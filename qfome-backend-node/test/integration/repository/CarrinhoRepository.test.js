import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { Carrinho } from '../../../src/model/Carrinho.js';
import { ItemCarrinho } from '../../../src/model/ItemCarrinho.js';
import { Usuario } from '../../../src/model/Usuario.js';
import { CarrinhoRepository } from '../../../src/repository/CarrinhoRepository.js';
import { ProdutoRepository } from '../../../src/repository/ProdutoRepository.js';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository.js';
import { abrirBancoDeTeste, contarLinhas } from '../../apoio/banco.js';
import { CATALOGO } from '../../apoio/dados.js';

describe('CarrinhoRepository', () => {
  let banco;
  let repository;
  let produtos;
  let usuarioId;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    repository = new CarrinhoRepository(banco.db);
    produtos = new ProdutoRepository(banco.db);
    usuarioId = new UsuarioRepository(banco.db)
      .save(new Usuario({ nome: 'Ana', email: 'ana@qfome.com', senha: '123456' })).id;
  });

  afterEach(() => banco.fechar());

  function criarCarrinho() {
    return repository.save(new Carrinho({ usuarioId }));
  }

  /** Item do Bowl Nordestino com os adicionais de ids informados. */
  function itemDoBowl({ quantidade = 1, observacao = null, adicionais = [] } = {}) {
    const bowl = produtos.findById(CATALOGO.bowlNordestino.id);
    return new ItemCarrinho({
      produto: bowl,
      quantidade,
      observacao,
      adicionais: bowl.adicionais.filter((adicional) => adicionais.includes(adicional.id)),
    });
  }

  it('devolve null quando o cliente ainda nao tem carrinho', () => {
    assert.equal(repository.findByUsuarioId(usuarioId), null);
  });

  it('cria o carrinho vazio com a data de atualizacao', () => {
    const carrinho = criarCarrinho();

    const lido = repository.findByUsuarioId(usuarioId);
    assert.equal(lido.id, carrinho.id);
    assert.deepEqual(lido.itens, []);
    assert.equal(lido.atualizadoEm, carrinho.atualizadoEm);
  });

  it('nao cria dois carrinhos para o mesmo cliente', () => {
    criarCarrinho();
    assert.throws(() => criarCarrinho(), { code: 'SQLITE_CONSTRAINT_UNIQUE' });
  });

  it('grava o item com os adicionais e le de volta com produto e precos', () => {
    const carrinho = criarCarrinho();
    const { farofaDeBacon, molhoPicante } = CATALOGO.bowlNordestino.adicionais;

    repository.inserirItem(carrinho, itemDoBowl({ quantidade: 2, observacao: 'sem cebola', adicionais: [molhoPicante.id, farofaDeBacon.id] }));

    const [item] = repository.findByUsuarioId(usuarioId).itens;
    assert.equal(item.produto.nome, CATALOGO.bowlNordestino.nome);
    assert.equal(item.quantidade, 2);
    assert.equal(item.observacao, 'sem cebola');
    assert.deepEqual(item.adicionais.map((a) => a.id), [farofaDeBacon.id, molhoPicante.id]);
    assert.equal(item.subtotal.toFixed(2), '93.80');
  });

  it('le os itens em ordem de criacao', () => {
    const carrinho = criarCarrinho();
    repository.inserirItem(carrinho, itemDoBowl({ observacao: 'primeiro' }));
    repository.inserirItem(carrinho, itemDoBowl({ observacao: 'segundo' }));

    assert.deepEqual(repository.findByUsuarioId(usuarioId).itens.map((i) => i.observacao), ['primeiro', 'segundo']);
  });

  it('atualiza a quantidade do item', () => {
    const carrinho = criarCarrinho();
    const item = itemDoBowl();
    repository.inserirItem(carrinho, item);

    item.quantidade = 5;
    repository.atualizarQuantidade(item);

    assert.equal(repository.findByUsuarioId(usuarioId).itens[0].quantidade, 5);
  });

  it('remove o item junto com os seus adicionais', () => {
    const carrinho = criarCarrinho();
    const item = itemDoBowl({ adicionais: [1, 2] });
    repository.inserirItem(carrinho, item);

    repository.removerItem(item);

    assert.deepEqual(repository.findByUsuarioId(usuarioId).itens, []);
    assert.equal(contarLinhas(banco.db, 'item_carrinho_adicional'), 0);
  });

  it('remove todos os itens do carrinho, mantendo o carrinho', () => {
    const carrinho = criarCarrinho();
    repository.inserirItem(carrinho, itemDoBowl());
    repository.inserirItem(carrinho, itemDoBowl({ observacao: 'outro' }));

    repository.removerItens(carrinho);

    const lido = repository.findByUsuarioId(usuarioId);
    assert.equal(lido.id, carrinho.id);
    assert.deepEqual(lido.itens, []);
  });

  it('atualiza a data do carrinho', () => {
    const carrinho = criarCarrinho();
    carrinho.atualizadoEm = '2030-01-01 08:00:00.000';

    repository.atualizarData(carrinho);

    assert.equal(repository.findByUsuarioId(usuarioId).atualizadoEm, '2030-01-01 08:00:00.000');
  });
});
