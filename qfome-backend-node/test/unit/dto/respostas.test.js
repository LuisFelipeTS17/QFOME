import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Big from 'big.js';

import { CarrinhoDTO } from '../../../src/dto/CarrinhoDTO.js';
import { PedidoDTO } from '../../../src/dto/pedido/PedidoDTO.js';
import { ProdutoDTO } from '../../../src/dto/ProdutoDTO.js';
import { UsuarioDTO } from '../../../src/dto/UsuarioDTO.js';
import { Carrinho } from '../../../src/model/Carrinho.js';
import { ItemCarrinho } from '../../../src/model/ItemCarrinho.js';
import { ItemPedido } from '../../../src/model/ItemPedido.js';
import { ItemPedidoAdicional } from '../../../src/model/ItemPedidoAdicional.js';
import { Pedido } from '../../../src/model/Pedido.js';
import { comoJson, umAdicional, umProduto, umUsuario } from '../../apoio/fabricas.js';

// DTOs de resposta: o formato JSON que o site e o app recebem.

describe('UsuarioDTO', () => {
  it('expoe os dados do cliente sem a senha', () => {
    assert.deepEqual(comoJson(new UsuarioDTO(umUsuario())), {
      id: 1,
      nome: 'Ana Souza',
      email: 'ana@qfome.com',
      perfil: 'CLIENTE',
    });
  });
});

describe('ProdutoDTO', () => {
  it('inclui a categoria e os adicionais do produto', () => {
    const produto = umProduto({ adicionais: [umAdicional({ id: 1, nome: 'Farofa de bacon', preco: 4 })] });

    assert.deepEqual(comoJson(new ProdutoDTO(produto)), {
      id: 1,
      categoriaId: 1,
      categoriaNome: 'Caseira',
      nome: 'Bowl Nordestino',
      descricao: 'Arroz cremoso, carne de sol e queijo coalho.',
      preco: 39.9,
      imagemUrl: 'https://img.qfome.com/bowl.jpg',
      tempoPreparoMin: 29,
      adicionais: [{ id: 1, nome: 'Farofa de bacon', preco: 4 }],
    });
  });

  it('escreve os precos com duas casas decimais', () => {
    const produto = umProduto({ preco: 39.9, adicionais: [umAdicional({ preco: 4 })] });
    const json = JSON.stringify(new ProdutoDTO(produto));

    assert.match(json, /"preco":39\.90/);
    assert.match(json, /"preco":4\.00/);
  });
});

describe('CarrinhoDTO', () => {
  it('calcula o preco unitario com adicionais, o subtotal do item e o do carrinho', () => {
    const bowl = umProduto({ id: 1, nome: 'Bowl Nordestino', preco: 39.9 });
    const mousse = umProduto({ id: 27, nome: 'Mousse de Maracuja', preco: 16.9 });
    const carrinho = new Carrinho({
      id: 5,
      usuarioId: 1,
      atualizadoEm: '2026-10-14 12:15:08.450',
      itens: [
        new ItemCarrinho({ id: 10, produto: bowl, quantidade: 2, observacao: 'sem cebola', adicionais: [umAdicional({ preco: 3 })] }),
        new ItemCarrinho({ id: 11, produto: mousse, quantidade: 1 }),
      ],
    });

    const json = comoJson(new CarrinhoDTO(carrinho));

    assert.equal(json.atualizadoEm, '2026-10-14T12:15:08.45');
    assert.deepEqual(json.itens[0], {
      id: 10,
      produtoId: 1,
      produtoNome: 'Bowl Nordestino',
      quantidade: 2,
      precoUnitario: 42.9,
      adicionais: [{ id: 1, nome: 'Farofa de bacon', preco: 3 }],
      subtotal: 85.8,
      observacao: 'sem cebola',
    });
    assert.equal(json.itens[1].subtotal, 16.9);
    assert.equal(json.subtotal, 102.7);
  });

  it('mostra subtotal zero no carrinho vazio', () => {
    const json = JSON.stringify(new CarrinhoDTO(new Carrinho({ id: 1, usuarioId: 1, atualizadoEm: '2026-10-14 12:00:00.000' })));
    assert.match(json, /"itens":\[\],"subtotal":0\.00/);
  });
});

describe('PedidoDTO', () => {
  function umPedido() {
    // O adicional custa 9,99 hoje, mas o pedido foi feito quando custava 4,00.
    const farofa = umAdicional({ id: 1, nome: 'Farofa de bacon', preco: 9.99 });
    const item = new ItemPedido({
      id: 1,
      produto: umProduto({ preco: 45 }),
      quantidade: 2,
      precoUnitario: 39.9,
      observacao: null,
      adicionais: [new ItemPedidoAdicional(farofa, 4)],
    });
    return new Pedido({
      id: 3,
      codigo: 'QF-123456',
      usuarioId: 1,
      status: 'RECEBIDO',
      formaPagamento: 'PIX',
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'Sao Paulo',
      subtotal: new Big('87.80'),
      taxaEntrega: new Big(0),
      total: new Big('87.80'),
      criadoEm: '2026-10-14 12:15:08.454',
      itens: [item],
    });
  }

  it('agrupa o endereco e converte a data', () => {
    const json = comoJson(new PedidoDTO(umPedido()));

    assert.deepEqual(json.endereco, {
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'Sao Paulo',
    });
    assert.equal(json.criadoEm, '2026-10-14T12:15:08.454');
    assert.equal(json.codigo, 'QF-123456');
    assert.equal(json.total, 87.8);
  });

  it('mostra os precos congelados no pedido, nao os precos atuais do catalogo', () => {
    const [item] = comoJson(new PedidoDTO(umPedido())).itens;

    assert.equal(item.precoUnitario, 39.9);
    assert.deepEqual(item.adicionais, [{ id: 1, nome: 'Farofa de bacon', preco: 4 }]);
    assert.equal(item.subtotal, 87.8);
  });

  it('escreve taxa de entrega zero com duas casas decimais', () => {
    assert.match(JSON.stringify(new PedidoDTO(umPedido())), /"taxaEntrega":0\.00/);
  });
});
