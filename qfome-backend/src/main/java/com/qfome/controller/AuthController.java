package com.qfome.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qfome.model.Cliente;
import com.qfome.model.enums.TipoUsuario;
import com.qfome.repository.ClienteRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final ClienteRepository clienteRepository;

    public AuthController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String nome  = body.get("name");
        String email = body.get("email");
        String senha = body.get("password");
        String telefone = body.get("phone");

        if (nome == null || nome.isBlank() || email == null || email.isBlank() || senha == null || senha.isBlank()) {
            return ResponseEntity.badRequest().body("Nome, e-mail e senha sao obrigatorios");
        }

        String emailNormalizado = email.trim().toLowerCase();

        if (clienteRepository.existsByEmail(emailNormalizado)) {
            return ResponseEntity.status(409).body("E-mail ja cadastrado");
        }

        Cliente cliente = Cliente.builder()
                .nome(nome.trim())
                .email(emailNormalizado)
                .senha(senha)
                .telefone(telefone != null ? telefone.trim() : null)
                .tipo(TipoUsuario.CLIENTE)
                .build();

        Cliente salvo = clienteRepository.save(cliente);

        return ResponseEntity.ok(Map.of(
                "id",      salvo.getId(),
                "name",    salvo.getNome(),
                "email",   salvo.getEmail(),
                "message", "Conta criada com sucesso"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("password");

        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            return ResponseEntity.badRequest().body("E-mail e senha sao obrigatorios");
        }

        return clienteRepository.findByEmail(email.trim().toLowerCase())
                .filter(c -> c.getSenha().equals(senha))
                .map(c -> ResponseEntity.ok((Object) Map.of(
                        "id",      c.getId(),
                        "name",    c.getNome(),
                        "email",   c.getEmail(),
                        "message", "Login realizado com sucesso"
                )))
                .orElseGet(() -> ResponseEntity.status(401).body("Usuario ou senha invalidos"));
    }
}
