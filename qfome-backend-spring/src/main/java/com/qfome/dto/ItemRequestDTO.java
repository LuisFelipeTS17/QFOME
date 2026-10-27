package com.qfome.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Item enviado ao carrinho ou ao checkout: produto, quantidade e ids dos adicionais. */
public record ItemRequestDTO(
        @NotNull Long produtoId,
        @NotNull @Min(1) Integer quantidade,
        @Size(max = 255) String observacao,
        List<Long> adicionais
) {
    public List<Long> adicionaisOuVazio() {
        return adicionais == null ? List.of() : adicionais;
    }
}
