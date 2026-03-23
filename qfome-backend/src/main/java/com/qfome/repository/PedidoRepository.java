package com.qfome.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qfome.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    Optional<Pedido> findByCodigo(String codigo);
    List<Pedido> findByClienteIdOrderByDataCriacaoDesc(Long clienteId);
}
