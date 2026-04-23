package com.qfome.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteUpdateDTO(
        @NotBlank @Size(max = 120) String nome,
        @Size(max = 20)            String telefone
) {}
