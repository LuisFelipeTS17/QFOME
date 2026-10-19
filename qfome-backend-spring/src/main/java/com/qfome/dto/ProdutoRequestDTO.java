package com.qfome.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProdutoRequestDTO(
        @NotNull                                     Long categoriaId,
        @NotBlank @Size(max = 100)                   String nome,
        @Size(max = 500)                             String descricao,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal preco,
        @Size(max = 255)                             String imagemUrl,
        @Min(1)                                      Integer tempoPreparoMin
) {}
