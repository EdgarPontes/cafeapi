from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db, get_db_rjk, Funcionario
from pydantic import BaseModel, field_validator
from typing import List, Optional, Any

router = APIRouter()

class FuncionarioSchema(BaseModel):
    codigo: str
    nome: str
    rfid: Optional[str] = None

    class Config:
        from_attributes = True

    @field_validator('codigo', 'rfid', mode='before')
    @classmethod
    def ensure_str(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, float):
            if v == int(v):
                return str(int(v))
        return str(v)

@router.get("/", response_model=List[FuncionarioSchema])
def get_funcionarios(db: Session = Depends(get_db), db_rjk: Session = Depends(get_db_rjk)):
    from sqlalchemy import or_
    query = or_(
        Funcionario.datadem02 == None,
        Funcionario.datadem02 == '',
        Funcionario.datadem02 == '        '
    )
    funcs_sg = db.query(Funcionario).filter(query).all()
    funcs_rjk = []
    if db_rjk:
        funcs_rjk = db_rjk.query(Funcionario).filter(query).all()
    
    seen = set()
    result = []
    for f in funcs_sg + funcs_rjk:
        if f.codigo not in seen:
            seen.add(f.codigo)
            result.append(f)
    return result

@router.get("/{codigo}", response_model=FuncionarioSchema)
def get_funcionario(codigo: str, db: Session = Depends(get_db), db_rjk: Session = Depends(get_db_rjk)):
    func = db.query(Funcionario).filter(Funcionario.codigo == codigo).first()
    if not func:
        # Also try by RFID if not found by codigo
        func = db.query(Funcionario).filter(Funcionario.rfid == codigo).first()
    
    if not func and db_rjk:
        func = db_rjk.query(Funcionario).filter(Funcionario.codigo == codigo).first()
        if not func:
            func = db_rjk.query(Funcionario).filter(Funcionario.rfid == codigo).first()
    
    if not func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return func
