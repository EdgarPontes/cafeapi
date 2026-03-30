from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db, get_db_rjk, get_db_cafe, Consumo, Funcionario
from pydantic import BaseModel
import datetime
import zoneinfo
import re
from typing import Optional

router = APIRouter()

class ConsumoCreate(BaseModel):
    codigo: str
    valor: float
    nome: Optional[str] = None  # Nome opcional para visitantes
    data_hora: Optional[str] = None # Formato ISO 8601 opcional

@router.post("/")
@router.post("")
def register_consumo(data: ConsumoCreate, db: Session = Depends(get_db), db_rjk: Session = Depends(get_db_rjk), db_cafe: Session = Depends(get_db_cafe)):
    from sqlalchemy import or_
    
    # Parse prefix (e.g., 'SG:40' -> prefix='SG', raw_codigo='40')
    prefix = None
    raw_codigo = data.codigo
    if ":" in data.codigo:
        prefix, raw_codigo = data.codigo.split(":", 1)
    
    # Try parsing the numeric part
    try:
        codigo_float = float(raw_codigo)
    except ValueError:
        codigo_float = None

    func = None
    
    # Special case for visitor (codigo 999999)
    if raw_codigo == '999999' or codigo_float == 999999:
        pass  # Nome vem do frontend
    elif codigo_float is not None:
        if prefix == "SG":
            # Busca somente no banco SG
            func = db.query(Funcionario).filter(or_(Funcionario.codigo == codigo_float, Funcionario.rfid == codigo_float)).first()
        elif prefix == "RJK" and db_rjk:
            # Busca somente no banco RJK
            func = db_rjk.query(Funcionario).filter(or_(Funcionario.codigo == codigo_float, Funcionario.rfid == codigo_float)).first()
        else:
            # Sem prefixo: tenta SG primeiro, depois RJK
            func = db.query(Funcionario).filter(or_(Funcionario.codigo == codigo_float, Funcionario.rfid == codigo_float)).first()
            if not func and db_rjk:
                func = db_rjk.query(Funcionario).filter(or_(Funcionario.codigo == codigo_float, Funcionario.rfid == codigo_float)).first()
    
    if not func and not (raw_codigo == '999999' or codigo_float == 999999):
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    tz = zoneinfo.ZoneInfo("America/Sao_Paulo")
    
    # Define a data e hora do registro
    if data.data_hora:
        try:
            # Tenta converter o formato ISO 8601 (ex: 2023-10-27T10:30:00Z)
            # Substituímos 'Z' por '+00:00' para compatibilidade com Python 3.10+
            dt_str = data.data_hora.replace('Z', '+00:00')
            dt = datetime.datetime.fromisoformat(dt_str)
            
            # Se não tiver timezone, assume America/Sao_Paulo
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=tz)
            else:
                # Converte para o timezone local se vier outro
                dt = dt.astimezone(tz)
        except Exception:
            # Fallback para o horário atual do servidor em caso de erro no formato
            dt = datetime.datetime.now(tz)
    else:
        dt = datetime.datetime.now(tz)
    
    now = dt # Mantém para compatibilidade se usado em outro lugar, mas usaremos 'dt'
    
    # Para visitantes, usa o nome que veio do frontend
    if raw_codigo == '999999' or codigo_float == 999999:
        # Remove acentos e converte para maiúsculo
        nome_funcionario = data.nome[:30] if data.nome else "Visitante"
        if nome_funcionario != "Visitante":
            import unicodedata
            # Remove acentos usando normalize
            nome_funcionario = unicodedata.normalize('NFD', nome_funcionario)
            nome_funcionario = ''.join(c for c in nome_funcionario if not unicodedata.combining(c))
            nome_funcionario = nome_funcionario.upper()
            nome_funcionario = re.sub(r'[^A-Z0-9\s]', '', nome_funcionario)  # Remove caracteres especiais
            nome_funcionario = re.sub(r'\s+', ' ', nome_funcionario).strip()[:30]
    else:
        nome_funcionario = func.nome[:30] # Limit to 30 chars
    
    new_entry = Consumo(
        idfunc=int(codigo_float) if codigo_float is not None else 999999,
        nome=nome_funcionario,
        valor=data.valor,
        data=dt.date(),
        hora=dt.strftime("%H:%M:%S")
    )
    if db_cafe:
        db_cafe.add(new_entry)
        db_cafe.commit()
        db_cafe.refresh(new_entry)
    else:
        # Fallback se DB do cafe não existir
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
    return {"message": "Consumo registrado com sucesso", "id": new_entry.sr_recno}
