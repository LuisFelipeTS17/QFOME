import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';

describe('API /actuator', () => {
  describe('com a configuracao padrao (sem detalhes)', () => {
    let api;

    before(async () => {
      api = await subirAplicacao();
    });

    after(() => api.encerrar());

    it('GET /actuator/health responde UP sem detalhes', async () => {
      const { status, corpo, headers } = await api.get('/actuator/health');

      assert.equal(status, 200);
      assert.deepEqual(corpo, { status: 'UP' });
      assert.match(headers.get('content-type'), /^application\/vnd\.spring-boot\.actuator\.v3\+json/);
    });

    it('responde em application/json quando o cliente pede', async () => {
      const { headers } = await api.get('/actuator/health', { headers: { Accept: 'application/json' } });
      assert.match(headers.get('content-type'), /^application\/json/);
    });

    it('nao expoe os componentes do health', async () => {
      assert.equal((await api.get('/actuator/health/db')).status, 404);
    });

    it('GET /actuator lista os links dos endpoints', async () => {
      const { status, corpo } = await api.get('/actuator');

      assert.equal(status, 200);
      assert.deepEqual(Object.keys(corpo._links), ['self', 'health', 'health-path', 'info']);
      assert.equal(corpo._links.health.href, `${api.base}/actuator/health`);
    });

    it('GET /actuator/info responde vazio', async () => {
      const { status, corpo } = await api.get('/actuator/info');

      assert.equal(status, 200);
      assert.deepEqual(corpo, {});
    });

    it('recusa outros metodos (405)', async () => {
      assert.equal((await api.post('/actuator/health', {})).status, 405);
    });
  });

  describe('com MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=always', () => {
    let api;

    before(async () => {
      api = await subirAplicacao({ env: { MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: 'always' } });
    });

    after(() => api.encerrar());

    it('mostra a situacao de cada componente', async () => {
      const { status, corpo } = await api.get('/actuator/health');

      assert.equal(status, 200);
      assert.equal(corpo.status, 'UP');
      assert.deepEqual(Object.keys(corpo.components).sort(), ['db', 'diskSpace', 'ping', 'ssl']);
      assert.deepEqual(corpo.components.db, { status: 'UP', details: { database: 'SQLite', validationQuery: 'isValid()' } });
      assert.equal(corpo.components.diskSpace.status, 'UP');
    });

    it('consulta um componente pelo nome', async () => {
      const { status, corpo } = await api.get('/actuator/health/ping');

      assert.equal(status, 200);
      assert.deepEqual(corpo, { status: 'UP' });
    });

    it('responde 404 para componente desconhecido', async () => {
      assert.equal((await api.get('/actuator/health/redis')).status, 404);
    });
  });
});
