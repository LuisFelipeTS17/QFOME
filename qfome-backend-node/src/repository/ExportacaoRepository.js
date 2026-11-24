import { agora } from '../util/datas.js';

/** Historico das exportacoes de pedidos em JSON (tabela exportacao). */
export class ExportacaoRepository {
  constructor(db) {
    this.db = db;
  }

  save({ usuarioId, origem, totalPedidos, faturamentoTotal, arquivo }) {
    const criadoEm = agora();
    const { lastInsertRowid } = this.db.prepare(`
      INSERT INTO exportacao (usuario_id, origem, total_pedidos, faturamento_total, arquivo, criado_em)
      VALUES (?, ?, ?, ?, ?, ?)`).run(usuarioId, origem, totalPedidos, faturamentoTotal, arquivo, criadoEm);
    return { id: Number(lastInsertRowid), usuarioId, origem, totalPedidos, faturamentoTotal, arquivo, criadoEm };
  }

  /** As mais recentes primeiro, com o nome de quem exportou (null na exportacao da area do cliente). */
  findRecentes(limite) {
    return this.db.prepare(`
      SELECT e.*, u.nome AS usuario_nome
      FROM exportacao e
      LEFT JOIN usuario u ON u.id = e.usuario_id
      ORDER BY e.id DESC
      LIMIT ?`).all(limite).map((linha) => ({
      id: linha.id,
      usuarioId: linha.usuario_id,
      usuarioNome: linha.usuario_nome,
      origem: linha.origem,
      totalPedidos: linha.total_pedidos,
      faturamentoTotal: linha.faturamento_total,
      arquivo: linha.arquivo,
      criadoEm: linha.criado_em,
    }));
  }
}
