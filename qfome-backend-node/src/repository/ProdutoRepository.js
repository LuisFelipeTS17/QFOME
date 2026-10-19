import { Adicional } from '../model/Adicional.js';
import { Categoria } from '../model/Categoria.js';
import { Produto } from '../model/Produto.js';

const SELECT_PRODUTO = `
  SELECT p.*, c.nome AS categoria_nome
  FROM produto p
  JOIN categoria c ON c.id = p.categoria_id`;

// Produtos vem sempre com categoria e adicionais, carregados em duas consultas (sem N+1).
export class ProdutoRepository {
  constructor(db) {
    this.db = db;
  }

  findAllByOrderByIdAsc() {
    const produtos = this.db.prepare(`${SELECT_PRODUTO} ORDER BY p.id`).all();
    const adicionais = this.db.prepare('SELECT * FROM adicional ORDER BY id').all();
    return montar(produtos, adicionais);
  }

  findByCategoriaIdOrderByIdAsc(categoriaId) {
    const produtos = this.db.prepare(`${SELECT_PRODUTO} WHERE p.categoria_id = ? ORDER BY p.id`).all(categoriaId);
    const adicionais = this.db.prepare(`
      SELECT a.* FROM adicional a
      JOIN produto p ON p.id = a.produto_id
      WHERE p.categoria_id = ?
      ORDER BY a.id`).all(categoriaId);
    return montar(produtos, adicionais);
  }

  findById(id) {
    const produtos = this.db.prepare(`${SELECT_PRODUTO} WHERE p.id = ?`).all(id);
    const adicionais = this.db.prepare('SELECT * FROM adicional WHERE produto_id = ? ORDER BY id').all(id);
    return montar(produtos, adicionais)[0] ?? null;
  }

  save(produto) {
    const valores = [
      produto.categoria.id, produto.nome, produto.descricao, Number(produto.preco),
      produto.imagemUrl, produto.tempoPreparoMin,
    ];
    if (produto.id == null) {
      const { lastInsertRowid } = this.db.prepare(`
        INSERT INTO produto (categoria_id, nome, descricao, preco, imagem_url, tempo_preparo_min)
        VALUES (?, ?, ?, ?, ?, ?)`).run(...valores);
      produto.id = Number(lastInsertRowid);
    } else {
      this.db.prepare(`
        UPDATE produto
        SET categoria_id = ?, nome = ?, descricao = ?, preco = ?, imagem_url = ?, tempo_preparo_min = ?
        WHERE id = ?`).run(...valores, produto.id);
    }
    return produto;
  }

  delete(produto) {
    this.db.prepare('DELETE FROM produto WHERE id = ?').run(produto.id);
  }
}

function montar(produtos, adicionais) {
  const adicionaisPorProduto = Map.groupBy(adicionais.map(paraAdicional), (adicional) => adicional.produtoId);
  return produtos.map((linha) => new Produto({
    id: linha.id,
    categoria: new Categoria({ id: linha.categoria_id, nome: linha.categoria_nome }),
    nome: linha.nome,
    descricao: linha.descricao,
    preco: linha.preco,
    imagemUrl: linha.imagem_url,
    tempoPreparoMin: linha.tempo_preparo_min,
    adicionais: adicionaisPorProduto.get(linha.id) ?? [],
  }));
}

export function paraAdicional(linha) {
  return new Adicional({ id: linha.id, produtoId: linha.produto_id, nome: linha.nome, preco: linha.preco });
}
