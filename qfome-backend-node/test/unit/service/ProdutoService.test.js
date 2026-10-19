import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ProdutoRequestDTO } from '../../../src/dto/ProdutoRequestDTO.js';
import { CategoriaService } from '../../../src/service/CategoriaService.js';
import { ProdutoService } from '../../../src/service/ProdutoService.js';
import { comoJson, transacaoDireta, umAdicional, umaCategoria, umProduto } from '../../apoio/fabricas.js';
import { falhaCom } from '../../apoio/verificacoes.js';

/** ProdutoService sobre repositorios em memoria; cada chamada cria um catalogo novo. */
function montarProdutos() {
  const caseira = umaCategoria({ id: 1, nome: 'Caseira' });
  const sobremesas = umaCategoria({ id: 6, nome: 'Sobremesas' });
  const produtos = [
    umProduto({ id: 1, nome: 'Bowl Nordestino', categoria: caseira, adicionais: [umAdicional({ id: 1 }), umAdicional({ id: 2 })] }),
    umProduto({ id: 27, nome: 'Mousse de Maracuja', categoria: sobremesas, preco: 16.9 }),
  ];
  const produtoRepository = {
    findAllByOrderByIdAsc: mock.fn(() => produtos),
    findByCategoriaIdOrderByIdAsc: mock.fn((id) => produtos.filter((produto) => produto.categoria.id === id)),
    findById: mock.fn((id) => produtos.find((produto) => produto.id === id) ?? null),
    save: mock.fn((produto) => {
      produto.id ??= 50;
      return produto;
    }),
    delete: mock.fn(),
  };
  const categoriaRepository = { findById: (id) => [caseira, sobremesas].find((categoria) => categoria.id === id) ?? null };
  const categoriaService = new CategoriaService(categoriaRepository, transacaoDireta);
  return { service: new ProdutoService(produtoRepository, categoriaService, transacaoDireta), produtoRepository };
}

const requisicao = (campos = {}) => ProdutoRequestDTO.deJson({
  categoriaId: 6,
  nome: 'Pudim',
  descricao: 'Pudim de leite',
  preco: '12.50',
  imagemUrl: 'https://img.qfome.com/pudim.jpg',
  tempoPreparoMin: 5,
  ...campos,
});

describe('ProdutoService', () => {
  describe('listar', () => {
    it('lista todos os produtos quando nao ha filtro', () => {
      const { service, produtoRepository } = montarProdutos();

      const produtos = service.listar(null);

      assert.deepEqual(produtos.map((p) => p.nome), ['Bowl Nordestino', 'Mousse de Maracuja']);
      assert.equal(produtoRepository.findAllByOrderByIdAsc.mock.callCount(), 1);
    });

    it('filtra pela categoria', () => {
      const { service, produtoRepository } = montarProdutos();

      const produtos = service.listar(6);

      assert.deepEqual(produtos.map((p) => p.nome), ['Mousse de Maracuja']);
      assert.deepEqual(produtoRepository.findByCategoriaIdOrderByIdAsc.mock.calls[0].arguments, [6]);
    });
  });

  describe('buscarPorId', () => {
    it('devolve o produto com categoria e adicionais', () => {
      const produto = comoJson(montarProdutos().service.buscarPorId(1));

      assert.equal(produto.categoriaNome, 'Caseira');
      assert.deepEqual(produto.adicionais.map((a) => a.id), [1, 2]);
    });

    it('responde 404 quando o produto nao existe', () => {
      assert.throws(() => montarProdutos().service.buscarPorId(7), falhaCom(404, 'Produto nao encontrado: 7'));
    });
  });

  describe('criar', () => {
    it('grava o produto na categoria informada, com o nome aparado', () => {
      const { service, produtoRepository } = montarProdutos();

      const criado = comoJson(service.criar(requisicao({ nome: '  Pudim  ' })));

      assert.equal(produtoRepository.save.mock.callCount(), 1);
      assert.deepEqual(criado, {
        id: 50,
        categoriaId: 6,
        categoriaNome: 'Sobremesas',
        nome: 'Pudim',
        descricao: 'Pudim de leite',
        preco: 12.5,
        imagemUrl: 'https://img.qfome.com/pudim.jpg',
        tempoPreparoMin: 5,
        adicionais: [],
      });
    });

    it('responde 404 quando a categoria nao existe', () => {
      const { service, produtoRepository } = montarProdutos();

      assert.throws(() => service.criar(requisicao({ categoriaId: 99 })), falhaCom(404, 'Categoria nao encontrada'));
      assert.equal(produtoRepository.save.mock.callCount(), 0);
    });
  });

  describe('atualizar', () => {
    it('substitui os dados do produto existente', () => {
      const { service, produtoRepository } = montarProdutos();

      const atualizado = comoJson(service.atualizar(27, requisicao({ nome: 'Mousse de Limao', preco: 18, categoriaId: 1 })));

      assert.equal(atualizado.id, 27);
      assert.equal(atualizado.nome, 'Mousse de Limao');
      assert.equal(atualizado.preco, 18);
      assert.equal(atualizado.categoriaNome, 'Caseira');
      assert.equal(produtoRepository.save.mock.calls[0].arguments[0].id, 27);
    });

    it('mantem os adicionais do produto', () => {
      const atualizado = comoJson(montarProdutos().service.atualizar(1, requisicao({ categoriaId: 1 })));
      assert.deepEqual(atualizado.adicionais.map((a) => a.id), [1, 2]);
    });

    it('responde 404 quando o produto nao existe', () => {
      const { service, produtoRepository } = montarProdutos();

      assert.throws(() => service.atualizar(99, requisicao()), falhaCom(404, 'Produto nao encontrado: 99'));
      assert.equal(produtoRepository.save.mock.callCount(), 0);
    });
  });

  describe('deletar', () => {
    it('apaga o produto existente', () => {
      const { service, produtoRepository } = montarProdutos();

      service.deletar(27);

      assert.equal(produtoRepository.delete.mock.calls[0].arguments[0].id, 27);
    });

    it('responde 404 quando o produto nao existe', () => {
      const { service, produtoRepository } = montarProdutos();

      assert.throws(() => service.deletar(99), falhaCom(404, 'Produto nao encontrado: 99'));
      assert.equal(produtoRepository.delete.mock.callCount(), 0);
    });
  });

  describe('adicionaisDoProduto', () => {
    const produto = umProduto({
      id: 1,
      adicionais: [umAdicional({ id: 1 }), umAdicional({ id: 2 }), umAdicional({ id: 3 })],
    });

    it('converte os ids nos adicionais do produto, na ordem pedida', () => {
      const adicionais = montarProdutos().service.adicionaisDoProduto(produto, [3, 1]);
      assert.deepEqual(adicionais.map((a) => a.id), [3, 1]);
    });

    it('ignora ids repetidos', () => {
      const adicionais = montarProdutos().service.adicionaisDoProduto(produto, [2, 2, 2]);
      assert.deepEqual(adicionais.map((a) => a.id), [2]);
    });

    it('devolve lista vazia quando nenhum adicional foi escolhido', () => {
      assert.deepEqual(montarProdutos().service.adicionaisDoProduto(produto, []), []);
    });

    it('responde 400 quando o adicional nao e do produto', () => {
      assert.throws(
        () => montarProdutos().service.adicionaisDoProduto(produto, [1, 4]),
        falhaCom(400, 'Adicional 4 nao pertence ao produto 1'),
      );
    });
  });
});
