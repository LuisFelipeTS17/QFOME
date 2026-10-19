import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';

// Comportamento HTTP comum a todas as rotas: formato do erro, rotas, metodos, corpo e idioma.

describe('API: respostas de erro', () => {
  let api;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  it('responde erros em JSON com timestamp, status e mensagem', async () => {
    const { status, corpo, headers } = await api.get('/produtos/999999');

    assert.equal(status, 404);
    assert.match(headers.get('content-type'), /^application\/json/);
    assert.deepEqual(Object.keys(corpo), ['timestamp', 'status', 'erro']);
    assert.match(corpo.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    assert.equal(corpo.status, 404);
  });

  describe('rotas', () => {
    it('responde 404 para rota inexistente', async () => {
      const { status, corpo } = await api.get('/rota-inexistente');

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'No static resource rota-inexistente.');
    });

    it('diferencia maiusculas no caminho', async () => {
      assert.equal((await api.get('/Categorias')).status, 404);
    });

    it('nao aceita barra no final do caminho', async () => {
      assert.equal((await api.get('/categorias/')).status, 404);
    });

    it('responde 400 quando o id do caminho nao e numero', async () => {
      const { status, corpo } = await api.get('/produtos/abc');

      assert.equal(status, 400);
      assert.equal(corpo.erro, 'Requisicao invalida');
    });
  });

  describe('metodos', () => {
    it('responde 405 para metodo nao suportado na rota', async () => {
      const { status, corpo } = await api.patch('/categorias');

      assert.equal(status, 405);
      assert.equal(corpo.erro, "Method 'PATCH' is not supported.");
    });

    it('OPTIONS informa os metodos aceitos pela rota', async () => {
      const { status, headers } = await api.options('/categorias');

      assert.equal(status, 200);
      assert.equal(headers.get('allow'), 'GET,HEAD,POST,OPTIONS');
    });
  });

  describe('corpo da requisicao', () => {
    it('exige Content-Type JSON (415)', async () => {
      const { status, corpo } = await api.post('/categorias', 'nome=Massas', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      assert.equal(status, 415);
      assert.equal(corpo.erro, "Content-Type 'application/x-www-form-urlencoded;charset=UTF-8' is not supported.");
    });

    it('recusa JSON malformado (400)', async () => {
      const { status, corpo } = await api.post('/categorias', '{"nome": ');

      assert.equal(status, 400);
      assert.equal(corpo.erro, 'Requisicao invalida');
    });

    it('recusa corpo vazio (400)', async () => {
      assert.equal((await api.post('/categorias', '')).status, 400);
    });

    it('recusa campo com tipo errado (400)', async () => {
      const { status, corpo } = await api.post('/categorias', { nome: { texto: 'Massas' } });

      assert.equal(status, 400);
      assert.equal(corpo.erro, 'Requisicao invalida');
    });
  });

  describe('idioma das mensagens de validacao', () => {
    const validar = (acceptLanguage) => api.post('/categorias', { nome: '' }, {
      headers: acceptLanguage ? { 'Accept-Language': acceptLanguage } : {},
    });

    it('usa portugues do Brasil quando o cliente nao informa o idioma', async () => {
      assert.equal((await validar()).corpo.erro, 'nome: não deve estar em branco');
    });

    it('segue o Accept-Language do cliente', async () => {
      assert.equal((await validar('en-US,en;q=0.9')).corpo.erro, 'nome: must not be blank');
      assert.equal((await validar('es')).corpo.erro, 'nome: no debe estar vacío');
    });
  });

  describe('cabecalhos', () => {
    it('nao envia ETag nem X-Powered-By', async () => {
      const { headers } = await api.get('/categorias');

      assert.equal(headers.get('etag'), null);
      assert.equal(headers.get('x-powered-by'), null);
    });
  });
});
