package com.qfome.dto;

import com.qfome.model.Usuario;

public record UsuarioDTO(Long id, String nome, String email, String perfil) {

    public UsuarioDTO(Usuario u) {
        this(u.getId(), u.getNome(), u.getEmail(), u.getPerfil().name());
    }
}
