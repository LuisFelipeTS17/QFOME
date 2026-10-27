import { Categoria } from '../model/Categoria.js';

export class CategoriaRepository {
  constructor(db) {
    this.db = db;
  }

  findAllByOrderByIdAsc() {
    return this.db.prepare('SELECT * FROM categoria ORDER BY id').all().map((linha) => new Categoria(linha));
  }

  findById(id) {
    const linha = this.db.prepare('SELECT * FROM categoria WHERE id = ?').get(id);
    return linha ? new Categoria(linha) : null;
  }

  // Mesma consulta que o Spring Data gera para IgnoreCase: upper() dos dois lados.
  existsByNomeIgnoreCase(nome) {
    return this.db.prepare('SELECT 1 FROM categoria WHERE upper(nome) = upper(?)').get(nome) !== undefined;
  }

  save(categoria) {
    if (categoria.id == null) {
      const { lastInsertRowid } = this.db.prepare('INSERT INTO categoria (nome) VALUES (?)').run(categoria.nome);
      categoria.id = Number(lastInsertRowid);
    } else {
      this.db.prepare('UPDATE categoria SET nome = ? WHERE id = ?').run(categoria.nome, categoria.id);
    }
    return categoria;
  }

  delete(categoria) {
    this.db.prepare('DELETE FROM categoria WHERE id = ?').run(categoria.id);
  }
}
