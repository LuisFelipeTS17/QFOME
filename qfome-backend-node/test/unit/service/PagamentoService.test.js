import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { ItemPedido } from '../../../src/model/ItemPedido.js';
import { Pedido } from '../../../src/model/Pedido.js';
import { Produto } from '../../../src/model/Produto.js';
import { PagamentoService } from '../../../src/service/pedido/PagamentoService.js';
import { ResponseStatusError } from '../../../src/web/erros.js';

const USUARIO = { id: 7, nome: 'Ana', email: 'ana@qfome.com' };

function pedidoDeExemplo() {
  return new Pedido({
    id: 1,
    codigo: 'QF-123456',
    usuarioId: USUARIO.id,
    formaPagamento: 'MERCADO_PAGO',
    cep: '01310100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'Sao Paulo',
    subtotal: 33.80,
    taxaEntrega: 6.90,
    total: 40.70,
    itens: [
      new ItemPedido({
        produto: new Produto({ id: 27, nome: 'Mousse de Maracuja' }),
        quantidade: 2,
        precoUnitario: 16.90,
      }),
    ],
  });
}

function criarServico({ pedido = pedidoDeExemplo(), accessToken = 'TEST-token', fetchFn, pasta }) {
  const config = {
    mercadoPago: { accessToken, urlApi: 'https://api.mercadopago.test' },
    dados: { pasta },
  };
  const pedidoRepository = { findByCodigo: (codigo) => (codigo === pedido.codigo ? pedido : null) };
  const usuarioRepository = { findById: (id) => (id === USUARIO.id ? USUARIO : null) };
  return new PagamentoService(pedidoRepository, usuarioRepository, config, { fetchFn });
}

describe('PagamentoService (modo mercadopago, com token)', () => {
  let pasta;

  beforeEach(() => {
    pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'qfome-pagamento-unit-'));
  });

  afterEach(() => {
    fs.rmSync(pasta, { recursive: true, force: true });
  });

  it('cria a preferencia na API do Mercado Pago com token, itens e taxa de entrega', async () => {
    const chamadas = [];
    const fetchFn = async (url, options) => {
      chamadas.push({ url, options });
      return { ok: true, json: async () => ({ id: 'pref-1', init_point: 'https://mp/pagar/pref-1' }) };
    };

    const resposta = await criarServico({ fetchFn, pasta }).pagarComMercadoPago('QF-123456');

    assert.equal(chamadas.length, 1);
    assert.equal(chamadas[0].url, 'https://api.mercadopago.test/checkout/preferences');
    assert.equal(chamadas[0].options.headers.Authorization, 'Bearer TEST-token');

    const corpo = JSON.parse(chamadas[0].options.body);
    assert.equal(corpo.external_reference, 'QF-123456');
    // Item com o subtotal fechado (2x 16.90) + taxa de entrega: total identico ao pedido.
    assert.deepEqual(corpo.items.map((item) => [item.title, item.quantity, item.unit_price]), [
      ['2x Mousse de Maracuja', 1, 33.80],
      ['Taxa de entrega', 1, 6.90],
    ]);

    assert.equal(resposta.modo, 'mercadopago');
    assert.equal(resposta.preferenceId, 'pref-1');
    assert.equal(resposta.initPoint, 'https://mp/pagar/pref-1');
  });

  it('nao envia a taxa de entrega quando o frete e gratis', async () => {
    const pedido = pedidoDeExemplo();
    pedido.taxaEntrega = 0;
    let corpo;
    const fetchFn = async (url, options) => {
      corpo = JSON.parse(options.body);
      return { ok: true, json: async () => ({ init_point: 'https://mp/pagar' }) };
    };

    await criarServico({ pedido, fetchFn, pasta }).pagarComMercadoPago('QF-123456');

    assert.deepEqual(corpo.items.map((item) => item.title), ['2x Mousse de Maracuja']);
  });

  it('grava o registro da compra com o id da preferencia', async () => {
    const fetchFn = async () => ({ ok: true, json: async () => ({ id: 'pref-77', init_point: 'https://mp/pagar' }) });

    await criarServico({ fetchFn, pasta }).pagarComMercadoPago('QF-123456');

    const arquivos = fs.readdirSync(path.join(pasta, 'purchases'));
    assert.equal(arquivos.length, 1);
    const registro = JSON.parse(fs.readFileSync(path.join(pasta, 'purchases', arquivos[0]), 'utf8'));
    assert.equal(registro.pagamento.preferenceId, 'pref-77');
    assert.equal(registro.pagamento.modo, 'mercadopago');
    assert.deepEqual(registro.usuario, USUARIO);
  });

  it('responde 502 quando o Mercado Pago recusa a preferencia', async () => {
    const fetchFn = async () => ({ ok: false, status: 401, json: async () => ({ message: 'invalid access token' }) });

    await assert.rejects(
      criarServico({ fetchFn, pasta }).pagarComMercadoPago('QF-123456'),
      (erro) => erro instanceof ResponseStatusError && erro.status === 502 && /invalid access token/.test(erro.motivo),
    );
  });

  it('responde 502 quando a resposta nao traz o init_point', async () => {
    const fetchFn = async () => ({ ok: true, json: async () => ({ id: 'pref-1' }) });

    await assert.rejects(
      criarServico({ fetchFn, pasta }).pagarComMercadoPago('QF-123456'),
      (erro) => erro instanceof ResponseStatusError && erro.status === 502,
    );
  });

  it('responde 502 quando nao ha conexao com o Mercado Pago', async () => {
    const fetchFn = async () => {
      throw new Error('rede fora');
    };

    await assert.rejects(
      criarServico({ fetchFn, pasta }).pagarComMercadoPago('QF-123456'),
      (erro) => erro instanceof ResponseStatusError && erro.status === 502 && /Sem conexao/.test(erro.motivo),
    );
  });

  it('responde 404 para pedido inexistente', async () => {
    await assert.rejects(
      criarServico({ fetchFn: async () => ({}), pasta }).pagarComMercadoPago('QF-999999'),
      (erro) => erro instanceof ResponseStatusError && erro.status === 404,
    );
  });
});
