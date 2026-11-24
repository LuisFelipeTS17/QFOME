import { entrarComoAdmin, sairDoAdmin } from "./api";
import { getDatabase } from "./database";

/** Sessao do login administrativo, gravada no SQLite do aparelho (tabela sessao_admin). */
export type SessaoAdmin = {
  usuarioId: number;
  nome: string;
  email: string;
  token: string;
  expiraEm: string;
};

export async function readSessaoAdmin(): Promise<SessaoAdmin | null> {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync<SessaoAdmin>(
      `SELECT usuario_id AS usuarioId, nome, email, token, expira_em AS expiraEm
       FROM sessao_admin WHERE id = 1`,
    );
  } catch {
    return null;
  }
}

async function saveSessaoAdmin(sessao: SessaoAdmin) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sessao_admin (id, usuario_id, nome, email, token, expira_em, atualizado_em)
     VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       usuario_id = excluded.usuario_id,
       nome = excluded.nome,
       email = excluded.email,
       token = excluded.token,
       expira_em = excluded.expira_em,
       atualizado_em = excluded.atualizado_em`,
    sessao.usuarioId,
    sessao.nome,
    sessao.email,
    sessao.token,
    sessao.expiraEm,
  );
}

export async function clearSessaoAdmin() {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM sessao_admin");
}

/** Faz o login administrativo no servidor e guarda a sessao no aparelho. */
export async function abrirSessaoAdmin(email: string, senha: string): Promise<SessaoAdmin> {
  const { token, expiraEm, usuario } = await entrarComoAdmin(email, senha);
  const sessao: SessaoAdmin = {
    usuarioId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    token,
    expiraEm,
  };
  await saveSessaoAdmin(sessao);
  return sessao;
}

/** Encerra a sessao no servidor e no aparelho. */
export async function encerrarSessaoAdmin() {
  const sessao = await readSessaoAdmin();
  if (sessao) {
    // Sem conexao, o token ainda sai do aparelho e expira sozinho no servidor.
    await sairDoAdmin(sessao.token).catch(() => {});
    await clearSessaoAdmin();
  }
}
