package com.qfome.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequestDTO(
        @NotBlank @Size(max = 80)  String nome,
        @NotBlank @Size(max = 100) String slug,
        @Size(max = 255)           String descricao
) {}
