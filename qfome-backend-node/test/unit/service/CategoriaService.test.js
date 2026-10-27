import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { CategoriaRequestDTO } from '../../../src/dto/CategoriaRequestDTO.js';
import { CategoriaService } from '../../../src/service/CategoriaService.js';
import { comoJson, transacaoDireta, umaCategoria } from '../../apoio/fabricas.js';
import { falhaCom } from '../../apoio/verificacoes.js';

function montarCategorias({ nomeJaExiste = false } = {}) {
  const categorias = [umaCategoria({ id: 1, nome: 'Caseira' }), umaCategoria({ id: 2, nome: 'Fit & Fresh' })];
  const categoriaRepository = {
    findAllByOrderByIdAsc: () => categorias,
    findById: (id) => categorias.find((categoria) => categoria.id === id) ?? null,
    existsByNomeIgnoreCase: mock.fn(() => nomeJaExiste),
    save: mock.fn((categoria) => {
      categoria.id ??= 7;
      return categoria;
    }),
    delete: mock.fn(),
  };
  return { service: new CategoriaService(categoriaRepository, transacaoDireta), categoriaRepository };
}

const requisicao = (nome) => CategoriaRequestDTO.deJson({ nome });

describe('CategoriaService', () => {
  it('lista as categorias', () => {
    assert.deepEqual(comoJson(montarCategorias().service.listarTodas()), [
      { id: 1, nome: 'Caseira' },
      { id: 2, nome: 'Fit & Fresh' },
    ]);
  });

  describe('buscarPorId', () => {
    it('devolve a categoria', () => {
      assert.deepEqual(comoJson(montarCategorias().service.buscarPorId(2)), { id: 2, nome: 'Fit & Fresh' });
    });

    it('responde 404 quando a categoria nao existe', () => {
      assert.throws(() => montarCategorias().service.buscarPorId(99), falhaCom(404, 'Categoria nao encontrada'));
    });
  });

  describe('criar', () => {
    it('grava a categoria com o nome aparado', () => {
      const { service, categoriaRepository } = montarCategorias();

      const criada = comoJson(service.criar(requisicao('  Massas  ')));

      assert.deepEqual(criada, { id: 7, nome: 'Massas' });
      assert.deepEqual(categoriaRepository.existsByNomeIgnoreCase.mock.calls[0].arguments, ['Massas']);
    });

    it('responde 409 quando ja existe categoria com o mesmo nome', () => {
      const { service, categoriaRepository } = montarCategorias({ nomeJaExiste: true });

      assert.throws(() => service.criar(requisicao('caseira')), falhaCom(409, 'Ja existe uma categoria com esse nome'));
      assert.equal(categoriaRepository.save.mock.callCount(), 0);
    });
  });

  describe('atualizar', () => {
    it('renomeia a categoria com o nome aparado', () => {
      const { service, categoriaRepository } = montarCategorias();

      const atualizada = comoJson(service.atualizar(1, requisicao(' Comida Caseira ')));

      assert.deepEqual(atualizada, { id: 1, nome: 'Comida Caseira' });
      assert.equal(categoriaRepository.save.mock.callCount(), 1);
    });

    it('responde 404 quando a categoria nao existe', () => {
      const { service, categoriaRepository } = montarCategorias();

      assert.throws(() => service.atualizar(99, requisicao('Massas')), falhaCom(404, 'Categoria nao encontrada'));
      assert.equal(categoriaRepository.save.mock.callCount(), 0);
    });
  });

  describe('deletar', () => {
    it('apaga a categoria existente', () => {
      const { service, categoriaRepository } = montarCategorias();

      service.deletar(2);

      assert.equal(categoriaRepository.delete.mock.calls[0].arguments[0].id, 2);
    });

    it('responde 404 quando a categoria nao existe', () => {
      const { service, categoriaRepository } = montarCategorias();

      assert.throws(() => service.deletar(99), falhaCom(404, 'Categoria nao encontrada'));
      assert.equal(categoriaRepository.delete.mock.callCount(), 0);
    });
  });
});
