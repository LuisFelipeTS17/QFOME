import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { criarCors } from '../../../src/config/cors.js';

// O comportamento das requisicoes com CORS e coberto em test/integration/api/cors.test.js.

const CONFIG = {
  allowedOrigins: ['http://localhost:3000'],
  allowedHeaders: ['Content-Type'],
  allowCredentials: true,
  maxAgeSeconds: 3600,
};

describe('criarCors', () => {
  it('recusa a origem curinga junto com credenciais', () => {
    assert.throws(
      () => criarCors({ ...CONFIG, allowedOrigins: ['*'] }),
      /Wildcard CORS origins are not allowed when credentials are enabled/,
    );
  });

  it('aceita a origem curinga sem credenciais', () => {
    const cors = criarCors({ ...CONFIG, allowedOrigins: ['*'], allowCredentials: false });
    assert.equal(typeof cors.preflight, 'function');
    assert.equal(typeof cors.requisicao, 'function');
  });
});
