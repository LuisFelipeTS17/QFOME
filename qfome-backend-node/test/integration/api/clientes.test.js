import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { cadastrarCliente } from '../../apoio/dados.js';

describe('API /clientes', () => {
  let api;
  let cliente;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  beforeEach(async () => {
    cliente = await cadastrarCliente(api, { nome: 'Ana Souza' });
  });

  describe('GET /clientes/{id}', () => {
    it('devolve os dados do cliente, sem a senha', async () => {
      const { status, corpo } = await api.get(`/clientes/${cliente.id}`);

      assert.equal(status, 200);
      assert.deepEqual(corpo, { id: cliente.id, nome: 'Ana Souza', email: cliente.email, perfil: 'CLIENTE' });
    });

    it('responde 404 quando o cliente nao existe', async () => {
      const { status, corpo } = await api.get('/clientes/999999');

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Usuario nao encontrado');
    });
  });

  describe('PUT /clientes/{id}', () => {
    it('atualiza o nome, aparando os espacos', async () => {
      const { status, corpo } = await api.put(`/clientes/${cliente.id}`, { nome: '  Ana Lima  ' });

      assert.equal(status, 200);
      assert.equal(corpo.nome, 'Ana Lima');
      assert.equal((await api.get(`/clientes/${cliente.id}`)).corpo.nome, 'Ana Lima');
    });

    it('nao muda o e-mail nem o perfil', async () => {
      const { corpo } = await api.put(`/clientes/${cliente.id}`, { nome: 'Ana', email: 'outro@qfome.com', perfil: 'ADMIN' });

      assert.equal(corpo.email, cliente.email);
      assert.equal(corpo.perfil, 'CLIENTE');
    });

    it('valida o nome (400)', async () => {
      const emBranco = await api.put(`/clientes/${cliente.id}`, { nome: ' ' });
      assert.equal(emBranco.status, 400);
      assert.equal(emBranco.corpo.erro, 'nome: não deve estar em branco');

      const longo = await api.put(`/clientes/${cliente.id}`, { nome: 'x'.repeat(101) });
      assert.equal(longo.status, 400);
      assert.equal(longo.corpo.erro, 'nome: tamanho deve ser entre 0 e 100');
    });

    it('responde 404 quando o cliente nao existe', async () => {
      assert.equal((await api.put('/clientes/999999', { nome: 'Ana' })).status, 404);
    });
  });

  describe('DELETE /clientes/{id}', () => {
    it('apaga o cliente', async () => {
      assert.equal((await api.delete(`/clientes/${cliente.id}`)).status, 204);
      assert.equal((await api.get(`/clientes/${cliente.id}`)).status, 404);
    });

    it('responde 404 quando o cliente nao existe', async () => {
      assert.equal((await api.delete('/clientes/999999')).status, 404);
    });

    it('nao apaga cliente que ja tem carrinho (409)', async () => {
      await api.get(`/carrinho/${cliente.id}`);

      const { status } = await api.delete(`/clientes/${cliente.id}`);

      assert.equal(status, 409);
      assert.equal((await api.get(`/clientes/${cliente.id}`)).status, 200);
    });
  });
});
