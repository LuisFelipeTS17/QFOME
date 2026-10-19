import { paraJson } from '../../util/datas.js';
import * as Dinheiro from '../Dinheiro.js';
import { EnderecoDTO } from './EnderecoDTO.js';
import { ItemPedidoDTO } from './ItemPedidoDTO.js';

export class PedidoDTO {
  constructor(pedido) {
    this.id = pedido.id;
    this.codigo = pedido.codigo;
    this.usuarioId = pedido.usuarioId;
    this.status = pedido.status;
    this.formaPagamento = pedido.formaPagamento;
    this.endereco = EnderecoDTO.de(pedido);
    this.subtotal = Dinheiro.arredondar(pedido.subtotal);
    this.taxaEntrega = Dinheiro.arredondar(pedido.taxaEntrega);
    this.total = Dinheiro.arredondar(pedido.total);
    this.criadoEm = paraJson(pedido.criadoEm);
    this.itens = pedido.itens.map((item) => new ItemPedidoDTO(item));
  }
}
