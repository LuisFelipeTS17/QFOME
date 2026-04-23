package com.qfome.dto;

import com.qfome.model.Cliente;

public record ClienteDTO(Long id, String nome, String email, String telefone) {

    public ClienteDTO(Cliente c) {
        this(c.getId(), c.getNome(), c.getEmail(), c.getTelefone());
    }
}
