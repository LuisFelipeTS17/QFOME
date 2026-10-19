import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { subirAplicacao } from '../../apoio/api.js';
import { cadastrarCliente, CATALOGO, criarCategoria, criarProduto, fecharPedido, unico } from '../../apoio/dados.js';

describe('API /produtos', () => {
  let api;

  before(async () => {
    api = await subirAplicacao();
  });

  after(() => api.encerrar());

  describe('GET /produtos', () => {
    it('lista os produtos do catalogo em ordem de id, com categoria e adicionais', async () => {
      const { status, corpo } = await api.get('/produtos');

      // Outros testes deste arquivo criam produtos; os do catalogo inicial sao os primeiros ids.
      const doCatalogo = corpo.filter((p) => p.id <= CATALOGO.totalProdutos);

      assert.equal(status, 200);
      assert.equal(doCatalogo.length, CATALOGO.totalProdutos);
      assert.deepEqual(corpo.map((p) => p.id), corpo.map((p) => p.id).toSorted((a, b) => a - b));
      assert.equal(doCatalogo.flatMap((p) => p.adicionais).length, CATALOGO.totalAdicionais);
      assert.ok(corpo.every((p) => typeof p.categoriaNome === 'string'));
    });

    it('filtra pela categoria', async () => {
      const { status, corpo } = await api.get(`/produtos?categoria=${CATALOGO.caseira.id}`);

      assert.equal(status, 200);
      assert.equal(corpo.length, CATALOGO.caseira.totalProdutos);
      assert.ok(corpo.every((p) => p.categoriaId === CATALOGO.caseira.id));
      assert.equal(corpo[0].nome, CATALOGO.bowlNordestino.nome);
    });

    it('devolve lista vazia para categoria sem produtos ou inexistente', async () => {
      const vazia = await criarCategoria(api);

      assert.deepEqual((await api.get(`/produtos?categoria=${vazia.id}`)).corpo, []);
      assert.deepEqual((await api.get('/produtos?categoria=999999')).corpo, []);
    });

    it('recusa filtro de categoria que nao e numero (400)', async () => {
      const { status, corpo } = await api.get('/produtos?categoria=caseira');

      assert.equal(status, 400);
      assert.equal(corpo.erro, 'Requisicao invalida');
    });
  });

  describe('GET /produtos/{id}', () => {
    it('devolve o produto com categoria e adicionais', async () => {
      const { status, corpo } = await api.get(`/produtos/${CATALOGO.bowlNordestino.id}`);
      const { farofaDeBacon, queijoGratinado, molhoPicante } = CATALOGO.bowlNordestino.adicionais;

      assert.equal(status, 200);
      assert.equal(corpo.nome, CATALOGO.bowlNordestino.nome);
      assert.equal(corpo.categoriaId, CATALOGO.caseira.id);
      assert.equal(corpo.categoriaNome, CATALOGO.caseira.nome);
      assert.equal(corpo.preco, CATALOGO.bowlNordestino.preco);
      assert.equal(corpo.tempoPreparoMin, CATALOGO.bowlNordestino.tempoPreparoMin);
      assert.match(corpo.imagemUrl, /^https:\/\//);
      assert.deepEqual(corpo.adicionais, [farofaDeBacon, queijoGratinado, molhoPicante]);
    });

    it('escreve os precos com duas casas decimais', async () => {
      const { texto } = await api.get(`/produtos/${CATALOGO.bowlNordestino.id}`);

      assert.match(texto, /"preco":39\.90/);
      assert.match(texto, /"preco":4\.00/);
    });

    it('responde 404 quando o produto nao existe', async () => {
      const { status, corpo } = await api.get('/produtos/999999');

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Produto nao encontrado: 999999');
    });
  });

  describe('POST /produtos', () => {
    it('cria o produto (201)', async () => {
      const categoria = await criarCategoria(api);
      const nome = unico('Pudim');

      const { status, corpo } = await api.post('/produtos', {
        categoriaId: categoria.id,
        nome: `  ${nome} `,
        descricao: 'Pudim de leite',
        preco: '12.5',
        imagemUrl: 'https://img.qfome.com/pudim.jpg',
        tempoPreparoMin: 5,
      });

      assert.equal(status, 201);
      assert.deepEqual(corpo, {
        id: corpo.id,
        categoriaId: categoria.id,
        categoriaNome: categoria.nome,
        nome,
        descricao: 'Pudim de leite',
        preco: 12.5,
        imagemUrl: 'https://img.qfome.com/pudim.jpg',
        tempoPreparoMin: 5,
        adicionais: [],
      });
      assert.equal((await api.get(`/produtos/${corpo.id}`)).status, 200);
    });

    it('aceita produto so com os campos obrigatorios', async () => {
      const categoria = await criarCategoria(api);

      const { status, corpo } = await api.post('/produtos', { categoriaId: categoria.id, nome: unico('Simples'), preco: 9.9 });

      assert.equal(status, 201);
      assert.equal(corpo.descricao, null);
      assert.equal(corpo.tempoPreparoMin, null);
    });

    const invalidos = [
      ['sem categoria', { categoriaId: null }, 'categoriaId: não deve ser nulo'],
      ['sem nome', { nome: '' }, 'nome: não deve estar em branco'],
      ['com nome longo', { nome: 'x'.repeat(101) }, 'nome: tamanho deve ser entre 0 e 100'],
      ['com descricao longa', { descricao: 'x'.repeat(501) }, 'descricao: tamanho deve ser entre 0 e 500'],
      ['sem preco', { preco: null }, 'preco: não deve ser nulo'],
      ['com preco zero', { preco: 0 }, 'preco: deve ser maior que 0.0'],
      ['com preco negativo', { preco: -5 }, 'preco: deve ser maior que 0.0'],
      ['com tempo de preparo zero', { tempoPreparoMin: 0 }, 'tempoPreparoMin: deve ser maior que ou igual à 1'],
      ['com preco que nao e numero', { preco: 'caro' }, 'Requisicao invalida'],
    ];
    for (const [caso, campos, erro] of invalidos) {
      it(`recusa produto ${caso} (400)`, async () => {
        const resposta = await api.post('/produtos', { categoriaId: 1, nome: 'Produto', preco: 10, ...campos });

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo.erro, erro);
      });
    }

    it('responde 404 quando a categoria nao existe', async () => {
      const { status, corpo } = await api.post('/produtos', { categoriaId: 999999, nome: 'Produto', preco: 10 });

      assert.equal(status, 404);
      assert.equal(corpo.erro, 'Categoria nao encontrada');
    });
  });

  describe('PUT /produtos/{id}', () => {
    it('substitui os dados do produto', async () => {
      const produto = await criarProduto(api);
      const outraCategoria = await criarCategoria(api);

      const { status, corpo } = await api.put(`/produtos/${produto.id}`, {
        categoriaId: outraCategoria.id,
        nome: 'Nome novo',
        descricao: null,
        preco: 31.5,
        imagemUrl: null,
        tempoPreparoMin: 40,
      });

      assert.equal(status, 200);
      assert.equal(corpo.id, produto.id);
      assert.equal(corpo.categoriaNome, outraCategoria.nome);
      assert.equal(corpo.nome, 'Nome novo');
      assert.equal(corpo.descricao, null);
      assert.equal(corpo.preco, 31.5);
      assert.equal(corpo.tempoPreparoMin, 40);
    });

    it('valida os dados (400)', async () => {
      const produto = await criarProduto(api);
      const { status } = await api.put(`/produtos/${produto.id}`, { categoriaId: 1, nome: 'X', preco: 0 });
      assert.equal(status, 400);
    });

    it('responde 404 quando o produto nao existe', async () => {
      const { status } = await api.put('/produtos/999999', { categoriaId: 1, nome: 'X', preco: 10 });
      assert.equal(status, 404);
    });
  });

  describe('DELETE /produtos/{id}', () => {
    it('apaga o produto (204)', async () => {
      const produto = await criarProduto(api);

      assert.equal((await api.delete(`/produtos/${produto.id}`)).status, 204);
      assert.equal((await api.get(`/produtos/${produto.id}`)).status, 404);
    });

    it('nao apaga produto que ja esta em um pedido (409)', async () => {
      const produto = await criarProduto(api);
      const cliente = await cadastrarCliente(api);
      await fecharPedido(api, cliente.id, [{ produtoId: produto.id, quantidade: 1 }]);

      const { status } = await api.delete(`/produtos/${produto.id}`);

      assert.equal(status, 409);
      assert.equal((await api.get(`/produtos/${produto.id}`)).status, 200);
    });

    it('responde 404 quando o produto nao existe', async () => {
      assert.equal((await api.delete('/produtos/999999')).status, 404);
    });
  });
});
