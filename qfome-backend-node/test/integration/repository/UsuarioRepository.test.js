import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { Usuario } from '../../../src/model/Usuario.js';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository.js';
import { abrirBancoDeTeste, contarLinhas } from '../../apoio/banco.js';

describe('UsuarioRepository', () => {
  let banco;
  let repository;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    repository = new UsuarioRepository(banco.db);
  });

  afterEach(() => banco.fechar());

  const novoUsuario = (campos = {}) => new Usuario({ nome: 'Ana Souza', email: 'ana@qfome.com', senha: '123456', ...campos });

  describe('save', () => {
    it('insere o usuario com id, perfil CLIENTE e data de criacao', () => {
      const salvo = repository.save(novoUsuario());

      assert.equal(typeof salvo.id, 'number');
      const lido = repository.findById(salvo.id);
      assert.equal(lido.nome, 'Ana Souza');
      assert.equal(lido.email, 'ana@qfome.com');
      assert.equal(lido.perfil, 'CLIENTE');
      assert.match(lido.criadoEm, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
    });

    it('atualiza o usuario existente', () => {
      const salvo = repository.save(novoUsuario());
      salvo.nome = 'Ana Lima';

      repository.save(salvo);

      assert.equal(repository.findById(salvo.id).nome, 'Ana Lima');
      assert.equal(contarLinhas(banco.db, 'usuario'), 1);
    });

    it('valida o usuario antes de gravar', () => {
      assert.throws(() => repository.save(novoUsuario({ email: 'invalido' })), /Usuario invalido: email/);
      assert.equal(contarLinhas(banco.db, 'usuario'), 0);
    });

    it('nao grava dois usuarios com o mesmo e-mail', () => {
      repository.save(novoUsuario());
      assert.throws(() => repository.save(novoUsuario({ nome: 'Outra Ana' })), { code: 'SQLITE_CONSTRAINT_UNIQUE' });
    });
  });

  describe('consultas', () => {
    let ana;

    beforeEach(() => {
      ana = repository.save(novoUsuario());
    });

    it('busca por id e por e-mail', () => {
      assert.equal(repository.findById(ana.id).email, 'ana@qfome.com');
      assert.equal(repository.findByEmail('ana@qfome.com').id, ana.id);
    });

    it('devolve null quando nao encontra', () => {
      assert.equal(repository.findById(999), null);
      assert.equal(repository.findByEmail('ninguem@qfome.com'), null);
    });

    it('diz se o id ou o e-mail existem', () => {
      assert.equal(repository.existsById(ana.id), true);
      assert.equal(repository.existsById(999), false);
      assert.equal(repository.existsByEmail('ana@qfome.com'), true);
      assert.equal(repository.existsByEmail('ninguem@qfome.com'), false);
    });
  });

  it('apaga pelo id', () => {
    const ana = repository.save(novoUsuario());

    repository.deleteById(ana.id);

    assert.equal(repository.findById(ana.id), null);
  });
});
