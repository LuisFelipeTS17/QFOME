package com.qfome.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private String status;
    private LocalDateTime data;

    @ManyToOne
    private Cliente cliente;

}