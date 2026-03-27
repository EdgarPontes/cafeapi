from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db, get_db_rjk, Funcionario
from pydantic import BaseModel, field_validator
from typing import List, Optional, Any
import logging

logger = logging.getLogger(__name__)

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
@router.get("", response_model=List[FuncionarioSchema])
def get_funcionarios(db: Session = Depends(get_db), db_rjk: Session = Depends(get_db_rjk)):
    from sqlalchemy import or_, func
    # Use func.trim to catch strings that only contain spaces (e.g. '        ' or '          ')
    query = or_(
        Funcionario.datadem02 == None,
        func.trim(Funcionario.datadem02) == '',
        Funcionario.datadem02 == '0',
        Funcionario.datadem02 == '00000000'
    )
    
    # SG Query
    funcs_sg = db.query(Funcionario).filter(query).all()
    logger.info(f"Fetched {len(funcs_sg)} employees from SG database")
    
    # RJK Query
    funcs_rjk = []
    if db_rjk:
        try:
            funcs_rjk = db_rjk.query(Funcionario).filter(query).all()
            logger.info(f"Fetched {len(funcs_rjk)} employees from RJK database")
        except Exception as e:
            logger.error(f"Error fetching from RJK database: {str(e)}")
    
    seen = set()
    result = []
    
    # Helper to convert to a dictionary with a prefix
    def to_prefixed_dict(f, prefix):
        # Normalize codigo to string (handle float)
        cod_val = f.codigo
        cod_str = str(int(cod_val)) if isinstance(cod_val, float) and cod_val == int(cod_val) else str(cod_val)
        
        # Normalize rfid to string
        rfid_val = f.rfid
        rfid_str = str(int(rfid_val)) if isinstance(rfid_val, float) and rfid_val == int(rfid_val) else str(rfid_val) if rfid_val is not None else None
        
        return {
            "codigo": f"{prefix}:{cod_str}",
            "nome": f.nome,
            "rfid": rfid_str
        }

    # Add all from SG
    for f in funcs_sg:
        result.append(to_prefixed_dict(f, "SG"))
        
    # Add all from RJK (NO MORE DEDUPLICATION)
    for f in funcs_rjk:
        result.append(to_prefixed_dict(f, "RJK"))
    
    logger.info(f"Total active employees: {len(result)}")
    return result

@router.get("/{codigo}", response_model=FuncionarioSchema)
def get_funcionario(codigo: str, db: Session = Depends(get_db), db_rjk: Session = Depends(get_db_rjk)):
    from sqlalchemy import or_, func
    
    prefix = None
    original_codigo = codigo
    
    # Check for prefix (e.g., "SG:40" or "RJK:40")
    if ":" in codigo:
        prefix, original_codigo = codigo.split(":", 1)
        logger.info(f"Request with prefix: {prefix}, code: {original_codigo}")

    try:
        codigo_num = float(original_codigo)
    except ValueError:
        logger.warning(f"Invalid non-numeric code received: {original_codigo}")
        raise HTTPException(status_code=400, detail="Código inválido")

    # Define the 'active' filter query
    active_query = or_(
        Funcionario.datadem02 == None,
        func.trim(Funcionario.datadem02) == '',
        Funcionario.datadem02 == '0',
        Funcionario.datadem02 == '00000000'
    )

    func_obj = None

    # Helper to format return as schema expects properly
    def return_with_original_prefix(f, p):
        # We must return the prefixed code back to the frontend so it remains unique
        cod_val = f.codigo
        cod_str = str(int(cod_val)) if isinstance(cod_val, float) and cod_val == int(cod_val) else str(cod_val)
        
        # rfid
        rfid_val = f.rfid
        rfid_str = str(int(rfid_val)) if isinstance(rfid_val, float) and rfid_val == int(rfid_val) else str(rfid_val) if rfid_val is not None else None
        
        return {
            "codigo": f"{p}:{cod_str}",
            "nome": f.nome,
            "rfid": rfid_str
        }

    # If prefix specified, search in that DB exclusively
    if prefix == "SG":
        func_obj = db.query(Funcionario).filter(or_(Funcionario.codigo == codigo_num, Funcionario.rfid == codigo_num)).filter(active_query).first()
        if func_obj:
            return return_with_original_prefix(func_obj, "SG")
    elif prefix == "RJK" and db_rjk:
        func_obj = db_rjk.query(Funcionario).filter(or_(Funcionario.codigo == codigo_num, Funcionario.rfid == codigo_num)).filter(active_query).first()
        if func_obj:
            return return_with_original_prefix(func_obj, "RJK")
            
    # If no prefix or not found with prefix, search both for an active one (Priority SG then RJK)
    if not prefix:
        # Search SG
        func_obj = db.query(Funcionario).filter(or_(Funcionario.codigo == codigo_num, Funcionario.rfid == codigo_num)).filter(active_query).first()
        if func_obj:
            return return_with_original_prefix(func_obj, "SG")
        
        # Search RJK
        if db_rjk:
            try:
                func_obj = db_rjk.query(Funcionario).filter(or_(Funcionario.codigo == codigo_num, Funcionario.rfid == codigo_num)).filter(active_query).first()
                if func_obj:
                    return return_with_original_prefix(func_obj, "RJK")
            except:
                pass

    logger.warning(f"Active employee {codigo} not found in any database")
    raise HTTPException(status_code=404, detail="Funcionário não encontrado")
