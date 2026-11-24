import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { gerarHashDaSenha, senhaConfere } from '../../../src/util/senha.js';

describe('gerarHashDaSenha', () => {
  it('nao guarda a senha e usa um sal diferente a cada vez', () => {
    const um = gerarHashDaSenha('Segredo@1');
    const outro = gerarHashDaSenha('Segredo@1');

    assert.match(um, /^scrypt\$[\w-]{22}\$[\w-]{43}$/);
    assert.ok(!um.includes('Segredo'));
    assert.notEqual(um, outro);
  });

  it('cabe na coluna senha (255 caracteres)', () => {
    assert.ok(gerarHashDaSenha('x'.repeat(255)).length <= 255);
  });
});

describe('senhaConfere', () => {
  it('aceita a senha certa e recusa a errada', () => {
    const hash = gerarHashDaSenha('Segredo@1');

    assert.equal(senhaConfere('Segredo@1', hash), true);
    assert.equal(senhaConfere('segredo@1', hash), false);
    assert.equal(senhaConfere('', hash), false);
  });

  it('nao aceita o proprio hash como senha', () => {
    const hash = gerarHashDaSenha('Segredo@1');
    assert.equal(senhaConfere(hash, hash), false);
  });

  it('compara direto quando a conta ainda guarda a senha em texto puro', () => {
    assert.equal(senhaConfere('123456', '123456'), true);
    assert.equal(senhaConfere('1234567', '123456'), false);
  });

  it('trata como texto puro o que so parece um hash', () => {
    assert.equal(senhaConfere('scrypt$a$b', 'scrypt$a$b'), true);
    assert.equal(senhaConfere('outra', 'scrypt$a$b'), false);
  });
});
