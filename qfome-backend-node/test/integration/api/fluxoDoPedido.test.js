import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { CATALOGO, ENDERECO, emailUnico } from '../../apoio/dados.js';

// Jornada completa do cliente no app, do cadastro ao acompanhamento do pedido.
// Cada etapa usa o resultado da anterior, por isso ficam como subtestes em sequencia.

let api;

before(async () => {
  api = await subirAplicacao();
});

after(() => api.encerrar());

test('cliente se cadastra, monta o carrinho, fecha o pedido e acompanha a entrega', async (t) => {
  const email = emailUnico();
  const { bowlNordestino, mousseDeMaracuja } = CATALOGO;
  const { farofaDeBacon } = bowlNordestino.adicionais;
  let cliente;
  let carrinho;
  let pedido;

  await t.test('cadastra a conta e faz login', async () => {
    const cadastro = await api.post('/auth/register', { name: 'Ana Souza', email, password: 'segredo' });
    assert.equal(cadastro.status, 200);

    const login = await api.post('/auth/login', { email, password: 'segredo' });
    assert.equal(login.status, 200);
    assert.equal(login.corpo.id, cadastro.corpo.id);
    cliente = login.corpo;
  });

  await t.test('navega pelo catalogo', async () => {
    const categorias = await api.get('/categorias');
    assert.equal(categorias.corpo[0].nome, CATALOGO.caseira.nome);

    const produtos = await api.get(`/produtos?categoria=${CATALOGO.caseira.id}`);
    const bowl = produtos.corpo.find((p) => p.id === bowlNordestino.id);
    assert.ok(bowl.adicionais.some((a) => a.id === farofaDeBacon.id));
  });

  await t.test('monta o carrinho', async () => {
    await api.post(`/carrinho/${cliente.id}/itens`, { produtoId: bowlNordestino.id, quantidade: 1, adicionais: [farofaDeBacon.id] });
    const resposta = await api.post(`/carrinho/${cliente.id}/itens`, { produtoId: mousseDeMaracuja.id, quantidade: 1 });

    carrinho = resposta.corpo;
    // (39,90 + 4,00) + 16,90 = 60,80
    assert.equal(carrinho.itens.length, 2);
    assert.equal(carrinho.subtotal, 60.8);
  });

  await t.test('fecha o pedido com os itens do carrinho e limpa o carrinho', async () => {
    const itens = carrinho.itens.map((item) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      observacao: item.observacao,
      adicionais: item.adicionais.map((a) => a.id),
    }));

    const checkout = await api.post('/checkout', { usuarioId: cliente.id, formaPagamento: 'cartao', endereco: ENDERECO, itens });
    assert.equal(checkout.status, 201);
    pedido = checkout.corpo;
    assert.equal(pedido.subtotal, carrinho.subtotal);
    assert.equal(pedido.taxaEntrega, 0);
    assert.equal(pedido.total, 60.8);

    assert.equal((await api.delete(`/carrinho/${cliente.id}/limpar`)).status, 204);
    assert.deepEqual((await api.get(`/carrinho/${cliente.id}`)).corpo.itens, []);
  });

  await t.test('acompanha o pedido pelo codigo enquanto o status muda', async () => {
    const recebido = await api.get(`/pedidos/acompanhar/${pedido.codigo}`);
    assert.equal(recebido.corpo.status, 'RECEBIDO');

    // A API nao muda o status; aqui ele e alterado direto no banco, como faria a cozinha.
    api.db.prepare("UPDATE pedido SET status = 'SAIU_PARA_ENTREGA' WHERE codigo = ?").run(pedido.codigo);
    const saiu = await api.get(`/pedidos/acompanhar/${pedido.codigo}`);
    assert.equal(saiu.corpo.status, 'SAIU_PARA_ENTREGA');
  });

  await t.test('encontra o pedido no historico', async () => {
    const historico = await api.get(`/pedidos/cliente/${cliente.id}`);
    assert.deepEqual(historico.corpo.map((p) => p.codigo), [pedido.codigo]);
  });
});
