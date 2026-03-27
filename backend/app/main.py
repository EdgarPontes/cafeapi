import logging
import json
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from .database import engine
from .routers import funcionarios, consumo, ranking, relatorios, fotos
from .config import ALLOWED_ORIGINS, ALLOWED_IPS

logger = logging.getLogger(__name__)

app = FastAPI(title="Cafe System API", redirect_slashes=False)


class IPWhitelistMiddleware(BaseHTTPMiddleware):
    """Bloqueia requisições de IPs não autorizados.
    Se ALLOWED_IPS estiver vazio, todas as requisições são permitidas.
    """
    async def dispatch(self, request: Request, call_next):
        if not ALLOWED_IPS:
            return await call_next(request)

        client_ip = request.client.host if request.client else None

        # Suporte a proxy reverso: usa X-Forwarded-For se disponível
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        if client_ip not in ALLOWED_IPS:
            logger.warning(f"Acesso negado para IP: {client_ip}")
            return JSONResponse(
                status_code=403,
                content={"detail": "Acesso negado: IP não autorizado."}
            )

        return await call_next(request)


# Middleware de IP (deve ser adicionado antes do CORS)
app.add_middleware(IPWhitelistMiddleware)

class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ["POST", "PUT"]:
            # Obtém o corpo da requisição
            body = await request.body()
            
            # Tenta logar de forma amigável
            try:
                body_json = json.loads(body)
                # Trunca strings longas (como base64 de fotos) no log
                if isinstance(body_json, dict):
                    for key in body_json:
                        if isinstance(body_json[key], str) and len(body_json[key]) > 150:
                            body_json[key] = f"{body_json[key][:50]}...[TRUNCATED {len(body_json[key])} bytes]...{body_json[key][-20:]}"
                log_body = json.dumps(body_json, ensure_ascii=False)
            except Exception:
                log_body = body.decode(errors="ignore")[:500]

            logger.info(f"Incoming Request: {request.method} {request.url.path} - Body: {log_body}")
            
            # Permite que o FastAPI leia o body novamente
            async def receive():
                return {"type": "http.request", "body": body}
            request._receive = receive

        return await call_next(request)

# Middleware de log (adicionado após o IP whitelist)
app.add_middleware(RequestLoggerMiddleware)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    try:
        body_str = body.decode()
    except:
        body_str = str(body)
        
    logger.error(f"Erro de Validação (422) em {request.url.path}: {exc.errors()}\nBody recebido: {body_str[:1000]}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body_received": body_str[:1000] if len(body_str) < 5000 else "Body too large to echo"},
    )

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
app.include_router(fotos.router, prefix="/api/fotos", tags=["fotos"])

@app.get("/")
def read_root():
    return {"message": "Cafe System Enterprise API is running"}
