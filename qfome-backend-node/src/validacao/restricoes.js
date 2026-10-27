// Restricoes do Jakarta Bean Validation usadas no projeto (@NotNull, @NotBlank, @Size...).
// Cada uma tem a chave da mensagem padrao (validacao/mensagensPadrao.js) e os argumentos dela.

import { domainToASCII } from 'node:url';

import { ValidacaoError } from '../web/erros.js';
import { trim } from '../util/texto.js';

const restricao = (chave, valido, args = {}) => ({ chave, valido, args });

export const NotNull = restricao('NotNull', (valor) => valor != null);

// O @NotBlank do Hibernate usa o trim() do Java.
export const NotBlank = restricao('NotBlank', (valor) => valor != null && trim(valor).length > 0);

export const NotEmpty = restricao('NotEmpty', (valor) => valor != null && valor.length > 0);

/** @Size(max = n) */
export const Size = (max) => restricao('Size', (valor) => valor == null || valor.length <= max, { min: 0, max });

/** @Min(n) */
export const Min = (min) => restricao('Min', (valor) => valor == null || valor >= min, { value: min });

/** @DecimalMin(value = "x", inclusive = false), para valores big.js. */
export const DecimalMinExclusivo = (min) =>
  restricao('DecimalMin', (valor) => valor == null || valor.gt(min), { value: min });

/** @Pattern(regexp, message): mensagem propria, nao traduzida. */
export const Pattern = (regex, mensagem) => ({ ...restricao('Pattern', (valor) => valor == null || regex.test(valor)), mensagem });

/** @Email do Hibernate Validator (so usado na entidade Usuario). */
export const Email = restricao('Email', (valor) => valor == null || valor.length === 0 || emailValido(valor));

/** Primeira restricao violada, na ordem declarada. campos: [nomeDoCampo, valor, ...restricoes]. */
export function primeiraViolacao(campos) {
  for (const [campo, valor, ...restricoes] of campos) {
    const violada = restricoes.find((r) => !r.valido(valor));
    if (violada) return { campo, restricao: violada };
  }
  return null;
}

/** Como o @Valid do Spring MVC: a primeira violacao vira 400 "campo: mensagem". */
export function validar(campos) {
  const violacao = primeiraViolacao(campos);
  if (violacao) throw new ValidacaoError(violacao.campo, violacao.restricao);
}

// --- @Email (AbstractEmailValidator e DomainNameUtil do Hibernate Validator) ---

const ATOMO = "[a-z0-9!#$%&'*+/=?^_`{|}~\u0080-\uFFFF-]";
const ATOMO_ENTRE_ASPAS = "(?:[a-z0-9!#$%&'*.(),<>\\[\\]:;  @+/=?^_`{|}~\u0080-\uFFFF-]|\\\\\\\\|\\\\\")";
const PARTE_LOCAL = new RegExp(
  `^(?:${ATOMO}+|"${ATOMO_ENTRE_ASPAS}+")(?:\\.(?:${ATOMO}+|"${ATOMO_ENTRE_ASPAS}+"))*$`, 'i');
// Mesmo conjunto aceito pelo DOMAIN do Hibernate (rotulos com hifens so no meio), escrito sem
// quantificadores aninhados para nao travar com textos longos.
const CARACTERE_DOMINIO = "[a-z\u0080-\uFFFF0-9!#$%&'*+/=?^_`{|}~]";
const ROTULO = `${CARACTERE_DOMINIO}(?:-*${CARACTERE_DOMINIO})*`;
const DOMINIO = new RegExp(`^(?:${ROTULO}(?:\\.${ROTULO})*|\\[[0-9]{1,3}(?:\\.[0-9]{1,3}){3}\\])$`, 'i');

function emailValido(email) {
  const arroba = email.lastIndexOf('@');
  if (arroba < 0) return false;
  const local = email.slice(0, arroba);
  const dominio = email.slice(arroba + 1);
  if (local.length > 64 || !PARTE_LOCAL.test(local)) return false;
  if (dominio.endsWith('.') || !DOMINIO.test(dominio)) return false;
  const ascii = dominio.startsWith('[') ? dominio : domainToASCII(dominio);
  return ascii !== '' && ascii.length <= 255;
}
