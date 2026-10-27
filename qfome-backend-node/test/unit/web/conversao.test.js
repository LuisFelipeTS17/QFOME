import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  comoDecimal,
  comoInteger,
  comoLista,
  comoLong,
  comoObjeto,
  comoString,
  parametroInteger,
  parametroLong,
  primeiroValor,
} from '../../../src/web/conversao.js';
import { RequisicaoInvalidaError } from '../../../src/web/erros.js';

const recusa = (fn) => assert.throws(fn, RequisicaoInvalidaError);

describe('conversao do corpo JSON', () => {
  describe('comoLong', () => {
    it('aceita numeros inteiros', () => {
      assert.equal(comoLong(42), 42);
      assert.equal(comoLong(-7), -7);
    });

    it('descarta a parte decimal de numeros', () => {
      assert.equal(comoLong(1.7), 1);
      assert.equal(comoLong(-1.7), -1);
    });

    it('aceita texto com digitos, com sinal e espacos nas pontas', () => {
      assert.equal(comoLong('42'), 42);
      assert.equal(comoLong(' 42 '), 42);
      assert.equal(comoLong('+7'), 7);
      assert.equal(comoLong('-3'), -3);
    });

    it('trata ausente e texto vazio como null', () => {
      assert.equal(comoLong(null), null);
      assert.equal(comoLong(undefined), null);
      assert.equal(comoLong(''), null);
      assert.equal(comoLong('   '), null);
    });

    it('recusa texto que nao e inteiro', () => {
      recusa(() => comoLong('abc'));
      recusa(() => comoLong('1.5'));
      recusa(() => comoLong('1e3'));
    });

    it('recusa booleanos, objetos e listas', () => {
      recusa(() => comoLong(true));
      recusa(() => comoLong({}));
      recusa(() => comoLong([1]));
    });

    it('recusa numeros acima do inteiro seguro', () => {
      recusa(() => comoLong(2 ** 53));
    });
  });

  describe('comoInteger', () => {
    it('aceita os limites de 32 bits', () => {
      assert.equal(comoInteger(2 ** 31 - 1), 2 ** 31 - 1);
      assert.equal(comoInteger('-2147483648'), -(2 ** 31));
    });

    it('recusa valores fora de 32 bits', () => {
      recusa(() => comoInteger(2 ** 31));
      recusa(() => comoInteger('-2147483649'));
    });
  });

  describe('comoDecimal', () => {
    it('converte numeros e textos em valores exatos', () => {
      assert.equal(comoDecimal(39.9).toFixed(2), '39.90');
      assert.equal(comoDecimal('39.90').toFixed(2), '39.90');
      assert.equal(comoDecimal(' +1.5 ').toFixed(1), '1.5');
    });

    it('trata ausente e texto vazio como null', () => {
      assert.equal(comoDecimal(null), null);
      assert.equal(comoDecimal(''), null);
    });

    it('recusa texto que nao e numero e outros tipos', () => {
      recusa(() => comoDecimal('abc'));
      recusa(() => comoDecimal(true));
      recusa(() => comoDecimal({}));
    });
  });

  describe('comoString', () => {
    it('mantem textos e converte numeros e booleanos', () => {
      assert.equal(comoString('Bowl'), 'Bowl');
      assert.equal(comoString(123), '123');
      assert.equal(comoString(false), 'false');
    });

    it('trata ausente como null', () => {
      assert.equal(comoString(null), null);
      assert.equal(comoString(undefined), null);
    });

    it('recusa objetos e listas', () => {
      recusa(() => comoString({}));
      recusa(() => comoString(['a']));
    });
  });

  describe('comoObjeto', () => {
    it('aceita objetos e trata ausente como null', () => {
      const objeto = { nome: 'x' };
      assert.equal(comoObjeto(objeto), objeto);
      assert.equal(comoObjeto(null), null);
    });

    it('recusa listas e valores simples', () => {
      recusa(() => comoObjeto([]));
      recusa(() => comoObjeto('texto'));
      recusa(() => comoObjeto(1));
    });
  });

  describe('comoLista', () => {
    it('converte cada item da lista', () => {
      assert.deepEqual(comoLista([1, '2', ' 3 '], comoLong), [1, 2, 3]);
    });

    it('trata ausente como null', () => {
      assert.equal(comoLista(null, comoLong), null);
    });

    it('recusa o que nao e lista', () => {
      recusa(() => comoLista('1,2', comoLong));
      recusa(() => comoLista({ 0: 1 }, comoLong));
    });

    it('recusa a lista quando um item nao converte', () => {
      recusa(() => comoLista([1, 'dois'], comoLong));
    });
  });
});

describe('conversao de parametros do caminho e da query', () => {
  describe('parametroLong', () => {
    it('aceita digitos com sinal', () => {
      assert.equal(parametroLong('42'), 42);
      assert.equal(parametroLong('+5'), 5);
      assert.equal(parametroLong('-5'), -5);
    });

    it('ignora espacos em qualquer posicao', () => {
      assert.equal(parametroLong(' 4 2 '), 42);
    });

    it('aceita hexadecimal com 0x ou #', () => {
      assert.equal(parametroLong('0x1F'), 31);
      assert.equal(parametroLong('#1f'), 31);
      assert.equal(parametroLong('-0x10'), -16);
    });

    it('trata ausente e vazio como null', () => {
      assert.equal(parametroLong(undefined), null);
      assert.equal(parametroLong(''), null);
    });

    it('recusa texto que nao e inteiro', () => {
      recusa(() => parametroLong('abc'));
      recusa(() => parametroLong('1.5'));
      recusa(() => parametroLong('0xZZ'));
    });
  });

  describe('parametroInteger', () => {
    it('recusa valores fora de 32 bits', () => {
      assert.equal(parametroInteger('2147483647'), 2147483647);
      recusa(() => parametroInteger('2147483648'));
    });
  });

  describe('primeiroValor', () => {
    it('pega o primeiro valor de um parametro repetido', () => {
      assert.equal(primeiroValor(['1', '2']), '1');
    });

    it('devolve o proprio valor quando nao e repetido', () => {
      assert.equal(primeiroValor('3'), '3');
      assert.equal(primeiroValor(undefined), undefined);
    });
  });
});
