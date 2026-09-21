# QFOME Mobile

![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-3ddc84)
![Expo](https://img.shields.io/badge/expo-SDK%2057-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/react%20native-0.86-61DAFB?logo=react&logoColor=0B1020)
![TypeScript](https://img.shields.io/badge/typescript-6.0-3178C6?logo=typescript&logoColor=white)

App mobile do QFOME, com o mesmo design e a mesma paleta do frontend web.

## Como rodar

```bash
cd qfome-mobile
npm install
npx expo start
```

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
| `categoria/[slug]`       | `/categoria/[slug]`      | Pratos da categoria, com hero da imagem      |
| `produto/[slug]`         | `/produto/[slug]`        | Detalhe + montagem do pedido (qtd, adicionais, observacao) |
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
    data/           # catalogo portado de `src/data/` do site
    lib/
      api.ts        # cliente HTTP espelhado do site, pronto para o backend
      storage.ts    # AsyncStorage (mesmas chaves do localStorage do site)
      format.ts     # formatacao de moeda e data pt-BR
    theme/          # paleta, fontes, raios e espacamentos
```

## Dados

O catalogo (6 categorias, 25 pratos) vem de `src/data/`, copiado do site — o app abre
sem depender do backend. Carrinho, sessao e historico ficam em `AsyncStorage`, usando as
mesmas chaves do `localStorage` da web (`qfome-order-items`, `qfome-user`,
`qfome-last-order`, `qfome-order-history`).

O checkout consulta o **ViaCEP** para preencher rua e bairro, igual ao site.

### Ligar no backend Spring Boot

`src/lib/api.ts` ja tem todos os endpoints. Para ativar, crie um `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
```

Use o IP da maquina na rede local — `localhost` nao funciona a partir de um celular fisico.
Lembre de incluir esse IP em `APP_CORS_ALLOWED_ORIGINS` no backend.
