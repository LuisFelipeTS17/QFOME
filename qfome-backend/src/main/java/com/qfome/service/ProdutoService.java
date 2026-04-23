package com.qfome.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.ProdutoDTO;
import com.qfome.dto.ProdutoRequestDTO;
import com.qfome.dto.ProdutoResumoDTO;
import com.qfome.model.Categoria;
import com.qfome.model.Produto;
import com.qfome.repository.CategoriaRepository;
import com.qfome.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<ProdutoResumoDTO> listarTodos() {
        return produtoRepository.findByAtivoTrue()
                .stream()
                .map(ProdutoResumoDTO::new)
                .toList();
    }

    public List<ProdutoResumoDTO> listarPorCategoria(String categoriaSlug) {
        return produtoRepository.findByCategoriaSlugAndAtivoTrue(categoriaSlug)
                .stream()
                .map(ProdutoResumoDTO::new)
                .toList();
    }

    public ProdutoDTO buscarPorSlug(String slug) {
        return produtoRepository.findBySlugAndAtivoTrue(slug)
                .map(ProdutoDTO::new)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado"));
    }

    public ProdutoDTO buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .map(ProdutoDTO::new)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado"));
    }

    public ProdutoDTO criar(ProdutoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada"));

        Produto produto = Produto.builder()
                .nome(dto.nome())
                .slug(dto.slug())
                .descricao(dto.descricao())
                .preco(dto.preco())
                .ativo(true)
                .categoria(categoria)
                .build();

        return new ProdutoDTO(produtoRepository.save(produto));
    }

    public ProdutoDTO atualizar(Long id, ProdutoRequestDTO dto) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado"));

        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada"));

        produto.setNome(dto.nome());
        produto.setSlug(dto.slug());
        produto.setDescricao(dto.descricao());
        produto.setPreco(dto.preco());
        produto.setCategoria(categoria);

        return new ProdutoDTO(produtoRepository.save(produto));
    }

    public void deletar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado"));
        produto.setAtivo(false);
        produtoRepository.save(produto);
    }
}
