package com.qfome.service.pedido;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.pedido.PedidoStatusResponse;
import com.qfome.model.Pedido;
import com.qfome.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoAcompanhamentoService {

    private final PedidoRepository pedidoRepository;

    public List<PedidoStatusResponse> buscarHistoricoPorCliente(Long clienteId) {
        return pedidoRepository.findByClienteId(clienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PedidoStatusResponse acompanharPedidoPorCodigo(String codigo) {
        Pedido pedido = pedidoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido nao encontrado"));

        return toResponse(pedido);
    }

    private PedidoStatusResponse toResponse(Pedido pedido) {
        return PedidoStatusResponse.builder()
                .id(pedido.getId())
                .codigo(pedido.getCodigo())
                .status(pedido.getStatus().name())
                .total(pedido.getTotal())
                .dataCriacao(pedido.getDataCriacao())
                .clienteId(pedido.getCliente().getId())
                .build();
    }
}
