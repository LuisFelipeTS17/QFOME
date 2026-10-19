import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { agora, agoraComoLocalDateTime, paraJson } from '../../../src/util/datas.js';

/** Congela o relogio do teste na data local informada (mes comeca em 1). */
function congelarRelogio(t, [ano, mes, dia, hora, minuto, segundo, milissegundo]) {
  const instante = new Date(ano, mes - 1, dia, hora, minuto, segundo, milissegundo);
  t.mock.timers.enable({ apis: ['Date'], now: instante.getTime() });
}

describe('agora', () => {
  it('usa o formato gravado no banco, com milissegundos', (t) => {
    congelarRelogio(t, [2026, 10, 14, 9, 5, 3, 7]);
    assert.equal(agora(), '2026-10-14 09:05:03.007');
  });

  it('mantem os milissegundos mesmo quando sao zero', (t) => {
    congelarRelogio(t, [2026, 1, 2, 0, 0, 0, 0]);
    assert.equal(agora(), '2026-01-02 00:00:00.000');
  });
});

describe('agoraComoLocalDateTime', () => {
  it('usa o formato ISO sem fuso, com milissegundos', (t) => {
    congelarRelogio(t, [2026, 10, 14, 9, 5, 3, 7]);
    assert.equal(agoraComoLocalDateTime(), '2026-10-14T09:05:03.007');
  });

  it('omite a fracao quando os milissegundos sao zero', (t) => {
    congelarRelogio(t, [2026, 10, 14, 9, 5, 3, 0]);
    assert.equal(agoraComoLocalDateTime(), '2026-10-14T09:05:03');
  });

  it('omite os segundos quando segundos e milissegundos sao zero', (t) => {
    congelarRelogio(t, [2026, 10, 14, 9, 5, 0, 0]);
    assert.equal(agoraComoLocalDateTime(), '2026-10-14T09:05');
  });
});

describe('paraJson', () => {
  it('converte a data do banco para o formato ISO sem fuso', () => {
    assert.equal(paraJson('2026-10-14 12:15:08.454'), '2026-10-14T12:15:08.454');
  });

  it('remove zeros a direita da fracao', () => {
    assert.equal(paraJson('2026-10-14 12:15:08.450'), '2026-10-14T12:15:08.45');
  });

  it('omite a fracao quando ela e zero', () => {
    assert.equal(paraJson('2026-10-14 12:15:08.000'), '2026-10-14T12:15:08');
  });

  it('completa os segundos quando a data tem so hora e minuto', () => {
    assert.equal(paraJson('2026-10-14 12:15'), '2026-10-14T12:15:00');
  });

  it('aceita a data que ja vem com T', () => {
    assert.equal(paraJson('2026-10-14T12:15:08.5'), '2026-10-14T12:15:08.5');
  });

  it('devolve null quando nao ha data', () => {
    assert.equal(paraJson(null), null);
    assert.equal(paraJson(undefined), null);
  });

  it('devolve o texto original quando nao reconhece o formato', () => {
    assert.equal(paraJson('ontem'), 'ontem');
  });
});
