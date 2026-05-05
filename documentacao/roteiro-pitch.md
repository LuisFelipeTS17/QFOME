# Roteiro de Pitch — QFOME
### 8 pessoas · 1 minuto cada

> **Divisão feita com base nos commits de cada um no repositório.**
> Cada pessoa apresenta a parte que ela própria construiu no projeto.

| Parte | Responsável | GitHub |
|-------|-------------|--------|
| 1 — Abertura e Problema | Luis Felipe | @LuisFelipeTS17 |
| 2 — Solução e Proposta de Valor | João | @moreirajoaopaulo951 |
| 3 — Demo: Home e Cardápio | Eric | @EricSouzaDosSantos |
| 4 — Demo: Produto e Carrinho | Henrique | @hgolfetto |
| 5 — Demo: Checkout e Confirmação | Lorenzo | LORENZO MAFRA |
| 6 — Demo: Acompanhar e Área do Cliente | Brenda | @Brenda-cslima |
| 7 — Mercado e Modelo de Negócio | Fernando | @fernando-cruzx |
| 8 — Fechamento e Pedido | *(a definir)* | — |

---

> **Para quem faz a demo (Partes 3, 4, 5 e 6):**
> Os links de rota são clicáveis — abra este arquivo no VS Code ou GitHub e clique direto para navegar enquanto grava a tela.
> Backend precisa estar rodando em `http://localhost:8080` e frontend em `http://localhost:3000`.

---

## Parte 1 — Abertura e Problema de Mercado
### Luis Felipe · @LuisFelipeTS17

O mercado de delivery no Brasil movimenta mais de **60 bilhões de reais por ano**. O iFood sozinho processa mais de 70 milhões de pedidos por mês. Os números são impressionantes. Mas existe um problema que esses números escondem: **o usuário está insatisfeito**.

Pesquisas de experiência do consumidor mostram que a principal reclamação em apps de delivery não é o tempo de entrega — é a dificuldade de usar o próprio aplicativo. Interfaces confusas, processos de checkout longos, falta de transparência no status do pedido. O mercado cresceu rápido demais e esqueceu de colocar o cliente no centro.

Existe um espaço real para uma plataforma que faça isso diferente. Uma plataforma que trate cada etapa da jornada de compra como uma oportunidade de encantar o usuário, não de perdê-lo. É exatamente esse espaço que o **QFOME** ocupa.

---

## Parte 2 — Solução e Proposta de Valor
### João · @moreirajoaopaulo951

O QFOME é uma plataforma de delivery construída com uma premissa simples: **o usuário não deveria precisar de tutorial para fazer um pedido**.

Nossa proposta de valor tem três pilares. **Velocidade** — do momento em que o usuário abre o app até a confirmação do pedido, cada tela foi desenhada para eliminar fricção. **Transparência** — o cliente sabe exatamente onde está o pedido dele, em tempo real, com uma linguagem clara e humana. **Personalização** — cada prato pode ser ajustado ao gosto do cliente, com adicionais e observações, sem complicação.

Não estamos competindo com o iFood pelo volume. Estamos competindo pela **qualidade da experiência**. E experiência é o que cria fidelidade. É o que faz o cliente voltar amanhã sem precisar de cupom de desconto.

Agora deixa a gente mostrar o produto funcionando.

---

## Parte 3 — Demo: Descoberta
### Eric · @EricSouzaDosSantos

> **TELA:** [http://localhost:3000](http://localhost:3000)

Essa é a primeira tela que o nosso cliente vê. Sem cadastro obrigatório, sem pop-up pedindo notificação, sem banner de promoção gritando. O usuário chega e já vê o que importa: as categorias e os pratos em destaque.

Trabalhamos com seis categorias pensadas para cobrir diferentes perfis de consumidor — de quem quer uma refeição caseira até quem está no modo fit, passando por grelhados, peixes, sopas e sobremesas. Cada categoria tem identidade visual própria e uma curadoria de pratos cuidadosa.

> *(clicar em uma categoria)* → [http://localhost:3000/cardapio](http://localhost:3000/cardapio)

No cardápio completo, a navegação é fluida. O usuário filtra por categoria, encontra o que quer em segundos. Não tem algoritmo empurrando o produto mais caro nem anúncio patrocinado no meio da lista. **O que aparece aqui é o que é bom, não o que pagou pra aparecer.** Essa é uma das razões pelas quais nosso usuário confia na plataforma.

> *(clicar em qualquer card de prato para a Parte 4 assumir)*

---

## Parte 4 — Demo: Escolha e Carrinho
### Henrique · @hgolfetto

> **TELA:** página de produto
> *(o produto que foi clicado na parte anterior)*

Aqui está a página de detalhe do produto. O usuário pode ajustar a quantidade usando os botões — o total recalcula em tempo real. Logo abaixo tem os adicionais disponíveis, que ele pode marcar ou desmarcar, e um campo de observação livre pra deixar um recado pro restaurante.

Tudo isso acontece instantaneamente, sem loading desnecessário. Quando o usuário clica em **"Adicionar ao pedido"**, o item é salvo e um feedback aparece na tela.

> *(clicar em "Adicionar ao pedido" — aguardar o feedback aparecer)*
> *(clicar em "Meu pedido" no topo da página)* → [http://localhost:3000/pedido](http://localhost:3000/pedido)

No carrinho, o cliente tem controle total. Pode adicionar mais itens, remover o que não quer, ajustar quantidades. O total atualiza na hora. **Não tem surpresa no valor final.**

Esse nível de controle e clareza é o que diferencia uma experiência frustrante de uma experiência que o cliente recomenda pro amigo. Boca a boca é o canal de aquisição mais barato que existe. E ele só funciona quando o produto é bom o suficiente pra merecer.

> *(clicar em "Ir para checkout")*

---

## Parte 5 — Demo: Checkout e Confirmação
### Lorenzo · LORENZO MAFRA

> **TELA:** [http://localhost:3000/checkout](http://localhost:3000/checkout)
> *(chega aqui pelo botão "Ir para checkout" do carrinho)*

No checkout o usuário preenche o endereço de entrega e escolhe a forma de pagamento. Três passos. O usuário sabe o valor total antes de confirmar — sem surpresa. Sem "taxa de serviço" aparecendo na última tela.

> *(preencher o formulário com dados fictícios e clicar em "Confirmar pedido")*

> **TELA:** [http://localhost:3000/checkout/sucesso](http://localhost:3000/checkout/sucesso)

Pedido confirmado. O cliente recebe um código único do pedido e a confirmação imediata. Nenhuma dúvida se "foi mesmo" ou se "precisa esperar um email". A confirmação é instantânea e clara.

Esse momento — a confirmação do pedido — é o momento de maior satisfação do usuário. A gente tratou ele com o cuidado que merece.

> *(anotar o código que aparece na tela — vai ser usado na Parte 6)*
> *(clicar em "Acompanhar")*

---

## Parte 6 — Demo: Acompanhamento e Fidelização
### Brenda · @Brenda-cslima

> **TELA:** [http://localhost:3000/acompanhar-pedido](http://localhost:3000/acompanhar-pedido)
> *(chega aqui pelo botão "Acompanhar" da tela de sucesso)*

Com o código do pedido, o usuário acessa o acompanhamento em tempo real. Uma timeline simples e visual mostra em que etapa o pedido está: recebido, em preparo, saiu para entrega, entregue. Sem precisar ficar ligando pro restaurante, sem ficar adivinhando.

Transparência gera confiança. Confiança gera retenção.

> *(clicar no ícone de conta no topo)* → [http://localhost:3000/entrar](http://localhost:3000/entrar)
> *(fazer login com o usuário de demo cadastrado antes da apresentação)*

> **TELA:** [http://localhost:3000/cliente](http://localhost:3000/cliente)
> *(o login redireciona automaticamente para cá)*

Na área do cliente, o histórico de pedidos aparece completo. Tudo que o usuário pediu fica registrado. Não é dado inventado — é o histórico real. E é esse histórico que permite personalização futura, programa de fidelidade, recomendação de pratos. **É onde o negócio de verdade começa.**

---

## Parte 7 — Mercado e Modelo de Negócio
### Fernando · @fernando-cruzx

O mercado de food delivery no Brasil está em expansão contínua. Só em 2024, o setor cresceu mais de 15% em volume de pedidos. A penetração ainda é baixa fora dos grandes centros — o que significa que o mercado ainda vai crescer muito antes de saturar.

O modelo de negócio do QFOME é baseado em **comissão por pedido** — entre 12% e 18% do valor da transação, pago pelo restaurante parceiro. Esse é o mesmo modelo que sustenta os maiores players do setor globalmente. Sem taxa pro consumidor final, o que reduz fricção na aquisição de usuários.

Receitas adicionais vêm de **planos de visibilidade** para restaurantes que queiram destaque no catálogo — mas com transparência: o usuário sempre sabe o que é curadoria e o que é parceria paga.

Com uma base de clientes fidelizados e baixo custo de retenção, a unidade econômica do negócio fecha bem. **Margem saudável, modelo escalável, mercado em crescimento.**

---

## Parte 8 — Fechamento e Pedido
### *(a definir)*

Por que o QFOME vai dar certo? Três razões.

**Produto.** Vocês acabaram de ver uma jornada de compra completa, fluida, sem obstáculos. Isso não é sorte de design — é resultado de meses de decisões deliberadas colocando o usuário acima de qualquer outra prioridade.

**Time.** Somos oito pessoas com perfis complementares, que construíram isso do zero com foco e disciplina. Um time que entrega em condições adversas é o maior sinal de que vai entregar quando as condições melhorarem.

**Timing.** O consumidor brasileiro está mais digital do que nunca, mais exigente do que nunca, e ainda mal atendido nas experiências que consome. A janela de oportunidade está aberta.

O que a gente está pedindo hoje é simples: **acredite no problema, acredite na solução, acredite no time**. O QFOME está pronto pra crescer. A pergunta é se você quer fazer parte disso.

Obrigado.

---

## Checklist — fazer ANTES de entrar no ar

- [ ] Backend rodando: `cd qfome-backend && .\mvnw.cmd spring-boot:run`
- [ ] Frontend rodando: `npm run dev` (na raiz do qfome-frontend)
- [ ] Usuário de demo criado em [localhost:3000/entrar](http://localhost:3000/entrar) (cadastro)
- [ ] Login feito com esse usuário — sessão ativa no navegador
- [ ] Pelo menos 1 pedido feito com esse usuário (para aparecer no histórico em /cliente)
- [ ] Código do pedido anotado (para usar na demo de acompanhamento)
- [ ] Navegador em [localhost:3000](http://localhost:3000) — tela limpa, sem abas desnecessárias
