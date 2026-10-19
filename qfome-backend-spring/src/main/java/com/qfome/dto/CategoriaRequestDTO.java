package com.qfome.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequestDTO(@NotBlank @Size(max = 60) String nome) {}
