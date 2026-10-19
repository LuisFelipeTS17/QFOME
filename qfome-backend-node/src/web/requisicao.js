import { validar } from '../validacao/restricoes.js';
import { primeiroValor } from './conversao.js';
import { ErroMvc, RequisicaoInvalidaError } from './erros.js';

/**
 * @Valid @RequestBody: le o corpo JSON, converte no DTO (como o Jackson) e valida.
 * O DTO informa a conversao (static deJson) e as restricoes (restricoes()).
 */
export function corpoValidado(req, Dto) {
  const dto = Dto.deJson(lerCorpoJson(req));
  validar(dto.restricoes());
  return dto;
}

/**
 * @RequestBody: exige Content-Type JSON (senao 415) e um JSON que nao seja vazio nem null
 * (senao 400), na mesma ordem de verificacao do Spring MVC. O corpo chega cru (express.raw em app.js).
 */
export function lerCorpoJson(req) {
  const bruto = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  const contentType = req.headers['content-type'];

  if (contentType === undefined) {
    if (bruto.length === 0) throw new RequisicaoInvalidaError();
    throw new ErroMvc(415, "Content-Type 'application/octet-stream' is not supported.");
  }

  const [tipo, ...parametros] = contentType.split(';').map((parte) => parte.trim()).filter(Boolean);
  const essencia = (tipo ?? '').toLowerCase();
  if (essencia !== 'application/json' && !/^application\/[^/]+\+json$/.test(essencia)) {
    // O Spring descreve o Content-Type ja com o charset da requisicao (UTF-8 se nao vier nenhum).
    const charset = parametros.some((p) => /^charset=/i.test(p)) ? [] : ['charset=UTF-8'];
    throw new ErroMvc(415, `Content-Type '${[essencia, ...parametros, ...charset].join(';')}' is not supported.`);
  }

  const texto = decodificar(bruto, parametros).replace(/^\uFEFF/, '');
  if (texto.trim() === '') throw new RequisicaoInvalidaError();
  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    throw new RequisicaoInvalidaError();
  }
  if (corpo === null) throw new RequisicaoInvalidaError();
  return corpo;
}

/**
 * @RequestParam obrigatorio: ausente ou vazio responde 400 "Required parameter 'x' is not present.".
 * converter recebe o texto (path/query) e devolve o valor no tipo do parametro.
 */
export function parametroObrigatorio(req, nome, converter) {
  const valor = converter(primeiroValor(req.query[nome]));
  if (valor == null) throw new ErroMvc(400, `Required parameter '${nome}' is not present.`);
  return valor;
}

function decodificar(bruto, parametros) {
  const charset = parametros.find((p) => /^charset=/i.test(p))?.slice('charset='.length).replace(/"/g, '');
  try {
    return new TextDecoder(charset || 'utf-8').decode(bruto);
  } catch {
    return new TextDecoder('utf-8').decode(bruto);
  }
}
