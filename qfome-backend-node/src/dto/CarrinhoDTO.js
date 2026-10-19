import { paraJson } from '../util/datas.js';
import * as Dinheiro from './Dinheiro.js';
import { ItemCarrinhoDTO } from './ItemCarrinhoDTO.js';

export class CarrinhoDTO {
  constructor(carrinho) {
    this.id = carrinho.id;
    this.usuarioId = carrinho.usuarioId;
    this.atualizadoEm = paraJson(carrinho.atualizadoEm);
    this.itens = carrinho.itens.map((item) => new ItemCarrinhoDTO(item));
    this.subtotal = Dinheiro.arredondar(carrinho.subtotal);
  }
}
