// Conversao de valores da requisicao nos tipos dos DTOs, com as mesmas regras do Spring:
// o corpo JSON segue o Jackson; path variables e query params seguem o ConversionService.
// Valor que nao converte vira 400 "Requisicao invalida".

import Big from 'big.js';

import { RequisicaoInvalidaError } from './erros.js';

const INTEGER_MIN = -(2 ** 31);
const INTEGER_MAX = 2 ** 31 - 1;

// --- Corpo JSON (Jackson) ---

/** Long: aceita numero (a parte decimal e descartada, 1.7 -> 1) ou texto com digitos; "" vira null. */
export function comoLong(valor) {
  return inteiroDoJson(valor, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}

/** Integer: como o Long, mas com 32 bits. */
export function comoInteger(valor) {
  return inteiroDoJson(valor, INTEGER_MIN, INTEGER_MAX);
}

/** BigDecimal, como valor big.js. */
export function comoDecimal(valor) {
  if (valor == null) return null;
  if (typeof valor === 'number') return new Big(valor);
  if (typeof valor !== 'string') throw new RequisicaoInvalidaError();
  const texto = valor.trim().replace(/^\+/, '');
  if (texto === '') return null;
  try {
    return new Big(texto);
  } catch {
    throw new RequisicaoInvalidaError();
  }
}

/** String: numeros e booleanos viram texto (123 -> "123"); objeto ou lista e erro. */
export function comoString(valor) {
  if (valor == null) return null;
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor);
  throw new RequisicaoInvalidaError();
}

/** Objeto JSON (record/DTO aninhado ou o corpo inteiro). */
export function comoObjeto(valor) {
  if (valor == null) return null;
  if (typeof valor === 'object' && !Array.isArray(valor)) return valor;
  throw new RequisicaoInvalidaError();
}

/** List<T>: exige uma lista JSON e converte cada item. */
export function comoLista(valor, converterItem) {
  if (valor == null) return null;
  if (!Array.isArray(valor)) throw new RequisicaoInvalidaError();
  return valor.map((item) => converterItem(item));
}

function inteiroDoJson(valor, min, max) {
  if (valor == null) return null;
  let numero;
  if (typeof valor === 'number') {
    numero = Math.trunc(valor);
  } else if (typeof valor === 'string') {
    const texto = valor.trim();
    if (texto === '') return null;
    if (!/^[+-]?\d+$/.test(texto)) throw new RequisicaoInvalidaError();
    numero = Number(texto);
  } else {
    throw new RequisicaoInvalidaError();
  }
  return dentroDoIntervalo(numero, min, max);
}

// --- Path variables e query params (ConversionService do Spring) ---

/** Long de @PathVariable/@RequestParam: espacos sao ignorados; aceita sinal e hexadecimal (0x1F, #1F). */
export function parametroLong(texto) {
  return inteiroDeParametro(texto, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}

/** Integer de @PathVariable/@RequestParam. */
export function parametroInteger(texto) {
  return inteiroDeParametro(texto, INTEGER_MIN, INTEGER_MAX);
}

/** Primeiro valor de um query param (?x=1&x=2 -> "1"), ou undefined. */
export function primeiroValor(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

function inteiroDeParametro(texto, min, max) {
  if (texto == null) return null;
  const limpo = String(texto).replace(/\s/g, '');
  if (limpo === '') return null;
  const hexadecimal = /^(-?)(?:0x|0X|#)([0-9a-fA-F]+)$/.exec(limpo);
  if (hexadecimal) {
    const [, sinal, digitos] = hexadecimal;
    return dentroDoIntervalo(Number.parseInt(`${sinal}${digitos}`, 16), min, max);
  }
  if (!/^[+-]?\d+$/.test(limpo)) throw new RequisicaoInvalidaError();
  return dentroDoIntervalo(Number(limpo), min, max);
}

function dentroDoIntervalo(numero, min, max) {
  if (!Number.isSafeInteger(numero) || numero < min || numero > max) throw new RequisicaoInvalidaError();
  return numero;
}
