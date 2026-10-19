import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Big from 'big.js';

import { arredondar } from '../../../src/dto/Dinheiro.js';

/** Como o valor aparece no JSON da resposta. */
const noJson = (valor) => JSON.stringify(arredondar(valor));

describe('Dinheiro.arredondar', () => {
  it('escreve o valor com duas casas decimais no JSON', () => {
    assert.equal(noJson(39.9), '39.90');
    assert.equal(noJson(45), '45.00');
    assert.equal(noJson(0), '0.00');
  });

  it('mantem o valor numerico ao ler o JSON', () => {
    assert.deepEqual(JSON.parse(JSON.stringify({ preco: arredondar(39.9) })), { preco: 39.9 });
  });

  it('aceita valores big.js e textos', () => {
    assert.equal(noJson(new Big('6.9')), '6.90');
    assert.equal(noJson('10'), '10.00');
  });

  it('arredonda a terceira casa para cima a partir de 5', () => {
    assert.equal(noJson('1.005'), '1.01');
    assert.equal(noJson('2.344'), '2.34');
    assert.equal(noJson('2.345'), '2.35');
  });

  it('devolve null quando nao ha valor', () => {
    assert.equal(arredondar(null), null);
    assert.equal(arredondar(undefined), null);
  });
});
