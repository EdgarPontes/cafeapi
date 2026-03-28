from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db, get_db_cafe
import datetime
import zoneinfo
import re
from pydantic import BaseModel, field_validator

DATE_PATTERN = re.compile(r'^\d{4}-\d{2}-\d{2}$')

def validate_date_param(value: str | None) -> str | None:
    """Valida que o parâmetro de data está no formato YYYY-MM-DD."""
    if value is None:
        return None
    if not DATE_PATTERN.match(value):
        raise HTTPException(
            status_code=422,
            detail=f"Formato de data inválido: '{value}'. Use YYYY-MM-DD."
        )
    try:
        datetime.date.fromisoformat(value)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"Data inválida: '{value}'. Use YYYY-MM-DD."
        )
    return value


class BaixarRequest(BaseModel):
    start_date: str | None = None
    end_date: str | None = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def check_date_format(cls, v):
        if v is None:
            return v
        if not DATE_PATTERN.match(str(v)):
            raise ValueError(f"Formato de data inválido: '{v}'. Use YYYY-MM-DD.")
        try:
            datetime.date.fromisoformat(str(v))
        except ValueError:
            raise ValueError(f"Data inválida: '{v}'. Use YYYY-MM-DD.")
        return v


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
    # Validação dos parâmetros de data
    start_date = validate_date_param(start_date)
    end_date = validate_date_param(end_date)

    target_db = db_cafe if db_cafe else db

    params = {}
    conditions = []

    if start_date:
        conditions.append("data >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("data <= :end_date")
        params["end_date"] = end_date
    if not baixado:
        conditions.append("(databaixa IS NULL)")

    where_str = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    # Queries com parâmetros nomeados (sem interpolação de variáveis externas)
    sql_records = text(f"""
        SELECT nome, valor, data, hora, databaixa, horabaixa, idfunc, sr_recno
        FROM CAFE
        {where_str}
        ORDER BY data DESC, nome ASC
    """)
    sql_totals = text(f"""
        SELECT nome, SUM(valor) as total, idfunc
        FROM CAFE
        {where_str}
        GROUP BY nome, idfunc
        ORDER BY total DESC
    """)

    result_records = target_db.execute(sql_records, params).fetchall()
    result_totals = target_db.execute(sql_totals, params).fetchall()

    total_funcionarios = 0.0
    total_visitantes = 0.0
    for row in result_records:
        if row[6] == 999999:
            total_visitantes += float(row[1])
        else:
            total_funcionarios += float(row[1])

    return {
        "records": [
            {
                "nome": row[0],
                "valor": float(row[1]),
                "data": str(row[2]),
                "hora": str(row[3]),
                "baixado": row[4] is not None,
                "codigo": row[6],
                "id_consumo": row[7]
            } for row in result_records
        ],
        "totals": [{"nome": row[0], "total": float(row[1]), "codigo": row[2]} for row in result_totals],
        "total_funcionarios": total_funcionarios,
        "total_visitantes": total_visitantes
    }


@router.post("/baixar")
def baixar_relatorio(
    request: BaixarRequest,
    db: Session = Depends(get_db),
    db_cafe: Session = Depends(get_db_cafe)
):
    target_db = db_cafe if db_cafe else db

    conditions = ["(databaixa IS NULL)"]
    params = {}

    if request.start_date:
        conditions.append("data >= :start_date")
        params["start_date"] = request.start_date
    if request.end_date:
        conditions.append("data <= :end_date")
        params["end_date"] = request.end_date

    where_str = "WHERE " + " AND ".join(conditions)

    tz = zoneinfo.ZoneInfo("America/Sao_Paulo")
    now = datetime.datetime.now(tz)
    params["data_baixa"] = now.date()
    params["hora_baixa"] = now.strftime("%H:%M:%S")

    sql_update = text(f"""
        UPDATE CAFE
        SET databaixa = :data_baixa, horabaixa = :hora_baixa
        {where_str}
    """)

    result = target_db.execute(sql_update, params)
    target_db.commit()

    return {"message": "Lançamentos baixados com sucesso", "count": result.rowcount}
