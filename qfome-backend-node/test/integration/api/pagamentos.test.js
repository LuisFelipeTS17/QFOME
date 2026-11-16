import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { cadastrarCliente, CATALOGO, fecharPedido } from '../../apoio/dados.js';

const ITENS = [{ produtoId: CATALOGO.mousseDeMaracuja.id, quantidade: 2 }];

describe('API /pagamentos/mercadopago', () => {
  let api;
  let pastaDados;

  before(async () => {
    // Sem MERCADOPAGO_ACCESS_TOKEN: o pagamento roda em modo simulado,
    // sem chamar a API real do Mercado Pago.
    pastaDados = fs.mkdtempSync(path.join(os.tmpdir(), 'qfome-pagamentos-'));
    api = await subirAplicacao({ env: { DATA_DIR: pastaDados } });
  });

  after(async () => {
    await api.encerrar();
    fs.rmSync(pastaDados, { recursive: true, force: true });
  });

  it('aceita MERCADO_PAGO como forma de pagamento no checkout', async () => {
    const cliente = await cadastrarCliente(api);
    const pedido = await fecharPedido(api, cliente.id, ITENS, { formaPagamento: 'mercado_pago' });

    assert.equal(pedido.formaPagamento, 'MERCADO_PAGO');
  });

  it('cria o link de pagamento simulado para um pedido existente', async () => {
    const cliente = await cadastrarCliente(api);
    const pedido = await fecharPedido(api, cliente.id, ITENS, { formaPagamento: 'mercado_pago' });

    const { status, corpo } = await api.post('/pagamentos/mercadopago', { codigo: pedido.codigo });

    assert.equal(status, 201);
    assert.equal(corpo.codigo, pedido.codigo);
    assert.equal(corpo.modo, 'simulado');
    assert.match(corpo.initPoint, /^https:\/\/www\.mercadopago\.com\.br\/checkout\//);
    assert.equal(corpo.total, pedido.total);
  });

  it('grava o registro da compra em purchases/compra_{usuarioId}_{timestamp}.json', async () => {
    const cliente = await cadastrarCliente(api);
    const pedido = await fecharPedido(api, cliente.id, ITENS, { formaPagamento: 'mercado_pago' });

    await api.post('/pagamentos/mercadopago', { codigo: pedido.codigo });

    const pasta = path.join(pastaDados, 'purchases');
    const arquivos = fs.readdirSync(pasta).filter((nome) => nome.startsWith(`compra_${cliente.id}_`));
    assert.equal(arquivos.length, 1);

    const registro = JSON.parse(fs.readFileSync(path.join(pasta, arquivos[0]), 'utf8'));
    assert.equal(registro.codigoPedido, pedido.codigo);
    assert.equal(registro.usuario.id, cliente.id);
    assert.equal(registro.pagamento.metodo, 'Mercado Pago');
    assert.equal(registro.pagamento.status, 'pendente');
    assert.deepEqual(registro.produtos.map((p) => p.nomeProduto), [CATALOGO.mousseDeMaracuja.nome]);
    assert.equal(registro.resumo.valorTotal, pedido.total);
  });

  it('devolve 404 para codigo de pedido inexistente', async () => {
    const { status } = await api.post('/pagamentos/mercadopago', { codigo: 'QF-000000' });

    assert.equal(status, 404);
  });

  it('recusa corpo sem codigo (400)', async () => {
    const { status } = await api.post('/pagamentos/mercadopago', {});

    assert.equal(status, 400);
  });

  it('recusa metodo nao suportado (405)', async () => {
    const { status } = await api.get('/pagamentos/mercadopago');

    assert.equal(status, 405);
  });
});
