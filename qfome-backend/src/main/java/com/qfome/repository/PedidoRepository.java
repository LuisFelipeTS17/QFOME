package com.qfome.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qfome.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}