package com.qfome.controller.pedido;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qfome.dto.pedido.PedidoStatusResponse;
import com.qfome.service.pedido.PedidoAcompanhamentoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoAcompanhamentoController {

    private final PedidoAcompanhamentoService pedidoAcompanhamentoService;

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<PedidoStatusResponse>> buscarHistoricoPorCliente(@PathVariable Long clienteId) {
        List<PedidoStatusResponse> historico = pedidoAcompanhamentoService.buscarHistoricoPorCliente(clienteId);
        return ResponseEntity.ok(historico);
    }

    @GetMapping("/acompanhar/{codigo}")
    public ResponseEntity<PedidoStatusResponse> acompanharPedidoPorCodigo(@PathVariable String codigo) {
        PedidoStatusResponse response = pedidoAcompanhamentoService.acompanharPedidoPorCodigo(codigo);
        return ResponseEntity.ok(response);
    }
}
