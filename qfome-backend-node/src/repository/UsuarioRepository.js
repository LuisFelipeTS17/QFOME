import { Usuario } from '../model/Usuario.js';

export class UsuarioRepository {
  constructor(db) {
    this.db = db;
  }

  findById(id) {
    return paraUsuario(this.db.prepare('SELECT * FROM usuario WHERE id = ?').get(id));
  }

  findByEmail(email) {
    return paraUsuario(this.db.prepare('SELECT * FROM usuario WHERE email = ?').get(email));
  }

  existsById(id) {
    return this.db.prepare('SELECT 1 FROM usuario WHERE id = ?').get(id) !== undefined;
  }

  existsByEmail(email) {
    return this.db.prepare('SELECT 1 FROM usuario WHERE email = ?').get(email) !== undefined;
  }

  save(usuario) {
    if (usuario.id == null) {
      usuario.prePersist();
      usuario.validar();
      const { lastInsertRowid } = this.db
        .prepare('INSERT INTO usuario (nome, email, senha, perfil, criado_em) VALUES (?, ?, ?, ?, ?)')
        .run(usuario.nome, usuario.email, usuario.senha, usuario.perfil, usuario.criadoEm);
      usuario.id = Number(lastInsertRowid);
    } else {
      usuario.validar();
      this.db
        .prepare('UPDATE usuario SET nome = ?, email = ?, senha = ?, perfil = ? WHERE id = ?')
        .run(usuario.nome, usuario.email, usuario.senha, usuario.perfil, usuario.id);
    }
    return usuario;
  }

  deleteById(id) {
    this.db.prepare('DELETE FROM usuario WHERE id = ?').run(id);
  }
}

function paraUsuario(linha) {
  if (!linha) return null;
  return new Usuario({
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    senha: linha.senha,
    perfil: linha.perfil,
    criadoEm: linha.criado_em,
  });
}
