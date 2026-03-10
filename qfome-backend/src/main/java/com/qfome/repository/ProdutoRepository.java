package com.qfome.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qfome.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}