import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { Categoria } from '../../../src/model/Categoria.js';
import { CategoriaRepository } from '../../../src/repository/CategoriaRepository.js';
import { abrirBancoDeTeste } from '../../apoio/banco.js';

describe('CategoriaRepository', () => {
  let banco;
  let repository;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    repository = new CategoriaRepository(banco.db);
  });

  afterEach(() => banco.fechar());

  it('lista as categorias do catalogo em ordem de id', () => {
    assert.deepEqual(
      repository.findAllByOrderByIdAsc().map((categoria) => categoria.nome),
      ['Caseira', 'Fit & Fresh', 'Grelhados', 'Peixes', 'Sopas', 'Sobremesas'],
    );
  });

  it('busca por id e devolve null quando nao encontra', () => {
    assert.equal(repository.findById(6).nome, 'Sobremesas');
    assert.equal(repository.findById(999), null);
  });

  it('procura o nome sem diferenciar maiusculas', () => {
    assert.equal(repository.existsByNomeIgnoreCase('CASEIRA'), true);
    assert.equal(repository.existsByNomeIgnoreCase('fit & fresh'), true);
    assert.equal(repository.existsByNomeIgnoreCase('Massas'), false);
  });

  it('insere uma categoria nova e atualiza uma existente', () => {
    const massas = repository.save(new Categoria({ nome: 'Massas' }));
    assert.equal(repository.findById(massas.id).nome, 'Massas');

    massas.nome = 'Massas Frescas';
    repository.save(massas);

    assert.equal(repository.findById(massas.id).nome, 'Massas Frescas');
  });

  it('apaga a categoria', () => {
    const massas = repository.save(new Categoria({ nome: 'Massas' }));

    repository.delete(massas);

    assert.equal(repository.findById(massas.id), null);
  });

  it('nao apaga categoria que tem produtos', () => {
    assert.throws(() => repository.delete(repository.findById(1)), { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' });
  });
});
