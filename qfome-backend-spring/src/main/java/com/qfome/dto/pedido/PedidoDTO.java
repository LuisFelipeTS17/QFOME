package com.qfome.dto.pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.qfome.dto.Dinheiro;
import com.qfome.model.Pedido;

public record PedidoDTO(
        Long id,
        String codigo,
        Long usuarioId,
        String status,
        String formaPagamento,
        EnderecoDTO endereco,
        BigDecimal subtotal,
        BigDecimal taxaEntrega,
        BigDecimal total,
        LocalDateTime criadoEm,
        List<ItemPedidoDTO> itens
) {
    public PedidoDTO(Pedido pedido) {
        this(
                pedido.getId(),
                pedido.getCodigo(),
                pedido.getUsuario().getId(),
                pedido.getStatus().name(),
                pedido.getFormaPagamento().name(),
                new EnderecoDTO(pedido),
                Dinheiro.arredondar(pedido.getSubtotal()),
                Dinheiro.arredondar(pedido.getTaxaEntrega()),
                Dinheiro.arredondar(pedido.getTotal()),
                pedido.getCriadoEm(),
                pedido.getItens().stream().map(ItemPedidoDTO::new).toList()
        );
    }
}
