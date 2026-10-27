import { AdicionalDTO } from '../AdicionalDTO.js';
import * as Dinheiro from '../Dinheiro.js';

export class ItemPedidoDTO {
  constructor(item) {
    this.produtoId = item.produto.id;
    this.produtoNome = item.produto.nome;
    this.quantidade = item.quantidade;
    this.precoUnitario = Dinheiro.arredondar(item.precoUnitario);
    this.observacao = item.observacao;
    // preco congelado no pedido, nao o preco atual do adicional
    this.adicionais = item.adicionais.map((a) => new AdicionalDTO(a.adicional.id, a.adicional.nome, Dinheiro.arredondar(a.preco)));
    this.subtotal = Dinheiro.arredondar(item.subtotal);
  }
}
