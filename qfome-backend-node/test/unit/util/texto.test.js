import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isBlank, trim } from '../../../src/util/texto.js';

describe('trim', () => {
  it('remove espacos e quebras de linha das pontas', () => {
    assert.equal(trim('  \t\n Feijoada \r\n'), 'Feijoada');
  });

  it('remove caracteres de controle das pontas', () => {
    assert.equal(trim('\u0000\u001FBowl\u0007'), 'Bowl');
  });

  it('preserva os espacos do meio', () => {
    assert.equal(trim('  Bowl  Nordestino  '), 'Bowl  Nordestino');
  });

  it('nao remove espacos unicode, como o espaco sem quebra (NBSP)', () => {
    assert.equal(trim(' Bowl '), ' Bowl ');
  });

  it('devolve texto vazio quando so ha espacos', () => {
    assert.equal(trim('   '), '');
  });
});

describe('isBlank', () => {
  for (const texto of ['', ' ', '\t\n\r', ' ', '　']) {
    it(`considera em branco ${JSON.stringify(texto)}`, () => {
      assert.equal(isBlank(texto), true);
    });
  }

  for (const texto of ['a', '  x  ', '0']) {
    it(`nao considera em branco ${JSON.stringify(texto)}`, () => {
      assert.equal(isBlank(texto), false);
    });
  }

  it('nao considera o espaco sem quebra (NBSP) como branco', () => {
    assert.equal(isBlank(' '), false);
  });
});
