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

O QFOME foi pensado para cobrir o ciclo completo de compra em delivery:

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
- Banco: H2 em arquivo local.

## Status real do MVP (abril/2026)

### Pronto e funcional

- Fluxo completo de compra no frontend (UI/UX).
- Login e cadastro conectando no backend (`/auth/register` e `/auth/login`).
- Endpoints de catalogo, checkout e acompanhamento ja implementados no backend.
- Testes de backend passando com Maven Wrapper.

### Em evolucao

- Checkout e acompanhamento no frontend ainda usam `localStorage` como fonte principal.
- Integracao frontend -> endpoints reais de catalogo/checkout/pedidos ainda nao esta completa.
- Carrinho no backend ainda esta em modo placeholder.
- Auth backend ainda e MVP em memoria (sem persistencia em banco).

## Arquitetura

### Frontend (Next.js)

Principais rotas:

- `/` home com destaque, busca, categorias e resumo do pedido.
- `/cardapio` lista completa de pratos.
- `/categoria/[slug]` pratos por categoria.
- `/produto/[slug]` detalhe e personalizacao.
- `/pedido` carrinho.
- `/checkout` finalizacao do pedido.
- `/checkout/sucesso` confirmacao.
- `/acompanhar-pedido` timeline do pedido.
- `/entrar` login/cadastro.
- `/cliente` area do cliente.
- `/contato` e `/recuperar-acesso` suporte.

Observacao:

- Atualmente o frontend usa dados locais (`src/data/*`) e estado no `localStorage` para simular o fluxo ponta a ponta.

### Backend (Spring Boot)

Backend principal: `qfome-backend/`

Endpoints atuais:

- `GET /actuator/health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /categorias`
- `GET /produtos`
- `GET /produtos/{slug}`
- `POST /checkout`
- `GET /pedidos/cliente/{clienteId}`
- `GET /pedidos/acompanhar/{codigo}`
- `POST /carrinho/itens` (placeholder)
- `PATCH /carrinho/itens/{id}` (placeholder)
- `DELETE /carrinho/itens/{id}` (placeholder)
- `GET /carrinho/{clienteId}` (placeholder)

Limitacoes conhecidas:

- Nao ha seed automatica de categorias/produtos/clientes no banco.
- Auth nao persiste em `clientes`; usuarios ficam em memoria enquanto a app roda.
- `POST /checkout` exige `clienteId` existente no banco.

## Estrutura do repositorio

```text
qfome-frontend/
  src/                    # app Next.js
  qfome-backend/          # backend Spring Boot principal
  documentacao/           # notas de andamento e riscos
  pom.xml                 # base backend legada no diretorio raiz
```

Nota:

- Existe uma base Spring legada no diretorio raiz (`src/main/*` e `pom.xml`).
- Para o fluxo atual, considere `qfome-backend/` como backend principal.

## Como rodar localmente

### 1) Backend

Windows (PowerShell/CMD):

```bash
cd qfome-backend
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
cd qfome-backend
./mvnw spring-boot:run
```

Backend em `http://localhost:8080`.

### 2) Frontend

Na raiz `qfome-frontend`:

```bash
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

- H2 console: `http://localhost:8080/h2-console` (habilitacao via env).

## Qualidade e testes

Backend:

```bash
cd qfome-backend
.\mvnw.cmd test
```

Ja existe teste de integracao para health endpoint (`/actuator/health`).

## Roadmap sugerido

1. Conectar frontend aos endpoints reais de `categorias` e `produtos`.
2. Migrar checkout do `localStorage` para `POST /checkout`.
3. Persistir auth em banco (cliente) e remover mapa em memoria.
4. Implementar carrinho backend de fato (CRUD + regras de negocio).
5. Adicionar seed inicial de catalogo para ambiente de desenvolvimento.
6. Publicar colecao de testes de API e contrato de integracao frontend/backend.

## Documentacao complementar

- `documentacao/andamento-projeto-2026-03-23.md`
- `documentacao/riscos-e-mitigacao.md`
