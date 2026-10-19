import { getDatabase } from "./database";

export type Sessao = {
  usuarioId: number;
  nome: string;
  email: string;
  perfil: string;
};

export async function readSessao(): Promise<Sessao | null> {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync<Sessao>(
      "SELECT usuario_id AS usuarioId, nome, email, perfil FROM sessao WHERE id = 1",
    );
  } catch {
    return null;
  }
}

export async function saveSessao(sessao: Sessao) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sessao (id, usuario_id, nome, email, perfil, atualizado_em)
     VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       usuario_id = excluded.usuario_id,
       nome = excluded.nome,
       email = excluded.email,
       perfil = excluded.perfil,
       atualizado_em = excluded.atualizado_em`,
    sessao.usuarioId,
    sessao.nome,
    sessao.email,
    sessao.perfil,
  );
}

export async function clearSessao() {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM sessao");
}
