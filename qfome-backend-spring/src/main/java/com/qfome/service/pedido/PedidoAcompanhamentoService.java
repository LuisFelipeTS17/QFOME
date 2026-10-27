package com.qfome.service.pedido;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.pedido.PedidoDTO;
import com.qfome.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoAcompanhamentoService {

    private final PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public List<PedidoDTO> buscarHistoricoPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId)
                .stream()
                .map(PedidoDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public PedidoDTO acompanharPedidoPorCodigo(String codigo) {
        return pedidoRepository.findByCodigo(codigo)
                .map(PedidoDTO::new)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Pedido nao encontrado com o codigo: " + codigo));
    }
}
