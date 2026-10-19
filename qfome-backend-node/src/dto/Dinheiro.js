import Big from 'big.js';

/**
 * O SQLite devolve NUMERIC como REAL (39.9); as respostas saem sempre com 2 casas (39.90).
 * Valores monetarios sao somados com big.js (como o BigDecimal) e JSON.rawJSON mantem
 * as 2 casas no JSON, como o Jackson escreve um BigDecimal.
 */
export function arredondar(valor) {
  return valor == null ? null : JSON.rawJSON(new Big(valor).round(2, Big.roundHalfUp).toFixed(2));
}
