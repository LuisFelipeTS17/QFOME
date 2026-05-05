# QFOME Backend

API REST do QFOME construida com Java 21 e Spring Boot 3.5.

## Stack

- Java 21
- Spring Boot 3.5 (Web, Data JPA, Validation, Actuator)
- H2 (banco em arquivo local)
- Lombok

## Como rodar

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

API disponivel em `http://localhost:8080`.

## Endpoints

### Health

```
GET /actuator/health
```

### Autenticacao

```
POST /auth/register   { nome, email, senha, telefone }
POST /auth/login      { email, senha }
```

### Categorias

```
GET    /categorias
GET    /categorias/{id}
POST   /categorias     { nome, descricao, imagemUrl }
PUT    /categorias/{id}
DELETE /categorias/{id}
```

### Produtos

```
GET    /produtos               ?categoria={id} (opcional)
GET    /produtos/{slug}
POST   /produtos               { nome, descricao, preco, imagemUrl, categoriaId, ... }
PUT    /produtos/{id}
DELETE /produtos/{id}
```

### Carrinho

```
GET    /carrinho/{clienteId}
POST   /carrinho/{clienteId}/itens       { produtoId, quantidade }
PATCH  /carrinho/{clienteId}/itens/{id}  { quantidade }
DELETE /carrinho/{clienteId}/itens/{id}
DELETE /carrinho/{clienteId}/limpar
```

### Checkout

```
POST /checkout   { clienteId, endereco, formaPagamento, itens[] }
```

### Pedidos

```
GET /pedidos/cliente/{clienteId}
GET /pedidos/acompanhar/{codigo}
```

## Banco de dados

- H2 em arquivo: `./data/qfome`
- Schema gerenciado por `spring.jpa.hibernate.ddl-auto: update`
- Seed automatico via `src/main/resources/data.sql` (6 categorias, 25 produtos)
- H2 Console: `http://localhost:8080/h2-console` (habilitar via env)

JDBC URL: `jdbc:h2:file:./data/qfome`

## Variaveis de ambiente

```env
SERVER_PORT=8080
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

Arquivo completo: `src/main/resources/application.yml`

## Testes

```bash
.\mvnw.cmd test
```

Cobre: `GET /actuator/health` (teste de integracao).

## Estrutura

```
src/main/java/com/qfome/
  controller/    AuthController, CategoriaController, ProdutoController,
                 CarrinhoController, CheckoutController, PedidoAcompanhamentoController
  model/         Cliente, Categoria, Produto, Carrinho, ItemCarrinho, Pedido, ItemPedido
  repository/    interfaces Spring Data JPA
  service/       logica de negocio
src/main/resources/
  application.yml
  data.sql       seed de catalogo
```
