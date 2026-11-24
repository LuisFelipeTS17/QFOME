import assert from 'node:assert/strict';

import { Perfil } from '../../src/model/enums/Perfil.js';
import { Usuario } from '../../src/model/Usuario.js';
import { UsuarioRepository } from '../../src/repository/UsuarioRepository.js';
import { gerarHashDaSenha } from '../../src/util/senha.js';

export const ADMIN = Object.freeze({ nome: 'Administrador Teste', email: 'admin.teste@qfome.com', senha: 'Senha@Admin1' });

/** Grava um administrador no banco do teste (a API nao cadastra esse perfil). */
export function cadastrarAdmin(db, dados = {}) {
  const { nome, email, senha } = { ...ADMIN, ...dados };
  return new UsuarioRepository(db).save(new Usuario({ nome, email, senha: gerarHashDaSenha(senha), perfil: Perfil.ADMIN }));
}

const porApi = new WeakMap();

/**
 * Cliente HTTP ja autenticado como administrador, com os mesmos metodos da api.
 * Cria o administrador e faz login uma vez por aplicacao de teste.
 */
export function entrarComoAdmin(api) {
  if (!porApi.has(api)) porApi.set(api, criarClienteAdmin(api));
  return porApi.get(api);
}

async function criarClienteAdmin(api) {
  cadastrarAdmin(api.db);
  const { status, corpo } = await api.post('/admin/login', { email: ADMIN.email, password: ADMIN.senha });
  assert.equal(status, 200, `login administrativo falhou: ${JSON.stringify(corpo)}`);

  const comToken = (opcoes = {}) => ({ ...opcoes, headers: { Authorization: `Bearer ${corpo.token}`, ...opcoes.headers } });
  return {
    ...corpo,
    get: (caminho, opcoes) => api.get(caminho, comToken(opcoes)),
    post: (caminho, dados, opcoes) => api.post(caminho, dados, comToken(opcoes)),
    put: (caminho, dados, opcoes) => api.put(caminho, dados, comToken(opcoes)),
    delete: (caminho, opcoes) => api.delete(caminho, comToken(opcoes)),
  };
}
