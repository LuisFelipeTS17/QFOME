import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Big from 'big.js';

import {
  DecimalMinExclusivo,
  Email,
  Min,
  NotBlank,
  NotEmpty,
  NotNull,
  Pattern,
  primeiraViolacao,
  Size,
  validar,
} from '../../../src/validacao/restricoes.js';
import { ValidacaoError } from '../../../src/web/erros.js';

/** Confere quais valores a restricao aceita e quais recusa. */
function conferir(restricao, { aceita = [], recusa = [] }) {
  for (const valor of aceita) assert.equal(restricao.valido(valor), true, `deveria aceitar ${String(valor)}`);
  for (const valor of recusa) assert.equal(restricao.valido(valor), false, `deveria recusar ${String(valor)}`);
}

describe('restricoes', () => {
  it('NotNull recusa so null e undefined', () => {
    conferir(NotNull, { aceita: [0, '', false, []], recusa: [null, undefined] });
  });

  it('NotBlank recusa ausente, vazio e so espacos', () => {
    conferir(NotBlank, { aceita: ['a', '  a  '], recusa: [null, undefined, '', '   ', '\t\n'] });
  });

  it('NotEmpty recusa ausente e listas ou textos vazios', () => {
    conferir(NotEmpty, { aceita: [[1], 'a', ' '], recusa: [null, [], ''] });
  });

  it('Size limita o tamanho maximo e aceita ausente', () => {
    conferir(Size(3), { aceita: [null, '', 'abc', [1, 2, 3]], recusa: ['abcd', [1, 2, 3, 4]] });
    assert.deepEqual(Size(3).args, { min: 0, max: 3 });
  });

  it('Min exige valor minimo e aceita ausente', () => {
    conferir(Min(1), { aceita: [null, 1, 99], recusa: [0, -1] });
    assert.deepEqual(Min(1).args, { value: 1 });
  });

  it('DecimalMinExclusivo exige valor estritamente maior', () => {
    conferir(DecimalMinExclusivo('0.0'), {
      aceita: [null, new Big('0.01'), new Big(10)],
      recusa: [new Big(0), new Big('-0.01')],
    });
  });

  it('Pattern confere a expressao, aceita ausente e leva a mensagem propria', () => {
    const cep = Pattern(/^\d{5}-?\d{3}$/, 'deve ter 8 digitos');
    conferir(cep, { aceita: [null, '01310-100', '01310100'], recusa: ['0131-0100', 'abcde-fgh', '013101000'] });
    assert.equal(cep.mensagem, 'deve ter 8 digitos');
  });

  describe('Email', () => {
    it('aceita enderecos validos', () => {
      conferir(Email, {
        aceita: [
          'cliente@qfome.com',
          'nome.sobrenome+tag@sub.dominio.com.br',
          'jose@açaí.com.br',
          'admin@[127.0.0.1]',
        ],
      });
    });

    it('aceita ausente e vazio (a obrigatoriedade fica com o NotBlank)', () => {
      conferir(Email, { aceita: [null, ''] });
    });

    it('recusa enderecos malformados', () => {
      conferir(Email, {
        recusa: ['semarroba', 'cliente@', '@qfome.com', 'cliente@qfome.', 'com espaco@qfome.com', 'a@-qfome.com'],
      });
    });

    it('recusa parte local com mais de 64 caracteres', () => {
      conferir(Email, { aceita: [`${'a'.repeat(64)}@qfome.com`], recusa: [`${'a'.repeat(65)}@qfome.com`] });
    });
  });
});

describe('primeiraViolacao', () => {
  it('devolve null quando todos os campos sao validos', () => {
    assert.equal(primeiraViolacao([['nome', 'Ana', NotBlank], ['idade', 30, Min(18)]]), null);
  });

  it('devolve o primeiro campo invalido, na ordem declarada', () => {
    const violacao = primeiraViolacao([
      ['nome', 'Ana', NotBlank],
      ['email', '', NotBlank],
      ['idade', 10, Min(18)],
    ]);
    assert.equal(violacao.campo, 'email');
    assert.equal(violacao.restricao.chave, 'NotBlank');
  });

  it('dentro do campo, devolve a primeira restricao violada', () => {
    const violacao = primeiraViolacao([['nome', '', NotBlank, Size(0)]]);
    assert.equal(violacao.restricao.chave, 'NotBlank');
  });
});

describe('validar', () => {
  it('nao lanca erro quando os campos sao validos', () => {
    assert.doesNotThrow(() => validar([['nome', 'Ana', NotBlank]]));
  });

  it('lanca ValidacaoError com o campo e a restricao violada', () => {
    assert.throws(
      () => validar([['preco', new Big(0), NotNull, DecimalMinExclusivo('0.0')]]),
      (erro) => erro instanceof ValidacaoError && erro.campo === 'preco' && erro.restricao.chave === 'DecimalMin',
    );
  });
});
