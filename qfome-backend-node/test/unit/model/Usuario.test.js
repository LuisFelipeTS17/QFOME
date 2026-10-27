import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Usuario } from '../../../src/model/Usuario.js';
import { umUsuario } from '../../apoio/fabricas.js';

describe('Usuario', () => {
  describe('prePersist', () => {
    it('define o perfil CLIENTE e a data de criacao', () => {
      const usuario = new Usuario({ nome: 'Ana', email: 'ana@qfome.com', senha: '123456' });
      usuario.prePersist();

      assert.equal(usuario.perfil, 'CLIENTE');
      assert.match(usuario.criadoEm, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
    });

    it('mantem o perfil ja definido', () => {
      const usuario = umUsuario({ perfil: 'ADMIN' });
      usuario.prePersist();
      assert.equal(usuario.perfil, 'ADMIN');
    });
  });

  describe('violacao', () => {
    it('devolve null para um usuario valido', () => {
      assert.equal(umUsuario().violacao(), null);
    });

    it('devolve o campo e a restricao violada, sem lancar erro', () => {
      const { campo, restricao } = umUsuario({ email: 'ana.qfome.com' }).violacao();

      assert.equal(campo, 'email');
      assert.equal(restricao.chave, 'Email');
    });

    it('informa o limite violado nos argumentos da restricao', () => {
      const { restricao } = umUsuario({ senha: 'x'.repeat(256) }).violacao();
      assert.deepEqual(restricao.args, { min: 0, max: 255 });
    });
  });

  describe('validar', () => {
    it('aceita um usuario valido', () => {
      assert.doesNotThrow(() => umUsuario().validar());
    });

    const invalidos = [
      ['nome em branco', { nome: ' ' }, 'nome (NotBlank)'],
      ['nome longo', { nome: 'x'.repeat(101) }, 'nome (Size)'],
      ['e-mail malformado', { email: 'ana.qfome.com' }, 'email (Email)'],
      ['e-mail vazio', { email: '' }, 'email (NotBlank)'],
      ['e-mail com mais de 150 caracteres', { email: `${'a'.repeat(60)}@${'b'.repeat(50)}.${'c'.repeat(40)}.com` }, 'email (Size)'],
      ['senha em branco', { senha: '' }, 'senha (NotBlank)'],
    ];
    for (const [caso, campos, esperado] of invalidos) {
      it(`recusa ${caso}`, () => {
        assert.throws(() => umUsuario(campos).validar(), { message: `Usuario invalido: ${esperado}` });
      });
    }
  });
});
