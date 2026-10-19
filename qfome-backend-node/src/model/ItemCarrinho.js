import Big from 'big.js';

export class ItemCarrinho {
  constructor({ id = null, produto, quantidade, observacao = null, adicionais = [] }) {
    this.id = id;
    this.produto = produto;
    this.quantidade = quantidade;
    this.observacao = observacao;
    this.adicionais = adicionais;
  }

  /** Preco do produto + adicionais escolhidos, para uma unidade. */
  get precoUnitario() {
    return this.adicionais.reduce((soma, adicional) => soma.plus(adicional.preco), new Big(this.produto.preco));
  }

  get subtotal() {
    return this.precoUnitario.times(this.quantidade);
  }
}
