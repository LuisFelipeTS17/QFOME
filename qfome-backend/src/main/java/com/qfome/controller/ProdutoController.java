package com.qfome.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.qfome.dto.ProdutoDTO;
import com.qfome.dto.ProdutoResumoDTO;
import com.qfome.service.ProdutoService;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResumoDTO>> listar(
            @RequestParam(required = false) String categoria
    ) {
        // Ignora filtro de categoria vazio
        if (categoria != null && !categoria.isBlank()) {
            return ResponseEntity.ok(produtoService.listarPorCategoria(categoria));
        }
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProdutoDTO> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(produtoService.buscarPorSlug(slug));
    }
}
