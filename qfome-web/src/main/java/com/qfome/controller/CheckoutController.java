package com.qfome.controller;

import com.qfome.dto.CheckoutDTO;
import com.qfome.model.Order;
import com.qfome.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/checkout")
@CrossOrigin(origins = "*") 
public class CheckoutController {

    @Autowired
    private OrderRepository orderRepository;

    // TASK 1: POST /checkout (fecha pedido)
    @PostMapping
    public Order finalizeOrder(@RequestBody CheckoutDTO dto) {
        Order order = new Order();
        
        // TASK 2: Gerar código tipo QF-123456
        String timestamp = String.valueOf(System.currentTimeMillis());
        String orderCode = "QF-" + timestamp.substring(timestamp.length() - 6);
        
        order.setCode(orderCode);
        order.setCustomerName(dto.getFullName());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("recebido");

        return orderRepository.save(order);
    }
}