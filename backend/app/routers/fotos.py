import os
import base64
import re
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional
from ..config import FOTOS_PATH

router = APIRouter()


class FotoUploadRequest(BaseModel):
    id_consumo: int
    codigo_usuario: str = Field(..., alias="codigo")
    imagem: str = Field(..., alias="foto_base64")
    formato: Optional[str] = "jpg"

    class Config:
        populate_by_name = True  # Pydantic v2 support
        allow_population_by_field_name = True  # Pydantic v1 support
        protected_namespaces = () # Avoid Pydantic v2 warning if any field starts with model_


class FotoUploadResponse(BaseModel):
    filename: str
    caminho: str
    mensagem: str


def _decode_base64(imagem: str) -> tuple[bytes, str]:
    """Extrai os bytes e a extensão de uma string base64 (com ou sem data URI)."""
    # Suporta: "data:image/jpeg;base64,/9j/..." ou string pura base64
    match = re.match(r"data:image/(?P<fmt>\w+);base64,(?P<data>.+)", imagem, re.DOTALL)
    if match:
        fmt = match.group("fmt")
        data = match.group("data")
    else:
        fmt = None
        data = imagem

    try:
        image_bytes = base64.b64decode(data)
    except Exception:
        raise HTTPException(status_code=400, detail="String base64 inválida")

    return image_bytes, fmt


@router.post("/", response_model=FotoUploadResponse)
@router.post("", response_model=FotoUploadResponse)
def upload_foto(payload: FotoUploadRequest):
    """
    Recebe uma imagem em base64 e grava na pasta de fotos associada ao consumo.

    - **id_consumo**: ID único do registro de consumo (sr_recno)
    - **codigo_usuario**: código do funcionário
    - **imagem**: imagem em base64 (com ou sem prefixo data URI)
    - **formato**: extensão do arquivo (padrão: jpg)
    """
    image_bytes, detected_fmt = _decode_base64(payload.imagem)

    # Prioridade: formato detectado no data URI > parâmetro 'formato' > 'jpg'
    extensao = (detected_fmt or payload.formato or "jpg").lower()
    # Normalizar jpeg -> jpg
    if extensao == "jpeg":
        extensao = "jpg"

    filename = f"consumo_{payload.id_consumo}_{payload.codigo_usuario}.{extensao}"
    filepath = os.path.join(FOTOS_PATH, filename)

    # Garantir que o diretório existe
    os.makedirs(FOTOS_PATH, exist_ok=True)

    try:
        with open(filepath, "wb") as f:
            f.write(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar imagem: {str(e)}")

    return FotoUploadResponse(
        filename=filename,
        caminho=filepath,
        mensagem=f"Foto do consumo '{payload.id_consumo}' (usuário {payload.codigo_usuario}) salva com sucesso.",
    )


@router.get("/arquivo/{filename}")
def get_foto_arquivo(filename: str):
    """Retorna o arquivo de imagem diretamente."""
    filepath = os.path.join(FOTOS_PATH, filename)
    
    # Se o arquivo não existir, tenta procurar com prefixos SG: ou RJK: (específico para consumo)
    if not os.path.exists(filepath) and filename.startswith("consumo_"):
        # Tenta inserir os prefixos conhecidos após o segundo underscore
        # Ex: consumo_2704_416.jpg -> consumo_2704_SG:416.jpg
        parts = filename.split('_', 2)
        if len(parts) == 3:
            for prefix in ("SG:", "RJK:"):
                alt_filename = f"{parts[0]}_{parts[1]}_{prefix}{parts[2]}"
                alt_path = os.path.join(FOTOS_PATH, alt_filename)
                if os.path.exists(alt_path):
                    filepath = alt_path
                    break

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    # Determinar o media type básico pela extensão
    media_type = "image/jpeg"
    lower_f = filepath.lower()
    if lower_f.endswith(".png"):
        media_type = "image/png"
    elif lower_f.endswith(".webp"):
        media_type = "image/webp"

    return FileResponse(filepath, media_type=media_type)


@router.delete("/{codigo}")
def delete_foto(codigo: str):
    """Remove a foto de um funcionário (tenta .jpg e .png)."""
    removido = False
    for ext in ("jpg", "jpeg", "png", "webp"):
        filepath = os.path.join(FOTOS_PATH, f"{codigo}.{ext}")
        if os.path.exists(filepath):
            os.remove(filepath)
            removido = True
            break

    if not removido:
        raise HTTPException(status_code=404, detail=f"Foto do funcionário '{codigo}' não encontrada")

    return {"mensagem": f"Foto do funcionário '{codigo}' removida com sucesso."}


@router.get("/{codigo}")
def get_foto_info(codigo: str):
    # Busca padrão baseada no código (exato ou com extensões comuns)
    for ext in ("jpg", "jpeg", "png", "webp"):
        filepath = os.path.join(FOTOS_PATH, f"{codigo}.{ext}")
        if os.path.exists(filepath):
            stat = os.stat(filepath)
            return {
                "codigo": codigo,
                "filename": f"{codigo}.{ext}",
                "tamanho_bytes": stat.st_size,
                "existe": True,
            }

    # Se for um padrão de consumo e não encontrou, tenta com prefixos
    if codigo.startswith("consumo_"):
        parts = codigo.split('_', 2)
        if len(parts) == 3:
            for prefix in ("SG:", "RJK:"):
                # Reconstrói com o prefixo (Ex: consumo_2704_SG:416)
                alt_codigo = f"{parts[0]}_{parts[1]}_{prefix}{parts[2]}"
                for ext in ("jpg", "jpeg", "png", "webp"):
                    alt_path = os.path.join(FOTOS_PATH, f"{alt_codigo}.{ext}")
                    if os.path.exists(alt_path):
                        stat = os.stat(alt_path)
                        return {
                            "codigo": codigo,
                            "filename": f"{alt_codigo}.{ext}",
                            "tamanho_bytes": stat.st_size,
                            "existe": True,
                        }

    return {"codigo": codigo, "existe": False}
