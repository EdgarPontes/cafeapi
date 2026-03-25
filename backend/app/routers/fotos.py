import os
import base64
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..config import FOTOS_PATH

router = APIRouter()


class FotoUploadRequest(BaseModel):
    codigo: str
    imagem: str  # base64 string (pode incluir o data URI prefix)
    formato: Optional[str] = "jpg"  # extensão padrão: jpg


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
def upload_foto(payload: FotoUploadRequest):
    """
    Recebe uma imagem em base64 e grava na pasta de fotos.

    - **codigo**: código do funcionário (usado como nome do arquivo)
    - **imagem**: imagem em base64 (com ou sem prefixo data URI)
    - **formato**: extensão do arquivo (padrão: jpg)
    """
    image_bytes, detected_fmt = _decode_base64(payload.imagem)

    # Prioridade: formato detectado no data URI > parâmetro 'formato' > 'jpg'
    extensao = (detected_fmt or payload.formato or "jpg").lower()
    # Normalizar jpeg -> jpg
    if extensao == "jpeg":
        extensao = "jpg"

    filename = f"{payload.codigo}.{extensao}"
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
        mensagem=f"Foto do funcionário '{payload.codigo}' salva com sucesso.",
    )


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
    """Retorna informações sobre a foto de um funcionário (se existir)."""
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

    return {"codigo": codigo, "existe": False}
