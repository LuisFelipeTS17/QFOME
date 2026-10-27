package com.qfome;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class PedidoFluxoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long usuarioId;

    @BeforeEach
    void cadastrarUsuario() throws Exception {
        String email = "teste-" + UUID.randomUUID() + "@qfome.com";
        String resposta = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Cliente Teste", "email": "%s", "password": "123456"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("CLIENTE"))
                .andReturn().getResponse().getContentAsString();
        usuarioId = objectMapper.readTree(resposta).get("id").asLong();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "password": "123456"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(usuarioId));
    }

    @Test
    void catalogoVemDoSeed() throws Exception {
        mockMvc.perform(get("/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)))
                .andExpect(jsonPath("$[0].nome").value("Caseira"));

        mockMvc.perform(get("/produtos").param("categoria", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[0].nome").value("Bowl Nordestino"))
                .andExpect(jsonPath("$[0].preco").value(39.90))
                .andExpect(jsonPath("$[0].tempoPreparoMin").value(29))
                .andExpect(jsonPath("$[0].adicionais", hasSize(3)));

        mockMvc.perform(get("/produtos/999999")).andExpect(status().isNotFound());
    }

    @Test
    void checkoutCalculaTotaisNoServidorEGravaAdicionais() throws Exception {
        // Bowl Nordestino (39,90) + farofa (4,00) + queijo (5,00) = 48,90 x 2 = 97,80 -> frete gratis
        String resposta = mockMvc.perform(post("/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkout(usuarioId, """
                                {"produtoId": 1, "quantidade": 2, "observacao": "sem cebola", "adicionais": [1, 2]}
                                """)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo").value(startsWith("QF-")))
                .andExpect(jsonPath("$.status").value("RECEBIDO"))
                .andExpect(jsonPath("$.formaPagamento").value("PIX"))
                .andExpect(jsonPath("$.endereco.cep").value("01310100"))
                .andExpect(jsonPath("$.subtotal").value(97.80))
                .andExpect(jsonPath("$.taxaEntrega").value(0.00))
                .andExpect(jsonPath("$.total").value(97.80))
                .andReturn().getResponse().getContentAsString();

        String codigo = objectMapper.readTree(resposta).get("codigo").asText();

        mockMvc.perform(get("/pedidos/acompanhar/" + codigo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].observacao").value("sem cebola"))
                .andExpect(jsonPath("$.itens[0].adicionais", hasSize(2)))
                .andExpect(jsonPath("$.itens[0].subtotal").value(97.80));

        mockMvc.perform(get("/pedidos/cliente/" + usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].codigo").value(codigo));

        // Produto que ja esta em pedido nao pode ser apagado (FK de item_pedido).
        mockMvc.perform(delete("/produtos/1")).andExpect(status().isConflict());
    }

    @Test
    void pedidoAbaixoDe45PagaTaxaDeEntrega() throws Exception {
        // Mousse de Maracuja (16,90) -> + 6,90 de entrega
        JsonNode mousse = produtoPorNome("Mousse de Maracuja");

        mockMvc.perform(post("/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkout(usuarioId, """
                                {"produtoId": %d, "quantidade": 1}
                                """.formatted(mousse.get("id").asLong()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subtotal").value(16.90))
                .andExpect(jsonPath("$.taxaEntrega").value(6.90))
                .andExpect(jsonPath("$.total").value(23.80));
    }

    @Test
    void checkoutRejeitaAdicionalDeOutroProduto() throws Exception {
        // adicional 4 pertence ao produto 2
        mockMvc.perform(post("/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkout(usuarioId, """
                                {"produtoId": 1, "quantidade": 1, "adicionais": [4]}
                                """)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void carrinhoSomaQuantidadeDeItensIguais() throws Exception {
        String item = """
                {"produtoId": 1, "quantidade": 1, "adicionais": [3]}
                """;
        mockMvc.perform(post("/carrinho/" + usuarioId + "/itens").contentType(MediaType.APPLICATION_JSON).content(item))
                .andExpect(status().isOk());
        mockMvc.perform(post("/carrinho/" + usuarioId + "/itens").contentType(MediaType.APPLICATION_JSON).content(item))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].quantidade").value(2))
                .andExpect(jsonPath("$.itens[0].precoUnitario").value(42.90))
                .andExpect(jsonPath("$.subtotal").value(85.80));

        mockMvc.perform(delete("/carrinho/" + usuarioId + "/limpar")).andExpect(status().isNoContent());
        mockMvc.perform(get("/carrinho/" + usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(0)));
    }

    private JsonNode produtoPorNome(String nome) throws Exception {
        String lista = mockMvc.perform(get("/produtos")).andReturn().getResponse().getContentAsString();
        for (JsonNode produto : objectMapper.readTree(lista)) {
            if (produto.get("nome").asText().equals(nome)) {
                return produto;
            }
        }
        throw new AssertionError("Produto nao encontrado no seed: " + nome);
    }

    private static String checkout(long usuarioId, String itemJson) {
        return """
                {
                  "usuarioId": %d,
                  "formaPagamento": "pix",
                  "endereco": {
                    "cep": "01310-100",
                    "logradouro": "Avenida Paulista",
                    "numero": "1000",
                    "bairro": "Bela Vista",
                    "cidade": "Sao Paulo"
                  },
                  "itens": [%s]
                }
                """.formatted(usuarioId, itemJson);
    }
}
