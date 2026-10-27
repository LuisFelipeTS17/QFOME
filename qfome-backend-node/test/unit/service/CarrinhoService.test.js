import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ItemRequestDTO } from '../../../src/dto/ItemRequestDTO.js';
import { CarrinhoService } from '../../../src/service/CarrinhoService.js';
import { ProdutoService } from '../../../src/service/ProdutoService.js';
import { comoJson, transacaoDireta, umAdicional, umProduto, umUsuario } from '../../apoio/fabricas.js';
import { falhaCom } from '../../apoio/verificacoes.js';

const farofa = umAdicional({ id: 1, produtoId: 1, preco: 4 });
const queijo = umAdicional({ id: 2, produtoId: 1, preco: 5 });
const batata = umAdicional({ id: 4, produtoId: 2, preco: 8 });
const bowl = umProduto({ id: 1, preco: 39.9, adicionais: [farofa, queijo] });
const frango = umProduto({ id: 2, preco: 36.9, adicionais: [batata] });

/**
 * Repositorio de carrinho em memoria. O service altera os objetos do carrinho e chama o
 * repositorio para persistir cada mudanca; os metodos sao mock.fn para conferir essas chamadas.
 */
function repositorioEmMemoria() {
  const carrinhos = new Map();
  let proximoId = 1;
  return {
    carrinhos,
    findByUsuarioId: mock.fn((usuarioId) => carrinhos.get(usuarioId) ?? null),
    save: mock.fn((carrinho) => {
      carrinho.prePersist();
      carrinho.id = proximoId++;
      carrinhos.set(carrinho.usuarioId, carrinho);
      return carrinho;
    }),
    inserirItem: mock.fn((carrinho, item) => {
      item.id = proximoId++;
    }),
    atualizarQuantidade: mock.fn(),
    removerItem: mock.fn(),
    removerItens: mock.fn(),
    atualizarData: mock.fn(),
  };
}

function montarCarrinho({ usuarios = [umUsuario({ id: 1 })] } = {}) {
  const carrinhoRepository = repositorioEmMemoria();
  const usuarioRepository = { findById: (id) => usuarios.find((usuario) => usuario.id === id) ?? null };
  const produtoRepository = { findById: (id) => [bowl, frango].find((produto) => produto.id === id) ?? null };
  const produtoService = new ProdutoService(produtoRepository, null, transacaoDireta);
  const service = new CarrinhoService(carrinhoRepository, usuarioRepository, produtoService, transacaoDireta);
  return { service, carrinhoRepository };
}

const item = (campos) => ItemRequestDTO.deJson({ produtoId: 1, quantidade: 1, ...campos });

describe('CarrinhoService', () => {
  describe('buscar', () => {
    it('cria um carrinho vazio no primeiro acesso', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      const carrinho = comoJson(service.buscar(1));

      assert.equal(carrinhoRepository.save.mock.callCount(), 1);
      assert.equal(carrinho.usuarioId, 1);
      assert.deepEqual(carrinho.itens, []);
      assert.equal(carrinho.subtotal, 0);
    });

    it('reaproveita o carrinho existente', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      const primeiro = service.buscar(1);
      const segundo = service.buscar(1);

      assert.equal(segundo.id, primeiro.id);
      assert.equal(carrinhoRepository.save.mock.callCount(), 1);
    });

    it('responde 404 quando o cliente nao existe', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      assert.throws(() => service.buscar(99), falhaCom(404, 'Usuario nao encontrado'));
      assert.equal(carrinhoRepository.save.mock.callCount(), 0);
    });
  });

  describe('adicionarItem', () => {
    it('adiciona o item com adicionais e calcula os valores', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      const carrinho = comoJson(service.adicionarItem(1, item({ quantidade: 2, adicionais: [1], observacao: 'sem cebola' })));

      assert.equal(carrinhoRepository.inserirItem.mock.callCount(), 1);
      assert.equal(carrinho.itens.length, 1);
      assert.equal(carrinho.itens[0].precoUnitario, 43.9);
      assert.equal(carrinho.itens[0].subtotal, 87.8);
      assert.equal(carrinho.itens[0].observacao, 'sem cebola');
      assert.equal(carrinho.subtotal, 87.8);
    });

    it('soma a quantidade quando o mesmo item ja esta no carrinho', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      service.adicionarItem(1, item({ quantidade: 1, adicionais: [1] }));
      const carrinho = service.adicionarItem(1, item({ quantidade: 2, adicionais: [1] }));

      assert.equal(carrinho.itens.length, 1);
      assert.equal(carrinho.itens[0].quantidade, 3);
      assert.equal(carrinhoRepository.inserirItem.mock.callCount(), 1);
      assert.equal(carrinhoRepository.atualizarQuantidade.mock.callCount(), 1);
    });

    it('considera iguais os mesmos adicionais em outra ordem', () => {
      const { service } = montarCarrinho();

      service.adicionarItem(1, item({ adicionais: [1, 2] }));
      const carrinho = service.adicionarItem(1, item({ adicionais: [2, 1] }));

      assert.equal(carrinho.itens.length, 1);
      assert.equal(carrinho.itens[0].quantidade, 2);
    });

    it('considera iguais observacoes que so diferem nos espacos das pontas', () => {
      const { service } = montarCarrinho();

      service.adicionarItem(1, item({ observacao: 'sem cebola' }));
      const carrinho = service.adicionarItem(1, item({ observacao: '  sem cebola ' }));

      assert.equal(carrinho.itens.length, 1);
    });

    it('trata observacao em branco como sem observacao', () => {
      const { service } = montarCarrinho();

      service.adicionarItem(1, item({ observacao: null }));
      const carrinho = service.adicionarItem(1, item({ observacao: '   ' }));

      assert.equal(carrinho.itens.length, 1);
      assert.equal(carrinho.itens[0].observacao, null);
    });

    it('cria outro item quando os adicionais sao diferentes', () => {
      const { service } = montarCarrinho();

      service.adicionarItem(1, item({ adicionais: [1] }));
      const carrinho = service.adicionarItem(1, item({ adicionais: [1, 2] }));

      assert.equal(carrinho.itens.length, 2);
    });

    it('cria outro item quando a observacao e diferente', () => {
      const { service } = montarCarrinho();

      service.adicionarItem(1, item({ observacao: 'sem cebola' }));
      const carrinho = service.adicionarItem(1, item({ observacao: 'bem passado' }));

      assert.equal(carrinho.itens.length, 2);
    });

    it('responde 400 quando o adicional e de outro produto', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      assert.throws(() => service.adicionarItem(1, item({ adicionais: [4] })), falhaCom(400, 'Adicional 4 nao pertence ao produto 1'));
      assert.equal(carrinhoRepository.inserirItem.mock.callCount(), 0);
    });

    it('responde 404 quando o produto nao existe', () => {
      const { service } = montarCarrinho();
      assert.throws(() => service.adicionarItem(1, item({ produtoId: 99 })), falhaCom(404, 'Produto nao encontrado: 99'));
    });

    it('atualiza a data do carrinho', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      service.adicionarItem(1, item());

      assert.equal(carrinhoRepository.atualizarData.mock.callCount(), 1);
    });
  });

  describe('atualizarItem', () => {
    function carrinhoComUmItem() {
      const montado = montarCarrinho();
      const itemId = montado.service.adicionarItem(1, item({ quantidade: 1 })).itens[0].id;
      return { ...montado, itemId };
    }

    it('altera a quantidade e recalcula o subtotal', () => {
      const { service, carrinhoRepository, itemId } = carrinhoComUmItem();

      const carrinho = comoJson(service.atualizarItem(1, itemId, 3));

      assert.equal(carrinho.itens[0].quantidade, 3);
      assert.equal(carrinho.subtotal, 119.7);
      assert.equal(carrinhoRepository.atualizarQuantidade.mock.calls[0].arguments[0].quantidade, 3);
    });

    for (const quantidade of [0, -1]) {
      it(`remove o item quando a quantidade e ${quantidade}`, () => {
        const { service, carrinhoRepository, itemId } = carrinhoComUmItem();

        const carrinho = service.atualizarItem(1, itemId, quantidade);

        assert.deepEqual(carrinho.itens, []);
        assert.equal(carrinhoRepository.removerItem.mock.callCount(), 1);
      });
    }

    it('responde 404 quando o item nao esta no carrinho', () => {
      const { service } = carrinhoComUmItem();
      assert.throws(() => service.atualizarItem(1, 999, 2), falhaCom(404, 'Item nao encontrado no carrinho'));
    });
  });

  describe('removerItem', () => {
    it('remove so o item indicado', () => {
      const { service, carrinhoRepository } = montarCarrinho();
      service.adicionarItem(1, item({ produtoId: 1 }));
      const [bowlId, frangoId] = service.adicionarItem(1, item({ produtoId: 2 })).itens.map((i) => i.id);

      const carrinho = service.removerItem(1, bowlId);

      assert.deepEqual(carrinho.itens.map((i) => i.id), [frangoId]);
      assert.equal(carrinhoRepository.removerItem.mock.calls[0].arguments[0].id, bowlId);
    });

    it('responde 404 quando o item nao esta no carrinho', () => {
      const { service } = montarCarrinho();
      assert.throws(() => service.removerItem(1, 999), falhaCom(404, 'Item nao encontrado no carrinho'));
    });

    it('nao remove item do carrinho de outro cliente', () => {
      const { service } = montarCarrinho({ usuarios: [umUsuario({ id: 1 }), umUsuario({ id: 2 })] });
      const itemDoCliente1 = service.adicionarItem(1, item()).itens[0].id;

      assert.throws(() => service.removerItem(2, itemDoCliente1), falhaCom(404, 'Item nao encontrado no carrinho'));
      assert.equal(service.buscar(1).itens.length, 1);
    });
  });

  describe('limpar', () => {
    it('remove todos os itens do carrinho', () => {
      const { service, carrinhoRepository } = montarCarrinho();
      service.adicionarItem(1, item({ produtoId: 1 }));
      service.adicionarItem(1, item({ produtoId: 2 }));

      service.limpar(1);

      assert.equal(carrinhoRepository.removerItens.mock.callCount(), 1);
      assert.deepEqual(service.buscar(1).itens, []);
    });

    it('nao cria carrinho quando o cliente ainda nao tem um', () => {
      const { service, carrinhoRepository } = montarCarrinho();

      service.limpar(1);

      assert.equal(carrinhoRepository.save.mock.callCount(), 0);
      assert.equal(carrinhoRepository.removerItens.mock.callCount(), 0);
    });
  });
});
