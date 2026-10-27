package com.qfome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qfome.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findAllByOrderByIdAsc();
    boolean existsByNomeIgnoreCase(String nome);
}
