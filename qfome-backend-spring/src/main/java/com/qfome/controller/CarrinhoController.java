package com.qfome.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.qfome.dto.CarrinhoDTO;
import com.qfome.dto.ItemRequestDTO;
import com.qfome.service.CarrinhoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/carrinho")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<CarrinhoDTO> buscar(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(carrinhoService.buscar(usuarioId));
    }

    @PostMapping("/{usuarioId}/itens")
    public ResponseEntity<CarrinhoDTO> adicionarItem(
            @PathVariable Long usuarioId,
            @Valid @RequestBody ItemRequestDTO dto
    ) {
        return ResponseEntity.ok(carrinhoService.adicionarItem(usuarioId, dto));
    }

    @PatchMapping("/{usuarioId}/itens/{itemId}")
    public ResponseEntity<CarrinhoDTO> atualizarItem(
            @PathVariable Long usuarioId,
            @PathVariable Long itemId,
            @RequestParam Integer quantidade
    ) {
        return ResponseEntity.ok(carrinhoService.atualizarItem(usuarioId, itemId, quantidade));
    }

    @DeleteMapping("/{usuarioId}/itens/{itemId}")
    public ResponseEntity<CarrinhoDTO> removerItem(
            @PathVariable Long usuarioId,
            @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(carrinhoService.removerItem(usuarioId, itemId));
    }

    @DeleteMapping("/{usuarioId}/limpar")
    public ResponseEntity<Void> limpar(@PathVariable Long usuarioId) {
        carrinhoService.limpar(usuarioId);
        return ResponseEntity.noContent().build();
    }
}
