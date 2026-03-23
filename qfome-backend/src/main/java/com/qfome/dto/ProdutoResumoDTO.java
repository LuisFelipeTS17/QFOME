package com.qfome.dto;

import java.math.BigDecimal;

import com.qfome.model.Produto;

public record ProdutoResumoDTO(
        Long id,
        String nome,
        BigDecimal preco,
        String slug,
        String categoriaNome
) {

    public ProdutoResumoDTO(Produto produto) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getPreco(),
                produto.getSlug(),
                produto.getCategoria() != null ? produto.getCategoria().getNome() : null
        );
    }
}
