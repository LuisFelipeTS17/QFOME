package com.qfome.model;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "item_carrinho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carrinho_id", nullable = false)
    private Carrinho carrinho;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantidade;

    @Column(length = 255)
    private String observacao;

    @ManyToMany
    @JoinTable(
            name = "item_carrinho_adicional",
            joinColumns = @JoinColumn(name = "item_carrinho_id"),
            inverseJoinColumns = @JoinColumn(name = "adicional_id")
    )
    @OrderBy("id")
    @Builder.Default
    private Set<Adicional> adicionais = new LinkedHashSet<>();

    /** Preco do produto + adicionais escolhidos, para uma unidade. */
    public BigDecimal getPrecoUnitario() {
        return adicionais.stream()
                .map(Adicional::getPreco)
                .reduce(produto.getPreco(), BigDecimal::add);
    }

    public BigDecimal getSubtotal() {
        return getPrecoUnitario().multiply(BigDecimal.valueOf(quantidade));
    }
}
