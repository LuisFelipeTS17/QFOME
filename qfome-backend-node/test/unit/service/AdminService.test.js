import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { Perfil } from '../../../src/model/enums/Perfil.js';
import { AdminService } from '../../../src/service/AdminService.js';
import { gerarHashDaSenha } from '../../../src/util/senha.js';
import { umUsuario } from '../../apoio/fabricas.js';
import { falhaCom } from '../../apoio/verificacoes.js';

const SENHA = 'Senha@Admin1';
const HASH = gerarHashDaSenha(SENHA);

/** AdminService com repositorios em memoria. */
function montar({ usuarios = [], sessaoMinutos = 60 } = {}) {
  const sessoes = new Map();
  const usuarioRepository = {
    findByEmail: (email) => usuarios.find((usuario) => usuario.email === email) ?? null,
    findById: (id) => usuarios.find((usuario) => usuario.id === id) ?? null,
  };
  const sessaoAdminRepository = {
    save: (sessao) => {
      sessoes.set(sessao.tokenHash, sessao);
      return sessao;
    },
    findByTokenHash: (tokenHash) => sessoes.get(tokenHash) ?? null,
    deleteByTokenHash: (tokenHash) => sessoes.delete(tokenHash),
    deleteExpiradas: (agora) => {
      for (const [chave, sessao] of sessoes) if (sessao.expiraEm <= agora) sessoes.delete(chave);
    },
  };
  return { service: new AdminService(usuarioRepository, sessaoAdminRepository, { sessaoMinutos }), sessoes };
}

const NECESSARIO = falhaCom(401, 'Login administrativo necessario');

describe('AdminService', () => {
  let admin;
  let cliente;

  beforeEach(() => {
    admin = umUsuario({ id: 1, nome: 'Admin', email: 'admin@qfome.com', senha: HASH, perfil: Perfil.ADMIN });
    cliente = umUsuario({ id: 2, email: 'ana@qfome.com', senha: '123456' });
  });

  describe('entrar', () => {
    it('devolve o token e o administrador, sem a senha', () => {
      const { service } = montar({ usuarios: [admin] });

      const resposta = service.entrar('  ADMIN@qfome.com ', SENHA);

      assert.match(resposta.token, /^[\w-]{43}$/);
      assert.match(resposta.expiraEm, /^\d{4}-\d{2}-\d{2}T/);
      assert.deepEqual({ ...resposta.usuario }, { id: 1, nome: 'Admin', email: 'admin@qfome.com', perfil: 'ADMIN' });
    });

    it('grava so o hash do token', () => {
      const { service, sessoes } = montar({ usuarios: [admin] });

      const { token } = service.entrar('admin@qfome.com', SENHA);

      const [sessao] = sessoes.values();
      assert.match(sessao.tokenHash, /^[0-9a-f]{64}$/);
      assert.ok(!JSON.stringify(sessao).includes(token));
    });

    it('gera um token diferente a cada login', () => {
      const { service } = montar({ usuarios: [admin] });
      assert.notEqual(service.entrar('admin@qfome.com', SENHA).token, service.entrar('admin@qfome.com', SENHA).token);
    });

    it('responde 401 para e-mail desconhecido ou senha errada, com a mesma mensagem', () => {
      const { service } = montar({ usuarios: [admin] });
      const invalido = falhaCom(401, 'E-mail ou senha invalidos');

      assert.throws(() => service.entrar('ninguem@qfome.com', SENHA), invalido);
      assert.throws(() => service.entrar('admin@qfome.com', 'errada'), invalido);
    });

    it('responde 403 para conta de cliente', () => {
      const { service, sessoes } = montar({ usuarios: [cliente] });

      assert.throws(() => service.entrar('ana@qfome.com', '123456'), falhaCom(403, 'Acesso restrito a administradores'));
      assert.equal(sessoes.size, 0);
    });
  });

  describe('autenticar', () => {
    it('devolve o administrador do token', () => {
      const { service } = montar({ usuarios: [admin] });
      const { token } = service.entrar('admin@qfome.com', SENHA);

      assert.equal(service.autenticar(token).usuario.id, 1);
    });

    it('responde 401 sem token ou com token desconhecido', () => {
      const { service } = montar({ usuarios: [admin] });

      assert.throws(() => service.autenticar(null), NECESSARIO);
      assert.throws(() => service.autenticar('inventado'), NECESSARIO);
    });

    it('responde 401 e apaga a sessao expirada', (t) => {
      t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 10, 24, 10, 0).getTime() });
      const { service, sessoes } = montar({ usuarios: [admin], sessaoMinutos: 30 });
      const { token } = service.entrar('admin@qfome.com', SENHA);

      t.mock.timers.setTime(new Date(2026, 10, 24, 10, 29, 59).getTime());
      assert.equal(service.autenticar(token).usuario.id, 1);

      t.mock.timers.setTime(new Date(2026, 10, 24, 10, 30).getTime());
      assert.throws(() => service.autenticar(token), falhaCom(401, 'Sessao expirada. Entre novamente.'));
      assert.equal(sessoes.size, 0);
    });

    it('responde 401 quando o usuario deixa de ser administrador', () => {
      const { service } = montar({ usuarios: [admin] });
      const { token } = service.entrar('admin@qfome.com', SENHA);

      admin.perfil = Perfil.CLIENTE;

      assert.throws(() => service.autenticar(token), NECESSARIO);
    });
  });

  describe('sair', () => {
    it('invalida o token', () => {
      const { service } = montar({ usuarios: [admin] });
      const { token } = service.entrar('admin@qfome.com', SENHA);

      service.sair(token);

      assert.throws(() => service.autenticar(token), NECESSARIO);
    });

    it('nao falha sem token', () => {
      assert.doesNotThrow(() => montar().service.sair(null));
    });
  });

  it('um novo login apaga as sessoes expiradas', (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 10, 24, 10, 0).getTime() });
    const { service, sessoes } = montar({ usuarios: [admin], sessaoMinutos: 30 });
    service.entrar('admin@qfome.com', SENHA);

    t.mock.timers.setTime(new Date(2026, 10, 24, 11, 0).getTime());
    service.entrar('admin@qfome.com', SENHA);

    assert.equal(sessoes.size, 1);
  });
});
