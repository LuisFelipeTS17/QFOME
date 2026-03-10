package com.qfome.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.qfome.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}