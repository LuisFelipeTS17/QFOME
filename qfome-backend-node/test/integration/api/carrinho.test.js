import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { cadastrarCliente, CATALOGO } from '../../apoio/dados.js';

const { bowlNordestino, frangoCrocante, mousseDeMaracuja } = CATALOGO;
const { farofaDeBacon, queijoGratinado, molhoPicante } = bowlNordestino.adicionais;

describe('API /carrinho', () => {
  let api;
  let clienteId;
  let carrinho;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  beforeEach(async () => {
    clienteId = (await cadastrarCliente(api)).id;
    carrinho = `/carrinho/${clienteId}`;
  });

  /** Adiciona o item e confere o 200; devolve o carrinho atualizado. */
  async function adicionar(item) {
    const { status, corpo } = await api.post(`${carrinho}/itens`, item);
    assert.equal(status, 200, JSON.stringify(corpo));
    return corpo;
  }

  describe('GET /carrinho/{usuarioId}', () => {
    it('cria um carrinho vazio no primeiro acesso', async () => {
      const { status, corpo, texto } = await api.get(carrinho);

      assert.equal(status, 200);
      assert.equal(corpo.usuarioId, clienteId);
      assert.deepEqual(corpo.itens, []);
      assert.match(corpo.atualizadoEm, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      assert.match(texto, /"subtotal":0\.00/);
    });

    it('devolve sempre o mesmo carrinho do cliente', async () => {
      const primeiro = await api.get(carrinho);
      const segundo = await api.get(carrinho);

      assert.equal(segundo.corpo.id, primeiro.corpo.id);
    });

    it('responde 404 quando o cliente nao existe', async () => {
      const { status, corpo } = await api.get('/carrinho/999999');

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Usuario nao encontrado');
    });
  });

  describe('POST /carrinho/{usuarioId}/itens', () => {
    it('adiciona o item com adicionais e observacao', async () => {
      const corpo = await adicionar({ produtoId: bowlNordestino.id, quantidade: 2, observacao: 'sem cebola', adicionais: [molhoPicante.id] });

      assert.equal(corpo.itens.length, 1);
      assert.deepEqual(corpo.itens[0], {
        id: corpo.itens[0].id,
        produtoId: bowlNordestino.id,
        produtoNome: bowlNordestino.nome,
        quantidade: 2,
        precoUnitario: 42.9,
        adicionais: [molhoPicante],
        subtotal: 85.8,
        observacao: 'sem cebola',
      });
      assert.equal(corpo.subtotal, 85.8);
    });

    it('guarda o carrinho entre as requisicoes', async () => {
      await adicionar({ produtoId: bowlNordestino.id, quantidade: 1 });

      const { corpo } = await api.get(carrinho);

      assert.equal(corpo.itens.length, 1);
      assert.equal(corpo.itens[0].produtoId, bowlNordestino.id);
    });

    it('soma a quantidade quando o mesmo item ja esta no carrinho', async () => {
      const item = { produtoId: bowlNordestino.id, quantidade: 1, adicionais: [molhoPicante.id] };
      await adicionar(item);

      const corpo = await adicionar(item);

      assert.equal(corpo.itens.length, 1);
      assert.equal(corpo.itens[0].quantidade, 2);
      assert.equal(corpo.subtotal, 85.8);
    });

    it('considera iguais os mesmos adicionais em outra ordem', async () => {
      await adicionar({ produtoId: bowlNordestino.id, quantidade: 1, adicionais: [farofaDeBacon.id, queijoGratinado.id] });

      const corpo = await adicionar({ produtoId: bowlNordestino.id, quantidade: 1, adicionais: [queijoGratinado.id, farofaDeBacon.id] });

      assert.equal(corpo.itens.length, 1);
      assert.equal(corpo.itens[0].quantidade, 2);
    });

    it('separa itens com observacoes ou adicionais diferentes', async () => {
      await adicionar({ produtoId: bowlNordestino.id, quantidade: 1 });
      await adicionar({ produtoId: bowlNordestino.id, quantidade: 1, observacao: 'sem cebola' });

      const corpo = await adicionar({ produtoId: bowlNordestino.id, quantidade: 1, adicionais: [farofaDeBacon.id] });

      assert.equal(corpo.itens.length, 3);
      // 39,90 + 39,90 + 43,90
      assert.equal(corpo.subtotal, 123.7);
    });

    it('valida o item (400)', async () => {
      const casos = [
        [{ quantidade: 1 }, 'produtoId: não deve ser nulo'],
        [{ produtoId: bowlNordestino.id }, 'quantidade: não deve ser nulo'],
        [{ produtoId: bowlNordestino.id, quantidade: 0 }, 'quantidade: deve ser maior que ou igual à 1'],
        [{ produtoId: bowlNordestino.id, quantidade: 1, observacao: 'x'.repeat(256) }, 'observacao: tamanho deve ser entre 0 e 255'],
      ];
      for (const [item, erro] of casos) {
        const { status, corpo } = await api.post(`${carrinho}/itens`, item);
        assert.equal(status, 400);
        assert.equal(corpo.erro, erro);
      }
    });

    it('responde 404 quando o produto nao existe', async () => {
      const { status, corpo } = await api.post(`${carrinho}/itens`, { produtoId: 999999, quantidade: 1 });

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Produto nao encontrado: 999999');
    });

    it('recusa adicional de outro produto (400)', async () => {
      const { batataExtra } = frangoCrocante.adicionais;

      const { status, corpo } = await api.post(`${carrinho}/itens`, {
        produtoId: bowlNordestino.id, quantidade: 1, adicionais: [batataExtra.id],
      });

      assert.equal(status, 400);
      assert.equal(corpo.erro, `Adicional ${batataExtra.id} nao pertence ao produto ${bowlNordestino.id}`);
      assert.deepEqual((await api.get(carrinho)).corpo.itens, []);
    });
  });

  describe('PATCH /carrinho/{usuarioId}/itens/{id}', () => {
    let itemId;

    beforeEach(async () => {
      itemId = (await adicionar({ produtoId: mousseDeMaracuja.id, quantidade: 1 })).itens[0].id;
    });

    it('altera a quantidade e recalcula o subtotal', async () => {
      const { status, corpo } = await api.patch(`${carrinho}/itens/${itemId}?quantidade=3`);

      assert.equal(status, 200);
      assert.equal(corpo.itens[0].quantidade, 3);
      assert.equal(corpo.subtotal, 50.7);
    });

    it('remove o item quando a quantidade e zero', async () => {
      const { status, corpo } = await api.patch(`${carrinho}/itens/${itemId}?quantidade=0`);

      assert.equal(status, 200);
      assert.deepEqual(corpo.itens, []);
    });

    it('exige o parametro quantidade (400)', async () => {
      const { status, corpo } = await api.patch(`${carrinho}/itens/${itemId}`);

      assert.equal(status, 400);
      assert.equal(corpo.erro, "Required parameter 'quantidade' is not present.");
    });

    it('recusa quantidade que nao e numero (400)', async () => {
      assert.equal((await api.patch(`${carrinho}/itens/${itemId}?quantidade=muitos`)).status, 400);
    });

    it('responde 404 quando o item nao esta no carrinho', async () => {
      const { status, corpo } = await api.patch(`${carrinho}/itens/999999?quantidade=2`);

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Item nao encontrado no carrinho');
    });

    it('nao altera item do carrinho de outro cliente (404)', async () => {
      const outroCliente = await cadastrarCliente(api);

      const { status } = await api.patch(`/carrinho/${outroCliente.id}/itens/${itemId}?quantidade=5`);

      assert.equal(status, 404);
      assert.equal((await api.get(carrinho)).corpo.itens[0].quantidade, 1);
    });
  });

  describe('DELETE /carrinho/{usuarioId}/itens/{id}', () => {
    it('remove so o item indicado', async () => {
      await adicionar({ produtoId: bowlNordestino.id, quantidade: 1 });
      const { itens } = await adicionar({ produtoId: mousseDeMaracuja.id, quantidade: 1 });
      const [bowl, mousse] = itens;

      const { status, corpo } = await api.delete(`${carrinho}/itens/${bowl.id}`);

      assert.equal(status, 200);
      assert.deepEqual(corpo.itens.map((item) => item.id), [mousse.id]);
      assert.equal(corpo.subtotal, mousseDeMaracuja.preco);
    });

    it('responde 404 quando o item nao esta no carrinho', async () => {
      assert.equal((await api.delete(`${carrinho}/itens/999999`)).status, 404);
    });
  });

  describe('DELETE /carrinho/{usuarioId}/limpar', () => {
    it('esvazia o carrinho (204)', async () => {
      await adicionar({ produtoId: bowlNordestino.id, quantidade: 1 });
      await adicionar({ produtoId: mousseDeMaracuja.id, quantidade: 2 });

      const { status, texto } = await api.delete(`${carrinho}/limpar`);

      assert.equal(status, 204);
      assert.equal(texto, '');
      assert.deepEqual((await api.get(carrinho)).corpo.itens, []);
    });

    it('responde 204 mesmo quando o cliente ainda nao tem carrinho', async () => {
      assert.equal((await api.delete(`${carrinho}/limpar`)).status, 204);
    });
  });
});
