import Big from 'big.js';

import { agora } from '../util/datas.js';

export class Carrinho {
  constructor({ id = null, usuarioId, atualizadoEm = null, itens = [] }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.atualizadoEm = atualizadoEm;
    this.itens = itens;
  }

  prePersist() {
    this.atualizadoEm ??= agora();
  }

  marcarAtualizado() {
    this.atualizadoEm = agora();
  }

  get subtotal() {
    return this.itens.reduce((soma, item) => soma.plus(item.subtotal), new Big(0));
  }
}
