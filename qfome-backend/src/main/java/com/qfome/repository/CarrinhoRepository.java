package com.qfome.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qfome.model.Carrinho;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    Optional<Carrinho> findByClienteIdAndStatus(Long clienteId, String status);
}
