package com.qfome.dto;

import java.math.BigDecimal;

import com.qfome.model.Adicional;

public record AdicionalDTO(Long id, String nome, BigDecimal preco) {

    public AdicionalDTO(Adicional adicional) {
        this(adicional.getId(), adicional.getNome(), Dinheiro.arredondar(adicional.getPreco()));
    }
}
