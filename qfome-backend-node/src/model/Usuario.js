import { agora } from '../util/datas.js';
import { Email, NotBlank, Size, primeiraViolacao } from '../validacao/restricoes.js';
import { Perfil } from './enums/Perfil.js';

export class Usuario {
  constructor({ id = null, nome, email, senha, perfil = null, criadoEm = null }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.perfil = perfil;
    this.criadoEm = criadoEm;
  }

  prePersist() {
    this.perfil ??= Perfil.CLIENTE;
    this.criadoEm ??= agora();
  }

  /** Primeira restricao violada ({ campo, restricao }), ou null se o usuario e valido. */
  violacao() {
    return primeiraViolacao([
      ['nome', this.nome, NotBlank, Size(100)],
      ['email', this.email, Email, NotBlank, Size(150)],
      ['senha', this.senha, NotBlank, Size(255)],
    ]);
  }

  // Ultima barreira antes de gravar: quem recebe dados do cliente confere violacao() antes e responde 400.
  validar() {
    const violacao = this.violacao();
    if (violacao) throw new Error(`Usuario invalido: ${violacao.campo} (${violacao.restricao.chave})`);
  }
}
