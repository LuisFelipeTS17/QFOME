package com.qfome.dto.pedido;

import com.qfome.model.Pedido;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EnderecoDTO(
        @NotBlank @Pattern(regexp = "\\d{5}-?\\d{3}", message = "deve ter 8 digitos") String cep,
        @NotBlank @Size(max = 150) String logradouro,
        @NotBlank @Size(max = 10)  String numero,
        @NotBlank @Size(max = 80)  String bairro,
        @NotBlank @Size(max = 80)  String cidade
) {
    public EnderecoDTO(Pedido pedido) {
        this(pedido.getCep(), pedido.getLogradouro(), pedido.getNumero(), pedido.getBairro(), pedido.getCidade());
    }

    /** CEP como gravado no banco: CHAR(8), so digitos. */
    public String cepSomenteDigitos() {
        return cep.replaceAll("\\D", "");
    }
}
