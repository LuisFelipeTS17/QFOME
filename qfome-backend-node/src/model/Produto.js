export class Produto {
  constructor({
    id = null, categoria = null, nome = null, descricao = null, preco = null,
    imagemUrl = null, tempoPreparoMin = null, adicionais = [],
  } = {}) {
    this.id = id;
    this.categoria = categoria;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.imagemUrl = imagemUrl;
    this.tempoPreparoMin = tempoPreparoMin;
    // Adicionais sao apagados junto com o produto pelo ON DELETE CASCADE do banco.
    this.adicionais = adicionais;
  }
}
