import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import Big from 'big.js';

import { Produto } from '../../../src/model/Produto.js';
import { ProdutoRepository } from '../../../src/repository/ProdutoRepository.js';
import { abrirBancoDeTeste, contarLinhas } from '../../apoio/banco.js';
import { CATALOGO } from '../../apoio/dados.js';
import { umaCategoria } from '../../apoio/fabricas.js';

describe('ProdutoRepository', () => {
  let banco;
  let repository;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    repository = new ProdutoRepository(banco.db);
  });

  afterEach(() => banco.fechar());

  describe('consultas', () => {
    it('lista todos os produtos em ordem de id, cada um com os seus adicionais', () => {
      const produtos = repository.findAllByOrderByIdAsc();

      assert.equal(produtos.length, CATALOGO.totalProdutos);
      assert.deepEqual(produtos.map((p) => p.id), [...produtos.map((p) => p.id)].sort((a, b) => a - b));
      assert.equal(produtos.flatMap((p) => p.adicionais).length, CATALOGO.totalAdicionais);
      for (const produto of produtos) {
        assert.ok(produto.adicionais.every((adicional) => adicional.produtoId === produto.id), produto.nome);
      }
    });

    it('filtra pela categoria', () => {
      const produtos = repository.findByCategoriaIdOrderByIdAsc(CATALOGO.caseira.id);

      assert.equal(produtos.length, CATALOGO.caseira.totalProdutos);
      assert.ok(produtos.every((p) => p.categoria.id === CATALOGO.caseira.id && p.categoria.nome === 'Caseira'));
    });

    it('devolve lista vazia para categoria sem produtos', () => {
      assert.deepEqual(repository.findByCategoriaIdOrderByIdAsc(999), []);
    });

    it('busca o produto por id com categoria e adicionais', () => {
      const bowl = repository.findById(CATALOGO.bowlNordestino.id);

      assert.equal(bowl.nome, CATALOGO.bowlNordestino.nome);
      assert.equal(bowl.preco, CATALOGO.bowlNordestino.preco);
      assert.equal(bowl.tempoPreparoMin, CATALOGO.bowlNordestino.tempoPreparoMin);
      assert.equal(bowl.categoria.nome, 'Caseira');
      assert.deepEqual(
        bowl.adicionais.map((a) => [a.id, a.nome, a.preco]),
        Object.values(CATALOGO.bowlNordestino.adicionais).map((a) => [a.id, a.nome, a.preco]),
      );
    });

    it('devolve null quando o produto nao existe', () => {
      assert.equal(repository.findById(999), null);
    });
  });

  describe('save', () => {
    const novoProduto = () => new Produto({
      categoria: umaCategoria({ id: 6 }),
      nome: 'Pudim',
      descricao: 'Pudim de leite',
      preco: new Big('12.50'),
      imagemUrl: 'https://img.qfome.com/pudim.jpg',
      tempoPreparoMin: 5,
    });

    it('insere o produto novo', () => {
      const salvo = repository.save(novoProduto());
      const lido = repository.findById(salvo.id);

      assert.equal(lido.nome, 'Pudim');
      assert.equal(lido.preco, 12.5);
      assert.equal(lido.categoria.nome, 'Sobremesas');
      assert.equal(lido.imagemUrl, 'https://img.qfome.com/pudim.jpg');
      assert.equal(lido.tempoPreparoMin, 5);
      assert.deepEqual(lido.adicionais, []);
    });

    it('atualiza o produto existente', () => {
      const salvo = repository.save(novoProduto());
      salvo.nome = 'Pudim de Leite Ninho';
      salvo.preco = new Big('14.90');
      salvo.categoria = umaCategoria({ id: 1 });

      repository.save(salvo);

      const lido = repository.findById(salvo.id);
      assert.equal(lido.nome, 'Pudim de Leite Ninho');
      assert.equal(lido.preco, 14.9);
      assert.equal(lido.categoria.id, 1);
      assert.equal(contarLinhas(banco.db, 'produto'), CATALOGO.totalProdutos + 1);
    });
  });

  describe('delete', () => {
    it('apaga o produto e os seus adicionais', () => {
      const bowl = repository.findById(CATALOGO.bowlNordestino.id);

      repository.delete(bowl);

      assert.equal(repository.findById(bowl.id), null);
      assert.equal(contarLinhas(banco.db, 'adicional', 'produto_id = ?', bowl.id), 0);
    });

    it('nao apaga produto que esta em algum carrinho', () => {
      banco.db.prepare("INSERT INTO usuario (nome, email, senha) VALUES ('Ana', 'ana@qfome.com', 'x')").run();
      banco.db.prepare('INSERT INTO carrinho (usuario_id) VALUES (1)').run();
      banco.db.prepare('INSERT INTO item_carrinho (carrinho_id, produto_id, quantidade) VALUES (1, ?, 1)').run(CATALOGO.bowlNordestino.id);

      assert.throws(
        () => repository.delete(repository.findById(CATALOGO.bowlNordestino.id)),
        { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' },
      );
    });
  });
});
