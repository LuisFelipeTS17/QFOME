import { Carrinho } from '../model/Carrinho.js';
import { ItemCarrinho } from '../model/ItemCarrinho.js';
import { Produto } from '../model/Produto.js';
import { paraAdicional } from './ProdutoRepository.js';

// O JPA grava as mudancas do carrinho por cascade/dirty checking; aqui cada mudanca tem o seu metodo.
export class CarrinhoRepository {
  constructor(db) {
    this.db = db;
  }

  /** Carrinho do usuario com os itens (ordenados por id), cada um com produto e adicionais. */
  findByUsuarioId(usuarioId) {
    const linha = this.db.prepare('SELECT * FROM carrinho WHERE usuario_id = ?').get(usuarioId);
    if (!linha) return null;

    const itens = this.db.prepare(`
      SELECT i.*, p.nome AS produto_nome, p.preco AS produto_preco
      FROM item_carrinho i
      JOIN produto p ON p.id = i.produto_id
      WHERE i.carrinho_id = ?
      ORDER BY i.id`).all(linha.id);
    const adicionais = this.db.prepare(`
      SELECT ica.item_carrinho_id, a.*
      FROM item_carrinho_adicional ica
      JOIN item_carrinho i ON i.id = ica.item_carrinho_id
      JOIN adicional a ON a.id = ica.adicional_id
      WHERE i.carrinho_id = ?
      ORDER BY a.id`).all(linha.id);
    const adicionaisPorItem = Map.groupBy(adicionais, (adicional) => adicional.item_carrinho_id);

    return new Carrinho({
      id: linha.id,
      usuarioId: linha.usuario_id,
      atualizadoEm: linha.atualizado_em,
      itens: itens.map((item) => new ItemCarrinho({
        id: item.id,
        produto: new Produto({ id: item.produto_id, nome: item.produto_nome, preco: item.produto_preco }),
        quantidade: item.quantidade,
        observacao: item.observacao,
        adicionais: (adicionaisPorItem.get(item.id) ?? []).map(paraAdicional),
      })),
    });
  }

  save(carrinho) {
    carrinho.prePersist();
    const { lastInsertRowid } = this.db
      .prepare('INSERT INTO carrinho (usuario_id, atualizado_em) VALUES (?, ?)')
      .run(carrinho.usuarioId, carrinho.atualizadoEm);
    carrinho.id = Number(lastInsertRowid);
    return carrinho;
  }

  atualizarData(carrinho) {
    this.db.prepare('UPDATE carrinho SET atualizado_em = ? WHERE id = ?').run(carrinho.atualizadoEm, carrinho.id);
  }

  inserirItem(carrinho, item) {
    const { lastInsertRowid } = this.db
      .prepare('INSERT INTO item_carrinho (carrinho_id, produto_id, quantidade, observacao) VALUES (?, ?, ?, ?)')
      .run(carrinho.id, item.produto.id, item.quantidade, item.observacao);
    item.id = Number(lastInsertRowid);

    const inserirAdicional = this.db.prepare('INSERT INTO item_carrinho_adicional (item_carrinho_id, adicional_id) VALUES (?, ?)');
    for (const adicional of item.adicionais) {
      inserirAdicional.run(item.id, adicional.id);
    }
  }

  atualizarQuantidade(item) {
    this.db.prepare('UPDATE item_carrinho SET quantidade = ? WHERE id = ?').run(item.quantidade, item.id);
  }

  // Os adicionais do item saem pelo ON DELETE CASCADE de item_carrinho_adicional.
  removerItem(item) {
    this.db.prepare('DELETE FROM item_carrinho WHERE id = ?').run(item.id);
  }

  removerItens(carrinho) {
    this.db.prepare('DELETE FROM item_carrinho WHERE carrinho_id = ?').run(carrinho.id);
  }
}
