import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import Big from 'big.js';

import { ItemPedido } from '../../../src/model/ItemPedido.js';
import { Pedido } from '../../../src/model/Pedido.js';
import { Usuario } from '../../../src/model/Usuario.js';
import { PedidoRepository } from '../../../src/repository/PedidoRepository.js';
import { ProdutoRepository } from '../../../src/repository/ProdutoRepository.js';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository.js';
import { abrirBancoDeTeste, contarLinhas } from '../../apoio/banco.js';
import { CATALOGO } from '../../apoio/dados.js';

describe('PedidoRepository', () => {
  let banco;
  let repository;
  let produtos;
  let usuarios;
  let ana;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    repository = new PedidoRepository(banco.db);
    produtos = new ProdutoRepository(banco.db);
    usuarios = new UsuarioRepository(banco.db);
    ana = usuarios.save(new Usuario({ nome: 'Ana', email: 'ana@qfome.com', senha: '123456' }));
  });

  afterEach(() => banco.fechar());

  /** Pedido de um Bowl Nordestino com farofa (39,90 + 4,00), como o CheckoutService monta. */
  function novoPedido({ codigo = 'QF-123456', usuarioId = ana.id, criadoEm = null } = {}) {
    const bowl = produtos.findById(CATALOGO.bowlNordestino.id);
    const item = new ItemPedido({ produto: bowl, quantidade: 2, precoUnitario: bowl.preco, observacao: 'sem cebola' });
    item.adicionarAdicional(bowl.adicionais.find((a) => a.id === CATALOGO.bowlNordestino.adicionais.farofaDeBacon.id));
    const pedido = new Pedido({
      codigo,
      usuarioId,
      formaPagamento: 'PIX',
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'Sao Paulo',
      criadoEm,
    });
    pedido.adicionarItem(item);
    pedido.subtotal = new Big('87.80');
    pedido.taxaEntrega = new Big(0);
    pedido.total = new Big('87.80');
    return pedido;
  }

  it('grava o pedido com itens e adicionais e le de volta pelo codigo', () => {
    const salvo = repository.save(novoPedido());

    const lido = repository.findByCodigo('QF-123456');

    assert.equal(lido.id, salvo.id);
    assert.equal(lido.status, 'RECEBIDO');
    assert.equal(lido.formaPagamento, 'PIX');
    assert.equal(lido.cep, '01310100');
    assert.equal(lido.subtotal, 87.8);
    assert.equal(lido.total, 87.8);
    assert.equal(lido.criadoEm, salvo.criadoEm);
    assert.equal(lido.itens.length, 1);
    assert.equal(lido.itens[0].produto.nome, CATALOGO.bowlNordestino.nome);
    assert.equal(lido.itens[0].observacao, 'sem cebola');
    assert.equal(lido.itens[0].subtotal.toFixed(2), '87.80');
    assert.equal(contarLinhas(banco.db, 'item_pedido_adicional'), 1);
  });

  it('mantem os precos congelados mesmo depois de o catalogo mudar', () => {
    repository.save(novoPedido());
    banco.db.prepare('UPDATE produto SET preco = 99.90 WHERE id = ?').run(CATALOGO.bowlNordestino.id);
    banco.db.prepare('UPDATE adicional SET preco = 9.99 WHERE id = ?').run(CATALOGO.bowlNordestino.adicionais.farofaDeBacon.id);

    const [item] = repository.findByCodigo('QF-123456').itens;

    assert.equal(item.precoUnitario, CATALOGO.bowlNordestino.preco);
    assert.equal(item.adicionais[0].preco, 4);
    assert.equal(item.adicionais[0].adicional.preco, 9.99);
    assert.equal(item.subtotal.toFixed(2), '87.80');
  });

  it('diz se o codigo ja existe', () => {
    repository.save(novoPedido());

    assert.equal(repository.existsByCodigo('QF-123456'), true);
    assert.equal(repository.existsByCodigo('QF-000000'), false);
  });

  it('devolve null para codigo inexistente', () => {
    assert.equal(repository.findByCodigo('QF-000000'), null);
  });

  it('nao grava dois pedidos com o mesmo codigo', () => {
    repository.save(novoPedido());
    assert.throws(() => repository.save(novoPedido()), { code: 'SQLITE_CONSTRAINT_UNIQUE' });
  });

  describe('historico do cliente', () => {
    it('lista do pedido mais recente para o mais antigo', () => {
      repository.save(novoPedido({ codigo: 'QF-000001', criadoEm: '2026-10-01 12:00:00.000' }));
      repository.save(novoPedido({ codigo: 'QF-000003', criadoEm: '2026-10-03 12:00:00.000' }));
      repository.save(novoPedido({ codigo: 'QF-000002', criadoEm: '2026-10-02 12:00:00.000' }));

      const historico = repository.findByUsuarioIdOrderByCriadoEmDesc(ana.id);

      assert.deepEqual(historico.map((p) => p.codigo), ['QF-000003', 'QF-000002', 'QF-000001']);
    });

    it('traz so os pedidos do cliente', () => {
      const bia = usuarios.save(new Usuario({ nome: 'Bia', email: 'bia@qfome.com', senha: '123456' }));
      repository.save(novoPedido({ codigo: 'QF-000001' }));
      repository.save(novoPedido({ codigo: 'QF-000002', usuarioId: bia.id }));

      assert.deepEqual(repository.findByUsuarioIdOrderByCriadoEmDesc(bia.id).map((p) => p.codigo), ['QF-000002']);
    });

    it('devolve lista vazia para cliente sem pedidos', () => {
      assert.deepEqual(repository.findByUsuarioIdOrderByCriadoEmDesc(ana.id), []);
    });
  });
});
