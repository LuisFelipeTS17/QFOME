import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { Pedido } from '../../../src/model/Pedido.js';
import { PedidoAcompanhamentoService } from '../../../src/service/pedido/PedidoAcompanhamentoService.js';
import { comoJson } from '../../apoio/fabricas.js';
import { falhaCom } from '../../apoio/verificacoes.js';

function umPedido(codigo, status = 'RECEBIDO') {
  return new Pedido({
    id: Number(codigo.slice(3)),
    codigo,
    usuarioId: 1,
    status,
    formaPagamento: 'PIX',
    cep: '01310100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'Sao Paulo',
    subtotal: 16.9,
    taxaEntrega: 6.9,
    total: 23.8,
    criadoEm: '2026-10-14 12:00:00.000',
  });
}

function montarAcompanhamento(pedidos) {
  const pedidoRepository = {
    findByUsuarioIdOrderByCriadoEmDesc: mock.fn(() => pedidos),
    findByCodigo: (codigo) => pedidos.find((pedido) => pedido.codigo === codigo) ?? null,
  };
  return { service: new PedidoAcompanhamentoService(pedidoRepository), pedidoRepository };
}

describe('PedidoAcompanhamentoService', () => {
  describe('buscarHistoricoPorUsuario', () => {
    it('devolve os pedidos do cliente na ordem do repositorio (mais recente primeiro)', () => {
      const { service, pedidoRepository } = montarAcompanhamento([umPedido('QF-000002'), umPedido('QF-000001')]);

      const historico = comoJson(service.buscarHistoricoPorUsuario(1));

      assert.deepEqual(historico.map((pedido) => pedido.codigo), ['QF-000002', 'QF-000001']);
      assert.deepEqual(pedidoRepository.findByUsuarioIdOrderByCriadoEmDesc.mock.calls[0].arguments, [1]);
    });

    it('devolve lista vazia para cliente sem pedidos', () => {
      assert.deepEqual(montarAcompanhamento([]).service.buscarHistoricoPorUsuario(1), []);
    });
  });

  describe('acompanharPedidoPorCodigo', () => {
    it('devolve o pedido com o status atual', () => {
      const { service } = montarAcompanhamento([umPedido('QF-000001', 'SAIU_PARA_ENTREGA')]);

      const pedido = comoJson(service.acompanharPedidoPorCodigo('QF-000001'));

      assert.equal(pedido.codigo, 'QF-000001');
      assert.equal(pedido.status, 'SAIU_PARA_ENTREGA');
    });

    it('responde 404 quando o codigo nao existe', () => {
      const { service } = montarAcompanhamento([]);

      assert.throws(
        () => service.acompanharPedidoPorCodigo('QF-999999'),
        falhaCom(404, 'Pedido nao encontrado com o codigo: QF-999999'),
      );
    });
  });
});
