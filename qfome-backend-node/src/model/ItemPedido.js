import Big from 'big.js';

import { ItemPedidoAdicional } from './ItemPedidoAdicional.js';

/**
 * Item do pedido. precoUnitario e o preco do produto no momento da compra;
 * o preco de cada adicional fica congelado em item_pedido_adicional.
 */
export class ItemPedido {
  constructor({ id = null, produto, quantidade, precoUnitario, observacao = null, adicionais = [] }) {
    this.id = id;
    this.produto = produto;
    this.quantidade = quantidade;
    this.precoUnitario = precoUnitario;
    this.observacao = observacao;
    this.adicionais = adicionais;
  }

  adicionarAdicional(adicional) {
    this.adicionais.push(new ItemPedidoAdicional(adicional));
  }

  get subtotal() {
    const unidade = this.adicionais.reduce((soma, adicional) => soma.plus(adicional.preco), new Big(this.precoUnitario));
    return unidade.times(this.quantidade);
  }
}
