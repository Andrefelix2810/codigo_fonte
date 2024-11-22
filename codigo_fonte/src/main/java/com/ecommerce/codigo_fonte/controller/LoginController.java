package com.ecommerce.codigo_fonte.controller;

import com.ecommerce.codigo_fonte.model.Cliente;
import com.ecommerce.codigo_fonte.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private ClienteService clienteService;

    @PostMapping
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String senha = loginData.get("senha");

        Cliente cliente = clienteService.findByEmail(email);
        if (cliente != null && clienteService.checkPassword(cliente, senha)) {
            String token = clienteService.generateToken(cliente);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", cliente.getId()); // Adiciona o ID do cliente na resposta
            response.put("nome", cliente.getNome());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Credenciais inválidas.");
        }
    }
}