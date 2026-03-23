package com.qfome.dto.pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoStatusResponse {

    private Long id;
    private String codigo;
    private String status;
    private BigDecimal total;
    private LocalDateTime dataCriacao;
    private Long clienteId;
}
