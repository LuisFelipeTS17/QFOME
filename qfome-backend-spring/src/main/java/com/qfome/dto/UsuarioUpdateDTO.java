package com.qfome.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateDTO(@NotBlank @Size(max = 100) String nome) {}
