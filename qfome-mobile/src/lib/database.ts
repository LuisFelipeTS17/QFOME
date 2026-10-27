import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessao (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  usuario_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil TEXT NOT NULL,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categoria_cache (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS produto_cache (
  id INTEGER PRIMARY KEY,
  categoria_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco REAL NOT NULL,
  imagem_url TEXT,
  tempo_preparo_min INTEGER,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

let databasePromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync("qfome.db")
      .then(async (db) => {
        await db.execAsync(SCHEMA);
        return db;
      })
      .catch((error) => {
        databasePromise = null;
        throw error;
      });
  }
  return databasePromise;
}
