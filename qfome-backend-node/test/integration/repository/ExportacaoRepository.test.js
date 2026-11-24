import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { ExportacaoRepository } from '../../../src/repository/ExportacaoRepository.js';
import { ADMIN, cadastrarAdmin } from '../../apoio/admin.js';
import { abrirBancoDeTeste } from '../../apoio/banco.js';

describe('ExportacaoRepository', () => {
  let banco;
  let repository;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    repository = new ExportacaoRepository(banco.db);
  });

  afterEach(() => banco.fechar());

  const exportacao = (campos = {}) =>
    ({ usuarioId: null, origem: 'CLIENTE', totalPedidos: 2, faturamentoTotal: 95.8, arquivo: '/data/exports/pedidos.json', ...campos });

  it('grava a exportacao com a data', () => {
    const admin = cadastrarAdmin(banco.db);

    const salva = repository.save(exportacao({ usuarioId: admin.id, origem: 'ADMIN' }));

    assert.equal(typeof salva.id, 'number');
    assert.match(salva.criadoEm, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
    assert.deepEqual(repository.findRecentes(10), [{ ...salva, usuarioNome: ADMIN.nome }]);
  });

  it('lista as mais recentes primeiro, ate o limite', () => {
    const ids = [1, 2, 3].map((totalPedidos) => repository.save(exportacao({ totalPedidos })).id);

    assert.deepEqual(repository.findRecentes(2).map((e) => e.id), [ids[2], ids[1]]);
  });

  it('mantem o historico quando o usuario e apagado', () => {
    const admin = cadastrarAdmin(banco.db);
    repository.save(exportacao({ usuarioId: admin.id, origem: 'ADMIN' }));

    banco.db.prepare('DELETE FROM usuario WHERE id = ?').run(admin.id);

    const [lida] = repository.findRecentes(10);
    assert.equal(lida.usuarioId, null);
    assert.equal(lida.usuarioNome, null);
    assert.equal(lida.origem, 'ADMIN');
  });

  it('recusa origem desconhecida (CHECK)', () => {
    assert.throws(() => repository.save(exportacao({ origem: 'OUTRA' })), { code: 'SQLITE_CONSTRAINT_CHECK' });
  });
});
