# ☕ Cafe System Enterprise — Walkthrough

## O que foi implementado

| Feature | Status |
|---|---|
| Foto do funcionário (`/fotos/CODIGO.jpg`) | ✅ |
| Registro por QR Code | ✅ |
| Leitor RFID (modo teclado + Enter) | ✅ |
| Busca por nome | ✅ |
| Ranking Diário / Semanal / Mensal | ✅ |
| Dashboard com gráficos (Recharts) | ✅ |
| Modo TV fullscreen (`/tv`) | ✅ |
| PWA (instalável como App) | ✅ |
| API REST modular | ✅ |
| Docker Compose completo | ✅ |

---

## Estrutura Final

```
cafe-sg/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── database.py        # Modelos SQLAlchemy + sessão
│   │   ├── config.py          # Variáveis de ambiente
│   │   └── routers/
│   │       ├── funcionarios.py   # GET /api/funcionarios/{codigo}
│   │       ├── consumo.py        # POST /api/consumo/
│   │       ├── ranking.py        # GET /api/ranking/{hoje|semana|mes}
│   │       └── relatorios.py     # GET /api/relatorios/mensal
│   ├── sql/init.sql           # Schema MySQL + dados de exemplo
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Rotas: /, /dashboard, /tv
│   │   ├── pages/
│   │   │   ├── Kiosk.jsx      # RFID + QR + Busca + confirmação
│   │   │   ├── Dashboard.jsx  # Analytics + gráficos por período
│   │   │   └── TVRanking.jsx  # Fullscreen ranking
│   │   └── components/
│   │       ├── UserCard.jsx, QRScanner.jsx, SearchUser.jsx
│   │       ├── ValueSelector.jsx, Ranking.jsx, Charts.jsx
│   ├── vite.config.js         # Vite + PWA plugin
│   ├── tailwind.config.js
│   └── Dockerfile
├── nginx/nginx.conf            # Proxy + static + /fotos/
└── docker-compose.yml          # MySQL + Backend + Nginx
```

---

## Rodar Localmente (dev)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev   # Abre em http://localhost:3000
```

---

## Deploy com Docker

```bash
docker compose up --build -d
```

Acesse: `http://localhost` (Kiosk), `http://localhost/dashboard`, `http://localhost/tv`

---

## Fotos dos Funcionários

Coloque arquivos JPG na pasta `fotos/` com o nome do código:

```
cafe-sg/fotos/001.jpg   →  Ana Silva
cafe-sg/fotos/002.jpg   →  Bruno Costa
```

---

## Validado

- ✅ Frontend buildado com sucesso (`npm run build` — 700 módulos, PWA SW gerado)
- ✅ Todos os arquivos Python compilam sem erros
- ✅ PWA manifest configurado (instalável no celular)
- ✅ Estrutura Docker completa com healthcheck no MySQL
