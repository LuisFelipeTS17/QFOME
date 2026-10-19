package com.qfome.model;

import java.io.Serializable;
import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "item_pedido_adicional")
@Getter
@Setter
@NoArgsConstructor
public class ItemPedidoAdicional {

    @EmbeddedId
    private Chave id = new Chave();

    @MapsId("itemPedidoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_pedido_id")
    private ItemPedido itemPedido;

    @MapsId("adicionalId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adicional_id")
    private Adicional adicional;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    public ItemPedidoAdicional(ItemPedido itemPedido, Adicional adicional) {
        this.itemPedido = itemPedido;
        this.adicional = adicional;
        this.preco = adicional.getPreco();
    }

    /** Chave composta (item_pedido_id, adicional_id). */
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class Chave implements Serializable {
        private Long itemPedidoId;
        private Long adicionalId;
    }
}
