import { PedidoDTO } from '../../dto/pedido/PedidoDTO.js';
import { ResponseStatusError } from '../../web/erros.js';

export class PedidoAcompanhamentoService {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  buscarHistoricoPorUsuario(usuarioId) {
    return this.pedidoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId).map((pedido) => new PedidoDTO(pedido));
  }

  acompanharPedidoPorCodigo(codigo) {
    const pedido = this.pedidoRepository.findByCodigo(codigo);
    if (!pedido) throw new ResponseStatusError(404, `Pedido nao encontrado com o codigo: ${codigo}`);
    return new PedidoDTO(pedido);
  }
}
