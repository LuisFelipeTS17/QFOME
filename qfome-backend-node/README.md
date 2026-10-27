# QFOME Backend

API REST do QFOME, um delivery de comida. Atende o site e o app mobile com:

- **Catalogo**: categorias e produtos, cada produto com seus adicionais (ex.: "queijo extra").
- **Contas**: cadastro, login e perfil do cliente.
- **Carrinho**: um carrinho por cliente, salvo no servidor.
- **Checkout**: fecha o pedido com endereco e forma de pagamento; os valores sao calculados
  no servidor a partir dos precos do banco.
- **Pedidos**: historico do cliente e acompanhamento pelo codigo do pedido.

## Stack

- Node.js 22+
- Express 5
- SQLite (banco em arquivo local, via `better-sqlite3`)
- `big.js` para os calculos com dinheiro

## Como rodar

```bash
npm install
npm start          # ou: npm run dev (reinicia ao salvar)
```

API disponivel em `http://localhost:8080`. Nao precisa instalar banco: o arquivo
`data/qfome.db` e criado no primeiro start, ja com as tabelas e o catalogo inicial.

## Regras de negocio

### Contas

- O e-mail e gravado sem espacos e em minusculas, e e unico: cadastrar um e-mail repetido
  responde `409`.
- O cadastro exige e-mail em formato valido e limita o tamanho dos campos (nome ate 100,
  e-mail ate 150 e senha ate 255 caracteres); fora disso responde `400`.
- Toda conta criada pela API tem o perfil `CLIENTE` (os perfis sao `CLIENTE` e `ADMIN`).
- Login com e-mail ou senha errados responde `401`.

### Catalogo

- Nao pode haver duas categorias com o mesmo nome (sem diferenciar maiusculas): `409`.
- Produto exige categoria existente, nome e preco maior que zero.
- `GET /produtos?categoria={id}` filtra por categoria; sem o parametro, lista todos.
- Categorias e produtos sao listados em ordem de id.

### Carrinho

- Cada cliente tem um carrinho, criado no primeiro acesso.
- O preco unitario de um item e o preco do produto mais o dos adicionais escolhidos.
- Os adicionais escolhidos precisam pertencer ao produto; senao responde `400`.
- Adicionar um item igual a um que ja esta no carrinho (mesmo produto, mesmos adicionais e
  mesma observacao) soma a quantidade em vez de criar outro item.
- Alterar a quantidade de um item para `0` ou menos remove o item.
- Toda alteracao devolve o carrinho atualizado, com o subtotal.

### Checkout

- O cliente envia so produtos, quantidades, adicionais e observacoes; subtotal, taxa de
  entrega e total sao calculados no servidor com os precos do banco.
- **Taxa de entrega**: R$ 6,90 para pedidos abaixo de R$ 45,00; gratis a partir disso.
- O preco do produto e de cada adicional fica congelado no pedido: mudar o preco depois nao
  altera pedidos ja feitos.
- Formas de pagamento: `pix`, `cartao` ou `dinheiro` (sem diferenciar maiusculas).
- O CEP aceita `01310-100` ou `01310100` e e gravado so com os digitos.
- Cada pedido recebe um codigo unico no formato `QF-123456` e comeca com o status `RECEBIDO`.

### Pedidos

- Status possiveis: `RECEBIDO`, `EM_PREPARO`, `SAIU_PARA_ENTREGA`, `ENTREGUE`.
- O historico do cliente vem do pedido mais recente para o mais antigo.

## Endpoints

### Autenticacao

| Metodo | Rota             | Corpo                       | Sucesso |
|--------|------------------|-----------------------------|---------|
| POST   | `/auth/register` | `{ name, email, password }` | `200`   |
| POST   | `/auth/login`    | `{ email, password }`       | `200`   |

Resposta: `{ id, name, email, perfil, message }`. Nas falhas (`400`, `401`, `409`) o corpo e
so o texto da mensagem, por exemplo `E-mail ja cadastrado`.

### Clientes

| Metodo | Rota             | Corpo      | Sucesso |
|--------|------------------|------------|---------|
| GET    | `/clientes/{id}` |            | `200`   |
| PUT    | `/clientes/{id}` | `{ nome }` | `200`   |
| DELETE | `/clientes/{id}` |            | `204`   |

Resposta: `{ id, nome, email, perfil }`.

### Categorias

| Metodo | Rota               | Corpo      | Sucesso |
|--------|--------------------|------------|---------|
| GET    | `/categorias`      |            | `200`   |
| GET    | `/categorias/{id}` |            | `200`   |
| POST   | `/categorias`      | `{ nome }` | `201`   |
| PUT    | `/categorias/{id}` | `{ nome }` | `200`   |
| DELETE | `/categorias/{id}` |            | `204`   |

Resposta: `{ id, nome }`.

### Produtos

| Metodo | Rota             | Corpo                          | Sucesso |
|--------|------------------|--------------------------------|---------|
| GET    | `/produtos`      | `?categoria={id}` (opcional)   | `200`   |
| GET    | `/produtos/{id}` |                                | `200`   |
| POST   | `/produtos`      | ver abaixo                     | `201`   |
| PUT    | `/produtos/{id}` | ver abaixo                     | `200`   |
| DELETE | `/produtos/{id}` |                                | `204`   |

Corpo do POST/PUT:

```json
{
  "categoriaId": 1,
  "nome": "Bowl Nordestino",
  "descricao": "Arroz cremoso, carne de sol e queijo coalho.",
  "preco": 39.90,
  "imagemUrl": "https://...",
  "tempoPreparoMin": 29
}
```

Resposta: os mesmos campos mais `id`, `categoriaNome` e a lista `adicionais`
(`[{ id, nome, preco }]`).

### Carrinho

| Metodo | Rota                                          | Corpo                                              | Sucesso |
|--------|-----------------------------------------------|----------------------------------------------------|---------|
| GET    | `/carrinho/{usuarioId}`                       |                                                    | `200`   |
| POST   | `/carrinho/{usuarioId}/itens`                 | `{ produtoId, quantidade, observacao, adicionais }` | `200`   |
| PATCH  | `/carrinho/{usuarioId}/itens/{id}?quantidade=N` |                                                  | `200`   |
| DELETE | `/carrinho/{usuarioId}/itens/{id}`            |                                                    | `200`   |
| DELETE | `/carrinho/{usuarioId}/limpar`                |                                                    | `204`   |

`adicionais` e uma lista de ids (opcional). Resposta:

```json
{
  "id": 1,
  "usuarioId": 1,
  "atualizadoEm": "2026-10-14T12:15:08.454",
  "itens": [
    {
      "id": 1,
      "produtoId": 1,
      "produtoNome": "Bowl Nordestino",
      "quantidade": 2,
      "precoUnitario": 42.90,
      "adicionais": [{ "id": 3, "nome": "...", "preco": 3.00 }],
      "subtotal": 85.80,
      "observacao": null
    }
  ],
  "subtotal": 85.80
}
```

### Checkout

`POST /checkout` responde `201` com o pedido criado.

```json
{
  "usuarioId": 1,
  "formaPagamento": "pix",
  "endereco": {
    "cep": "01310-100",
    "logradouro": "Avenida Paulista",
    "numero": "1000",
    "bairro": "Bela Vista",
    "cidade": "Sao Paulo"
  },
  "itens": [
    { "produtoId": 1, "quantidade": 2, "observacao": "sem cebola", "adicionais": [1, 2] }
  ]
}
```

O campo `usuarioId` tambem pode ser enviado como `clienteId`.

### Pedidos

| Metodo | Rota                         | Sucesso |
|--------|------------------------------|---------|
| GET    | `/pedidos/cliente/{usuarioId}` | `200` |
| GET    | `/pedidos/acompanhar/{codigo}` | `200` |

Resposta de um pedido (o historico devolve uma lista deles):

```json
{
  "id": 1,
  "codigo": "QF-482913",
  "usuarioId": 1,
  "status": "RECEBIDO",
  "formaPagamento": "PIX",
  "endereco": { "cep": "01310100", "logradouro": "...", "numero": "...", "bairro": "...", "cidade": "..." },
  "subtotal": 39.90,
  "taxaEntrega": 6.90,
  "total": 46.80,
  "criadoEm": "2026-10-14T12:15:08.454",
  "itens": [
    {
      "produtoId": 1,
      "produtoNome": "Bowl Nordestino",
      "quantidade": 1,
      "precoUnitario": 39.90,
      "observacao": null,
      "adicionais": [],
      "subtotal": 39.90
    }
  ]
}
```

Valores em dinheiro sempre saem com 2 casas decimais. Datas saem como `AAAA-MM-DDTHH:MM:SS`,
na hora local do servidor e sem fuso.

### Health

| Metodo | Rota                            | Descricao                                            |
|--------|---------------------------------|------------------------------------------------------|
| GET    | `/actuator`                     | links para os endpoints abaixo                       |
| GET    | `/actuator/health`              | `{ "status": "UP" }` (`503` se algo estiver `DOWN`)  |
| GET    | `/actuator/health/{componente}` | `db`, `diskSpace`, `ping` ou `ssl` (so com detalhes) |
| GET    | `/actuator/info`                | `{}`                                                 |

Com `MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=always`, o health tambem mostra a situacao do
banco, do espaco em disco e dos demais componentes.

## Erros

Fora as rotas de autenticacao, toda falha responde:

```json
{ "timestamp": "2026-10-14T12:15:08.454", "status": 404, "erro": "Produto nao encontrado: 99" }
```

| Status | Quando                                                                          |
|--------|---------------------------------------------------------------------------------|
| `400`  | campo invalido, JSON ilegivel, adicional de outro produto, forma de pagamento invalida |
| `404`  | cliente, categoria, produto, item do carrinho ou pedido nao encontrado          |
| `405`  | metodo HTTP nao suportado na rota                                               |
| `409`  | registro duplicado ou em uso (ex.: apagar um produto que ja esta em um pedido)  |
| `500`  | erro inesperado                                                                 |

Nos erros de validacao, a mensagem indica o campo, por exemplo `"nome: não deve estar em branco"`
ou `"itens[0].quantidade: deve ser maior que ou igual à 1"`. O idioma segue o `Accept-Language`
da requisicao (pt-BR quando nao informado).

## Banco de dados

- Arquivo: `data/qfome.db` (relativo a pasta onde o backend roda; ignorado pelo git).
- Tabelas em `src/db/schema.sql` e catalogo inicial em `src/db/data.sql`: 6 categorias,
  29 produtos e 87 adicionais.
- Os dois scripts rodam a cada start sem duplicar nada (`IF NOT EXISTS` e
  `ON CONFLICT DO NOTHING`) e sem desfazer o que foi alterado pela API.
- As chaves estrangeiras estao ativas: um registro em uso nao pode ser apagado (`409`).
- Para inspecionar ou editar: abra `data/qfome.db` no [DB Browser for SQLite](https://sqlitebrowser.org/).
- Para zerar o banco: pare o backend e apague `data/qfome.db`.

## Variaveis de ambiente

Todas sao opcionais. Podem vir do ambiente ou de um arquivo `.env` na pasta do backend
(modelo em `.env.example`).

| Variavel                                 | Padrao                                                        | Descricao |
|------------------------------------------|---------------------------------------------------------------|-----------|
| `SERVER_PORT`                            | `8080`                                                        | porta da API |
| `DB_PATH`                                | `./data/qfome.db`                                             | caminho do arquivo SQLite |
| `SQL_INIT_MODE`                          | `always`                                                      | `always` roda `schema.sql` e `data.sql` a cada start; `never` nao roda |
| `APP_CORS_ALLOWED_ORIGINS`               | `http://localhost:3000,http://localhost:3001,http://localhost:8081` | origens liberadas no CORS |
| `APP_CORS_ALLOWED_HEADERS`               | `Authorization,Content-Type,Accept,Origin,X-Requested-With`   | cabecalhos liberados no CORS |
| `APP_CORS_ALLOW_CREDENTIALS`             | `true`                                                        | envia `Access-Control-Allow-Credentials` |
| `APP_CORS_MAX_AGE_SECONDS`               | `3600`                                                        | cache do preflight, em segundos |
| `MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS`| `never`                                                       | `never`, `when-authorized` ou `always` |

O app mobile nativo nao passa por CORS; a origem `8081` e para o Expo no navegador.

## Testes

Usam o runner nativo do Node (`node:test`), sem dependencias extras.

```bash
npm test                   # todos
npm run test:unit          # so os unitarios (sem banco e sem HTTP)
npm run test:integration   # so os de integracao
npm run test:coverage      # todos, com relatorio de cobertura
```

Os testes nunca tocam em `data/qfome.db`: cada arquivo de integracao cria um SQLite proprio
numa pasta temporaria, apagada no fim.

```
test/
  unit/                 regras isoladas, com repositorios falsos
    config/             variaveis de ambiente, CORS, tratamento de erros
    dto/                conversao do JSON, validacoes e formato das respostas
    model/              precos de itens, carrinho e pedido
    service/            carrinho, checkout, catalogo e acompanhamento
    util/ validacao/ web/
  integration/
    banco.test.js       schema, catalogo inicial, chaves estrangeiras e transacoes
    repository/         consultas SQL contra um SQLite real
    api/                requisicoes HTTP contra a aplicacao inteira, uma rota por arquivo,
                        mais erros, CORS e o fluxo completo do pedido (fluxoDoPedido.test.js)
  apoio/                funcoes compartilhadas
    api.js              sobe a aplicacao e faz requisicoes HTTP
    banco.js            abre um SQLite temporario
    dados.js            itens do catalogo inicial e atalhos (cadastrar cliente, fechar pedido...)
    fabricas.js         objetos de dominio para os testes unitarios
    verificacoes.js     verificacoes reutilizadas nos asserts (ex.: falhaCom(404, motivo))
```

Testes marcados como `todo` descrevem um comportamento esperado que ainda nao funciona:
aparecem no relatorio, mas nao quebram a execucao.

## Estrutura

```
src/
  server.js      ponto de entrada: le a configuracao, abre o banco e sobe o servidor
  app.js         monta a aplicacao: liga repositories, services e controllers
  config/        variaveis de ambiente, conexao com o banco, CORS e tratamento de erros
  controller/    rotas HTTP de cada recurso
  service/       regras de negocio (carrinho, checkout, catalogo, pedidos)
  repository/    consultas SQL ao SQLite
  model/         entidades e enums (perfil, status do pedido, forma de pagamento)
  dto/           formato das requisicoes e respostas em JSON
  validacao/     validacao dos campos e mensagens de erro por idioma
  web/           leitura do corpo, conversao de tipos, rotas e erros HTTP
  util/          texto e datas
  db/            schema.sql (tabelas) e data.sql (catalogo inicial)
test/            testes unitarios e de integracao (ver Testes)
```
