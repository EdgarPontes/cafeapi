from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from ..database import get_db, get_db_cafe, Consumo
from typing import List

router = APIRouter()

@router.get("/hoje")
def get_ranking_hoje(db: Session = Depends(get_db), db_cafe: Session = Depends(get_db_cafe)):
    sql = text("""
        SELECT nome, SUM(valor) as total
        FROM CAFE
        WHERE DATE(data) = CURDATE()
        GROUP BY nome
        ORDER BY total DESC
        LIMIT 10
    """)
    target_db = db_cafe if db_cafe else db
    result = target_db.execute(sql).fetchall()
    return [{"NOME": row[0], "TOTAL": float(row[1])} for row in result]

@router.get("/semana")
def get_ranking_semana(db: Session = Depends(get_db), db_cafe: Session = Depends(get_db_cafe)):
    sql = text("""
        SELECT nome, SUM(valor) as total
        FROM CAFE
        WHERE YEARWEEK(data, 1) = YEARWEEK(CURDATE(), 1)
        GROUP BY nome
        ORDER BY total DESC
        LIMIT 10
    """)
    target_db = db_cafe if db_cafe else db
    result = target_db.execute(sql).fetchall()
    return [{"NOME": row[0], "TOTAL": float(row[1])} for row in result]

@router.get("/mes")
def get_ranking_mes(db: Session = Depends(get_db), db_cafe: Session = Depends(get_db_cafe)):
    sql = text("""
        SELECT nome, SUM(valor) as total
        FROM CAFE
        WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())
        GROUP BY nome
        ORDER BY total DESC
        LIMIT 10
    """)
    target_db = db_cafe if db_cafe else db
    result = target_db.execute(sql).fetchall()
    return [{"NOME": row[0], "TOTAL": float(row[1])} for row in result]
