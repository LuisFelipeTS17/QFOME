package com.qfome.dto;

import java.math.BigDecimal;

import com.qfome.model.ItemCarrinho;

public record ItemCarrinhoDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal,
        String observacao
) {
    public ItemCarrinhoDTO(ItemCarrinho item) {
        this(
                item.getId(),
                item.getProduto().getId(),
                item.getProduto().getNome(),
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getSubtotal(),
                item.getObservacao()
        );
    }
}
