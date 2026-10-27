package com.qfome.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.ProdutoDTO;
import com.qfome.dto.ProdutoRequestDTO;
import com.qfome.model.Adicional;
import com.qfome.model.Produto;
import com.qfome.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaService categoriaService;

    public ProdutoService(ProdutoRepository produtoRepository, CategoriaService categoriaService) {
        this.produtoRepository = produtoRepository;
        this.categoriaService = categoriaService;
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> listar(Long categoriaId) {
        List<Produto> produtos = categoriaId == null
                ? produtoRepository.findAllByOrderByIdAsc()
                : produtoRepository.findByCategoriaIdOrderByIdAsc(categoriaId);
        return produtos.stream().map(ProdutoDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoDTO buscarPorId(Long id) {
        return new ProdutoDTO(buscarEntidade(id));
    }

    @Transactional
    public ProdutoDTO criar(ProdutoRequestDTO dto) {
        Produto produto = new Produto();
        preencher(produto, dto);
        return new ProdutoDTO(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoDTO atualizar(Long id, ProdutoRequestDTO dto) {
        Produto produto = buscarEntidade(id);
        preencher(produto, dto);
        return new ProdutoDTO(produtoRepository.save(produto));
    }

    @Transactional
    public void deletar(Long id) {
        produtoRepository.delete(buscarEntidade(id));
        produtoRepository.flush();
    }

    public Produto buscarEntidade(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado: " + id));
    }

    /** Converte ids em adicionais, garantindo que todos pertencem ao produto. */
    public List<Adicional> adicionaisDoProduto(Produto produto, Collection<Long> ids) {
        Map<Long, Adicional> disponiveis = produto.getAdicionais().stream()
                .collect(Collectors.toMap(Adicional::getId, Function.identity()));

        return ids.stream()
                .distinct()
                .map(id -> {
                    Adicional adicional = disponiveis.get(id);
                    if (adicional == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Adicional " + id + " nao pertence ao produto " + produto.getId());
                    }
                    return adicional;
                })
                .toList();
    }

    private void preencher(Produto produto, ProdutoRequestDTO dto) {
        produto.setCategoria(categoriaService.buscarEntidade(dto.categoriaId()));
        produto.setNome(dto.nome().trim());
        produto.setDescricao(dto.descricao());
        produto.setPreco(dto.preco());
        produto.setImagemUrl(dto.imagemUrl());
        produto.setTempoPreparoMin(dto.tempoPreparoMin());
    }
}
