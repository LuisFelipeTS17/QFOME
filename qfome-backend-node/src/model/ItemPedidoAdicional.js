/** Adicional escolhido num item do pedido, com o preco congelado na hora da compra. */
export class ItemPedidoAdicional {
  constructor(adicional, preco = adicional.preco) {
    this.adicional = adicional;
    this.preco = preco;
  }
}
