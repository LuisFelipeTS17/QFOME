package com.qfome.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.CategoriaDTO;
import com.qfome.dto.CategoriaRequestDTO;
import com.qfome.model.Categoria;
import com.qfome.repository.CategoriaRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaDTO> listarTodas() {
        return categoriaRepository.findAll()
                .stream()
                .map(CategoriaDTO::new)
                .toList();
    }

    public CategoriaDTO buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .map(CategoriaDTO::new)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada"));
    }

    public CategoriaDTO criar(CategoriaRequestDTO dto) {
        if (categoriaRepository.existsBySlug(dto.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug ja em uso");
        }
        Categoria categoria = Categoria.builder()
                .nome(dto.nome())
                .slug(dto.slug())
                .descricao(dto.descricao())
                .ativo(true)
                .build();
        return new CategoriaDTO(categoriaRepository.save(categoria));
    }

    public CategoriaDTO atualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada"));

        categoria.setNome(dto.nome());
        categoria.setSlug(dto.slug());
        categoria.setDescricao(dto.descricao());

        return new CategoriaDTO(categoriaRepository.save(categoria));
    }

    public void deletar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada");
        }
        categoriaRepository.deleteById(id);
    }
}
