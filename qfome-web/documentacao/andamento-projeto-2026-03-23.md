# Atualizacao do Projeto QFome

**Data:** 23/03/2026  
**Atualizado em:** 11:02 (America/Sao_Paulo)

## O que ja foi feito ate agora

### 1) Infra e configuracao
- Backend Spring Boot criado e rodando com `mvnw.cmd spring-boot:run`.
- Arquivo `application.yml` ajustado com porta, CORS e H2.
- Endpoint de health ativo em `/actuator/health`.
- Teste de integracao do health criado e passando.

### 2) Modelos e repositorios
- Entidades criadas:
  - `Cliente`
  - `Categoria`
  - `Produto`
  - `Pedido`
  - `ItemPedido`
- Relacionamentos basicos entre as entidades funcionando.
- Repositorios criados para todas as entidades.

### 3) Testes
- Backend validado com `mvnw.cmd test` sem erro.

## Sobre o codigo que foi removido

Nao foi apagado trabalho do grupo. O que foi removido era duplicado.

- Depois de alguns merges, o projeto ficou com duas estruturas parecidas:
  - `com.qfome.model` / `com.qfome.repository`
  - `com.qfome.domain` / `com.qfome.domain.repository`
- Isso gerou conflito na aplicacao (ex.: repositorio repetido com mesmo nome de bean).
- Para corrigir, o codigo foi unificado no pacote que ja estava sendo usado no projeto (`com.qfome.model` e `com.qfome.repository`).

Resumo: foi uma limpeza para o backend voltar a subir normalmente, sem perder historico no Git.

## Situacao atual das tasks (backend)
- Infra/Config: base pronta.
- Modelos/Repositorios: base pronta.
- Login/Cadastro: pendente.
- Catalogo (endpoints): pendente.
- Carrinho: pendente.
- Checkout/Pedido (endpoint): pendente.
- Historico/Acompanhamento (endpoints): pendente.
- Postman/README do fluxo completo: pendente.

## Commits usados como referencia
- `44fbb95` - consolidacao e remocao de duplicidade
- `21c24cb` - entidades/repositories e validacao de health
- `036499d` - merge do branch de integrante

## Alteracoes recentes e situacao real do projeto (agora)

### O que ja entrou no GitHub (`main`)
- Commit `4fac92f` (cherry-pick do PR #2 do Joao) entrou no `main`.
- Esse commit adicionou:
  - `qfome-backend/src/main/java/com/qfome/controller/AuthController.java`
  - alteracoes em `src/app/entrar/page.tsx`
  - alteracoes em `src/app/cliente/page.tsx`

### Situacao real de Login/Cadastro hoje
- Existem endpoints no backend:
  - `POST /auth/register`
  - `POST /auth/login`
- A implementacao atual e simples e guarda usuarios em memoria (`Map`), ou seja:
  - nao persiste no banco
  - reinicia quando a aplicacao sobe de novo

### O que ainda nao esta no GitHub (somente local)
- Estrutura de pastas para Historico/Acompanhamento criada localmente, sem commit:
  - `qfome-backend/src/main/java/com/qfome/controller/pedido/`
  - `qfome-backend/src/main/java/com/qfome/service/pedido/`
  - `qfome-backend/src/main/java/com/qfome/dto/pedido/`

### Resumo da situacao agora
- `main` remoto: atualizado ate `4fac92f`.
- Backend: sobe e passa nos testes basicos.
- Login/Cadastro: existe, mas ainda em versao simples (MVP).
- Catalogo, Carrinho, Checkout e Historico/Acompanhamento: ainda sem endpoints implementados no backend.
