import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Database from 'better-sqlite3';

import { tratadorDeErros } from '../../../src/config/tratadorDeErros.js';
import { NotBlank } from '../../../src/validacao/restricoes.js';
import { ErroMvc, RequisicaoInvalidaError, ResponseStatusError, ValidacaoError } from '../../../src/web/erros.js';

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/;

/** Resposta do express que so guarda o status e o JSON enviados. */
function respostaFalsa({ headersSent = false } = {}) {
  return {
    headersSent,
    statusCode: undefined,
    corpo: undefined,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(corpo) {
      this.corpo = corpo;
      return this;
    },
  };
}

/** Executa o tratador e devolve { status, erro } da resposta. */
function tratar(erro, { acceptLanguage } = {}) {
  const req = { headers: acceptLanguage ? { 'accept-language': acceptLanguage } : {} };
  const res = respostaFalsa();
  tratadorDeErros(erro, req, res, () => assert.fail('nao deveria chamar next'));
  assert.match(res.corpo.timestamp, TIMESTAMP);
  assert.equal(res.corpo.status, res.statusCode);
  return { status: res.statusCode, erro: res.corpo.erro };
}

describe('tratadorDeErros', () => {
  it('responde o status e o motivo de um ResponseStatusError', () => {
    assert.deepEqual(tratar(new ResponseStatusError(404, 'Produto nao encontrado: 9')), {
      status: 404,
      erro: 'Produto nao encontrado: 9',
    });
  });

  it('usa "Erro" quando o ResponseStatusError nao tem motivo', () => {
    assert.deepEqual(tratar(new ResponseStatusError(400)), { status: 400, erro: 'Erro' });
  });

  it('responde 400 com o campo e a mensagem de validacao', () => {
    assert.deepEqual(tratar(new ValidacaoError('nome', NotBlank)), {
      status: 400,
      erro: 'nome: não deve estar em branco',
    });
  });

  it('traduz a mensagem de validacao pelo Accept-Language', () => {
    assert.deepEqual(tratar(new ValidacaoError('nome', NotBlank), { acceptLanguage: 'en' }), {
      status: 400,
      erro: 'nome: must not be blank',
    });
  });

  it('responde 409 quando o banco recusa por restricao (FK ou UNIQUE)', () => {
    for (const codigo of ['SQLITE_CONSTRAINT_FOREIGNKEY', 'SQLITE_CONSTRAINT_UNIQUE']) {
      assert.deepEqual(tratar(new Database.SqliteError('constraint failed', codigo)), {
        status: 409,
        erro: 'Operacao viola uma restricao do banco (registro em uso ou duplicado)',
      });
    }
  });

  it('responde 400 para corpo ou parametro invalido', () => {
    assert.deepEqual(tratar(new RequisicaoInvalidaError()), { status: 400, erro: 'Requisicao invalida' });
  });

  it('responde 400 para erro do leitor de corpo do express', () => {
    const erro = Object.assign(new Error('request entity too large'), { type: 'entity.too.large', status: 413 });
    assert.deepEqual(tratar(erro), { status: 400, erro: 'Requisicao invalida' });
  });

  it('repassa status e detalhe dos erros HTTP (404, 405, 415)', () => {
    assert.deepEqual(tratar(new ErroMvc(405, "Method 'PATCH' is not supported.")), {
      status: 405,
      erro: "Method 'PATCH' is not supported.",
    });
  });

  it('responde 500 sem expor detalhes para erros inesperados', (t) => {
    const log = t.mock.method(console, 'error', () => {});
    const erro = new TypeError("Cannot read properties of null (reading 'id')");

    assert.deepEqual(tratar(erro), { status: 500, erro: 'Erro interno no servidor' });
    assert.equal(log.mock.callCount(), 1);
    assert.equal(log.mock.calls[0].arguments[0], erro);
  });

  it('responde 500 para erros do banco que nao sao de restricao', (t) => {
    t.mock.method(console, 'error', () => {});
    assert.deepEqual(tratar(new Database.SqliteError('database is locked', 'SQLITE_BUSY')), {
      status: 500,
      erro: 'Erro interno no servidor',
    });
  });

  it('passa o erro adiante quando a resposta ja comecou a ser enviada', () => {
    const erro = new Error('falhou no meio');
    const res = respostaFalsa({ headersSent: true });
    let repassado;

    tratadorDeErros(erro, { headers: {} }, res, (e) => { repassado = e; });

    assert.equal(repassado, erro);
    assert.equal(res.statusCode, undefined);
  });
});
