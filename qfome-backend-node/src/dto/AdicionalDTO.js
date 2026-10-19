import * as Dinheiro from './Dinheiro.js';

export class AdicionalDTO {
  constructor(id, nome, preco) {
    this.id = id;
    this.nome = nome;
    this.preco = preco;
  }

  static de(adicional) {
    return new AdicionalDTO(adicional.id, adicional.nome, Dinheiro.arredondar(adicional.preco));
  }
}
