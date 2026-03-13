from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db, get_db_cafe
import datetime
from pydantic import BaseModel

class BaixarRequest(BaseModel):
    start_date: str = None
    end_date: str = None

router = APIRouter()

@router.get("/mensal")
def get_relatorio_mensal(db: Session = Depends(get_db), db_cafe: Session = Depends(get_db_cafe)):
    sql = text("""
        SELECT DATE(data) as dia, SUM(valor) as total
        FROM CAFE
        WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())
        GROUP BY dia
        ORDER BY dia ASC
    """)
    target_db = db_cafe if db_cafe else db
    result = target_db.execute(sql).fetchall()
    return [{"DIA": str(row[0]), "TOTAL": float(row[1])} for row in result]

@router.get("/consumos")
def get_relatorio_consumos(
    start_date: str = None, 
    end_date: str = None, 
    baixado: bool = False,
    db: Session = Depends(get_db), 
    db_cafe: Session = Depends(get_db_cafe)
):
    target_db = db_cafe if db_cafe else db
    
    where_clauses = []
    params = {}
    
    if start_date:
        where_clauses.append("data >= :start_date")
        params["start_date"] = start_date
    if end_date:
        where_clauses.append("data <= :end_date")
        params["end_date"] = end_date
    
    # "Baixado" checkbox logic:
    # If baixado=False (default), show only records where databaixa is NULL
    # If baixado=True, show everything or maybe only those that are baixado?
    # User said: "checkbox Baixado? desmarcado por padrão e apresentando somente os usuario que a databaixa e horabaixa não estiverem preenchidoss"
    if not baixado:
        where_clauses.append("(databaixa IS NULL)")
    
    where_str = ""
    if where_clauses:
        where_str = "WHERE " + " AND ".join(where_clauses)
    
    # Get all records
    sql_records_str = f"""
        SELECT nome, valor, data, hora, databaixa, horabaixa
        FROM CAFE
        {where_str}
        ORDER BY data DESC, nome ASC
    """
    result_records = target_db.execute(text(sql_records_str), params).fetchall()
    
    # Get totals per user
    sql_totals_str = f"""
        SELECT nome, SUM(valor) as total
        FROM CAFE
        {where_str}
        GROUP BY nome
        ORDER BY total DESC
    """
    result_totals = target_db.execute(text(sql_totals_str), params).fetchall()
    
    return {
        "records": [
            {
                "nome": row[0], 
                "valor": float(row[1]), 
                "data": str(row[2]), 
                "hora": str(row[3]),
                "baixado": row[4] is not None
            } for row in result_records
        ],
        "totals": [{"nome": row[0], "total": float(row[1])} for row in result_totals]
    }

@router.post("/baixar")
def baixar_relatorio(
    request: BaixarRequest,
    db: Session = Depends(get_db), 
    db_cafe: Session = Depends(get_db_cafe)
):
    target_db = db_cafe if db_cafe else db
    
    where_clauses = ["(databaixa IS NULL)"]
    params = {}
    
    if request.start_date:
        where_clauses.append("data >= :start_date")
        params["start_date"] = request.start_date
    if request.end_date:
        where_clauses.append("data <= :end_date")
        params["end_date"] = request.end_date
    
    where_str = "WHERE " + " AND ".join(where_clauses)
    
    now = datetime.datetime.now()
    params["data_baixa"] = now.date()
    params["hora_baixa"] = now.strftime("%H:%M:%S")
    
    sql_update = f"""
        UPDATE CAFE 
        SET databaixa = :data_baixa, horabaixa = :hora_baixa
        {where_str}
    """
    
    result = target_db.execute(text(sql_update), params)
    target_db.commit()
    
    return {"message": "Lançamentos baixados com sucesso", "count": result.rowcount}
