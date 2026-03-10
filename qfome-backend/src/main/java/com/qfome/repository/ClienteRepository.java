package com.qfome.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qfome.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}