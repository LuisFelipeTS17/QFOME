package com.qfome.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProdutoRequestDTO(
        @NotBlank @Size(max = 120)  String nome,
        @NotBlank @Size(max = 140)  String slug,
        @Size(max = 600)            String descricao,
        @NotNull @DecimalMin("0.0") BigDecimal preco,
        @NotNull                    Long categoriaId
) {}
