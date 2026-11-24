import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Formato gravado: "scrypt$<sal>$<hash>", com sal e hash em base64url.
const PREFIXO = 'scrypt';
const TAMANHO_SAL = 16;
const TAMANHO_HASH = 32;

/** Hash da senha com sal aleatorio: a mesma senha gera um texto diferente a cada chamada. */
export function gerarHashDaSenha(senha) {
  const sal = randomBytes(TAMANHO_SAL);
  const hash = scryptSync(senha, sal, TAMANHO_HASH);
  return [PREFIXO, sal.toString('base64url'), hash.toString('base64url')].join('$');
}

/**
 * Confere a senha digitada com a gravada. Contas de cliente ainda guardam a senha em texto puro;
 * nesse caso, a comparacao e direta.
 */
export function senhaConfere(digitada, gravada) {
  const hash = lerHash(gravada);
  if (!hash) return digitada === gravada;
  return timingSafeEqual(scryptSync(digitada, hash.sal, TAMANHO_HASH), hash.valor);
}

function lerHash(gravada) {
  const partes = gravada.split('$');
  if (partes.length !== 3 || partes[0] !== PREFIXO) return null;
  const sal = Buffer.from(partes[1], 'base64url');
  const valor = Buffer.from(partes[2], 'base64url');
  return sal.length === TAMANHO_SAL && valor.length === TAMANHO_HASH ? { sal, valor } : null;
}
