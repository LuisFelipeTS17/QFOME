import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';

const SITE = 'http://localhost:3000';
const ESTRANHA = 'https://site-estranho.com';

/** Cabecalhos do preflight que o navegador envia antes de uma requisicao com CORS. */
function preflight(origem, metodo = 'POST', cabecalhos = 'content-type') {
  return {
    headers: {
      Origin: origem,
      'Access-Control-Request-Method': metodo,
      ...(cabecalhos ? { 'Access-Control-Request-Headers': cabecalhos } : {}),
    },
  };
}

describe('API: CORS', () => {
  describe('com as origens padrao', () => {
    let api;

    before(async () => {
      api = await subirAplicacao();
    });

    after(() => api.encerrar());

    it('libera o preflight de uma origem permitida', async () => {
      const { status, headers } = await api.options('/categorias', preflight(SITE));

      assert.equal(status, 200);
      assert.equal(headers.get('access-control-allow-origin'), SITE);
      assert.equal(headers.get('access-control-allow-methods'), 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      assert.equal(headers.get('access-control-allow-headers'), 'content-type');
      assert.equal(headers.get('access-control-allow-credentials'), 'true');
      assert.equal(headers.get('access-control-max-age'), '3600');
    });

    it('libera a requisicao de uma origem permitida', async () => {
      const { status, headers } = await api.get('/categorias', { headers: { Origin: 'http://localhost:8081' } });

      assert.equal(status, 200);
      assert.equal(headers.get('access-control-allow-origin'), 'http://localhost:8081');
      assert.match(headers.get('vary'), /Origin/);
    });

    it('recusa origem nao permitida (403)', async () => {
      const preflightRecusado = await api.options('/categorias', preflight(ESTRANHA));
      assert.equal(preflightRecusado.status, 403);
      assert.equal(preflightRecusado.texto, 'Invalid CORS request');

      const requisicaoRecusada = await api.get('/categorias', { headers: { Origin: ESTRANHA } });
      assert.equal(requisicaoRecusada.status, 403);
      assert.equal(requisicaoRecusada.headers.get('access-control-allow-origin'), null);
    });

    it('recusa preflight com cabecalho nao permitido (403)', async () => {
      const { status } = await api.options('/categorias', preflight(SITE, 'POST', 'x-cabecalho-estranho'));
      assert.equal(status, 403);
    });

    it('atende requisicoes sem Origin, como as do app nativo', async () => {
      const { status, headers } = await api.get('/categorias');

      assert.equal(status, 200);
      assert.equal(headers.get('access-control-allow-origin'), null);
    });

    it('nao libera CORS para o actuator', async () => {
      const { status } = await api.options('/actuator/health', preflight(SITE, 'GET', null));
      assert.equal(status, 403);
    });
  });

  describe('com APP_CORS_ALLOWED_ORIGINS configurado', () => {
    let api;

    before(async () => {
      api = await subirAplicacao({ env: { APP_CORS_ALLOWED_ORIGINS: 'https://qfome.com.br' } });
    });

    after(() => api.encerrar());

    it('libera so as origens configuradas', async () => {
      assert.equal((await api.options('/categorias', preflight('https://qfome.com.br'))).status, 200);
      assert.equal((await api.options('/categorias', preflight(SITE))).status, 403);
    });
  });
});
