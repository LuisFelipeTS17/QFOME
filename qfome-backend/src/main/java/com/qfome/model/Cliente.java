package com.qfome.model;

import java.util.ArrayList;
import java.util.List;

import com.qfome.model.enums.TipoUsuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String nome;

    @Email
    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String senha;

    @Size(max = 20)
    @Column(length = 20)
    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoUsuario tipo;

    @OneToMany(mappedBy = "cliente")
    @Builder.Default
    private List<Pedido> pedidos = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (tipo == null) {
            tipo = TipoUsuario.CLIENTE;
        }
    }
}
