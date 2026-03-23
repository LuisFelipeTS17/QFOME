package com.qfome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qfome.model.ItemPedido;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {
    List<ItemPedido> findByPedidoId(Long pedidoId);
}
