package com.ecommerce.codigo_fonte.controller;

import com.ecommerce.codigo_fonte.model.ItemPedido;
import com.ecommerce.codigo_fonte.model.Pedido;
import com.ecommerce.codigo_fonte.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedido")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/concluir")
    public Pedido concluirPedido(@RequestBody Pedido pedido, @RequestParam Long clienteId) {
        List<ItemPedido> itens = pedido.getItens();
        return pedidoService.criarPedido(pedido.getValorTotal(), itens, clienteId, pedido.getEnderecoEntrega(), pedido.getFormaPagamento());
    }

    @GetMapping("/listarPorCliente")
    public ResponseEntity<List<Pedido>> listarPedidosPorCliente(@RequestParam Long clienteId) {
        List<Pedido> pedidos = pedidoService.listarPedidosPorCliente(clienteId);
        return ResponseEntity.ok(pedidos);
    }
    @GetMapping("/listarTodos")
    public List<Pedido> listarTodos() {
        return pedidoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPedidoPorId(@PathVariable Long id) {
        Pedido pedido = pedidoService.buscarPedidoPorId(id);
        return ResponseEntity.ok(pedido);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> atualizarStatusPedido(@PathVariable Long id, @RequestBody Pedido pedidoAtualizado) {
        Pedido pedido = pedidoService.buscarPedidoPorId(id);
        pedido.setStatus(pedidoAtualizado.getStatus());
        Pedido pedidoSalvo = pedidoService.salvarPedido(pedido);
        return ResponseEntity.ok(pedidoSalvo);
    }
}