// Equivalente ao CorsConfig (WebMvcConfigurer) + o processamento de CORS do Spring MVC:
// origem, metodo ou cabecalho nao permitido responde 403 "Invalid CORS request".

const METODOS_PERMITIDOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
// O preflight nao chega ao controller: o Spring responde 200 com o Allow padrao do servlet.
const ALLOW_DO_PREFLIGHT = 'GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH';

/**
 * semCors(caminho): caminhos sem configuracao de CORS (o actuator tem a sua, que aqui fica vazia),
 * onde o preflight e recusado. As rotas desses caminhos sao criadas sem CORS (web/rotas.js).
 *
 * Devolve dois middlewares:
 *  - preflight: responde todo preflight, de qualquer caminho, antes das rotas;
 *  - requisicao: confere uma requisicao normal depois que a rota foi encontrada (o CorsInterceptor
 *    do Spring). Por isso um metodo nao mapeado responde 405 sem passar pelo CORS.
 */
export function criarCors({ allowedOrigins, allowedHeaders, allowCredentials, maxAgeSeconds }, { semCors = () => false } = {}) {
  if (allowCredentials && allowedOrigins.includes('*')) {
    throw new Error('Wildcard CORS origins are not allowed when credentials are enabled.');
  }
  const origensPermitidas = allowedOrigins.map(semBarraNoFinal);

  function preflight(req, res, next) {
    const ehPreflight = req.method === 'OPTIONS'
      && req.headers.origin !== undefined
      && req.headers['access-control-request-method'] !== undefined;
    if (!ehPreflight) return next();
    if (semCors(req.path)) return recusar(res);

    adicionarVary(res);
    if (!mesmaOrigem(req, req.headers.origin)) {
      const cabecalhos = verificar(req, res, req.headers['access-control-request-method'], true);
      if (cabecalhos === null) return recusar(res);

      res.set('Access-Control-Allow-Methods', METODOS_PERMITIDOS.join(','));
      if (cabecalhos.length > 0) res.set('Access-Control-Allow-Headers', cabecalhos.join(', '));
      res.set('Access-Control-Max-Age', String(maxAgeSeconds));
    }
    return res.set('Allow', ALLOW_DO_PREFLIGHT).end();
  }

  function requisicao(req, res, next) {
    adicionarVary(res);
    if (req.headers.origin === undefined || mesmaOrigem(req, req.headers.origin)) return next();
    if (verificar(req, res, req.method, false) === null) return recusar(res);
    return next();
  }

  // Confere origem, metodo e (no preflight) os cabecalhos pedidos. Recusada: null. Aceita: poe
  // Allow-Origin/Allow-Credentials e devolve os cabecalhos pedidos que sao permitidos.
  function verificar(req, res, metodo, ehPreflight) {
    const origemPermitida = verificarOrigem(req.headers.origin);
    if (origemPermitida === null || !METODOS_PERMITIDOS.includes(metodo)) return null;

    const cabecalhos = ehPreflight ? verificarCabecalhos(req.headers['access-control-request-headers']) : [];
    if (cabecalhos === null) return null;

    res.set('Access-Control-Allow-Origin', origemPermitida);
    if (allowCredentials) res.set('Access-Control-Allow-Credentials', 'true');
    return cabecalhos;
  }

  function verificarOrigem(origem) {
    if (origensPermitidas.includes('*')) return '*';
    const origemSemBarra = semBarraNoFinal(origem).toLowerCase();
    return origensPermitidas.some((permitida) => permitida.toLowerCase() === origemSemBarra) ? origem : null;
  }

  // Cabecalhos pedidos que sao permitidos; null se nenhum dos pedidos for permitido.
  function verificarCabecalhos(pedidos) {
    const lista = (pedidos ?? '').split(',').map((c) => c.trim()).filter(Boolean);
    if (lista.length === 0) return [];
    const permitidos = allowedHeaders.includes('*')
      ? lista
      : lista.filter((c) => allowedHeaders.some((permitido) => permitido.toLowerCase() === c.toLowerCase()));
    return permitidos.length > 0 ? permitidos : null;
  }

  return { preflight, requisicao };
}

function adicionarVary(res) {
  res.vary('Origin');
  res.vary('Access-Control-Request-Method');
  res.vary('Access-Control-Request-Headers');
}

function recusar(res) {
  adicionarVary(res);
  res.status(403).end('Invalid CORS request');
}

// Requisicao da propria origem do backend nao e CORS (mesmo esquema, host e porta).
function mesmaOrigem(req, origem) {
  let url;
  try {
    url = new URL(origem);
  } catch {
    return false;
  }
  const portaPadrao = (protocolo) => (protocolo === 'https' ? '443' : '80');
  const protocolo = req.protocol;
  const [host, porta = portaPadrao(protocolo)] = (req.headers.host ?? '').split(':');
  return url.protocol === `${protocolo}:`
    && url.hostname.toLowerCase() === host.toLowerCase()
    && (url.port || portaPadrao(protocolo)) === porta;
}

function semBarraNoFinal(origem) {
  return origem.endsWith('/') ? origem.slice(0, -1) : origem;
}
