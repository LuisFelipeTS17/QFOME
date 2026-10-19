package com.qfome.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.qfome.model.Carrinho;

public record CarrinhoDTO(
        Long id,
        Long usuarioId,
        LocalDateTime atualizadoEm,
        List<ItemCarrinhoDTO> itens,
        BigDecimal subtotal
) {
    public CarrinhoDTO(Carrinho carrinho) {
        this(
                carrinho.getId(),
                carrinho.getUsuario().getId(),
                carrinho.getAtualizadoEm(),
                carrinho.getItens().stream().map(ItemCarrinhoDTO::new).toList(),
                Dinheiro.arredondar(carrinho.getSubtotal())
        );
    }
}
