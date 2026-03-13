# Product Requirements Document (PRD): App Android - Café SG

## 1. Visão Geral do Produto
O aplicativo Android "Café SG" será uma versão nativa e otimizada do atual Kiosk web. Ele servirá como um terminal de autoatendimento para os funcionários registrarem o consumo de café. O aplicativo deve se comunicar com a API backend existente e replicar o fluxo da interface Web atual, oferecendo suporte a leitores de RFID (via teclado USB/Bluetooth ou nativo) e uma interface amigável construída no Android Studio.

## 2. Casos de Uso
1. **Visualizar Tela Inicial (Idle):** O funcionário visualiza o painel principal exibindo o logo do "Café SG", uma barra de busca/seleção de usuários e um pódio de ranking.
2. **Identificação do Funcionário:** O funcionário se identifica digitando seu nome/código na barra de busca.
3. **Registro de Consumo:** Após identificado, o funcionário vê seu "Card" de usuário, escolhe o valor desejado do café em um seletor numérico, e confirma.
4. **Feedback Visual:** O aplicativo exibe sucesso, retorna rapidamente para a tela inicial.

## 3. Telas e Fluxo de Navegação (UI/UX)

### 3.1. Tela Inicial (Main / Idle Activity)
- **Header:** Título em destaque "CAFÉ SG".
- **Busca de Usuários (Search):** Campo de texto com autocompletar para buscar funcionários por nome ou código numérico. Ao clicar em um funcionário, transiciona para a Tela de Consumo.
- **Pódio de Ranking:** Exibe os 3 funcionários com maior consumo (integrado via API de Ranking).

### 3.2. Tela de Registro de Consumo (Dialog ou Fragment)
- **User Card:** Exibe as informações do funcionário identificado (Nome e Código). Animado (fade-in, zoom-in).
- **Seletor de Valor (Value Selector):** Opções pré-definidas de valores de café e possível input manual para outros valores.
- **Ações:** 
  - Botão "Confirmar": Salva o consumo e aciona a API.
  - Botão "Cancelar": Aborta e retorna para a Tela Inicial.
- **Feedback:** Toast, Snackbar ou Overlay exibindo mensagens de sucesso ou erro, junto à emissão de som (`MediaPlayer`).
- **Autoclose:** Após confirmação, fechar a tela e voltar ao estado inicial após 2 a 3 segundos.

## 4. Integração com a API (Network)

A comunicação com o backend será feita através de requisições HTTP RESTful. O Base URL será configurável (ex: `http://<IP_DO_SERVIDOR>:8000`). Utilizar biblioteca Retrofit ou OkHttp no Android Studio.

### 4.1. Buscar um Funcionário (Login do usuário no totem)
- **Endpoint:** `GET /api/funcionarios/{codigo}`
- **Parâmetros:** `{codigo}` correspondente ao RFID, Matrícula ou Código ID do funcionário.
- **Resposta Sucesso (200 OK):**
  ```json
  {
    "codigo": "1234",
    "nome": "João Silva",
    "rfid": "0001234567"
  }
  ```
- **Erro (404):** `{"detail": "Funcionário não encontrado"}`. Mostrar mensagem amigável no app e limpar a tela.

### 4.2. Buscar Todos Funcionários (Para o Autocomplete / Busca)
- **Endpoint:** `GET /api/funcionarios/`
- **Resposta Sucesso (200 OK):** 
  ```json
  [
    {"codigo": "1234", "nome": "João Silva", "rfid": "0001234567"},
    {"codigo": "5678", "nome": "Maria Souza", "rfid": "0009876543"}
  ]
  ```

### 4.3. Registrar Consumo (Compra)
- **Endpoint:** `POST /api/consumo/`
- **Body Request (JSON):**
  ```json
  {
    "codigo": "1234",
    "valor": 2.50
  }
  ```
- **Resposta Sucesso (200 OK):**
  ```json
  {
    "message": "Consumo registrado com sucesso",
    "id": 12345
  }
  ```
- **Ação App:** Ao receber 200, tocar som, exibir mensagem verde "Café registrado!" e resetar a tela.

### 4.4. Buscar Ranking (Para o Pódio)
- **Endpoint:** `GET /api/ranking/hoje`, `GET /api/ranking/semana`, ou `GET /api/ranking/mes`
- **Resposta Sucesso (200 OK):**
  ```json
  [
    {"NOME": "João Silva", "TOTAL": 15.5},
    {"NOME": "Maria Souza", "TOTAL": 10.0}
  ]
  ```
- **Ação App:** Pegar os 3 primeiros elementos (ou todos para um carrossel) e desenhar na Tela Inicial.

## 5. Requisitos Técnicos e Arquitetura Android Studio
- **Linguagem:** Kotlin, utilizando Coroutines para chamadas assíncronas no Retrofit.
- **UI Toolkit:** Recomendado utilizar Jetpack Compose para componentes modernos e responsivos equivalentes ao React (Tailwind v3), ou XML layouts usando ConstraintLayout.
- **Network Engine:** Retrofit2 + OkHttp3 + Gson converter.
- **Acessibilidade:** Textos grandes contendo bom contraste e botões de fácil clique (modo Totem de autoatendimento).

## 6. Próximos Passos (Plano de Ação)
1. Criar projeto no Android Studio via template "Empty Compose Activity".
2. Configurar dependências: Retrofit, GSON e ViewModel.
3. Criar a interface da API configurando as rotas da seção 4.
4. Desenvolver UI do Kiosk (Busca, Pódio, Modal de Confirmação).
5. Implementar leitor de Hardware Keyboard ou listener de RFID.
6. Testar no dispositivo físico as requisições na mesma rede do backend local.
