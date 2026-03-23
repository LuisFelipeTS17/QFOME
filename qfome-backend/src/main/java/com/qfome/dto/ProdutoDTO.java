package com.qfome.dto;

import java.math.BigDecimal;

import com.qfome.model.Produto;

public record ProdutoDTO(
        Long id,
        String nome,
        BigDecimal preco,
        String slug,
        CategoriaDTO categoria
) {

    public ProdutoDTO(Produto produto) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getPreco(),
                produto.getSlug(),
                produto.getCategoria() != null ? new CategoriaDTO(produto.getCategoria()) : null
        );
    }
}
