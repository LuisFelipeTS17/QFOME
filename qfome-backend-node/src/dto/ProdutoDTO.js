import { AdicionalDTO } from './AdicionalDTO.js';
import * as Dinheiro from './Dinheiro.js';

export class ProdutoDTO {
  constructor(produto) {
    this.id = produto.id;
    this.categoriaId = produto.categoria.id;
    this.categoriaNome = produto.categoria.nome;
    this.nome = produto.nome;
    this.descricao = produto.descricao;
    this.preco = Dinheiro.arredondar(produto.preco);
    this.imagemUrl = produto.imagemUrl;
    this.tempoPreparoMin = produto.tempoPreparoMin;
    this.adicionais = produto.adicionais.map((adicional) => AdicionalDTO.de(adicional));
  }
}
