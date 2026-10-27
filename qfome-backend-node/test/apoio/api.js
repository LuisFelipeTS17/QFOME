import { once } from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

import { criarApp } from '../../src/app.js';
import { lerConfiguracao } from '../../src/config/ambiente.js';
import { abrirBanco } from '../../src/config/banco.js';

/**
 * Sobe a aplicacao numa porta livre com um SQLite proprio (pasta temporaria, apagada no fim),
 * sem tocar em ./data/qfome.db. env sobrescreve variaveis de ambiente da configuracao.
 *
 * Cada requisicao devolve { status, headers, corpo, texto }: corpo e o JSON ja convertido
 * (ou o texto puro, quando a resposta nao e JSON).
 *
 * db fica exposto para o teste preparar estados que a API nao oferece (ex.: mudar o status
 * de um pedido ou o preco de um adicional).
 */
export async function subirAplicacao({ env = {} } = {}) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'qfome-test-'));
  const config = lerConfiguracao({ DB_PATH: path.join(pasta, 'qfome-test.db'), ...env });
  const db = abrirBanco(config.banco);
  const servidor = criarApp({ db, config }).listen(0);
  await once(servidor, 'listening');
  const base = `http://localhost:${servidor.address().port}`;

  // node:http em vez de fetch: o fetch acrescenta cabecalhos por conta propria (Accept-Language: *,
  // Accept: */*), e os testes precisam controlar exatamente o que o cliente envia.
  function requisitar(metodo, caminho, { corpo, headers = {} } = {}) {
    const cabecalhos = { ...headers };
    let dados;
    if (corpo !== undefined) {
      dados = Buffer.from(typeof corpo === 'string' ? corpo : JSON.stringify(corpo));
      if (!Object.keys(cabecalhos).some((nome) => nome.toLowerCase() === 'content-type')) {
        cabecalhos['Content-Type'] = 'application/json';
      }
      cabecalhos['Content-Length'] = dados.length;
    }

    return new Promise((resolve, reject) => {
      const req = http.request(`${base}${caminho}`, { method: metodo, headers: cabecalhos }, (res) => {
        const partes = [];
        res.on('data', (parte) => partes.push(parte));
        res.on('end', () => resolve(montarResposta(res, Buffer.concat(partes).toString('utf8'))));
        res.on('error', reject);
      });
      req.on('error', reject);
      req.end(dados);
    });
  }

  return {
    base,
    db,
    requisitar,
    get: (caminho, opcoes) => requisitar('GET', caminho, opcoes),
    post: (caminho, corpo, opcoes) => requisitar('POST', caminho, { ...opcoes, corpo }),
    put: (caminho, corpo, opcoes) => requisitar('PUT', caminho, { ...opcoes, corpo }),
    patch: (caminho, opcoes) => requisitar('PATCH', caminho, opcoes),
    delete: (caminho, opcoes) => requisitar('DELETE', caminho, opcoes),
    options: (caminho, opcoes) => requisitar('OPTIONS', caminho, opcoes),
    async encerrar() {
      servidor.closeAllConnections();
      await new Promise((resolve) => servidor.close(resolve));
      db.close();
      fs.rmSync(pasta, { recursive: true, force: true });
    },
  };
}

function montarResposta(res, texto) {
  const headers = new Headers();
  for (const [nome, valor] of Object.entries(res.headers)) {
    headers.set(nome, Array.isArray(valor) ? valor.join(', ') : valor);
  }

  let corpo = texto;
  if (texto !== '' && /json/.test(headers.get('content-type') ?? '')) {
    try {
      corpo = JSON.parse(texto);
    } catch {
      // JSON declarado mas nao valido: fica o texto puro.
    }
  }
  return { status: res.statusCode, headers, corpo, texto };
}
