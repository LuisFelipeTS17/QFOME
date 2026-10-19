# Riscos e Mitigacao - QFome

## Identificacao de riscos do projeto

| Risco | Exemplo | Probabilidade | Impacto | Prioridade |
|---|---|---|---|---|
| Atraso ou falha na API de autenticacao | `/auth/login` ou `/auth/register` indisponivel | Media/Alta | Alto | Alta |
| Bugs de integracao entre frontend e backend | Campos diferentes entre request/response | Alta | Alto | Alta |
| Instabilidade do backend no dia da demo | API fora do ar durante apresentacao | Media | Alto | Alta |
| Conflitos de merge entre branches | Codigo sobrescrito ou quebrado | Alta | Medio | Media |
| Mudanca de escopo perto da entrega | Novas demandas de ultima hora | Media | Medio | Media |

## Plano de mitigacao (riscos de alta prioridade)

### 1) Falha na autenticacao
- Plano A: usar `POST /auth/register` e `POST /auth/login`.
- Plano B: login local temporario no frontend (`localStorage`) para nao travar a demo.
- Acao preventiva: validar login/cadastro antes de cada apresentacao.

### 2) Bugs de integracao frontend x backend
- Manter contrato simples de payload (`email`, `password`, `name`).
- Testar fluxo ponta a ponta antes de merge (`login -> carrinho -> checkout -> acompanhar`).
- Contingencia: mock local temporario no frontend se algum endpoint quebrar.

### 3) Instabilidade do backend
- Subir backend antes da demo e validar `GET /actuator/health`.
- Manter ambiente local estavel (`application.yml`, H2 local, CORS definido).
- Ter notebook de backup com ambiente pronto.

## Monitoramento
- Revisar riscos nas reunioes do grupo.
- Atualizar este arquivo quando houver mudanca relevante.
