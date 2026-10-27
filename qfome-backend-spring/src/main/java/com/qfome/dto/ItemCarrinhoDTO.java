package com.qfome.dto;

import java.math.BigDecimal;
import java.util.List;

import com.qfome.model.ItemCarrinho;

public record ItemCarrinhoDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        Integer quantidade,
        BigDecimal precoUnitario,
        List<AdicionalDTO> adicionais,
        BigDecimal subtotal,
        String observacao
) {
    public ItemCarrinhoDTO(ItemCarrinho item) {
        this(
                item.getId(),
                item.getProduto().getId(),
                item.getProduto().getNome(),
                item.getQuantidade(),
                Dinheiro.arredondar(item.getPrecoUnitario()),
                item.getAdicionais().stream().map(AdicionalDTO::new).toList(),
                Dinheiro.arredondar(item.getSubtotal()),
                item.getObservacao()
        );
    }
}
