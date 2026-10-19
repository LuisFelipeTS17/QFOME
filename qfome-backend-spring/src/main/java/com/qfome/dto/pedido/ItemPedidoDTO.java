package com.qfome.dto.pedido;

import java.math.BigDecimal;
import java.util.List;

import com.qfome.dto.AdicionalDTO;
import com.qfome.dto.Dinheiro;
import com.qfome.model.ItemPedido;

public record ItemPedidoDTO(
        Long produtoId,
        String produtoNome,
        Integer quantidade,
        BigDecimal precoUnitario,
        String observacao,
        List<AdicionalDTO> adicionais,
        BigDecimal subtotal
) {
    public ItemPedidoDTO(ItemPedido item) {
        this(
                item.getProduto().getId(),
                item.getProduto().getNome(),
                item.getQuantidade(),
                Dinheiro.arredondar(item.getPrecoUnitario()),
                item.getObservacao(),
                // preco congelado no pedido, nao o preco atual do adicional
                item.getAdicionais().stream()
                        .map(a -> new AdicionalDTO(
                                a.getAdicional().getId(),
                                a.getAdicional().getNome(),
                                Dinheiro.arredondar(a.getPreco())))
                        .toList(),
                Dinheiro.arredondar(item.getSubtotal())
        );
    }
}
