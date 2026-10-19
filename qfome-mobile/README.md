# QFOME Mobile

![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-3ddc84)
![Expo](https://img.shields.io/badge/expo-SDK%2057-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/react%20native-0.86-61DAFB?logo=react&logoColor=0B1020)
![TypeScript](https://img.shields.io/badge/typescript-6.0-3178C6?logo=typescript&logoColor=white)

App mobile do QFOME, com o mesmo design e a mesma paleta do frontend web.

## Como rodar

O app busca os dados no backend (`qfome-backend/`), entao suba ele antes.

```bash
cd qfome-mobile
npm install
```

Crie um `.env` com o endereco do backend:

```env
# celular fisico (Expo Go): IP da maquina na mesma rede Wi-Fi
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
# emulador Android: 10.0.2.2 e o "localhost" do computador
# EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
# navegador (tecla w): pode omitir, o padrao e http://localhost:8080
```

```bash
npx expo start -c   # -c limpa o cache; necessario depois de mudar o .env
```

Para descobrir o IP no Linux: `hostname -I`; no Windows: `ipconfig` (Endereco IPv4).
Se o celular nao alcancar a API, libere a porta 8080 no firewall do computador.

Depois disso:

- **Celular**: instale o app **Expo Go** e leia o QR Code do terminal.
- **Emulador Android**: tecle `a` no terminal (precisa do Android Studio).
- **iOS**: tecle `i` (precisa de macOS + Xcode).
- **Navegador**: tecle `w`.

Verificacoes:

```bash
npm run typecheck    # tsc --noEmit (valida inclusive as rotas tipadas)
npx expo-doctor      # diagnostico de dependencias e config
```

## Design system

A paleta e as fontes foram portadas de `src/app/globals.css` do site.

| Token        | Hex       | Uso                                     |
|--------------|-----------|-----------------------------------------|
| `bg`         | `#f7ecdf` | Fundo creme do app                      |
| `surface`    | `#fffaf3` | Cartoes claros (`SurfaceCard`)          |
| `ink`        | `#2a120b` | Texto principal                         |
| `muted`      | `#654037` | Texto de apoio                          |
| `brand`      | `#d72638` | Vermelho da marca, botoes primarios     |
| `brandDeep`  | `#981b1e` | Estado pressionado do vermelho          |
| `accent`     | `#ffac39` | Amarelo de destaque                     |
| `outline`    | `#f2cfbf` | Bordas dos cartoes                      |
| `panelBg`    | `#321312` | Painel bordo (combo, resumo do pedido)  |
| `panelAction`| `#ffb348` | Botao dourado dentro do painel escuro   |

Fontes: **Bebas Neue** nos titulos (`fonts.display`, equivalente ao `.font-display`) e
**Manrope** no corpo, com os pesos 400/500/600/700/800 registrados em `src/app/_layout.tsx`.

Tokens ficam em `src/theme/colors.ts` e `src/theme/typography.ts`.

## Telas

Navegacao com **Expo Router**: 4 abas na base + stack para as telas internas.

| Rota mobile              | Rota do site             | Descricao                                    |
|--------------------------|--------------------------|----------------------------------------------|
| `(tabs)/index`           | `/`                      | Home: hero, busca, categorias, ofertas, destaques |
| `(tabs)/cardapio`        | `/cardapio`              | Cardapio completo com filtro por categoria   |
| `(tabs)/pedido`          | `/pedido`                | Carrinho editavel com recalculo de totais    |
| `(tabs)/cliente`         | `/cliente`               | Area do cliente e historico de pedidos       |
| `categoria/[id]`         | `/categoria/[slug]`      | Pratos da categoria, com hero da imagem      |
| `produto/[id]`           | `/produto/[slug]`        | Detalhe + montagem do pedido (qtd, adicionais, observacao) |
| `checkout/index`         | `/checkout`              | Dados de entrega, pagamento e confirmacao    |
| `checkout/sucesso`       | `/checkout/sucesso`      | Confirmacao com codigo do pedido             |
| `acompanhar-pedido`      | `/acompanhar-pedido`     | Timeline da entrega com a trilha animada     |
| `entrar`                 | `/entrar`                | Login e cadastro                             |
| `contato`                | `/contato`               | Canais de atendimento                        |
| `recuperar-acesso`       | `/recuperar-acesso`      | Recuperacao de acesso por e-mail             |

## Estrutura

```text
qfome-mobile/
  src/
    app/            # rotas (Expo Router) — cada arquivo e uma tela
      _layout.tsx   # Stack raiz + carregamento das fontes + splash
      (tabs)/       # tab bar: Inicio, Cardapio, Pedido, Conta
    components/     # UI compartilhada (Screen, SurfaceCard, DarkPanel, ProductCard, Field...)
    data/           # dados de vitrine do site (selo, nota, itens do prato, imagens das categorias)
    lib/
      api.ts        # cliente HTTP do backend (com timeout)
      database.ts   # banco SQLite local (Anexo B)
      session.ts    # usuario logado (tabela sessao)
      catalog.ts    # cache do catalogo + sincronizacao com o backend (useCatalogo)
      vitrine.ts    # liga os dados de vitrine aos produtos do backend pelo nome
      storage.ts    # carrinho em montagem (AsyncStorage)
      pedido.ts     # taxa de entrega e rotulos de status
      format.ts     # formatacao de moeda e data pt-BR
    theme/          # paleta, fontes, raios e espacamentos
  metro.config.js   # habilita o .wasm do SQLite no navegador
```

## Dados

### Banco local (SQLite)

O app usa `expo-sqlite` (ja incluso no Expo Go) com o banco `qfome.db` no aparelho.
O schema e o **Anexo B** e e criado em `src/lib/database.ts` na primeira abertura:

| Tabela            | Conteudo                                                        |
|-------------------|-----------------------------------------------------------------|
| `sessao`          | Usuario logado (uma linha, `id = 1`), gravado no login/cadastro |
| `categoria_cache` | Copia das categorias de `GET /categorias`                       |
| `produto_cache`   | Copia dos produtos de `GET /produtos`                           |

As telas leem o catalogo do SQLite (abre na hora e funciona sem internet) e em seguida
sincronizam com o backend, no maximo uma vez por minuto. Sem conexao, aparece o aviso
"Mostrando o cardapio salvo no aparelho". Os adicionais de cada prato nao ficam no cache
(o Anexo B nao tem essa tabela) e sao buscados ao abrir o produto.

### O que vem do backend

| Funcionalidade        | Origem                                            |
|-----------------------|---------------------------------------------------|
| Login / cadastro      | `POST /auth/login`, `POST /auth/register` -> `sessao` |
| Categorias e pratos   | `GET /categorias`, `GET /produtos` -> cache SQLite |
| Adicionais do prato   | `GET /produtos/{id}`                              |
| Checkout              | `POST /checkout` (exige login; totais calculados no servidor) |
| Historico             | `GET /pedidos/cliente/{usuarioId}`                |
| Acompanhar pedido     | `GET /pedidos/acompanhar/{codigo}`                |
| Carrinho em montagem  | Local (`AsyncStorage`, chave `qfome-order-items`) |

Precos, descricoes e tempo de preparo vem sempre do banco. Selo ("Mais pedido"), nota,
"o que vem no prato" e as imagens/descricoes das categorias nao existem no Anexo A e
continuam em `src/data/`, ligados aos produtos do backend pelo nome.

O checkout consulta o **ViaCEP** para preencher rua, bairro e cidade, igual ao site.
