package com.qfome.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.ProdutoDTO;
import com.qfome.dto.ProdutoResumoDTO;
import com.qfome.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public List<ProdutoResumoDTO> listarTodos() {
        // Apenas produtos ativos no catalogo
        return produtoRepository.findByAtivoTrue()
                .stream()
                .map(ProdutoResumoDTO::new)
                .toList();
    }

    public List<ProdutoResumoDTO> listarPorCategoria(String categoriaSlug) {
        // Filtro por slug da categoria
        return produtoRepository.findByCategoriaSlugAndAtivoTrue(categoriaSlug)
                .stream()
                .map(ProdutoResumoDTO::new)
                .toList();
    }

    public ProdutoDTO buscarPorSlug(String slug) {
        return produtoRepository.findBySlugAndAtivoTrue(slug)
                .map(ProdutoDTO::new)
                // Retorna 404 quando nao encontrar
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado"));
    }
}
