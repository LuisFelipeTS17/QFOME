import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { SessaoAdminRepository } from '../../../src/repository/SessaoAdminRepository.js';
import { cadastrarAdmin } from '../../apoio/admin.js';
import { abrirBancoDeTeste, contarLinhas } from '../../apoio/banco.js';

describe('SessaoAdminRepository', () => {
  let banco;
  let repository;
  let admin;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    repository = new SessaoAdminRepository(banco.db);
    admin = cadastrarAdmin(banco.db);
  });

  afterEach(() => banco.fechar());

  const sessao = (tokenHash, expiraEm = '2026-11-24 18:00:00.000') =>
    ({ usuarioId: admin.id, tokenHash, criadoEm: '2026-11-24 10:00:00.000', expiraEm });

  it('grava e le a sessao pelo hash do token', () => {
    const salva = repository.save(sessao('aaa'));

    assert.deepEqual(repository.findByTokenHash('aaa'), { id: salva.id, ...sessao('aaa') });
    assert.equal(repository.findByTokenHash('bbb'), null);
  });

  it('nao aceita o mesmo token duas vezes nem usuario inexistente', () => {
    repository.save(sessao('aaa'));

    assert.throws(() => repository.save(sessao('aaa')), { code: 'SQLITE_CONSTRAINT_UNIQUE' });
    assert.throws(() => repository.save({ ...sessao('bbb'), usuarioId: 999 }), { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' });
  });

  it('apaga a sessao pelo hash do token', () => {
    repository.save(sessao('aaa'));
    repository.save(sessao('bbb'));

    repository.deleteByTokenHash('aaa');

    assert.equal(repository.findByTokenHash('aaa'), null);
    assert.notEqual(repository.findByTokenHash('bbb'), null);
  });

  it('apaga so as sessoes expiradas', () => {
    repository.save(sessao('vencida', '2026-11-24 11:00:00.000'));
    repository.save(sessao('valida', '2026-11-24 13:00:00.000'));

    repository.deleteExpiradas('2026-11-24 12:00:00.000');

    assert.equal(repository.findByTokenHash('vencida'), null);
    assert.notEqual(repository.findByTokenHash('valida'), null);
  });

  it('as sessoes sao apagadas junto com o usuario', () => {
    repository.save(sessao('aaa'));

    banco.db.prepare('DELETE FROM usuario WHERE id = ?').run(admin.id);

    assert.equal(contarLinhas(banco.db, 'sessao_admin'), 0);
  });
});
