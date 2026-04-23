package com.qfome.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.AdicionarItemDTO;
import com.qfome.dto.CarrinhoDTO;
import com.qfome.model.Carrinho;
import com.qfome.model.Cliente;
import com.qfome.model.ItemCarrinho;
import com.qfome.model.Produto;
import com.qfome.repository.CarrinhoRepository;
import com.qfome.repository.ClienteRepository;
import com.qfome.repository.ItemCarrinhoRepository;
import com.qfome.repository.ProdutoRepository;

@Service
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ItemCarrinhoRepository itemCarrinhoRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;

    public CarrinhoService(
            CarrinhoRepository carrinhoRepository,
            ItemCarrinhoRepository itemCarrinhoRepository,
            ClienteRepository clienteRepository,
            ProdutoRepository produtoRepository
    ) {
        this.carrinhoRepository = carrinhoRepository;
        this.itemCarrinhoRepository = itemCarrinhoRepository;
        this.clienteRepository = clienteRepository;
        this.produtoRepository = produtoRepository;
    }

    public CarrinhoDTO buscar(Long clienteId) {
        Carrinho carrinho = obterOuCriarCarrinho(clienteId);
        return new CarrinhoDTO(carrinho);
    }

    @Transactional
    public CarrinhoDTO adicionarItem(Long clienteId, AdicionarItemDTO dto) {
        Carrinho carrinho = obterOuCriarCarrinho(clienteId);

        Produto produto = produtoRepository.findById(dto.produtoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado"));

        carrinho.getItens().stream()
                .filter(i -> i.getProduto().getId().equals(dto.produtoId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantidade(existing.getQuantidade() + dto.quantidade()),
                        () -> {
                            ItemCarrinho novoItem = ItemCarrinho.builder()
                                    .carrinho(carrinho)
                                    .produto(produto)
                                    .quantidade(dto.quantidade())
                                    .precoUnitario(produto.getPreco())
                                    .observacao(dto.observacao())
                                    .build();
                            carrinho.getItens().add(novoItem);
                        }
                );

        return new CarrinhoDTO(carrinhoRepository.save(carrinho));
    }

    @Transactional
    public CarrinhoDTO atualizarItem(Long clienteId, Long itemId, Integer quantidade) {
        Carrinho carrinho = obterOuCriarCarrinho(clienteId);

        ItemCarrinho item = carrinho.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item nao encontrado no carrinho"));

        if (quantidade <= 0) {
            carrinho.getItens().remove(item);
            itemCarrinhoRepository.delete(item);
        } else {
            item.setQuantidade(quantidade);
        }

        return new CarrinhoDTO(carrinhoRepository.save(carrinho));
    }

    @Transactional
    public CarrinhoDTO removerItem(Long clienteId, Long itemId) {
        Carrinho carrinho = obterOuCriarCarrinho(clienteId);

        ItemCarrinho item = carrinho.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item nao encontrado no carrinho"));

        carrinho.getItens().remove(item);
        itemCarrinhoRepository.delete(item);

        return new CarrinhoDTO(carrinhoRepository.save(carrinho));
    }

    @Transactional
    public void limpar(Long clienteId) {
        carrinhoRepository.findByClienteIdAndStatus(clienteId, "ABERTO")
                .ifPresent(carrinho -> {
                    carrinho.getItens().clear();
                    carrinhoRepository.save(carrinho);
                });
    }

    private Carrinho obterOuCriarCarrinho(Long clienteId) {
        return carrinhoRepository.findByClienteIdAndStatus(clienteId, "ABERTO")
                .orElseGet(() -> {
                    Cliente cliente = clienteRepository.findById(clienteId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));
                    return carrinhoRepository.save(Carrinho.builder().cliente(cliente).build());
                });
    }
}
