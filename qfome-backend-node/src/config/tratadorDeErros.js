import Database from 'better-sqlite3';

import { agoraComoLocalDateTime } from '../util/datas.js';
import { mensagemDe } from '../validacao/mensagens.js';
import { ErroMvc, RequisicaoInvalidaError, ResponseStatusError, ValidacaoError } from '../web/erros.js';

/** Equivalente ao GlobalExceptionHandler: toda falha vira { timestamp, status, erro }. */
export function tratadorDeErros(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ResponseStatusError) {
    return erro(res, err.status, err.motivo);
  }
  if (err instanceof ValidacaoError) {
    return erro(res, 400, `${err.campo}: ${mensagemDe(err.restricao, req.headers['accept-language'])}`);
  }
  // FK ou UNIQUE do banco (ex.: apagar produto que ja esta em pedido).
  if (err instanceof Database.SqliteError && err.code.startsWith('SQLITE_CONSTRAINT')) {
    return erro(res, 409, 'Operacao viola uma restricao do banco (registro em uso ou duplicado)');
  }
  // Corpo ilegivel, tipo errado, ou falha ao ler o corpo (body-parser).
  if (err instanceof RequisicaoInvalidaError || (typeof err.type === 'string' && err.status >= 400 && err.status < 500)) {
    return erro(res, 400, 'Requisicao invalida');
  }
  // Erros do proprio Spring MVC (rota inexistente, metodo nao suportado...) ja trazem o status certo.
  if (err instanceof ErroMvc) {
    return erro(res, err.status, err.detalhe);
  }
  console.error(err);
  return erro(res, 500, 'Erro interno no servidor');
}

function erro(res, status, mensagem) {
  return res.status(status).json({
    timestamp: agoraComoLocalDateTime(),
    status,
    erro: mensagem ?? 'Erro',
  });
}
