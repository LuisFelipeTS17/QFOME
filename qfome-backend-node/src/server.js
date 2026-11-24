import fs from 'node:fs';

import { criarApp } from './app.js';
import { garantirAdministrador } from './config/adminInicial.js';
import { lerConfiguracao, SENHA_ADMIN_PADRAO } from './config/ambiente.js';
import { abrirBanco } from './config/banco.js';
import { UsuarioRepository } from './repository/UsuarioRepository.js';

// Variaveis de ambiente tambem podem vir de um arquivo .env na pasta onde o backend roda.
if (fs.existsSync('.env')) process.loadEnvFile('.env');

const config = lerConfiguracao();
const db = abrirBanco(config.banco);

if (config.banco.executarScripts) {
  const admin = garantirAdministrador(new UsuarioRepository(db), config.admin);
  if (admin) {
    const aviso = config.admin.senha === SENHA_ADMIN_PADRAO ? ' com a senha padrao (defina ADMIN_SENHA para trocar)' : '';
    console.log(`Administrador criado: ${admin.email}${aviso}`);
  }
}

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
