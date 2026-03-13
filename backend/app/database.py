from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Date, Numeric, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import zoneinfo
import os
from .config import DATABASE_URL_SG, DATABASE_URL_RJK, DATABASE_URL_CAFE

engine = create_engine(DATABASE_URL_SG)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if DATABASE_URL_RJK:
    engine_rjk = create_engine(DATABASE_URL_RJK)
    SessionLocalRjk = sessionmaker(autocommit=False, autoflush=False, bind=engine_rjk)
else:
    engine_rjk = None
    SessionLocalRjk = None

if DATABASE_URL_CAFE:
    engine_cafe = create_engine(DATABASE_URL_CAFE)
    SessionLocalCafe = sessionmaker(autocommit=False, autoflush=False, bind=engine_cafe)
else:
    engine_cafe = None
    SessionLocalCafe = None

Base = declarative_base()

class Funcionario(Base):
    __tablename__ = "CARFUN"
    codigo = Column("codfun02", Float, primary_key=True, index=True)
    nome = Column("nomefun02", String(42), nullable=False)
    # Mapping rfid to nrcartao02 as it exists in the database
    rfid = Column("nrcartao02", Float, unique=True, index=True, nullable=True)
    datadem02 = Column("datadem02", String, nullable=True)

class Consumo(Base):
    __tablename__ = "CAFE"
    sr_recno = Column(Integer, primary_key=True, index=True, autoincrement=True)
    idfunc = Column("idfunc", Integer, index=True)
    nome = Column("nome", String(30))
    valor = Column("valor", Numeric(12, 2))
    data = Column("data", Date, default=lambda: datetime.datetime.now(zoneinfo.ZoneInfo("America/Sao_Paulo")).date())
    hora = Column("hora", String(8))
    databaixa = Column("databaixa", Date, nullable=True)
    horabaixa = Column("horabaixa", String(8), nullable=True)
    descricao = Column("descricao", String(35), nullable=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_rjk():
    if SessionLocalRjk:
        db = SessionLocalRjk()
        try:
            yield db
        finally:
            db.close()
    else:
        yield None

def get_db_cafe():
    if SessionLocalCafe:
        db = SessionLocalCafe()
        try:
            yield db
        finally:
            db.close()
    else:
        yield None
