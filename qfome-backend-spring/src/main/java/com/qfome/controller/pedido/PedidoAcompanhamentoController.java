package com.qfome.controller.pedido;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qfome.dto.pedido.PedidoDTO;
import com.qfome.service.pedido.PedidoAcompanhamentoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoAcompanhamentoController {

    private final PedidoAcompanhamentoService pedidoAcompanhamentoService;

    @GetMapping("/cliente/{usuarioId}")
    public ResponseEntity<List<PedidoDTO>> buscarHistoricoPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pedidoAcompanhamentoService.buscarHistoricoPorUsuario(usuarioId));
    }

    @GetMapping("/acompanhar/{codigo}")
    public ResponseEntity<PedidoDTO> acompanharPedidoPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(pedidoAcompanhamentoService.acompanharPedidoPorCodigo(codigo));
    }
}
