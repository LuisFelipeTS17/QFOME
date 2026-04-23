package com.qfome.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AdicionarItemDTO(
        @NotNull Long produtoId,
        @NotNull @Min(1) Integer quantidade,
        String observacao
) {}
