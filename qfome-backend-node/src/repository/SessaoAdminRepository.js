/** Sessoes do login administrativo (tabela sessao_admin). Guarda o hash do token, nunca o token. */
export class SessaoAdminRepository {
  constructor(db) {
    this.db = db;
  }

  save({ usuarioId, tokenHash, criadoEm, expiraEm }) {
    const { lastInsertRowid } = this.db
      .prepare('INSERT INTO sessao_admin (usuario_id, token_hash, criado_em, expira_em) VALUES (?, ?, ?, ?)')
      .run(usuarioId, tokenHash, criadoEm, expiraEm);
    return { id: Number(lastInsertRowid), usuarioId, tokenHash, criadoEm, expiraEm };
  }

  findByTokenHash(tokenHash) {
    const linha = this.db.prepare('SELECT * FROM sessao_admin WHERE token_hash = ?').get(tokenHash);
    if (!linha) return null;
    return {
      id: linha.id,
      usuarioId: linha.usuario_id,
      tokenHash: linha.token_hash,
      criadoEm: linha.criado_em,
      expiraEm: linha.expira_em,
    };
  }

  deleteByTokenHash(tokenHash) {
    this.db.prepare('DELETE FROM sessao_admin WHERE token_hash = ?').run(tokenHash);
  }

  deleteExpiradas(agora) {
    this.db.prepare('DELETE FROM sessao_admin WHERE expira_em <= ?').run(agora);
  }
}
