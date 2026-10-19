import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ItemPedido } from '../../../src/model/ItemPedido.js';
import { ItemPedidoAdicional } from '../../../src/model/ItemPedidoAdicional.js';
import { Pedido } from '../../../src/model/Pedido.js';
import { umAdicional, umProduto } from '../../apoio/fabricas.js';

describe('ItemPedidoAdicional', () => {
  it('congela o preco atual do adicional por padrao', () => {
    assert.equal(new ItemPedidoAdicional(umAdicional({ preco: 4 })).preco, 4);
  });

  it('aceita o preco congelado vindo do banco', () => {
    assert.equal(new ItemPedidoAdicional(umAdicional({ preco: 9.99 }), 4).preco, 4);
  });
});

describe('ItemPedido', () => {
  it('calcula o subtotal com o preco unitario do pedido, nao o preco atual do produto', () => {
    const item = new ItemPedido({ produto: umProduto({ preco: 99 }), quantidade: 2, precoUnitario: 39.9 });
    assert.equal(item.subtotal.toFixed(2), '79.80');
  });

  it('soma ao subtotal os precos congelados dos adicionais', () => {
    const item = new ItemPedido({ produto: umProduto(), quantidade: 2, precoUnitario: 39.9 });
    item.adicionarAdicional(umAdicional({ id: 1, preco: 4 }));
    item.adicionarAdicional(umAdicional({ id: 2, preco: 5 }));

    assert.equal(item.subtotal.toFixed(2), '97.80');
  });

  it('nao muda o subtotal quando o preco do adicional muda depois', () => {
    const farofa = umAdicional({ preco: 4 });
    const item = new ItemPedido({ produto: umProduto(), quantidade: 1, precoUnitario: 39.9 });
    item.adicionarAdicional(farofa);

    farofa.preco = 9.99;

    assert.equal(item.subtotal.toFixed(2), '43.90');
  });
});

describe('Pedido', () => {
  it('comeca como RECEBIDO e com a data de criacao', () => {
    const pedido = new Pedido({ codigo: 'QF-123456', usuarioId: 1, formaPagamento: 'PIX' });
    pedido.prePersist();

    assert.equal(pedido.status, 'RECEBIDO');
    assert.match(pedido.criadoEm, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
  });

  it('nao sobrescreve status e data ja definidos', () => {
    const pedido = new Pedido({ codigo: 'QF-1', usuarioId: 1, status: 'ENTREGUE', criadoEm: '2026-01-01 10:00:00.000' });
    pedido.prePersist();

    assert.equal(pedido.status, 'ENTREGUE');
    assert.equal(pedido.criadoEm, '2026-01-01 10:00:00.000');
  });

  it('acumula os itens adicionados', () => {
    const pedido = new Pedido({ codigo: 'QF-1', usuarioId: 1 });
    pedido.adicionarItem(new ItemPedido({ produto: umProduto(), quantidade: 1, precoUnitario: 1 }));
    pedido.adicionarItem(new ItemPedido({ produto: umProduto(), quantidade: 1, precoUnitario: 2 }));

    assert.equal(pedido.itens.length, 2);
  });
});
