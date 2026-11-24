/** Token do cabecalho "Authorization: Bearer <token>", ou null. */
export function tokenDaRequisicao(req) {
  return /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? '')?.[1] ?? null;
}

/**
 * Middleware das rotas administrativas: sem um token valido, responde 401.
 * Deixa o administrador em req.admin ({ usuario, expiraEm }).
 */
export function criarExigirAdmin(adminService) {
  return function exigirAdmin(req, res, next) {
    try {
      req.admin = adminService.autenticar(tokenDaRequisicao(req));
    } catch (erro) {
      res.set('WWW-Authenticate', 'Bearer');
      throw erro;
    }
    next();
  };
}
