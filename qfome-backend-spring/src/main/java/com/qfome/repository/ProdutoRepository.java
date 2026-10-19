package com.qfome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.qfome.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Carrega categoria e adicionais na mesma consulta (evita N+1 na listagem).
    @EntityGraph(attributePaths = {"categoria", "adicionais"})
    List<Produto> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = {"categoria", "adicionais"})
    List<Produto> findByCategoriaIdOrderByIdAsc(Long categoriaId);
}
