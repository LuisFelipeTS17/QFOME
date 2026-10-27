package com.qfome.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qfome.model.Usuario;
import com.qfome.model.enums.Perfil;
import com.qfome.repository.UsuarioRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String nome  = body.get("name");
        String email = body.get("email");
        String senha = body.get("password");

        if (nome == null || nome.isBlank() || email == null || email.isBlank() || senha == null || senha.isBlank()) {
            return ResponseEntity.badRequest().body("Nome, e-mail e senha sao obrigatorios");
        }

        String emailNormalizado = email.trim().toLowerCase();

        if (usuarioRepository.existsByEmail(emailNormalizado)) {
            return ResponseEntity.status(409).body("E-mail ja cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(nome.trim())
                .email(emailNormalizado)
                .senha(senha)
                .perfil(Perfil.CLIENTE)
                .build();

        return ResponseEntity.ok(resposta(usuarioRepository.save(usuario), "Conta criada com sucesso"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("password");

        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            return ResponseEntity.badRequest().body("E-mail e senha sao obrigatorios");
        }

        return usuarioRepository.findByEmail(email.trim().toLowerCase())
                .filter(u -> u.getSenha().equals(senha))
                .map(u -> ResponseEntity.ok((Object) resposta(u, "Login realizado com sucesso")))
                .orElseGet(() -> ResponseEntity.status(401).body("Usuario ou senha invalidos"));
    }

    // Chaves "name"/"email" mantidas para o site, que ja consome esse formato.
    private static Map<String, Object> resposta(Usuario usuario, String mensagem) {
        return Map.of(
                "id",      usuario.getId(),
                "name",    usuario.getNome(),
                "email",   usuario.getEmail(),
                "perfil",  usuario.getPerfil().name(),
                "message", mensagem
        );
    }
}
