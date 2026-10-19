// Erros que o tratadorDeErros (config/tratadorDeErros.js) converte em resposta HTTP,
// no lugar das excecoes que o Spring traduz.

/** Equivalente ao ResponseStatusException: status + motivo, lancado pelos services e controllers. */
export class ResponseStatusError extends Error {
  constructor(status, motivo) {
    super(motivo);
    this.status = status;
    this.motivo = motivo;
  }
}

/** Corpo ilegivel ou parametro com tipo errado (HttpMessageNotReadable / MethodArgumentTypeMismatch). */
export class RequisicaoInvalidaError extends Error {
  constructor() {
    super('Requisicao invalida');
  }
}

/** Falha do @Valid (MethodArgumentNotValidException): campo e restricao violada. */
export class ValidacaoError extends Error {
  constructor(campo, restricao) {
    super(`${campo}: ${restricao.chave}`);
    this.campo = campo;
    this.restricao = restricao;
  }
}

/** Erros que o proprio Spring MVC gera (rota inexistente, metodo nao suportado...), ja com status e detalhe. */
export class ErroMvc extends Error {
  constructor(status, detalhe) {
    super(detalhe);
    this.status = status;
    this.detalhe = detalhe;
  }
}
