import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { abrirBanco } from '../../src/config/banco.js';

/** Pasta temporaria para um teste; apagar() remove tudo o que foi criado dentro dela. */
export function criarPastaTemporaria() {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'qfome-test-'));
  return {
    pasta,
    caminho: (...partes) => path.join(pasta, ...partes),
    apagar: () => fs.rmSync(pasta, { recursive: true, force: true }),
  };
}

/** SQLite novo, com schema e catalogo inicial, numa pasta temporaria. fechar() fecha e apaga. */
export function abrirBancoDeTeste({ executarScripts = true } = {}) {
  const temporaria = criarPastaTemporaria();
  const arquivo = temporaria.caminho('qfome-test.db');
  const db = abrirBanco({ arquivo, executarScripts });
  return {
    db,
    arquivo,
    fechar() {
      db.close();
      temporaria.apagar();
    },
  };
}

/** Quantidade de linhas de uma tabela (ou das que satisfazem o where). */
export function contarLinhas(db, tabela, where = '1 = 1', ...parametros) {
  return db.prepare(`SELECT count(*) AS total FROM ${tabela} WHERE ${where}`).get(...parametros).total;
}
