# QFOME

![Status](https://img.shields.io/badge/status-MVP-orange)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2016-000000?logo=nextdotjs&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Spring%20Boot%203.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=0B1020)
![Java](https://img.shields.io/badge/java-21-007396?logo=openjdk&logoColor=white)
![Database](https://img.shields.io/badge/database-H2-0F67B1)

Matou a fome, chamou QFOME.

QFOME e uma plataforma de delivery com foco em experiencia de compra rapida, visual forte e jornada completa de pedido.

## Visao do produto

O QFOME cobre o ciclo completo de compra em delivery:

- Descoberta de pratos por categorias e busca.
- Pagina de produto com personalizacao (quantidade, adicionais e observacoes).
- Carrinho editavel com recalculo de totais.
- Checkout com dados de entrega e pagamento.
- Confirmacao com codigo do pedido.
- Acompanhamento e historico na area do cliente.

## Fluxo da experiencia

1. Usuario entra na home e navega por categorias/cardapio.
2. Seleciona um produto e personaliza o pedido.
3. Salva no carrinho e segue para checkout.
4. Finaliza pedido e recebe codigo de confirmacao.
5. Acompanha status e consulta historico na area do cliente.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide Icons.
- Backend: Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA, Validation, Actuator.
- Banco: H2 em arquivo local (`./data/qfome`).

## Status do MVP (maio/2026)

### Pronto e funcional

- Fluxo completo de compra no frontend (UI/UX).
- Login e cadastro conectados ao backend (`/auth/register` e `/auth/login`) com persistencia no banco.
- Catalogo de 6 categorias e 25 produtos populado via `data.sql` no startup do backend.
- CRUD completo de categorias e produtos via API REST.
- CRUD de carrinho por cliente no backend.
- Checkout conectado ao backend quando usuario autenticado.
- Acompanhamento de pedido e historico do cliente chamando endpoints reais.
- Testes de backend passando com Maven Wrapper.

### Em evolucao

- Listagem de categorias e produtos no frontend ainda usa dados locais (`src/data/`); integracao com endpoints `/categorias` e `/produtos` pendente.
- Carrinho no frontend usa `localStorage`; sincronizacao com o backend ainda nao esta ativa.
- Checkout cria pedido local com codigo gerado no cliente quando usuario nao esta logado.
- Senhas armazenadas em texto plano (sem hash); adequado para o MVP academico.

## Arquitetura

### Frontend (Next.js)

Principais rotas:

- `/` home com destaque, busca e categorias.
- `/cardapio` lista completa de pratos.
- `/categoria/[slug]` pratos por categoria.
- `/produto/[slug]` detalhe e personalizacao.
- `/pedido` carrinho.
- `/checkout` finalizacao do pedido.
- `/checkout/sucesso` confirmacao.
- `/acompanhar-pedido` timeline do pedido.
- `/entrar` login/cadastro.
- `/cliente` area do cliente com historico.
- `/contato` e `/recuperar-acesso` suporte.

Cliente HTTP centralizado em `src/lib/api.ts` (base: `NEXT_PUBLIC_API_URL`, padrao `http://localhost:8080`).

Status de integracao por funcionalidade:

| Funcionalidade       | Fonte de dados          |
|----------------------|-------------------------|
| Categorias           | Local (`src/data/`)     |
| Produtos             | Local (`src/data/`)     |
| Login / Cadastro     | API real                |
| Checkout             | API real (usuario logado) / local (anonimo) |
| Acompanhar pedido    | API real                |
| Historico do cliente | API real                |
| Carrinho             | `localStorage`          |

### Backend (Spring Boot)

Backend em `qfome-backend/`.

Endpoints:

```
GET    /actuator/health

POST   /auth/register
POST   /auth/login

GET    /categorias
GET    /categorias/{id}
POST   /categorias
PUT    /categorias/{id}
DELETE /categorias/{id}

GET    /produtos
GET    /produtos/{slug}
POST   /produtos
PUT    /produtos/{id}
DELETE /produtos/{id}

GET    /carrinho/{clienteId}
POST   /carrinho/{clienteId}/itens
PATCH  /carrinho/{clienteId}/itens/{itemId}
DELETE /carrinho/{clienteId}/itens/{itemId}
DELETE /carrinho/{clienteId}/limpar

POST   /checkout

GET    /pedidos/cliente/{clienteId}
GET    /pedidos/acompanhar/{codigo}
```

Banco de dados:

- H2 modo arquivo em `./data/qfome` (schema `update` + `data.sql`).
- `data.sql` popula 6 categorias e 25 produtos no startup.
- `clientes` persistido em banco.
- H2 console acessivel em `http://localhost:8080/h2-console` (requer habilitacao via env).

## Estrutura do repositorio

```text
qfome-frontend/
  src/
    app/          # paginas e rotas Next.js
    data/         # dados estaticos de catalogo (temporario)
    lib/
      api.ts      # cliente HTTP centralizado
  qfome-backend/  # backend Spring Boot
    src/main/
      java/com/qfome/
        controller/   # AuthController, CategoriaController, ProdutoController,
                      # CarrinhoController, CheckoutController, PedidoAcompanhamentoController
        model/        # Cliente, Categoria, Produto, Carrinho, ItemCarrinho, Pedido, ItemPedido
        repository/   # interfaces JPA
        service/      # logica de negocio
      resources/
        application.yml
        data.sql      # seed inicial de catalogo
  documentacao/   # notas de andamento e riscos
```

## Como rodar localmente

### 1) Backend

```bash
cd qfome-backend

# Windows
.\mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

Backend em `http://localhost:8080`.

### 2) Frontend

```bash
# na raiz qfome-frontend
npm install
npm run dev
```

Frontend em `http://localhost:3000`.

## Variaveis de ambiente (backend)

Arquivo de exemplo: `qfome-backend/.env.example`

```env
SERVER_PORT=8080
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

Configuracao completa: `qfome-backend/src/main/resources/application.yml`

## Testes

```bash
cd qfome-backend
.\mvnw.cmd test
```

Teste de integracao para `GET /actuator/health` incluido.

## Roadmap

1. Conectar frontend aos endpoints `/categorias` e `/produtos` (remover dados locais).
2. Sincronizar carrinho do `localStorage` com `GET/POST/PATCH/DELETE /carrinho/{clienteId}`.
3. Adicionar hash de senha (BCrypt) na autenticacao.
4. Publicar colecao Postman/Insomnia com os contratos de API.

## Documentacao complementar

- `documentacao/andamento-projeto-2026-03-23.md`
- `documentacao/riscos-e-mitigacao.md`
