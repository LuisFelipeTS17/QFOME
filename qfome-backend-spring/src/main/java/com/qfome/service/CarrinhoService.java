package com.qfome.service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.CarrinhoDTO;
import com.qfome.dto.ItemRequestDTO;
import com.qfome.model.Adicional;
import com.qfome.model.Carrinho;
import com.qfome.model.ItemCarrinho;
import com.qfome.model.Produto;
import com.qfome.model.Usuario;
import com.qfome.repository.CarrinhoRepository;
import com.qfome.repository.UsuarioRepository;

@Service
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoService produtoService;

    public CarrinhoService(
            CarrinhoRepository carrinhoRepository,
            UsuarioRepository usuarioRepository,
            ProdutoService produtoService
    ) {
        this.carrinhoRepository = carrinhoRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoService = produtoService;
    }

    @Transactional
    public CarrinhoDTO buscar(Long usuarioId) {
        return new CarrinhoDTO(obterOuCriarCarrinho(usuarioId));
    }

    @Transactional
    public CarrinhoDTO adicionarItem(Long usuarioId, ItemRequestDTO dto) {
        Carrinho carrinho = obterOuCriarCarrinho(usuarioId);
        Produto produto = produtoService.buscarEntidade(dto.produtoId());
        List<Adicional> adicionais = produtoService.adicionaisDoProduto(produto, dto.adicionaisOuVazio());
        String observacao = normalizar(dto.observacao());

        carrinho.getItens().stream()
                .filter(i -> i.getProduto().getId().equals(produto.getId())
                        && ids(i.getAdicionais()).equals(ids(adicionais))
                        && Objects.equals(i.getObservacao(), observacao))
                .findFirst()
                .ifPresentOrElse(
                        existente -> existente.setQuantidade(existente.getQuantidade() + dto.quantidade()),
                        () -> carrinho.getItens().add(ItemCarrinho.builder()
                                .carrinho(carrinho)
                                .produto(produto)
                                .quantidade(dto.quantidade())
                                .observacao(observacao)
                                .adicionais(new LinkedHashSet<>(adicionais))
                                .build())
                );

        return salvar(carrinho);
    }

    @Transactional
    public CarrinhoDTO atualizarItem(Long usuarioId, Long itemId, Integer quantidade) {
        Carrinho carrinho = obterOuCriarCarrinho(usuarioId);
        ItemCarrinho item = buscarItem(carrinho, itemId);

        if (quantidade <= 0) {
            carrinho.getItens().remove(item);
        } else {
            item.setQuantidade(quantidade);
        }

        return salvar(carrinho);
    }

    @Transactional
    public CarrinhoDTO removerItem(Long usuarioId, Long itemId) {
        Carrinho carrinho = obterOuCriarCarrinho(usuarioId);
        carrinho.getItens().remove(buscarItem(carrinho, itemId));
        return salvar(carrinho);
    }

    @Transactional
    public void limpar(Long usuarioId) {
        carrinhoRepository.findByUsuarioId(usuarioId).ifPresent(carrinho -> {
            carrinho.getItens().clear();
            salvar(carrinho);
        });
    }

    private CarrinhoDTO salvar(Carrinho carrinho) {
        carrinho.marcarAtualizado();
        carrinhoRepository.flush();
        return new CarrinhoDTO(carrinho);
    }

    private ItemCarrinho buscarItem(Carrinho carrinho, Long itemId) {
        return carrinho.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item nao encontrado no carrinho"));
    }

    private Carrinho obterOuCriarCarrinho(Long usuarioId) {
        return carrinhoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Usuario usuario = usuarioRepository.findById(usuarioId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));
                    return carrinhoRepository.save(Carrinho.builder().usuario(usuario).build());
                });
    }

    private static Set<Long> ids(Collection<Adicional> adicionais) {
        return adicionais.stream().map(Adicional::getId).collect(Collectors.toSet());
    }

    private static String normalizar(String observacao) {
        return observacao == null || observacao.isBlank() ? null : observacao.trim();
    }
}
