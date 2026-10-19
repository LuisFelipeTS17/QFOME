export class Adicional {
  constructor({ id = null, produtoId, nome, preco }) {
    this.id = id;
    this.produtoId = produtoId;
    this.nome = nome;
    this.preco = preco;
  }
}
