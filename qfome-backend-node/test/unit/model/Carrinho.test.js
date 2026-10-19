import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Carrinho } from '../../../src/model/Carrinho.js';
import { ItemCarrinho } from '../../../src/model/ItemCarrinho.js';
import { umAdicional, umProduto } from '../../apoio/fabricas.js';

describe('ItemCarrinho', () => {
  it('sem adicionais, o preco unitario e o preco do produto', () => {
    const item = new ItemCarrinho({ produto: umProduto({ preco: 39.9 }), quantidade: 1 });
    assert.equal(item.precoUnitario.toFixed(2), '39.90');
  });

  it('soma o preco dos adicionais ao preco unitario', () => {
    const item = new ItemCarrinho({
      produto: umProduto({ preco: 39.9 }),
      quantidade: 1,
      adicionais: [umAdicional({ id: 1, preco: 4 }), umAdicional({ id: 2, preco: 5 })],
    });
    assert.equal(item.precoUnitario.toFixed(2), '48.90');
  });

  it('multiplica o preco unitario pela quantidade no subtotal', () => {
    const item = new ItemCarrinho({
      produto: umProduto({ preco: 39.9 }),
      quantidade: 3,
      adicionais: [umAdicional({ preco: 3 })],
    });
    assert.equal(item.subtotal.toFixed(2), '128.70');
  });

  it('soma valores sem erro de ponto flutuante', () => {
    const item = new ItemCarrinho({ produto: umProduto({ preco: 0.1 }), quantidade: 1, adicionais: [umAdicional({ preco: 0.2 })] });
    assert.equal(item.precoUnitario.toString(), '0.3');
  });
});

describe('Carrinho', () => {
  it('soma o subtotal de todos os itens', () => {
    const carrinho = new Carrinho({
      usuarioId: 1,
      itens: [
        new ItemCarrinho({ produto: umProduto({ preco: 39.9 }), quantidade: 2 }),
        new ItemCarrinho({ produto: umProduto({ preco: 16.9 }), quantidade: 1 }),
      ],
    });
    assert.equal(carrinho.subtotal.toFixed(2), '96.70');
  });

  it('tem subtotal zero quando esta vazio', () => {
    assert.equal(new Carrinho({ usuarioId: 1 }).subtotal.toFixed(2), '0.00');
  });

  it('marca a data de atualizacao ao ser criado, sem sobrescrever uma existente', () => {
    const novo = new Carrinho({ usuarioId: 1 });
    novo.prePersist();
    assert.match(novo.atualizadoEm, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);

    const existente = new Carrinho({ usuarioId: 1, atualizadoEm: '2026-01-01 10:00:00.000' });
    existente.prePersist();
    assert.equal(existente.atualizadoEm, '2026-01-01 10:00:00.000');
  });

  it('atualiza a data a cada alteracao', (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 9, 14, 12, 0, 0, 0).getTime() });
    const carrinho = new Carrinho({ usuarioId: 1, atualizadoEm: '2026-01-01 10:00:00.000' });

    carrinho.marcarAtualizado();

    assert.equal(carrinho.atualizadoEm, '2026-10-14 12:00:00.000');
  });
});
