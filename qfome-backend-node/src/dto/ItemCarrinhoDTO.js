import { AdicionalDTO } from './AdicionalDTO.js';
import * as Dinheiro from './Dinheiro.js';

export class ItemCarrinhoDTO {
  constructor(item) {
    this.id = item.id;
    this.produtoId = item.produto.id;
    this.produtoNome = item.produto.nome;
    this.quantidade = item.quantidade;
    this.precoUnitario = Dinheiro.arredondar(item.precoUnitario);
    this.adicionais = item.adicionais.map((adicional) => AdicionalDTO.de(adicional));
    this.subtotal = Dinheiro.arredondar(item.subtotal);
    this.observacao = item.observacao;
  }
}
