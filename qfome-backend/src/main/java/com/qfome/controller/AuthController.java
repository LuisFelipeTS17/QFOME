package com.qfome.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private Map<String, Map<String, String>> users = new HashMap<>();

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Map<String, String> credentials) {
    String email = credentials.get("email");
    String password = credentials.get("password");
    String name = credentials.get("name");

    if (email == null || password == null || name == null) {
      return ResponseEntity.badRequest().body("Email, senha e nome são obrigatórios");
    }
    if (users.containsKey(email)) {
      return ResponseEntity.status(409).body("Usuário já cadastrado");
    }
    Map<String, String> userData = new HashMap<>();
    userData.put("password", password);
    userData.put("name", name);
    users.put(email, userData);
    Map<String, Object> user = new HashMap<>();
    user.put("email", email);
    user.put("name", name);
    user.put("message", "Usuário registrado com sucesso");
    return ResponseEntity.ok(user);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
    String email = credentials.get("email");
    String password = credentials.get("password");

    if (email == null || password == null) {
      return ResponseEntity.badRequest().body("Email e senha são obrigatórios");
    }
    if (users.containsKey(email)) {
      Map<String, String> userData = users.get(email);
      if (userData.get("password").equals(password)) {
        Map<String, Object> user = new HashMap<>();
        user.put("email", email);
        user.put("name", userData.get("name"));
        user.put("message", "Login realizado com sucesso");
        return ResponseEntity.ok(user);
      }
    }
    return ResponseEntity.status(401).body("Usuário ou senha inválidos");
  }
}
