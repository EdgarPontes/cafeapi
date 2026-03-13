# ☕ Sistema Café Enterprise — Versão 3

Sistema profissional para registro de consumo de café com suporte a RFID, QR Code e análise de dados em tempo real.

## 🚀 Principais Recursos

-   📸 **Foto do Funcionário**: Exibição automática se houver arquivo em `/fotos/{CODIGO}.jpg`.
-   📱 **PWA (App Instalável)**: Pode ser instalado como aplicativo no celular ou tablet.
-   🏷️ **Registro Instantâneo**: Suporte a leitor RFID (USB teclado) e QR Scanner (Câmera).
-   📊 **Dashboard Analítico**: Gráficos de consumo por dia e total mensal.
-   🏆 **Ranking do Café**: Rankings diário, semanal e mensal.
-   📺 **Modo TV**: Visualização em tela cheia do ranking, ideal para monitores fixos.
-   🐳 **Docker Ready**: Infraestrutura completa com Docker e Nginx.

---

## 🛠️ Arquitetura

O sistema é dividido em três componentes principais:

-   **Backend**: FastAPI (Python) + SQLAlchemy (MySQL/MariaDB).
-   **Frontend**: React (Vite) + Tailwind CSS + Recharts + Vite PWA.
-   **Infra**: Nginx (Proxy Reverso) + Docker Compose.

---

## 🏃 Como Rodar

### Opção 1: Via Docker (Recomendado)

Esta opção configura automaticamente o banco de dados, o backend e o frontend com Nginx.

```bash
docker compose up --build -d
```
-   **Kiosk**: http://localhost
-   **Dashboard**: http://localhost/dashboard
-   **Modo TV**: http://localhost/tv

### Opção 2: Desenvolvimento Local

#### Backend
```bash
cd backend
python3 -m venv venv;
source venv/bin/activate;
pip install -r requirements.txt;
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Acesse em: http://localhost:3000

---

## 📂 Organização de Fotos

Para que as fotos apareçam na tela, elas devem ser salvas na pasta `fotos/` na raiz do projeto, com o nome do arquivo sendo exatamente o código do funcionário:

Exemplo:
-   `fotos/001.jpg` -> Foto do funcionário com código 001.
-   `fotos/002.jpg` -> Foto do funcionário com código 002.

---

## ⚙️ Configuração

-   O banco de dados é inicializado automaticamente com 5 funcionários de exemplo através do script `backend/sql/init.sql`.
-   A configuração de rede da API no frontend é feita via `.env` ou `VitePWA`.

---

Desenvolvido por SG Sistemas.
