package com.ecommerce.codigo_fonte.controller;

import com.ecommerce.codigo_fonte.model.Cliente;
import com.ecommerce.codigo_fonte.model.Endereco;
import com.ecommerce.codigo_fonte.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/cliente")
public class ClienteController {

    private static final Logger logger = Logger.getLogger(ClienteController.class.getName());

    @Autowired
    private ClienteService clienteService;

    @PostMapping
    public ResponseEntity<?> cadastrarCliente(@RequestBody Cliente cliente) {
        try {
            clienteService.cadastrarCliente(cliente);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cadastro realizado com sucesso! Redirecionando para a tela de login...");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getClienteById(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.findById(id);
            if (cliente == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            logger.severe("Erro ao obter cliente por ID: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarCliente(@PathVariable Long id, @RequestBody Cliente cliente) {
        try {
            Cliente clienteAtualizado = clienteService.atualizarCliente(cliente, id);
            return ResponseEntity.ok(clienteAtualizado);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.severe("Erro ao atualizar cliente: " + e.getMessage());
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }

    @GetMapping("/{clienteId}/enderecos")
    public ResponseEntity<List<Endereco>> listarEnderecos(@PathVariable Long clienteId) {
        try {
            List<Endereco> enderecos = clienteService.listarEnderecos(clienteId);
            return ResponseEntity.ok(enderecos);
        } catch (Exception e) {
            logger.severe("Erro ao listar endereços: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/endereco")
    public ResponseEntity<?> adicionarEndereco(@RequestBody Endereco endereco) {
        try {
            clienteService.adicionarEndereco(endereco);
            return ResponseEntity.ok("Endereço adicionado com sucesso!");
        } catch (Exception e) {
            logger.severe("Erro ao adicionar endereço: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
