import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { cadastrarCliente, emailUnico } from '../../apoio/dados.js';

describe('API /auth', () => {
  let api;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  describe('POST /auth/register', () => {
    it('cria a conta como CLIENTE', async () => {
      const email = emailUnico();

      const { status, corpo } = await api.post('/auth/register', { name: 'Ana Souza', email, password: '123456' });

      assert.equal(status, 200);
      assert.equal(typeof corpo.id, 'number');
      assert.deepEqual(corpo, { id: corpo.id, name: 'Ana Souza', email, perfil: 'CLIENTE', message: 'Conta criada com sucesso' });
    });

    it('grava o e-mail em minusculas e sem espacos, e o nome aparado', async () => {
      const email = emailUnico();

      const { corpo } = await api.post('/auth/register', { name: '  Ana  ', email: `  ${email.toUpperCase()} `, password: '123456' });

      assert.equal(corpo.email, email);
      assert.equal(corpo.name, 'Ana');
    });

    it('ignora o perfil enviado pelo cliente', async () => {
      const { corpo } = await api.post('/auth/register', { name: 'Ana', email: emailUnico(), password: '123456', perfil: 'ADMIN' });
      assert.equal(corpo.perfil, 'CLIENTE');
    });

    it('recusa e-mail ja cadastrado, mesmo com outras maiusculas (409)', async () => {
      const { email } = await cadastrarCliente(api);

      const resposta = await api.post('/auth/register', { name: 'Outra', email: email.toUpperCase(), password: 'abc' });

      assert.equal(resposta.status, 409);
      assert.equal(resposta.corpo, 'E-mail ja cadastrado');
    });

    const incompletos = [
      ['sem nome', { email: 'a@qfome.com', password: '123' }],
      ['com nome em branco', { name: '  ', email: 'a@qfome.com', password: '123' }],
      ['sem e-mail', { name: 'Ana', password: '123' }],
      ['sem senha', { name: 'Ana', email: 'a@qfome.com' }],
      ['com senha em branco', { name: 'Ana', email: 'a@qfome.com', password: ' ' }],
    ];
    for (const [caso, corpo] of incompletos) {
      it(`recusa cadastro ${caso} (400)`, async () => {
        const resposta = await api.post('/auth/register', corpo);

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo, 'Nome, e-mail e senha sao obrigatorios');
      });
    }

    it('responde as falhas em texto puro', async () => {
      const { headers } = await api.post('/auth/register', {});
      assert.match(headers.get('content-type'), /^text\/plain/);
    });

    for (const email of ['nao-e-email', 'ana@', '@qfome.com', 'ana souza@qfome.com', 'ana@qfome.']) {
      it(`recusa e-mail em formato invalido: ${JSON.stringify(email)} (400)`, async () => {
        const resposta = await api.post('/auth/register', { name: 'Ana', email, password: '123456' });

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo, 'E-mail invalido');
      });
    }

    const longos = [
      ['nome', { name: 'x'.repeat(101) }, 'Nome deve ter no maximo 100 caracteres'],
      ['e-mail', { email: `${'a'.repeat(60)}@${'b'.repeat(50)}.${'c'.repeat(40)}.com` }, 'E-mail deve ter no maximo 150 caracteres'],
      ['senha', { password: 'x'.repeat(256) }, 'Senha deve ter no maximo 255 caracteres'],
    ];
    for (const [campo, campos, mensagem] of longos) {
      it(`recusa ${campo} acima do tamanho maximo (400)`, async () => {
        const resposta = await api.post('/auth/register', { name: 'Ana', email: emailUnico(), password: '123456', ...campos });

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo, mensagem);
      });
    }

    it('aceita campos no tamanho maximo', async () => {
      const email = `${'a'.repeat(50)}@${'b'.repeat(50)}.${'c'.repeat(44)}.com`; // 150 caracteres

      const resposta = await api.post('/auth/register', { name: 'x'.repeat(100), email, password: 'x'.repeat(255) });

      assert.equal(resposta.status, 200);
      assert.equal(resposta.corpo.email.length, 150);
    });

    it('nao grava nada quando o cadastro e recusado', async () => {
      const email = `${'a'.repeat(60)}@${'b'.repeat(50)}.${'c'.repeat(40)}.com`;
      await api.post('/auth/register', { name: 'Ana', email, password: '123456' });

      const login = await api.post('/auth/login', { email, password: '123456' });

      assert.equal(login.status, 401);
    });
  });

  describe('POST /auth/login', () => {
    let cliente;

    before(async () => {
      cliente = await cadastrarCliente(api, { nome: 'Bia', senha: 'Segredo1' });
    });

    it('entra com e-mail e senha corretos', async () => {
      const { status, corpo } = await api.post('/auth/login', { email: cliente.email, password: 'Segredo1' });

      assert.equal(status, 200);
      assert.deepEqual(corpo, {
        id: cliente.id,
        name: 'Bia',
        email: cliente.email,
        perfil: 'CLIENTE',
        message: 'Login realizado com sucesso',
      });
    });

    it('aceita o e-mail com outras maiusculas e espacos', async () => {
      const { status, corpo } = await api.post('/auth/login', { email: ` ${cliente.email.toUpperCase()} `, password: 'Segredo1' });

      assert.equal(status, 200);
      assert.equal(corpo.id, cliente.id);
    });

    const invalidos = [
      ['senha errada', () => ({ email: cliente.email, password: 'errada' })],
      ['senha com maiusculas diferentes', () => ({ email: cliente.email, password: 'segredo1' })],
      ['e-mail nao cadastrado', () => ({ email: emailUnico(), password: 'Segredo1' })],
    ];
    for (const [caso, corpo] of invalidos) {
      it(`recusa ${caso} (401)`, async () => {
        const resposta = await api.post('/auth/login', corpo());

        assert.equal(resposta.status, 401);
        assert.equal(resposta.corpo, 'Usuario ou senha invalidos');
      });
    }

    it('exige e-mail e senha (400)', async () => {
      for (const corpo of [{ password: 'x' }, { email: 'a@qfome.com' }, { email: ' ', password: 'x' }]) {
        const resposta = await api.post('/auth/login', corpo);
        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo, 'E-mail e senha sao obrigatorios');
      }
    });
  });
});
