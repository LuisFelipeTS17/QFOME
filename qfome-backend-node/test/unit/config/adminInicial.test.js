import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { garantirAdministrador } from '../../../src/config/adminInicial.js';
import { Perfil } from '../../../src/model/enums/Perfil.js';
import { senhaConfere } from '../../../src/util/senha.js';

const CONFIG = { email: ' Admin@QFOME.com ', senha: 'Senha@Admin1' };

function repositorio({ temAdmin = false, temEmail = false } = {}) {
  return {
    existsByPerfil: mock.fn(() => temAdmin),
    existsByEmail: mock.fn(() => temEmail),
    save: mock.fn((usuario) => usuario),
  };
}

describe('garantirAdministrador', () => {
  it('cria o administrador com a senha em hash quando o banco nao tem nenhum', () => {
    const repository = repositorio();

    const admin = garantirAdministrador(repository, CONFIG);

    assert.equal(repository.save.mock.callCount(), 1);
    assert.equal(admin.email, 'admin@qfome.com');
    assert.equal(admin.perfil, Perfil.ADMIN);
    assert.notEqual(admin.senha, CONFIG.senha);
    assert.equal(senhaConfere(CONFIG.senha, admin.senha), true);
  });

  it('nao cria outro quando ja existe um administrador', () => {
    const repository = repositorio({ temAdmin: true });

    assert.equal(garantirAdministrador(repository, CONFIG), null);
    assert.equal(repository.save.mock.callCount(), 0);
  });

  it('nao promove uma conta de cliente que ja usa o e-mail', (t) => {
    const aviso = t.mock.method(console, 'warn', () => {});
    const repository = repositorio({ temEmail: true });

    assert.equal(garantirAdministrador(repository, CONFIG), null);
    assert.equal(repository.save.mock.callCount(), 0);
    assert.match(aviso.mock.calls[0].arguments[0], /ja e uma conta de cliente/);
  });
});
