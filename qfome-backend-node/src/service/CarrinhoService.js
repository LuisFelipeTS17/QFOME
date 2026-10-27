import { CarrinhoDTO } from '../dto/CarrinhoDTO.js';
import { Carrinho } from '../model/Carrinho.js';
import { ItemCarrinho } from '../model/ItemCarrinho.js';
import { isBlank, trim } from '../util/texto.js';
import { ResponseStatusError } from '../web/erros.js';

export class CarrinhoService {
  constructor(carrinhoRepository, usuarioRepository, produtoService, transacao) {
    this.carrinhoRepository = carrinhoRepository;
    this.usuarioRepository = usuarioRepository;
    this.produtoService = produtoService;
    this.transacao = transacao;
  }

  buscar(usuarioId) {
    return this.transacao(() => new CarrinhoDTO(this.obterOuCriarCarrinho(usuarioId)));
  }

  adicionarItem(usuarioId, dto) {
    return this.transacao(() => {
      const carrinho = this.obterOuCriarCarrinho(usuarioId);
      const produto = this.produtoService.buscarEntidade(dto.produtoId);
      const adicionais = this.produtoService.adicionaisDoProduto(produto, dto.adicionaisOuVazio());
      const observacao = normalizar(dto.observacao);

      const existente = carrinho.itens.find((item) => item.produto.id === produto.id
        && mesmosIds(item.adicionais, adicionais)
        && item.observacao === observacao);

      if (existente) {
        existente.quantidade += dto.quantidade;
        this.carrinhoRepository.atualizarQuantidade(existente);
      } else {
        const item = new ItemCarrinho({ produto, quantidade: dto.quantidade, observacao, adicionais });
        this.carrinhoRepository.inserirItem(carrinho, item);
        carrinho.itens.push(item);
      }

      return this.salvar(carrinho);
    });
  }

  atualizarItem(usuarioId, itemId, quantidade) {
    return this.transacao(() => {
      const carrinho = this.obterOuCriarCarrinho(usuarioId);
      const item = buscarItem(carrinho, itemId);

      if (quantidade <= 0) {
        carrinho.itens.splice(carrinho.itens.indexOf(item), 1);
        this.carrinhoRepository.removerItem(item);
      } else {
        item.quantidade = quantidade;
        this.carrinhoRepository.atualizarQuantidade(item);
      }

      return this.salvar(carrinho);
    });
  }

  removerItem(usuarioId, itemId) {
    return this.transacao(() => {
      const carrinho = this.obterOuCriarCarrinho(usuarioId);
      const item = buscarItem(carrinho, itemId);
      carrinho.itens.splice(carrinho.itens.indexOf(item), 1);
      this.carrinhoRepository.removerItem(item);
      return this.salvar(carrinho);
    });
  }

  limpar(usuarioId) {
    this.transacao(() => {
      const carrinho = this.carrinhoRepository.findByUsuarioId(usuarioId);
      if (carrinho) {
        carrinho.itens = [];
        this.carrinhoRepository.removerItens(carrinho);
        this.salvar(carrinho);
      }
    });
  }

  salvar(carrinho) {
    carrinho.marcarAtualizado();
    this.carrinhoRepository.atualizarData(carrinho);
    return new CarrinhoDTO(carrinho);
  }

  obterOuCriarCarrinho(usuarioId) {
    const carrinho = this.carrinhoRepository.findByUsuarioId(usuarioId);
    if (carrinho) return carrinho;

    const usuario = this.usuarioRepository.findById(usuarioId);
    if (!usuario) throw new ResponseStatusError(404, 'Usuario nao encontrado');
    return this.carrinhoRepository.save(new Carrinho({ usuarioId: usuario.id }));
  }
}

function buscarItem(carrinho, itemId) {
  const item = carrinho.itens.find((i) => i.id === itemId);
  if (!item) throw new ResponseStatusError(404, 'Item nao encontrado no carrinho');
  return item;
}

// Mesmo conjunto de adicionais, em qualquer ordem.
function mesmosIds(adicionaisA, adicionaisB) {
  const idsA = new Set(adicionaisA.map((a) => a.id));
  const idsB = new Set(adicionaisB.map((a) => a.id));
  return idsA.size === idsB.size && [...idsA].every((id) => idsB.has(id));
}

function normalizar(observacao) {
  return observacao == null || isBlank(observacao) ? null : trim(observacao);
}
