import { agora } from '../util/datas.js';
import { StatusPedido } from './enums/StatusPedido.js';

export class Pedido {
  constructor({
    id = null, codigo, usuarioId, status = null, formaPagamento,
    cep, logradouro, numero, bairro, cidade,
    subtotal = null, taxaEntrega = null, total = null, criadoEm = null, itens = [],
  }) {
    this.id = id;
    this.codigo = codigo;
    this.usuarioId = usuarioId;
    this.status = status;
    this.formaPagamento = formaPagamento;
    this.cep = cep;
    this.logradouro = logradouro;
    this.numero = numero;
    this.bairro = bairro;
    this.cidade = cidade;
    this.subtotal = subtotal;
    this.taxaEntrega = taxaEntrega;
    this.total = total;
    this.criadoEm = criadoEm;
    this.itens = itens;
  }

  prePersist() {
    this.criadoEm ??= agora();
    this.status ??= StatusPedido.RECEBIDO;
  }

  adicionarItem(item) {
    this.itens.push(item);
  }
}
