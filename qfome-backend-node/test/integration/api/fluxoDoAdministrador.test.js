import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { ADMIN, cadastrarAdmin } from '../../apoio/admin.js';
import { cadastrarCliente, CATALOGO, fecharPedido } from '../../apoio/dados.js';

// Jornada completa do administrador, do login ao logout. Cada etapa usa o resultado da anterior.

let api;
let pastaDados;

before(async () => {
  pastaDados = fs.mkdtempSync(path.join(os.tmpdir(), 'qfome-fluxo-admin-'));
  api = await subirAplicacao({ env: { DATA_DIR: pastaDados } });
  cadastrarAdmin(api.db);
});

after(async () => {
  await api.encerrar();
  fs.rmSync(pastaDados, { recursive: true, force: true });
});

test('administrador entra, gerencia o cardapio, exporta os pedidos e sai', async (t) => {
  let sessao;
  let prato;
  let pedido;

  await t.test('entra com e-mail e senha', async () => {
    const { status, corpo } = await api.post('/admin/login', { email: ADMIN.email, password: ADMIN.senha });
    assert.equal(status, 200);
    sessao = { headers: { Authorization: `Bearer ${corpo.token}` } };
  });

  await t.test('insere um prato, que aparece no cardapio do cliente', async () => {
    const dados = { categoriaId: CATALOGO.caseira.id, nome: 'Risoto de Cogumelos', preco: 42.9, tempoPreparoMin: 28 };
    const { status, corpo } = await api.post('/produtos', dados, sessao);
    assert.equal(status, 201);
    prato = corpo;

    const { corpo: cardapio } = await api.get('/produtos');
    assert.ok(cardapio.some((p) => p.id === prato.id));
  });

  await t.test('altera o prato', async () => {
    const { status } = await api.put(`/produtos/${prato.id}`, { ...prato, nome: 'Risoto Especial', preco: 45.5 }, sessao);
    assert.equal(status, 200);

    const { corpo } = await api.get(`/produtos/${prato.id}`);
    assert.equal(corpo.nome, 'Risoto Especial');
    assert.equal(corpo.preco, 45.5);
  });

  await t.test('cliente compra o prato com o preco novo', async () => {
    const cliente = await cadastrarCliente(api);
    pedido = await fecharPedido(api, cliente.id, [{ produtoId: prato.id, quantidade: 1 }]);
    assert.equal(pedido.total, 45.5);
  });

  await t.test('nao consegue excluir o prato que ja foi vendido, mas exclui um que nao foi', async () => {
    assert.equal((await api.delete(`/produtos/${prato.id}`, sessao)).status, 409);

    const { corpo: outro } = await api.post('/produtos', { categoriaId: 1, nome: 'Prato sem venda', preco: 10 }, sessao);
    assert.equal((await api.delete(`/produtos/${outro.id}`, sessao)).status, 204);
    assert.equal((await api.get(`/produtos/${outro.id}`)).status, 404);
  });

  await t.test('exporta os pedidos em JSON e ve a exportacao no historico', async () => {
    const { status, corpo } = await api.post('/admin/relatorios/pedidos/exportar', {}, sessao);
    assert.equal(status, 201);
    assert.deepEqual(JSON.parse(fs.readFileSync(corpo.arquivo, 'utf8')).pedidos.map((p) => p.codigo), [pedido.codigo]);

    const { corpo: historico } = await api.get('/admin/exportacoes', sessao);
    assert.deepEqual(historico.map((e) => [e.usuarioNome, e.totalPedidos, e.faturamentoTotal]), [[ADMIN.nome, 1, 45.5]]);
  });

  await t.test('sai e perde o acesso', async () => {
    assert.equal((await api.post('/admin/logout', undefined, sessao)).status, 204);
    assert.equal((await api.delete(`/produtos/${prato.id}`, sessao)).status, 401);
  });
});
