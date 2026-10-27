import { ResponseStatusError } from '../../src/web/erros.js';

/** Para assert.throws: confere que o erro e um ResponseStatusError com esse status e motivo. */
export function falhaCom(status, motivo) {
  return (erro) => erro instanceof ResponseStatusError && erro.status === status && erro.motivo === motivo;
}
