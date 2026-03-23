package com.qfome.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qfome.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    Optional<Produto> findBySlugAndAtivoTrue(String slug);
    List<Produto> findByAtivoTrue();
    List<Produto> findByCategoriaSlugAndAtivoTrue(String categoriaSlug);
}
