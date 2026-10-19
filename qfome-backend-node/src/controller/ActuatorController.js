import fs from 'node:fs';
import path from 'node:path';

import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

// Equivalente ao Spring Boot Actuator com os endpoints expostos no application.yml: health e info.

const TIPO_ACTUATOR = 'application/vnd.spring-boot.actuator.v3+json';
// Espaco livre minimo do diskSpace (10 MB, padrao do Spring Boot).
const LIMITE_DISCO = 10 * 1024 * 1024;

/** Endpoints do actuator: o CORS da aplicacao nao vale para eles (o preflight e recusado). */
export function ehEndpointDoActuator(caminho) {
  return ['/actuator', '/actuator/health', '/actuator/info'].includes(caminho) || caminho.startsWith('/actuator/health/');
}

export function criarActuatorController(db, { mostrarDetalhes }) {
  const router = criarRouter({ comCors: false });

  router.route('/actuator')
    .get((req, res) => {
      const base = `${req.protocol}://${req.get('host')}/actuator`;
      responder(req, res, 200, {
        _links: {
          self: { href: base, templated: false },
          health: { href: `${base}/health`, templated: false },
          'health-path': { href: `${base}/health/{*path}`, templated: true },
          info: { href: `${base}/info`, templated: false },
        },
      });
    })
    .all(metodoNaoSuportado);

  router.route('/actuator/health')
    .get((req, res) => {
      const componentes = verificarComponentes();
      const status = statusGeral(Object.values(componentes));
      responder(req, res, status === 'UP' ? 200 : 503, mostrarDetalhes ? { status, components: componentes } : { status });
    })
    .all(metodoNaoSuportado);

  // Um componente (db, diskSpace, ping): so existe quando os detalhes estao visiveis.
  router.route('/actuator/health/*caminho')
    .get((req, res) => {
      const componente = mostrarDetalhes ? verificarComponentes()[req.params.caminho.join('/')] : undefined;
      if (!componente) return res.status(404).end();
      return responder(req, res, componente.status === 'UP' ? 200 : 503, componente);
    })
    .all(metodoNaoSuportado);

  router.route('/actuator/info')
    .get((req, res) => {
      responder(req, res, 200, {});
    })
    .all(metodoNaoSuportado);

  return router;

  function verificarComponentes() {
    return {
      db: verificarBanco(),
      diskSpace: verificarDisco(),
      ping: { status: 'UP' },
      // Sem certificados SSL configurados, o componente ssl do Spring Boot fica sempre UP e vazio.
      ssl: { status: 'UP', details: { validChains: [], invalidChains: [] } },
    };
  }

  function verificarBanco() {
    const detalhes = { database: 'SQLite', validationQuery: 'isValid()' };
    try {
      db.prepare('SELECT 1').get();
      return { status: 'UP', details: detalhes };
    } catch (erro) {
      return { status: 'DOWN', details: { ...detalhes, error: `${erro.name}: ${erro.message}` } };
    }
  }
}

function verificarDisco() {
  const pasta = path.resolve('.');
  const { bsize, blocks, bavail } = fs.statfsSync(pasta);
  const livre = bavail * bsize;
  return {
    status: livre >= LIMITE_DISCO ? 'UP' : 'DOWN',
    details: { total: blocks * bsize, free: livre, threshold: LIMITE_DISCO, path: `${pasta}${path.sep}.`, exists: true },
  };
}

function statusGeral(componentes) {
  return componentes.every((componente) => componente.status === 'UP') ? 'UP' : 'DOWN';
}

// O actuator responde no seu proprio tipo, ou em application/json se o cliente pedir.
function responder(req, res, status, corpo) {
  const tipo = req.accepts([TIPO_ACTUATOR, 'application/json']) || TIPO_ACTUATOR;
  return res.status(status).type(tipo).send(JSON.stringify(corpo));
}
