import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { ADMIN, entrarComoAdmin } from '../../apoio/admin.js';
import { contarLinhas } from '../../apoio/banco.js';
import { cadastrarCliente, CATALOGO, fecharPedido } from '../../apoio/dados.js';

describe('API /admin', () => {
  let api;
  let admin;
  let pastaDados;

  before(async () => {
    pastaDados = fs.mkdtempSync(path.join(os.tmpdir(), 'qfome-admin-'));
    api = await subirAplicacao({ env: { DATA_DIR: pastaDados } });
    admin = await entrarComoAdmin(api);
  });

  after(async () => {
    await api.encerrar();
    fs.rmSync(pastaDados, { recursive: true, force: true });
  });

  const entrar = (email = ADMIN.email, password = ADMIN.senha) => api.post('/admin/login', { email, password });
  const comToken = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

  describe('POST /admin/login', () => {
    it('devolve o token, a validade e o administrador', async () => {
      const { status, corpo, headers } = await entrar(` ${ADMIN.email.toUpperCase()} `);

      assert.equal(status, 200);
      assert.match(corpo.token, /^[\w-]{43}$/);
      assert.match(corpo.expiraEm, /^\d{4}-\d{2}-\d{2}T/);
      assert.deepEqual(corpo.usuario, { id: corpo.usuario.id, nome: ADMIN.nome, email: ADMIN.email, perfil: 'ADMIN' });
      assert.equal(headers.get('cache-control'), 'no-store');
    });

    it('grava a sessao no banco, sem o token', async () => {
      const antes = contarLinhas(api.db, 'sessao_admin');

      const { corpo } = await entrar();

      assert.equal(contarLinhas(api.db, 'sessao_admin'), antes + 1);
      assert.equal(contarLinhas(api.db, 'sessao_admin', 'token_hash = ?', corpo.token), 0);
    });

    it('recusa senha errada e e-mail desconhecido (401)', async () => {
      for (const resposta of [await entrar(ADMIN.email, 'errada'), await entrar('ninguem@qfome.com')]) {
        assert.equal(resposta.status, 401);
        assert.equal(resposta.corpo.erro, 'E-mail ou senha invalidos');
      }
    });

    it('recusa conta de cliente (403)', async () => {
      const cliente = await cadastrarCliente(api);

      const { status, corpo } = await entrar(cliente.email, cliente.senha);

      assert.equal(status, 403);
      assert.equal(corpo.erro, 'Acesso restrito a administradores');
    });

    it('valida os campos (400)', async () => {
      assert.equal((await entrar('', ADMIN.senha)).corpo.erro, 'email: não deve estar em branco');
      assert.equal((await entrar(ADMIN.email, ' ')).corpo.erro, 'password: não deve estar em branco');
      assert.equal((await api.post('/admin/login', {})).status, 400);
    });
  });

  describe('GET /admin/sessao', () => {
    it('devolve o administrador do token', async () => {
      const { status, corpo } = await admin.get('/admin/sessao');

      assert.equal(status, 200);
      assert.equal(corpo.usuario.email, ADMIN.email);
      assert.equal(corpo.usuario.senha, undefined);
    });

    it('responde 401 sem token ou com token invalido', async () => {
      const semToken = await api.get('/admin/sessao');
      assert.equal(semToken.status, 401);
      assert.equal(semToken.corpo.erro, 'Login administrativo necessario');
      assert.equal(semToken.headers.get('www-authenticate'), 'Bearer');

      assert.equal((await api.get('/admin/sessao', comToken('inventado'))).status, 401);
    });

    it('responde 401 depois que a sessao expira', async () => {
      const { token } = (await entrar()).corpo;
      api.db.prepare("UPDATE sessao_admin SET expira_em = '2020-01-01 00:00:00.000' WHERE id = (SELECT max(id) FROM sessao_admin)").run();

      const { status, corpo } = await api.get('/admin/sessao', comToken(token));

      assert.equal(status, 401);
      assert.equal(corpo.erro, 'Sessao expirada. Entre novamente.');
    });
  });

  describe('POST /admin/logout', () => {
    it('invalida o token (204)', async () => {
      const { token } = (await entrar()).corpo;

      assert.equal((await api.post('/admin/logout', undefined, comToken(token))).status, 204);
      assert.equal((await api.get('/admin/sessao', comToken(token))).status, 401);
    });

    it('responde 204 mesmo sem token', async () => {
      assert.equal((await api.post('/admin/logout')).status, 204);
    });
  });

  describe('rotas de escrita do cardapio', () => {
    const PRATO = { categoriaId: 1, nome: 'Prato protegido', preco: 10 };
    const rotas = [
      ['POST /produtos', (cliente) => cliente.post('/produtos', PRATO)],
      ['PUT /produtos/{id}', (cliente) => cliente.put('/produtos/1', PRATO)],
      ['DELETE /produtos/{id}', (cliente) => cliente.delete('/produtos/1')],
      ['POST /categorias', (cliente) => cliente.post('/categorias', { nome: 'Protegida' })],
      ['PUT /categorias/{id}', (cliente) => cliente.put('/categorias/1', { nome: 'Protegida' })],
      ['DELETE /categorias/{id}', (cliente) => cliente.delete('/categorias/1')],
    ];
    for (const [rota, chamar] of rotas) {
      it(`${rota} exige o login administrativo (401)`, async () => {
        const antes = [contarLinhas(api.db, 'produto'), contarLinhas(api.db, 'categoria')];

        const { status, corpo } = await chamar(api);

        assert.equal(status, 401);
        assert.equal(corpo.erro, 'Login administrativo necessario');
        assert.deepEqual([contarLinhas(api.db, 'produto'), contarLinhas(api.db, 'categoria')], antes);
        assert.equal((await api.get('/produtos/1')).corpo.nome, CATALOGO.bowlNordestino.nome);
      });
    }

    it('as consultas continuam publicas', async () => {
      assert.equal((await api.get('/produtos')).status, 200);
      assert.equal((await api.get('/categorias')).status, 200);
    });

    it('a resposta 401 leva os cabecalhos de CORS, para o navegador mostrar o erro', async () => {
      const { status, headers } = await api.post('/produtos', PRATO, { headers: { Origin: 'http://localhost:8081' } });

      assert.equal(status, 401);
      assert.equal(headers.get('access-control-allow-origin'), 'http://localhost:8081');
    });
  });

  describe('exportacao dos pedidos em JSON', () => {
    it('exige o login administrativo (401)', async () => {
      assert.equal((await api.post('/admin/relatorios/pedidos/exportar', {})).status, 401);
      assert.equal((await api.get('/admin/exportacoes')).status, 401);
    });

    it('grava o arquivo e registra no banco quem exportou', async () => {
      const cliente = await cadastrarCliente(api);
      const pedido = await fecharPedido(api, cliente.id, [{ produtoId: CATALOGO.mousseDeMaracuja.id, quantidade: 1 }]);

      const { status, corpo } = await admin.post('/admin/relatorios/pedidos/exportar', {});

      assert.equal(status, 201);
      assert.equal(corpo.arquivo, path.resolve(pastaDados, 'exports', 'pedidos.json'));
      assert.ok(corpo.pedidos.some((p) => p.codigo === pedido.codigo));
      const gravado = JSON.parse(fs.readFileSync(corpo.arquivo, 'utf8'));
      assert.equal(gravado.totalPedidos, corpo.totalPedidos);
      assert.equal(gravado.exportacaoId, undefined);

      const registro = api.db.prepare('SELECT * FROM exportacao WHERE id = ?').get(corpo.exportacaoId);
      assert.equal(registro.usuario_id, admin.usuario.id);
      assert.equal(registro.origem, 'ADMIN');
      assert.equal(registro.total_pedidos, corpo.totalPedidos);
      assert.equal(registro.faturamento_total, corpo.faturamentoTotal);
    });

    it('registra tambem a exportacao feita pela area do cliente, sem usuario', async () => {
      const { corpo } = await api.post('/relatorios/pedidos/exportar', {});

      const registro = api.db.prepare('SELECT * FROM exportacao WHERE id = ?').get(corpo.exportacaoId);
      assert.equal(registro.usuario_id, null);
      assert.equal(registro.origem, 'CLIENTE');
    });

    it('lista o historico, da mais recente para a mais antiga', async () => {
      const { corpo: nova } = await admin.post('/admin/relatorios/pedidos/exportar', {});

      const { status, corpo } = await admin.get('/admin/exportacoes');

      assert.equal(status, 200);
      assert.equal(corpo[0].id, nova.exportacaoId);
      assert.equal(corpo[0].usuarioNome, ADMIN.nome);
      assert.equal(corpo[0].origem, 'ADMIN');
      assert.match(corpo[0].criadoEm, /^\d{4}-\d{2}-\d{2}T/);
      assert.deepEqual(corpo.map((e) => e.id), corpo.map((e) => e.id).toSorted((a, b) => b - a));
    });
  });

  describe('conta do administrador', () => {
    it('nao pode ser alterada nem apagada pelas rotas de cliente (403)', async () => {
      const { id } = admin.usuario;

      assert.equal((await api.put(`/clientes/${id}`, { nome: 'Invasor' })).status, 403);
      assert.equal((await api.delete(`/clientes/${id}`)).status, 403);
      assert.equal((await api.get(`/clientes/${id}`)).corpo.nome, ADMIN.nome);
    });

    it('tambem entra pelo login comum, com o perfil ADMIN', async () => {
      const { status, corpo } = await api.post('/auth/login', { email: ADMIN.email, password: ADMIN.senha });

      assert.equal(status, 200);
      assert.equal(corpo.perfil, 'ADMIN');
      assert.equal(corpo.token, undefined);
    });

    it('o login comum nao aceita o hash gravado como senha (401)', async () => {
      const { senha } = api.db.prepare('SELECT senha FROM usuario WHERE id = ?').get(admin.usuario.id);

      assert.equal((await api.post('/auth/login', { email: ADMIN.email, password: senha })).status, 401);
    });
  });

  it('recusa metodo nao suportado (405)', async () => {
    assert.equal((await api.get('/admin/login')).status, 405);
    assert.equal((await api.delete('/admin/sessao')).status, 405);
    assert.equal((await api.get('/admin/relatorios/pedidos/exportar')).status, 405);
  });
});
