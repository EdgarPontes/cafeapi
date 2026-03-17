from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .routers import funcionarios, consumo, ranking, relatorios
from .config import ALLOWED_ORIGINS

app = FastAPI(title="Cafe System API")

# Configure CORS
# Origens são lidas da variável ALLOWED_ORIGINS (separadas por vírgula)
# Ex: ALLOWED_ORIGINS=http://localhost:8090,http://meu-servidor.com
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

app.include_router(funcionarios.router, prefix="/api/funcionarios", tags=["funcionarios"])
app.include_router(consumo.router, prefix="/api/consumo", tags=["consumo"])
app.include_router(ranking.router, prefix="/api/ranking", tags=["ranking"])
app.include_router(relatorios.router, prefix="/api/relatorios", tags=["relatorios"])

@app.get("/")
def read_root():
    return {"message": "Cafe System Enterprise API is running"}
