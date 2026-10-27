import { Adicional } from '../model/Adicional.js';
import { ItemPedido } from '../model/ItemPedido.js';
import { ItemPedidoAdicional } from '../model/ItemPedidoAdicional.js';
import { Pedido } from '../model/Pedido.js';
import { Produto } from '../model/Produto.js';

export class PedidoRepository {
  constructor(db) {
    this.db = db;
  }

  findByUsuarioIdOrderByCriadoEmDesc(usuarioId) {
    return this.db
      .prepare('SELECT * FROM pedido WHERE usuario_id = ? ORDER BY criado_em DESC')
      .all(usuarioId)
      .map((linha) => this.montar(linha));
  }

  findByCodigo(codigo) {
    const linha = this.db.prepare('SELECT * FROM pedido WHERE codigo = ?').get(codigo);
    return linha ? this.montar(linha) : null;
  }

  existsByCodigo(codigo) {
    return this.db.prepare('SELECT 1 FROM pedido WHERE codigo = ?').get(codigo) !== undefined;
  }

  /** Grava o pedido com os itens e os adicionais de cada item (o cascade do JPA). */
  save(pedido) {
    pedido.prePersist();
    const { lastInsertRowid } = this.db.prepare(`
      INSERT INTO pedido (codigo, usuario_id, status, forma_pagamento, cep, logradouro, numero, bairro, cidade,
                          subtotal, taxa_entrega, total, criado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      pedido.codigo, pedido.usuarioId, pedido.status, pedido.formaPagamento,
      pedido.cep, pedido.logradouro, pedido.numero, pedido.bairro, pedido.cidade,
      Number(pedido.subtotal), Number(pedido.taxaEntrega), Number(pedido.total), pedido.criadoEm,
    );
    pedido.id = Number(lastInsertRowid);

    const inserirItem = this.db.prepare(`
      INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario, observacao)
      VALUES (?, ?, ?, ?, ?)`);
    const inserirAdicional = this.db.prepare(
      'INSERT INTO item_pedido_adicional (item_pedido_id, adicional_id, preco) VALUES (?, ?, ?)');
    for (const item of pedido.itens) {
      const resultado = inserirItem.run(pedido.id, item.produto.id, item.quantidade, Number(item.precoUnitario), item.observacao);
      item.id = Number(resultado.lastInsertRowid);
      for (const { adicional, preco } of item.adicionais) {
        inserirAdicional.run(item.id, adicional.id, Number(preco));
      }
    }
    return pedido;
  }

  montar(linha) {
    const itens = this.db.prepare(`
      SELECT ip.*, p.nome AS produto_nome, p.preco AS produto_preco
      FROM item_pedido ip
      JOIN produto p ON p.id = ip.produto_id
      WHERE ip.pedido_id = ?
      ORDER BY ip.id`).all(linha.id);
    const adicionais = this.db.prepare(`
      SELECT ipa.item_pedido_id, ipa.preco, a.id, a.produto_id, a.nome, a.preco AS preco_atual
      FROM item_pedido_adicional ipa
      JOIN item_pedido ip ON ip.id = ipa.item_pedido_id
      JOIN adicional a ON a.id = ipa.adicional_id
      WHERE ip.pedido_id = ?
      ORDER BY ipa.item_pedido_id, ipa.adicional_id`).all(linha.id);
    const adicionaisPorItem = Map.groupBy(adicionais, (adicional) => adicional.item_pedido_id);

    return new Pedido({
      id: linha.id,
      codigo: linha.codigo,
      usuarioId: linha.usuario_id,
      status: linha.status,
      formaPagamento: linha.forma_pagamento,
      cep: linha.cep,
      logradouro: linha.logradouro,
      numero: linha.numero,
      bairro: linha.bairro,
      cidade: linha.cidade,
      subtotal: linha.subtotal,
      taxaEntrega: linha.taxa_entrega,
      total: linha.total,
      criadoEm: linha.criado_em,
      itens: itens.map((item) => new ItemPedido({
        id: item.id,
        produto: new Produto({ id: item.produto_id, nome: item.produto_nome, preco: item.produto_preco }),
        quantidade: item.quantidade,
        precoUnitario: item.preco_unitario,
        observacao: item.observacao,
        adicionais: (adicionaisPorItem.get(item.id) ?? []).map((a) => new ItemPedidoAdicional(
          new Adicional({ id: a.id, produtoId: a.produto_id, nome: a.nome, preco: a.preco_atual }),
          a.preco,
        )),
      })),
    });
  }
}
