package com.qfome.dto;

import com.qfome.model.Categoria;

public record CategoriaDTO(Long id, String nome) {

    public CategoriaDTO(Categoria categoria) {
        this(categoria.getId(), categoria.getNome());
    }
}
