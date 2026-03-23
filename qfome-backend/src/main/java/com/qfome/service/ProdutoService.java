package com.qfome.service;

import java.util.List;

import org.springframework.stereotype.Service;

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
        return produtoRepository.findAll()
                .stream()
                .map(ProdutoResumoDTO::new)
                .toList();
    }

    public List<ProdutoResumoDTO> listarPorCategoria(String categoriaId) {
        return produtoRepository.findByCategoria_NomeIgnoreCase(categoriaId)
                .stream().map(ProdutoResumoDTO::new).toList();
    }

    public ProdutoDTO buscarPorSlug(String slug) {
        return produtoRepository.findBySlug(slug)
                .map(ProdutoDTO::new)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com slug: " + slug));
    }
}
