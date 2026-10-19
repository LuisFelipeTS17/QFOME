import { ProdutoDTO } from '../dto/ProdutoDTO.js';
import { Produto } from '../model/Produto.js';
import { trim } from '../util/texto.js';
import { ResponseStatusError } from '../web/erros.js';

export class ProdutoService {
  constructor(produtoRepository, categoriaService, transacao) {
    this.produtoRepository = produtoRepository;
    this.categoriaService = categoriaService;
    this.transacao = transacao;
  }

  listar(categoriaId) {
    const produtos = categoriaId == null
      ? this.produtoRepository.findAllByOrderByIdAsc()
      : this.produtoRepository.findByCategoriaIdOrderByIdAsc(categoriaId);
    return produtos.map((produto) => new ProdutoDTO(produto));
  }

  buscarPorId(id) {
    return new ProdutoDTO(this.buscarEntidade(id));
  }

  criar(dto) {
    return this.transacao(() => {
      const produto = new Produto();
      this.preencher(produto, dto);
      return new ProdutoDTO(this.produtoRepository.save(produto));
    });
  }

  atualizar(id, dto) {
    return this.transacao(() => {
      const produto = this.buscarEntidade(id);
      this.preencher(produto, dto);
      return new ProdutoDTO(this.produtoRepository.save(produto));
    });
  }

  deletar(id) {
    this.transacao(() => this.produtoRepository.delete(this.buscarEntidade(id)));
  }

  buscarEntidade(id) {
    const produto = this.produtoRepository.findById(id);
    if (!produto) throw new ResponseStatusError(404, `Produto nao encontrado: ${id}`);
    return produto;
  }

  /** Converte ids em adicionais, garantindo que todos pertencem ao produto. */
  adicionaisDoProduto(produto, ids) {
    const disponiveis = new Map(produto.adicionais.map((adicional) => [adicional.id, adicional]));

    return [...new Set(ids)].map((id) => {
      const adicional = disponiveis.get(id);
      if (!adicional) {
        throw new ResponseStatusError(400, `Adicional ${id} nao pertence ao produto ${produto.id}`);
      }
      return adicional;
    });
  }

  preencher(produto, dto) {
    produto.categoria = this.categoriaService.buscarEntidade(dto.categoriaId);
    produto.nome = trim(dto.nome);
    produto.descricao = dto.descricao;
    produto.preco = dto.preco;
    produto.imagemUrl = dto.imagemUrl;
    produto.tempoPreparoMin = dto.tempoPreparoMin;
  }
}
