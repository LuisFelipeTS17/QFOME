import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, afterEach, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { cadastrarCliente, CATALOGO, fecharPedido } from '../../apoio/dados.js';

describe('API /relatorios', () => {
  let api;
  let pastaDados;

  before(async () => {
    pastaDados = fs.mkdtempSync(path.join(os.tmpdir(), 'qfome-relatorios-'));
    api = await subirAplicacao({ env: { DATA_DIR: pastaDados } });
  });

  after(async () => {
    await api.encerrar();
    fs.rmSync(pastaDados, { recursive: true, force: true });
  });

  // Cada teste parte de um banco sem pedidos.
  afterEach(() => {
    api.db.prepare('DELETE FROM pedido').run();
  });

  describe('GET /relatorios/pedidos', () => {
    it('devolve relatorio vazio quando nao ha pedidos', async () => {
      const { status, corpo } = await api.get('/relatorios/pedidos');

      assert.equal(status, 200);
      assert.equal(corpo.totalPedidos, 0);
      assert.equal(corpo.faturamentoTotal, 0);
      assert.deepEqual(corpo.pedidos, []);
    });

    it('traz os pedidos com usuario, itens e categoria de cada produto', async () => {
      const cliente = await cadastrarCliente(api, { nome: 'Ana Relatorio' });
      const pedido = await fecharPedido(api, cliente.id, [
        { produtoId: CATALOGO.bowlNordestino.id, quantidade: 1, adicionais: [CATALOGO.bowlNordestino.adicionais.farofaDeBacon.id] },
        { produtoId: CATALOGO.mousseDeMaracuja.id, quantidade: 2 },
      ]);

      const { corpo } = await api.get('/relatorios/pedidos');

      assert.equal(corpo.totalPedidos, 1);
      assert.equal(corpo.faturamentoTotal, pedido.total);

      const [exportado] = corpo.pedidos;
      assert.equal(exportado.codigo, pedido.codigo);
      assert.equal(exportado.formaPagamento, 'PIX');
      assert.deepEqual(exportado.usuario, { id: cliente.id, nome: 'Ana Relatorio', email: cliente.email });
      assert.deepEqual(
        exportado.itens.map((item) => item.categoriaNome),
        [CATALOGO.caseira.nome, 'Sobremesas'],
      );
      assert.equal(exportado.itens[0].adicionais[0].nome, CATALOGO.bowlNordestino.adicionais.farofaDeBacon.nome);
      assert.equal(exportado.total, pedido.total);
    });

    it('soma o faturamento de todos os pedidos', async () => {
      const cliente = await cadastrarCliente(api);
      const um = await fecharPedido(api, cliente.id, [{ produtoId: CATALOGO.mousseDeMaracuja.id, quantidade: 1 }]);
      const dois = await fecharPedido(api, cliente.id, [{ produtoId: CATALOGO.bowlNordestino.id, quantidade: 1 }]);

      const { corpo } = await api.get('/relatorios/pedidos');

      assert.equal(corpo.totalPedidos, 2);
      assert.equal(corpo.faturamentoTotal, Number((um.total + dois.total).toFixed(2)));
    });
  });

  describe('POST /relatorios/pedidos/exportar', () => {
    it('grava exports/pedidos.json e devolve o mesmo conteudo', async () => {
      const cliente = await cadastrarCliente(api);
      const pedido = await fecharPedido(api, cliente.id, [{ produtoId: CATALOGO.mousseDeMaracuja.id, quantidade: 1 }]);

      const { status, corpo } = await api.post('/relatorios/pedidos/exportar', {});

      assert.equal(status, 201);
      assert.equal(corpo.totalPedidos, 1);
      assert.equal(corpo.arquivo, path.resolve(pastaDados, 'exports', 'pedidos.json'));

      const gravado = JSON.parse(fs.readFileSync(corpo.arquivo, 'utf8'));
      assert.equal(gravado.totalPedidos, 1);
      assert.equal(gravado.pedidos[0].codigo, pedido.codigo);
    });
  });

  it('recusa metodo nao suportado (405)', async () => {
    assert.equal((await api.delete('/relatorios/pedidos')).status, 405);
    assert.equal((await api.get('/relatorios/pedidos/exportar')).status, 405);
  });
});
