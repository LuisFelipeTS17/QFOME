import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { CATALOGO, criarCategoria, criarProduto, unico } from '../../apoio/dados.js';

describe('API /categorias', () => {
  let api;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  describe('GET', () => {
    it('lista as categorias do catalogo em ordem de id', async () => {
      const { status, corpo } = await api.get('/categorias');

      assert.equal(status, 200);
      assert.deepEqual(corpo.slice(0, CATALOGO.totalCategorias), [
        { id: 1, nome: 'Caseira' },
        { id: 2, nome: 'Fit & Fresh' },
        { id: 3, nome: 'Grelhados' },
        { id: 4, nome: 'Peixes' },
        { id: 5, nome: 'Sopas' },
        { id: 6, nome: 'Sobremesas' },
      ]);
    });

    it('busca a categoria por id', async () => {
      const { status, corpo } = await api.get('/categorias/6');

      assert.equal(status, 200);
      assert.deepEqual(corpo, { id: 6, nome: 'Sobremesas' });
    });

    it('responde 404 quando a categoria nao existe', async () => {
      const { status, corpo } = await api.get('/categorias/999999');

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Categoria nao encontrada');
    });
  });

  describe('POST', () => {
    it('cria a categoria (201) com o nome aparado', async () => {
      const nome = unico('Massas');

      const { status, corpo } = await api.post('/categorias', { nome: `  ${nome}  ` });

      assert.equal(status, 201);
      assert.deepEqual(corpo, { id: corpo.id, nome });
      assert.deepEqual((await api.get(`/categorias/${corpo.id}`)).corpo, { id: corpo.id, nome });
    });

    it('recusa nome repetido, sem diferenciar maiusculas (409)', async () => {
      const { status, corpo } = await api.post('/categorias', { nome: 'CASEIRA' });

      assert.equal(status, 409);
      assert.equal(corpo.erro, 'Ja existe uma categoria com esse nome');
    });

    it('valida o nome (400)', async () => {
      const casos = [
        [{}, 'nome: não deve estar em branco'],
        [{ nome: '   ' }, 'nome: não deve estar em branco'],
        [{ nome: 'x'.repeat(61) }, 'nome: tamanho deve ser entre 0 e 60'],
      ];
      for (const [corpoEnviado, erro] of casos) {
        const { status, corpo } = await api.post('/categorias', corpoEnviado);
        assert.equal(status, 400);
        assert.equal(corpo.erro, erro);
      }
    });
  });

  describe('PUT', () => {
    it('renomeia a categoria', async () => {
      const categoria = await criarCategoria(api);
      const novoNome = unico('Lanches');

      const { status, corpo } = await api.put(`/categorias/${categoria.id}`, { nome: novoNome });

      assert.equal(status, 200);
      assert.deepEqual(corpo, { id: categoria.id, nome: novoNome });
    });

    it('recusa o nome de outra categoria (409)', async () => {
      const categoria = await criarCategoria(api);

      const { status } = await api.put(`/categorias/${categoria.id}`, { nome: 'Caseira' });

      assert.equal(status, 409);
    });

    it('responde 404 quando a categoria nao existe', async () => {
      assert.equal((await api.put('/categorias/999999', { nome: unico('X') })).status, 404);
    });
  });

  describe('DELETE', () => {
    it('apaga a categoria sem produtos (204)', async () => {
      const categoria = await criarCategoria(api);

      const { status, texto } = await api.delete(`/categorias/${categoria.id}`);

      assert.equal(status, 204);
      assert.equal(texto, '');
      assert.equal((await api.get(`/categorias/${categoria.id}`)).status, 404);
    });

    it('nao apaga categoria que tem produtos (409)', async () => {
      const produto = await criarProduto(api);

      const { status, corpo } = await api.delete(`/categorias/${produto.categoriaId}`);

      assert.equal(status, 409);
      assert.equal(corpo.erro, 'Operacao viola uma restricao do banco (registro em uso ou duplicado)');
    });

    it('responde 404 quando a categoria nao existe', async () => {
      assert.equal((await api.delete('/categorias/999999')).status, 404);
    });
  });
});
