import express from 'express';

import { ErroMvc } from './erros.js';

/**
 * Router com o casamento de caminhos do Spring MVC: diferencia maiusculas e nao aceita barra no final.
 * Toda rota criada nele passa primeiro pelo CORS da requisicao (registrado no app como 'cors'),
 * exceto com comCors: false.
 */
export function criarRouter({ comCors = true } = {}) {
  const router = express.Router({ caseSensitive: true, strict: true });
  if (comCors) {
    const criarRota = router.route.bind(router);
    router.route = (caminho) => criarRota(caminho).all(corsDaRota);
  }
  return router;
}

/**
 * Ultimo handler de cada rota (route.all): OPTIONS responde com o cabecalho Allow e
 * qualquer outro metodo nao mapeado e 405, como no Spring MVC.
 */
export function metodoNaoSuportado(req, res) {
  if (req.method === 'OPTIONS') {
    res.set({ Allow: metodosDaRota(req.route).join(','), 'Accept-Patch': '' }).end();
    return;
  }
  throw new ErroMvc(405, `Method '${req.method}' is not supported.`);
}

/** Caminho sem rota: o Spring cai no handler de arquivos estaticos (que tem CORS) e responde 404. */
export function rotaNaoEncontrada(req, res, next) {
  req.app.get('cors')(req, res, () => {
    next(new ErroMvc(404, `No static resource ${req.path.replace(/^\/+|\/+$/g, '')}.`));
  });
}

// O 405 do Spring sai antes do CORS: metodo nao mapeado na rota segue direto para metodoNaoSuportado.
function corsDaRota(req, res, next) {
  const metodo = req.method === 'HEAD' ? 'get' : req.method.toLowerCase();
  if (req.method !== 'OPTIONS' && !req.route.methods[metodo]) return next();
  return req.app.get('cors')(req, res, next);
}

function metodosDaRota(rota) {
  const metodos = Object.keys(rota.methods)
    .filter((metodo) => metodo !== '_all')
    .flatMap((metodo) => (metodo === 'get' ? ['GET', 'HEAD'] : [metodo.toUpperCase()]));
  return [...metodos, 'OPTIONS'];
}
