from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .routers import funcionarios, consumo, ranking, relatorios

app = FastAPI(title="Cafe System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for easier connectivity (Android App, different server IPs)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(funcionarios.router, prefix="/api/funcionarios", tags=["funcionarios"])
app.include_router(consumo.router, prefix="/api/consumo", tags=["consumo"])
app.include_router(ranking.router, prefix="/api/ranking", tags=["ranking"])
app.include_router(relatorios.router, prefix="/api/relatorios", tags=["relatorios"])

@app.get("/")
def read_root():
    return {"message": "Cafe System Enterprise API is running"}
