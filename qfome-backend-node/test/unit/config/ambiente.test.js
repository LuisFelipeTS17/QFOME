import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { lerConfiguracao } from '../../../src/config/ambiente.js';

describe('lerConfiguracao', () => {
  it('usa os valores padrao quando nenhuma variavel e informada', () => {
    assert.deepEqual(lerConfiguracao({}), {
      porta: 8080,
      banco: { arquivo: './data/qfome.db', executarScripts: true },
      cors: {
        allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081'],
        allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
        allowCredentials: true,
        maxAgeSeconds: 3600,
      },
      health: { mostrarDetalhes: false },
    });
  });

  it('le cada variavel de ambiente', () => {
    const config = lerConfiguracao({
      SERVER_PORT: '9090',
      DB_PATH: '/tmp/outro.db',
      SQL_INIT_MODE: 'never',
      APP_CORS_ALLOWED_ORIGINS: 'https://qfome.com.br',
      APP_CORS_ALLOWED_HEADERS: 'Content-Type',
      APP_CORS_ALLOW_CREDENTIALS: 'false',
      APP_CORS_MAX_AGE_SECONDS: '60',
      MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: 'always',
    });

    assert.equal(config.porta, 9090);
    assert.deepEqual(config.banco, { arquivo: '/tmp/outro.db', executarScripts: false });
    assert.deepEqual(config.cors, {
      allowedOrigins: ['https://qfome.com.br'],
      allowedHeaders: ['Content-Type'],
      allowCredentials: false,
      maxAgeSeconds: 60,
    });
    assert.equal(config.health.mostrarDetalhes, true);
  });

  it('separa listas por virgula, ignorando espacos e itens vazios', () => {
    const config = lerConfiguracao({ APP_CORS_ALLOWED_ORIGINS: ' https://a.com , ,https://b.com,' });
    assert.deepEqual(config.cors.allowedOrigins, ['https://a.com', 'https://b.com']);
  });

  describe('booleanos', () => {
    for (const valor of ['true', 'TRUE', 'on', 'yes', '1']) {
      it(`le ${JSON.stringify(valor)} como verdadeiro`, () => {
        assert.equal(lerConfiguracao({ APP_CORS_ALLOW_CREDENTIALS: valor }).cors.allowCredentials, true);
      });
    }

    for (const valor of ['false', 'Off', 'no', '0']) {
      it(`le ${JSON.stringify(valor)} como falso`, () => {
        assert.equal(lerConfiguracao({ APP_CORS_ALLOW_CREDENTIALS: valor }).cors.allowCredentials, false);
      });
    }

    it('recusa valor que nao e booleano', () => {
      assert.throws(
        () => lerConfiguracao({ APP_CORS_ALLOW_CREDENTIALS: 'talvez' }),
        /APP_CORS_ALLOW_CREDENTIALS deve ser true ou false/,
      );
    });
  });

  describe('numeros inteiros', () => {
    it('aceita espacos nas pontas', () => {
      assert.equal(lerConfiguracao({ SERVER_PORT: ' 3000 ' }).porta, 3000);
    });

    for (const valor of ['abc', '80.5', '-1', '']) {
      it(`recusa ${JSON.stringify(valor)}`, () => {
        assert.throws(() => lerConfiguracao({ SERVER_PORT: valor }), /SERVER_PORT deve ser um numero inteiro/);
      });
    }
  });

  describe('opcoes', () => {
    it('le SQL_INIT_MODE sem diferenciar maiusculas', () => {
      assert.equal(lerConfiguracao({ SQL_INIT_MODE: 'ALWAYS' }).banco.executarScripts, true);
      assert.equal(lerConfiguracao({ SQL_INIT_MODE: 'Never' }).banco.executarScripts, false);
    });

    it('recusa SQL_INIT_MODE desconhecido', () => {
      assert.throws(() => lerConfiguracao({ SQL_INIT_MODE: 'sometimes' }), /SQL_INIT_MODE deve ser always \| never/);
    });

    it('so mostra os detalhes do health com "always"', () => {
      const detalhes = (valor) => lerConfiguracao({ MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: valor }).health.mostrarDetalhes;
      assert.equal(detalhes('always'), true);
      assert.equal(detalhes('when-authorized'), false);
      assert.equal(detalhes('never'), false);
    });

    it('recusa valor desconhecido para os detalhes do health', () => {
      assert.throws(
        () => lerConfiguracao({ MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: 'sempre' }),
        /MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS deve ser never \| when-authorized \| always/,
      );
    });
  });
});
