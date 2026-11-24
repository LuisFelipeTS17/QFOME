import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { criarExigirAdmin, tokenDaRequisicao } from '../../../src/web/autenticacao.js';
import { ResponseStatusError } from '../../../src/web/erros.js';
import { falhaCom } from '../../apoio/verificacoes.js';

const requisicao = (authorization) => ({ headers: authorization === undefined ? {} : { authorization } });

describe('tokenDaRequisicao', () => {
  it('le o token do cabecalho Authorization', () => {
    assert.equal(tokenDaRequisicao(requisicao('Bearer abc-123')), 'abc-123');
    assert.equal(tokenDaRequisicao(requisicao('bearer abc-123')), 'abc-123');
  });

  it('devolve null sem cabecalho ou em outro formato', () => {
    for (const valor of [undefined, '', 'abc-123', 'Basic abc', 'Bearer', 'Bearer a b']) {
      assert.equal(tokenDaRequisicao(requisicao(valor)), null);
    }
  });
});

describe('criarExigirAdmin', () => {
  it('guarda o administrador na requisicao e segue', () => {
    const admin = { usuario: { id: 1 }, expiraEm: '2026-11-24 18:00:00.000' };
    const autenticar = mock.fn(() => admin);
    const req = requisicao('Bearer abc');
    const next = mock.fn();

    criarExigirAdmin({ autenticar })(req, { set: mock.fn() }, next);

    assert.deepEqual(autenticar.mock.calls[0].arguments, ['abc']);
    assert.equal(req.admin, admin);
    assert.equal(next.mock.callCount(), 1);
  });

  it('repassa a falha sem seguir para a rota', () => {
    const autenticar = () => {
      throw new ResponseStatusError(401, 'Login administrativo necessario');
    };
    const res = { set: mock.fn() };
    const next = mock.fn();

    assert.throws(() => criarExigirAdmin({ autenticar })(requisicao(), res, next), falhaCom(401, 'Login administrativo necessario'));
    assert.deepEqual(res.set.mock.calls[0].arguments, ['WWW-Authenticate', 'Bearer']);
    assert.equal(next.mock.callCount(), 0);
  });
});
