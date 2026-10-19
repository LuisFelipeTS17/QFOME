package com.qfome.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
        return categoriaRepository.findAllByOrderByIdAsc()
                .stream()
                .map(CategoriaDTO::new)
                .toList();
    }

    public CategoriaDTO buscarPorId(Long id) {
        return new CategoriaDTO(buscarEntidade(id));
    }

    @Transactional
    public CategoriaDTO criar(CategoriaRequestDTO dto) {
        String nome = dto.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ja existe uma categoria com esse nome");
        }
        return new CategoriaDTO(categoriaRepository.save(Categoria.builder().nome(nome).build()));
    }

    @Transactional
    public CategoriaDTO atualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = buscarEntidade(id);
        categoria.setNome(dto.nome().trim());
        return new CategoriaDTO(categoriaRepository.save(categoria));
    }

    @Transactional
    public void deletar(Long id) {
        categoriaRepository.delete(buscarEntidade(id));
    }

    Categoria buscarEntidade(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada"));
    }
}
