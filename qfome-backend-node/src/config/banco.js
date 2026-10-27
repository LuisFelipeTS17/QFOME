import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

const PASTA_SCRIPTS = new URL('../db/', import.meta.url);

/**
 * Abre o SQLite em arquivo e, se configurado, roda o schema (db/schema.sql, Anexo A) e o seed
 * (db/data.sql). Os scripts sao idempotentes e rodam a cada inicializacao.
 *
 * Uma unica conexao, como o pool de tamanho 1 do Spring: o SQLite aceita um escritor por vez.
 */
export function abrirBanco({ arquivo, executarScripts }) {
  // O SQLite cria o arquivo qfome.db, mas nao a pasta onde ele fica.
  fs.mkdirSync(path.dirname(path.resolve(arquivo)), { recursive: true });

  const db = new Database(arquivo, { timeout: 5000 });
  // Ativa as FKs e o ON DELETE CASCADE do schema (no SQLite vem desligado).
  db.pragma('foreign_keys = ON');

  if (executarScripts) {
    db.exec(lerScript('schema.sql'));
    db.exec(lerScript('data.sql'));
  }
  return db;
}

/** Roda fn numa transacao (como o @Transactional): se ela lancar erro, tudo e desfeito. */
export function criarTransacao(db) {
  return (fn) => db.transaction(fn)();
}

function lerScript(nome) {
  return fs.readFileSync(new URL(nome, PASTA_SCRIPTS), 'utf8');
}
