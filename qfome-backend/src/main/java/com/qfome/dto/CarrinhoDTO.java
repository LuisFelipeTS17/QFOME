package com.qfome.dto;

import java.math.BigDecimal;
import java.util.List;

import com.qfome.model.Carrinho;

public record CarrinhoDTO(
        Long id,
        Long clienteId,
        String status,
        List<ItemCarrinhoDTO> itens,
        BigDecimal total
) {
    public CarrinhoDTO(Carrinho carrinho) {
        this(
                carrinho.getId(),
                carrinho.getCliente().getId(),
                carrinho.getStatus(),
                carrinho.getItens().stream().map(ItemCarrinhoDTO::new).toList(),
                carrinho.getItens().stream()
                        .map(i -> i.getPrecoUnitario().multiply(BigDecimal.valueOf(i.getQuantidade())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }
}
