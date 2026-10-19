import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import Big from 'big.js';

import { CheckoutRequestDTO } from '../../../src/dto/pedido/CheckoutRequestDTO.js';
import {
  calcularTaxaEntrega,
  CheckoutService,
  FRETE_GRATIS_A_PARTIR_DE,
  TAXA_ENTREGA,
} from '../../../src/service/pedido/CheckoutService.js';
import { ProdutoService } from '../../../src/service/ProdutoService.js';
import { comoJson, transacaoDireta, umAdicional, umProduto, umUsuario } from '../../apoio/fabricas.js';
import { falhaCom } from '../../apoio/verificacoes.js';

const farofa = umAdicional({ id: 1, produtoId: 1, nome: 'Farofa de bacon', preco: 4 });
const queijo = umAdicional({ id: 2, produtoId: 1, nome: 'Queijo gratinado', preco: 5 });
const batata = umAdicional({ id: 4, produtoId: 2, nome: 'Batata extra', preco: 8 });
const bowl = umProduto({ id: 1, nome: 'Bowl Nordestino', preco: 39.9, adicionais: [farofa, queijo] });
const frango = umProduto({ id: 2, nome: 'Frango Crocante', preco: 36.9, adicionais: [batata] });
const mousse = umProduto({ id: 27, nome: 'Mousse de Maracuja', preco: 16.9 });

/**
 * CheckoutService com repositorios falsos. O ProdutoService e o real (sobre um repositorio
 * em memoria), porque a validacao dos adicionais faz parte da regra do checkout.
 */
function montarCheckout({ usuario = umUsuario({ id: 1 }), codigoExiste = () => false } = {}) {
  const produtos = [bowl, frango, mousse];
  const pedidoRepository = {
    existsByCodigo: mock.fn(codigoExiste),
    save: mock.fn((pedido) => {
      pedido.id = 100;
      pedido.prePersist();
      return pedido;
    }),
  };
  const usuarioRepository = { findById: (id) => (usuario?.id === id ? usuario : null) };
  const produtoRepository = { findById: (id) => produtos.find((produto) => produto.id === id) ?? null };
  const produtoService = new ProdutoService(produtoRepository, null, transacaoDireta);
  const service = new CheckoutService(pedidoRepository, usuarioRepository, produtoService, transacaoDireta);

  return {
    service,
    pedidoRepository,
    /** Pedido que o service mandou gravar. */
    pedidoGravado: () => pedidoRepository.save.mock.calls[0].arguments[0],
  };
}

function pedido(campos = {}) {
  return CheckoutRequestDTO.deJson({
    usuarioId: 1,
    formaPagamento: 'pix',
    endereco: { cep: '01310-100', logradouro: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'Sao Paulo' },
    itens: [{ produtoId: 1, quantidade: 1 }],
    ...campos,
  });
}

describe('calcularTaxaEntrega', () => {
  it('cobra R$ 6,90 abaixo de R$ 45,00', () => {
    assert.equal(calcularTaxaEntrega(new Big('44.99')).toFixed(2), '6.90');
    assert.equal(calcularTaxaEntrega(new Big('0.01')).toFixed(2), '6.90');
  });

  it('e gratis a partir de R$ 45,00', () => {
    assert.equal(calcularTaxaEntrega(new Big('45.00')).toFixed(2), '0.00');
    assert.equal(calcularTaxaEntrega(new Big('120')).toFixed(2), '0.00');
  });

  it('expoe os valores da regra', () => {
    assert.equal(FRETE_GRATIS_A_PARTIR_DE.toFixed(2), '45.00');
    assert.equal(TAXA_ENTREGA.toFixed(2), '6.90');
  });
});

describe('CheckoutService.fecharPedido', () => {
  describe('valores', () => {
    it('calcula subtotal com produto e adicionais vezes a quantidade, com frete gratis', () => {
      const { service, pedidoGravado } = montarCheckout();

      // (39,90 + 4,00 + 5,00) x 2 = 97,80
      service.fecharPedido(pedido({ itens: [{ produtoId: 1, quantidade: 2, adicionais: [1, 2] }] }));

      const gravado = pedidoGravado();
      assert.equal(gravado.subtotal.toFixed(2), '97.80');
      assert.equal(gravado.taxaEntrega.toFixed(2), '0.00');
      assert.equal(gravado.total.toFixed(2), '97.80');
    });

    it('cobra a taxa de entrega em pedidos abaixo de R$ 45,00', () => {
      const { service, pedidoGravado } = montarCheckout();

      service.fecharPedido(pedido({ itens: [{ produtoId: 27, quantidade: 1 }] }));

      const gravado = pedidoGravado();
      assert.equal(gravado.subtotal.toFixed(2), '16.90');
      assert.equal(gravado.taxaEntrega.toFixed(2), '6.90');
      assert.equal(gravado.total.toFixed(2), '23.80');
    });

    it('soma todos os itens do pedido', () => {
      const { service, pedidoGravado } = montarCheckout();

      // 39,90 + (36,90 + 8,00) + 16,90 x 2 = 118,60
      service.fecharPedido(pedido({
        itens: [
          { produtoId: 1, quantidade: 1 },
          { produtoId: 2, quantidade: 1, adicionais: [4] },
          { produtoId: 27, quantidade: 2 },
        ],
      }));

      assert.equal(pedidoGravado().itens.length, 3);
      assert.equal(pedidoGravado().subtotal.toFixed(2), '118.60');
    });

    it('congela no item o preco do produto e de cada adicional', () => {
      const { service, pedidoGravado } = montarCheckout();

      service.fecharPedido(pedido({ itens: [{ produtoId: 1, quantidade: 1, adicionais: [2] }] }));

      const [item] = pedidoGravado().itens;
      assert.equal(item.precoUnitario, 39.9);
      assert.deepEqual(item.adicionais.map((a) => [a.adicional.id, a.preco]), [[2, 5]]);
    });

    it('conta uma vez o adicional repetido na requisicao', () => {
      const { service, pedidoGravado } = montarCheckout();

      service.fecharPedido(pedido({ itens: [{ produtoId: 1, quantidade: 1, adicionais: [1, 1] }] }));

      assert.equal(pedidoGravado().itens[0].adicionais.length, 1);
      assert.equal(pedidoGravado().subtotal.toFixed(2), '43.90');
    });
  });

  describe('dados do pedido', () => {
    it('comeca com status RECEBIDO e codigo no formato QF-000000', () => {
      const { service, pedidoGravado } = montarCheckout();

      service.fecharPedido(pedido());

      assert.equal(pedidoGravado().status, 'RECEBIDO');
      assert.match(pedidoGravado().codigo, /^QF-\d{6}$/);
      assert.equal(pedidoGravado().usuarioId, 1);
    });

    it('le a forma de pagamento sem diferenciar maiusculas e espacos', () => {
      for (const [enviada, gravada] of [['pix', 'PIX'], [' Cartao ', 'CARTAO'], ['DINHEIRO', 'DINHEIRO']]) {
        const { service, pedidoGravado } = montarCheckout();
        service.fecharPedido(pedido({ formaPagamento: enviada }));
        assert.equal(pedidoGravado().formaPagamento, gravada);
      }
    });

    it('grava o CEP so com digitos e o endereco sem espacos nas pontas', () => {
      const { service, pedidoGravado } = montarCheckout();

      service.fecharPedido(pedido({
        endereco: { cep: '01310-100', logradouro: ' Avenida Paulista ', numero: ' 1000 ', bairro: ' Bela Vista', cidade: 'Sao Paulo ' },
      }));

      const { cep, logradouro, numero, bairro, cidade } = pedidoGravado();
      assert.deepEqual({ cep, logradouro, numero, bairro, cidade }, {
        cep: '01310100', logradouro: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'Sao Paulo',
      });
    });

    it('apara a observacao e descarta observacao em branco', () => {
      const { service, pedidoGravado } = montarCheckout();

      service.fecharPedido(pedido({
        itens: [
          { produtoId: 1, quantidade: 1, observacao: '  sem cebola  ' },
          { produtoId: 27, quantidade: 1, observacao: '   ' },
        ],
      }));

      assert.deepEqual(pedidoGravado().itens.map((item) => item.observacao), ['sem cebola', null]);
    });

    it('devolve o pedido gravado no formato da resposta', () => {
      const { service } = montarCheckout();

      const resposta = comoJson(service.fecharPedido(pedido({ itens: [{ produtoId: 27, quantidade: 1 }] })));

      assert.equal(resposta.id, 100);
      assert.equal(resposta.total, 23.8);
      assert.equal(resposta.itens[0].produtoNome, 'Mousse de Maracuja');
    });
  });

  describe('codigo do pedido', () => {
    it('sorteia outro codigo quando o gerado ja existe', () => {
      let tentativas = 0;
      const { service, pedidoRepository, pedidoGravado } = montarCheckout({ codigoExiste: () => ++tentativas < 3 });

      service.fecharPedido(pedido());

      assert.equal(pedidoRepository.existsByCodigo.mock.callCount(), 3);
      assert.equal(pedidoGravado().codigo, pedidoRepository.existsByCodigo.mock.calls[2].arguments[0]);
    });

    it('desiste com 500 depois de 30 codigos repetidos', () => {
      const { service, pedidoRepository } = montarCheckout({ codigoExiste: () => true });

      assert.throws(() => service.fecharPedido(pedido()), falhaCom(500, 'Nao foi possivel gerar codigo do pedido'));
      assert.equal(pedidoRepository.existsByCodigo.mock.callCount(), 30);
      assert.equal(pedidoRepository.save.mock.callCount(), 0);
    });
  });

  describe('falhas', () => {
    it('responde 404 quando o cliente nao existe', () => {
      const { service, pedidoRepository } = montarCheckout({ usuario: null });

      assert.throws(() => service.fecharPedido(pedido()), falhaCom(404, 'Usuario nao encontrado'));
      assert.equal(pedidoRepository.save.mock.callCount(), 0);
    });

    it('responde 400 para forma de pagamento desconhecida', () => {
      const { service } = montarCheckout();
      assert.throws(() => service.fecharPedido(pedido({ formaPagamento: 'boleto' })), falhaCom(400, 'Forma de pagamento invalida'));
    });

    it('responde 404 quando um produto nao existe', () => {
      const { service, pedidoRepository } = montarCheckout();

      assert.throws(
        () => service.fecharPedido(pedido({ itens: [{ produtoId: 1, quantidade: 1 }, { produtoId: 99, quantidade: 1 }] })),
        falhaCom(404, 'Produto nao encontrado: 99'),
      );
      assert.equal(pedidoRepository.save.mock.callCount(), 0);
    });

    it('responde 400 quando o adicional e de outro produto', () => {
      const { service } = montarCheckout();
      assert.throws(
        () => service.fecharPedido(pedido({ itens: [{ produtoId: 1, quantidade: 1, adicionais: [4] }] })),
        falhaCom(400, 'Adicional 4 nao pertence ao produto 1'),
      );
    });
  });
});
