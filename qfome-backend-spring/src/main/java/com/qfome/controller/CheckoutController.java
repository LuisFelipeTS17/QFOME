package com.qfome.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qfome.dto.pedido.CheckoutRequestDTO;
import com.qfome.dto.pedido.PedidoDTO;
import com.qfome.service.pedido.CheckoutService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<PedidoDTO> fecharPedido(@Valid @RequestBody CheckoutRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(checkoutService.fecharPedido(request));
    }
}
