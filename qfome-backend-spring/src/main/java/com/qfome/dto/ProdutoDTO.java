package com.qfome.dto;

import java.math.BigDecimal;
import java.util.List;

import com.qfome.model.Produto;

public record ProdutoDTO(
        Long id,
        Long categoriaId,
        String categoriaNome,
        String nome,
        String descricao,
        BigDecimal preco,
        String imagemUrl,
        Integer tempoPreparoMin,
        List<AdicionalDTO> adicionais
) {

    public ProdutoDTO(Produto produto) {
        this(
                produto.getId(),
                produto.getCategoria().getId(),
                produto.getCategoria().getNome(),
                produto.getNome(),
                produto.getDescricao(),
                Dinheiro.arredondar(produto.getPreco()),
                produto.getImagemUrl(),
                produto.getTempoPreparoMin(),
                produto.getAdicionais().stream().map(AdicionalDTO::new).toList()
        );
    }
}
