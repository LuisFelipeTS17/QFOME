package com.qfome.dto.pedido;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.qfome.dto.ItemRequestDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * Pedido enviado pelo app/site. Subtotal, taxa e total sao calculados no
 * servidor a partir dos precos do banco; o cliente nao manda valores.
 */
public record CheckoutRequestDTO(
        @NotNull @JsonAlias("clienteId") Long usuarioId,
        @NotBlank String formaPagamento,
        @NotNull @Valid EnderecoDTO endereco,
        @NotEmpty List<@Valid ItemRequestDTO> itens
) {
}
