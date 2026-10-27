package com.qfome.service.pedido;

import java.math.BigDecimal;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qfome.dto.ItemRequestDTO;
import com.qfome.dto.pedido.CheckoutRequestDTO;
import com.qfome.dto.pedido.EnderecoDTO;
import com.qfome.dto.pedido.PedidoDTO;
import com.qfome.model.ItemPedido;
import com.qfome.model.Pedido;
import com.qfome.model.Produto;
import com.qfome.model.Usuario;
import com.qfome.model.enums.FormaPagamento;
import com.qfome.model.enums.StatusPedido;
import com.qfome.repository.PedidoRepository;
import com.qfome.repository.UsuarioRepository;
import com.qfome.service.ProdutoService;

@Service
public class CheckoutService {

    /** Mesma regra do site e do app: frete gratis a partir de R$ 45. */
    static final BigDecimal FRETE_GRATIS_A_PARTIR_DE = new BigDecimal("45.00");
    static final BigDecimal TAXA_ENTREGA = new BigDecimal("6.90");

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoService produtoService;

    public CheckoutService(
            PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            ProdutoService produtoService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoService = produtoService;
    }

    @Transactional
    public PedidoDTO fecharPedido(CheckoutRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));
        EnderecoDTO endereco = request.endereco();

        Pedido pedido = Pedido.builder()
                .codigo(gerarCodigoPedido())
                .usuario(usuario)
                .status(StatusPedido.RECEBIDO)
                .formaPagamento(mapearFormaPagamento(request.formaPagamento()))
                .cep(endereco.cepSomenteDigitos())
                .logradouro(endereco.logradouro().trim())
                .numero(endereco.numero().trim())
                .bairro(endereco.bairro().trim())
                .cidade(endereco.cidade().trim())
                .build();

        for (ItemRequestDTO itemRequest : request.itens()) {
            Produto produto = produtoService.buscarEntidade(itemRequest.produtoId());
            ItemPedido item = ItemPedido.builder()
                    .produto(produto)
                    .quantidade(itemRequest.quantidade())
                    .precoUnitario(produto.getPreco())
                    .observacao(normalizar(itemRequest.observacao()))
                    .build();
            produtoService.adicionaisDoProduto(produto, itemRequest.adicionaisOuVazio())
                    .forEach(item::adicionarAdicional);
            pedido.adicionarItem(item);
        }

        BigDecimal subtotal = pedido.getItens().stream()
                .map(ItemPedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal taxaEntrega = calcularTaxaEntrega(subtotal);

        pedido.setSubtotal(subtotal);
        pedido.setTaxaEntrega(taxaEntrega);
        pedido.setTotal(subtotal.add(taxaEntrega));

        return new PedidoDTO(pedidoRepository.save(pedido));
    }

    static BigDecimal calcularTaxaEntrega(BigDecimal subtotal) {
        return subtotal.compareTo(FRETE_GRATIS_A_PARTIR_DE) >= 0 ? BigDecimal.ZERO : TAXA_ENTREGA;
    }

    private FormaPagamento mapearFormaPagamento(String formaPagamento) {
        try {
            return FormaPagamento.valueOf(formaPagamento.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Forma de pagamento invalida");
        }
    }

    private String gerarCodigoPedido() {
        // Gera codigo QF-123456 unico
        for (int tentativa = 0; tentativa < 30; tentativa++) {
            String codigo = "QF-" + ThreadLocalRandom.current().nextInt(100000, 1000000);
            if (!pedidoRepository.existsByCodigo(codigo)) {
                return codigo;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel gerar codigo do pedido");
    }

    private static String normalizar(String observacao) {
        return observacao == null || observacao.isBlank() ? null : observacao.trim();
    }
}
