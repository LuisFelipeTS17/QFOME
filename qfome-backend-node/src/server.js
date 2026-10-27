import fs from 'node:fs';

import { criarApp } from './app.js';
import { lerConfiguracao } from './config/ambiente.js';
import { abrirBanco } from './config/banco.js';

// Variaveis de ambiente tambem podem vir de um arquivo .env na pasta onde o backend roda.
if (fs.existsSync('.env')) process.loadEnvFile('.env');

const config = lerConfiguracao();
const db = abrirBanco(config.banco);
const app = criarApp({ db, config });

const servidor = app.listen(config.porta, (erro) => {
  if (erro) throw erro;
  console.log(`QFOME backend rodando em http://localhost:${servidor.address().port}`);
});

function encerrar() {
  servidor.close(() => db.close());
  servidor.closeAllConnections();
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
