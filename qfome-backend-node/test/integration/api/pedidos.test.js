import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { cadastrarCliente, CATALOGO, fecharPedido } from '../../apoio/dados.js';

const ITEM = [{ produtoId: CATALOGO.mousseDeMaracuja.id, quantidade: 1 }];

describe('API /pedidos', () => {
  let api;
  let clienteId;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  beforeEach(async () => {
    clienteId = (await cadastrarCliente(api)).id;
  });

  /** Ajusta a data de criacao, para o teste nao depender de pedidos criados no mesmo milissegundo. */
  function definirCriadoEm(codigo, criadoEm) {
    api.db.prepare('UPDATE pedido SET criado_em = ? WHERE codigo = ?').run(criadoEm, codigo);
  }

  describe('GET /pedidos/cliente/{usuarioId}', () => {
    it('devolve lista vazia para cliente sem pedidos', async () => {
      const { status, corpo } = await api.get(`/pedidos/cliente/${clienteId}`);

      assert.equal(status, 200);
      assert.deepEqual(corpo, []);
    });

    it('lista do pedido mais recente para o mais antigo', async () => {
      const antigo = await fecharPedido(api, clienteId, ITEM);
      const recente = await fecharPedido(api, clienteId, ITEM);
      const intermediario = await fecharPedido(api, clienteId, ITEM);
      definirCriadoEm(antigo.codigo, '2026-01-01 10:00:00.000');
      definirCriadoEm(intermediario.codigo, '2026-01-02 10:00:00.000');
      definirCriadoEm(recente.codigo, '2026-01-03 10:00:00.000');

      const { corpo } = await api.get(`/pedidos/cliente/${clienteId}`);

      assert.deepEqual(corpo.map((p) => p.codigo), [recente.codigo, intermediario.codigo, antigo.codigo]);
    });

    it('traz so os pedidos do cliente', async () => {
      const outroCliente = await cadastrarCliente(api);
      const meu = await fecharPedido(api, clienteId, ITEM);
      await fecharPedido(api, outroCliente.id, ITEM);

      const { corpo } = await api.get(`/pedidos/cliente/${clienteId}`);

      assert.deepEqual(corpo.map((p) => p.codigo), [meu.codigo]);
    });

    it('recusa id que nao e numero (400)', async () => {
      assert.equal((await api.get('/pedidos/cliente/ana')).status, 400);
    });
  });

  describe('GET /pedidos/acompanhar/{codigo}', () => {
    it('devolve o pedido pelo codigo, igual ao criado no checkout', async () => {
      const pedido = await fecharPedido(api, clienteId, ITEM);

      const { status, corpo } = await api.get(`/pedidos/acompanhar/${pedido.codigo}`);

      assert.equal(status, 200);
      assert.deepEqual(corpo, pedido);
    });

    it('mostra o status atual do pedido', async () => {
      const pedido = await fecharPedido(api, clienteId, ITEM);

      for (const status of ['EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE']) {
        api.db.prepare('UPDATE pedido SET status = ? WHERE codigo = ?').run(status, pedido.codigo);
        assert.equal((await api.get(`/pedidos/acompanhar/${pedido.codigo}`)).corpo.status, status);
      }
    });

    it('responde 404 quando o codigo nao existe', async () => {
      const { status, corpo } = await api.get('/pedidos/acompanhar/QF-000000');

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Pedido nao encontrado com o codigo: QF-000000');
    });
  });
});
