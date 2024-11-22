package com.ecommerce.codigo_fonte.service;

import com.ecommerce.codigo_fonte.model.Pedido;
import com.ecommerce.codigo_fonte.model.Cliente;
import com.ecommerce.codigo_fonte.model.ItemPedido;
import com.ecommerce.codigo_fonte.model.Endereco;
import com.ecommerce.codigo_fonte.repository.ClienteRepository;
import com.ecommerce.codigo_fonte.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public Pedido criarPedido(BigDecimal valorTotal, List<ItemPedido> itens, Long clienteId, Endereco enderecoEntrega, String formaPagamento) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));
        Pedido pedido = new Pedido();
        pedido.setNumeroPedido(UUID.randomUUID().toString());
        pedido.setValorTotal(valorTotal);
        pedido.setStatus("aguardando pagamento");
        pedido.setCliente(cliente);
        pedido.setEnderecoEntrega(enderecoEntrega);
        pedido.setFormaPagamento(formaPagamento);
        pedido.setDataCriacao(new Date());
        pedido.setItens(itens);
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> listarPedidosPorCliente(Long clienteId) {
        return pedidoRepository.findByClienteId(clienteId);
    }

    public Pedido buscarPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));
    }

    public Pedido salvarPedido(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }
    public List<Pedido> listarTodos() {
        // Lógica para listar todos os pedidos
        // Por exemplo, buscar todos os pedidos do banco de dados
        return pedidoRepository.findAll();
    }
}