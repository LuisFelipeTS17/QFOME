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

import com.qfome.dto.AdicionarItemDTO;
import com.qfome.dto.CarrinhoDTO;
import com.qfome.service.CarrinhoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/carrinho")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    @GetMapping("/{clienteId}")
    public ResponseEntity<CarrinhoDTO> buscar(@PathVariable Long clienteId) {
        return ResponseEntity.ok(carrinhoService.buscar(clienteId));
    }

    @PostMapping("/{clienteId}/itens")
    public ResponseEntity<CarrinhoDTO> adicionarItem(
            @PathVariable Long clienteId,
            @Valid @RequestBody AdicionarItemDTO dto
    ) {
        return ResponseEntity.ok(carrinhoService.adicionarItem(clienteId, dto));
    }

    @PatchMapping("/{clienteId}/itens/{itemId}")
    public ResponseEntity<CarrinhoDTO> atualizarItem(
            @PathVariable Long clienteId,
            @PathVariable Long itemId,
            @RequestParam Integer quantidade
    ) {
        return ResponseEntity.ok(carrinhoService.atualizarItem(clienteId, itemId, quantidade));
    }

    @DeleteMapping("/{clienteId}/itens/{itemId}")
    public ResponseEntity<CarrinhoDTO> removerItem(
            @PathVariable Long clienteId,
            @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(carrinhoService.removerItem(clienteId, itemId));
    }

    @DeleteMapping("/{clienteId}/limpar")
    public ResponseEntity<Void> limpar(@PathVariable Long clienteId) {
        carrinhoService.limpar(clienteId);
        return ResponseEntity.noContent().build();
    }
}
