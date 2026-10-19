import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CategoriaRequestDTO } from '../../../src/dto/CategoriaRequestDTO.js';
import { ErroMvc, RequisicaoInvalidaError, ValidacaoError } from '../../../src/web/erros.js';
import { corpoValidado, lerCorpoJson, parametroObrigatorio } from '../../../src/web/requisicao.js';
import { parametroInteger } from '../../../src/web/conversao.js';

/** Requisicao como o express entrega depois do express.raw: corpo em Buffer. contentType null omite o cabecalho. */
function requisicao({ contentType = 'application/json', corpo = '', query = {} } = {}) {
  const headers = contentType === null ? {} : { 'content-type': contentType };
  return { headers, body: Buffer.isBuffer(corpo) ? corpo : Buffer.from(corpo), query };
}

describe('lerCorpoJson', () => {
  it('le o corpo JSON', () => {
    assert.deepEqual(lerCorpoJson(requisicao({ corpo: '{"nome":"Massas"}' })), { nome: 'Massas' });
  });

  it('aceita charset no Content-Type e tipos +json', () => {
    assert.deepEqual(lerCorpoJson(requisicao({ contentType: 'application/json; charset=utf-8', corpo: '[1]' })), [1]);
    assert.deepEqual(lerCorpoJson(requisicao({ contentType: 'application/vnd.qfome+json', corpo: '{}' })), {});
  });

  it('decodifica o corpo no charset informado', () => {
    const corpo = Buffer.from('{"nome":"Feijão"}', 'latin1');
    const req = requisicao({ contentType: 'application/json; charset=ISO-8859-1', corpo });
    assert.deepEqual(lerCorpoJson(req), { nome: 'Feijão' });
  });

  it('ignora o BOM no inicio do corpo', () => {
    assert.deepEqual(lerCorpoJson(requisicao({ corpo: '﻿{"a":1}' })), { a: 1 });
  });

  it('recusa corpo vazio ou so com espacos', () => {
    assert.throws(() => lerCorpoJson(requisicao({ corpo: '' })), RequisicaoInvalidaError);
    assert.throws(() => lerCorpoJson(requisicao({ corpo: '  \n ' })), RequisicaoInvalidaError);
  });

  it('recusa JSON malformado', () => {
    assert.throws(() => lerCorpoJson(requisicao({ corpo: '{"nome":' })), RequisicaoInvalidaError);
  });

  it('recusa o JSON null', () => {
    assert.throws(() => lerCorpoJson(requisicao({ corpo: 'null' })), RequisicaoInvalidaError);
  });

  it('recusa requisicao sem Content-Type e sem corpo como invalida (400)', () => {
    assert.throws(() => lerCorpoJson(requisicao({ contentType: null })), RequisicaoInvalidaError);
  });

  it('recusa corpo sem Content-Type como tipo nao suportado (415)', () => {
    assert.throws(
      () => lerCorpoJson(requisicao({ contentType: null, corpo: '{}' })),
      { status: 415, detalhe: "Content-Type 'application/octet-stream' is not supported." },
    );
  });

  it('recusa Content-Type que nao e JSON (415)', () => {
    assert.throws(
      () => lerCorpoJson(requisicao({ contentType: 'text/plain', corpo: '{}' })),
      (erro) => erro instanceof ErroMvc
        && erro.status === 415
        && erro.detalhe === "Content-Type 'text/plain;charset=UTF-8' is not supported.",
    );
  });
});

describe('corpoValidado', () => {
  it('converte o corpo no DTO', () => {
    const dto = corpoValidado(requisicao({ corpo: '{"nome":"Massas"}' }), CategoriaRequestDTO);
    assert.ok(dto instanceof CategoriaRequestDTO);
    assert.equal(dto.nome, 'Massas');
  });

  it('lanca a primeira violacao das restricoes do DTO', () => {
    assert.throws(
      () => corpoValidado(requisicao({ corpo: '{"nome":"  "}' }), CategoriaRequestDTO),
      (erro) => erro instanceof ValidacaoError && erro.campo === 'nome' && erro.restricao.chave === 'NotBlank',
    );
  });
});

describe('parametroObrigatorio', () => {
  it('converte o parametro da query', () => {
    assert.equal(parametroObrigatorio(requisicao({ query: { quantidade: '3' } }), 'quantidade', parametroInteger), 3);
  });

  it('usa o primeiro valor quando o parametro se repete', () => {
    const req = requisicao({ query: { quantidade: ['2', '5'] } });
    assert.equal(parametroObrigatorio(req, 'quantidade', parametroInteger), 2);
  });

  it('responde 400 quando o parametro esta ausente ou vazio', () => {
    for (const query of [{}, { quantidade: '' }]) {
      assert.throws(
        () => parametroObrigatorio(requisicao({ query }), 'quantidade', parametroInteger),
        { status: 400, detalhe: "Required parameter 'quantidade' is not present." },
      );
    }
  });

  it('recusa valor que nao converte', () => {
    assert.throws(
      () => parametroObrigatorio(requisicao({ query: { quantidade: 'dois' } }), 'quantidade', parametroInteger),
      RequisicaoInvalidaError,
    );
  });
});
