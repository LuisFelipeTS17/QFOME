import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import {
  cadastrarCliente,
  CATALOGO,
  corpoDeCheckout,
  criarProduto,
  ENDERECO,
  fecharPedido,
} from '../../apoio/dados.js';

const { bowlNordestino, frangoCrocante, mousseDeMaracuja } = CATALOGO;
const { farofaDeBacon, queijoGratinado } = bowlNordestino.adicionais;

describe('API POST /checkout', () => {
  let api;
  let clienteId;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  beforeEach(async () => {
    clienteId = (await cadastrarCliente(api)).id;
  });

  /** Envia o checkout e devolve { status, corpo } sem exigir sucesso. */
  const enviar = (corpo) => api.post('/checkout', corpo);

  describe('pedido criado', () => {
    it('devolve o pedido completo (201)', async () => {
      const { status, corpo } = await enviar(corpoDeCheckout(clienteId, [
        { produtoId: bowlNordestino.id, quantidade: 2, observacao: 'sem cebola', adicionais: [farofaDeBacon.id, queijoGratinado.id] },
      ]));

      assert.equal(status, 201);
      assert.match(corpo.codigo, /^QF-\d{6}$/);
      assert.equal(corpo.usuarioId, clienteId);
      assert.equal(corpo.status, 'RECEBIDO');
      assert.equal(corpo.formaPagamento, 'PIX');
      assert.deepEqual(corpo.endereco, { ...ENDERECO, cep: '01310100' });
      assert.match(corpo.criadoEm, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
      assert.deepEqual(corpo.itens, [{
        produtoId: bowlNordestino.id,
        produtoNome: bowlNordestino.nome,
        quantidade: 2,
        precoUnitario: bowlNordestino.preco,
        observacao: 'sem cebola',
        adicionais: [farofaDeBacon, queijoGratinado],
        subtotal: 97.8,
      }]);
    });

    it('gera um codigo diferente para cada pedido', async () => {
      const item = [{ produtoId: mousseDeMaracuja.id, quantidade: 1 }];
      const codigos = new Set();
      for (let i = 0; i < 5; i++) codigos.add((await fecharPedido(api, clienteId, item)).codigo);

      assert.equal(codigos.size, 5);
    });
  });

  describe('valores calculados no servidor', () => {
    it('frete gratis quando o subtotal passa de R$ 45,00', async () => {
      // (39,90 + 4,00 + 5,00) x 2 = 97,80
      const pedido = await fecharPedido(api, clienteId, [
        { produtoId: bowlNordestino.id, quantidade: 2, adicionais: [farofaDeBacon.id, queijoGratinado.id] },
      ]);

      assert.equal(pedido.subtotal, 97.8);
      assert.equal(pedido.taxaEntrega, 0);
      assert.equal(pedido.total, 97.8);
    });

    it('cobra R$ 6,90 de entrega abaixo de R$ 45,00', async () => {
      const pedido = await fecharPedido(api, clienteId, [{ produtoId: mousseDeMaracuja.id, quantidade: 1 }]);

      assert.equal(pedido.subtotal, 16.9);
      assert.equal(pedido.taxaEntrega, 6.9);
      assert.equal(pedido.total, 23.8);
    });

    it('nao cobra entrega com subtotal de exatamente R$ 45,00', async () => {
      const produto = await criarProduto(api, { preco: 22.5 });

      const pedido = await fecharPedido(api, clienteId, [{ produtoId: produto.id, quantidade: 2 }]);

      assert.equal(pedido.subtotal, 45);
      assert.equal(pedido.taxaEntrega, 0);
    });

    it('cobra entrega com subtotal de R$ 44,99', async () => {
      const produto = await criarProduto(api, { preco: 44.99 });

      const pedido = await fecharPedido(api, clienteId, [{ produtoId: produto.id, quantidade: 1 }]);

      assert.equal(pedido.taxaEntrega, 6.9);
      assert.equal(pedido.total, 51.89);
    });

    it('soma varios itens', async () => {
      // 39,90 + 36,90 + 16,90 x 2 = 110,60
      const pedido = await fecharPedido(api, clienteId, [
        { produtoId: bowlNordestino.id, quantidade: 1 },
        { produtoId: frangoCrocante.id, quantidade: 1 },
        { produtoId: mousseDeMaracuja.id, quantidade: 2 },
      ]);

      assert.equal(pedido.itens.length, 3);
      assert.equal(pedido.subtotal, 110.6);
    });

    it('ignora precos e totais enviados pelo cliente', async () => {
      const { corpo } = await enviar(corpoDeCheckout(
        clienteId,
        [{ produtoId: mousseDeMaracuja.id, quantidade: 1, precoUnitario: 0.01, subtotal: 0.01 }],
        { subtotal: 0.01, taxaEntrega: 0, total: 0.01 },
      ));

      assert.equal(corpo.itens[0].precoUnitario, 16.9);
      assert.equal(corpo.total, 23.8);
    });

    it('escreve os valores com duas casas decimais', async () => {
      const { texto } = await enviar(corpoDeCheckout(clienteId, [{ produtoId: mousseDeMaracuja.id, quantidade: 1 }]));
      assert.match(texto, /"subtotal":16\.90,"taxaEntrega":6\.90,"total":23\.80/);
    });
  });

  describe('precos congelados', () => {
    it('o pedido mantem os precos da hora da compra', async () => {
      const produto = await criarProduto(api, { preco: 30 });
      const { lastInsertRowid } = api.db
        .prepare("INSERT INTO adicional (produto_id, nome, preco) VALUES (?, 'Bacon extra', 4)")
        .run(produto.id);
      const adicionalId = Number(lastInsertRowid);
      const pedido = await fecharPedido(api, clienteId, [{ produtoId: produto.id, quantidade: 1, adicionais: [adicionalId] }]);

      await api.put(`/produtos/${produto.id}`, { ...produto, preco: 99 });
      api.db.prepare('UPDATE adicional SET preco = 9.99 WHERE id = ?').run(adicionalId);

      const { corpo } = await api.get(`/pedidos/acompanhar/${pedido.codigo}`);
      assert.equal(corpo.itens[0].precoUnitario, 30);
      assert.equal(corpo.itens[0].adicionais[0].preco, 4);
      assert.equal(corpo.subtotal, 34);
    });
  });

  describe('dados de entrada', () => {
    it('aceita as formas de pagamento sem diferenciar maiusculas', async () => {
      const item = [{ produtoId: mousseDeMaracuja.id, quantidade: 1 }];
      for (const [enviada, gravada] of [['PIX', 'PIX'], ['cartao', 'CARTAO'], ['Dinheiro', 'DINHEIRO']]) {
        const pedido = await fecharPedido(api, clienteId, item, { formaPagamento: enviada });
        assert.equal(pedido.formaPagamento, gravada);
      }
    });

    it('recusa forma de pagamento desconhecida (400)', async () => {
      const { status, corpo } = await enviar(corpoDeCheckout(clienteId, [{ produtoId: 1, quantidade: 1 }], { formaPagamento: 'boleto' }));

      assert.equal(status, 400);
      assert.equal(corpo.erro, 'Forma de pagamento invalida');
    });

    it('aceita clienteId no lugar de usuarioId', async () => {
      const { usuarioId, ...semUsuario } = corpoDeCheckout(clienteId, [{ produtoId: 1, quantidade: 1 }]);

      const { status, corpo } = await enviar({ ...semUsuario, clienteId: usuarioId });

      assert.equal(status, 201);
      assert.equal(corpo.usuarioId, clienteId);
    });

    it('aceita CEP sem hifen', async () => {
      const pedido = await fecharPedido(api, clienteId, [{ produtoId: 1, quantidade: 1 }], {
        endereco: { ...ENDERECO, cep: '01310100' },
      });
      assert.equal(pedido.endereco.cep, '01310100');
    });

    const invalidos = [
      ['sem usuario', { usuarioId: null }, 'usuarioId: não deve ser nulo'],
      ['sem forma de pagamento', { formaPagamento: '' }, 'formaPagamento: não deve estar em branco'],
      ['sem endereco', { endereco: null }, 'endereco: não deve ser nulo'],
      ['com CEP invalido', { endereco: { ...ENDERECO, cep: '1234' } }, 'endereco.cep: deve ter 8 digitos'],
      ['sem numero no endereco', { endereco: { ...ENDERECO, numero: ' ' } }, 'endereco.numero: não deve estar em branco'],
      ['sem itens', { itens: [] }, 'itens: não deve estar vazio'],
      ['com quantidade zero', { itens: [{ produtoId: 1, quantidade: 0 }] }, 'itens[0].quantidade: deve ser maior que ou igual à 1'],
      ['com item sem produto', { itens: [{ produtoId: 1, quantidade: 1 }, { quantidade: 1 }] }, 'itens[1].produtoId: não deve ser nulo'],
    ];
    for (const [caso, campos, erro] of invalidos) {
      it(`recusa pedido ${caso} (400)`, async () => {
        const { status, corpo } = await enviar({ ...corpoDeCheckout(clienteId, [{ produtoId: 1, quantidade: 1 }]), ...campos });

        assert.equal(status, 400);
        assert.equal(corpo.erro, erro);
      });
    }
  });

  describe('referencias inexistentes', () => {
    it('responde 404 quando o cliente nao existe', async () => {
      const { status, corpo } = await enviar(corpoDeCheckout(999999, [{ produtoId: 1, quantidade: 1 }]));

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Usuario nao encontrado');
    });

    it('responde 404 quando o produto nao existe, sem gravar o pedido', async () => {
      const { status, corpo } = await enviar(corpoDeCheckout(clienteId, [
        { produtoId: bowlNordestino.id, quantidade: 1 },
        { produtoId: 999999, quantidade: 1 },
      ]));

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Produto nao encontrado: 999999');
      assert.deepEqual((await api.get(`/pedidos/cliente/${clienteId}`)).corpo, []);
    });

    it('recusa adicional de outro produto (400)', async () => {
      const { batataExtra } = frangoCrocante.adicionais;

      const { status, corpo } = await enviar(corpoDeCheckout(clienteId, [
        { produtoId: bowlNordestino.id, quantidade: 1, adicionais: [batataExtra.id] },
      ]));

      assert.equal(status, 400);
      assert.equal(corpo.erro, `Adicional ${batataExtra.id} nao pertence ao produto ${bowlNordestino.id}`);
    });
  });
});
