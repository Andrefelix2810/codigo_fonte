package com.ecommerce.codigo_fonte.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ecommerce.codigo_fonte.model.Product;
import com.ecommerce.codigo_fonte.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> listarTodosProdutos() {
        return productRepository.findAll();
    }

    public Product buscarProdutoPorId(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product salvarProduto(Product product) {
        return productRepository.save(product);
    }

    public Product buscarUltimoProduto() {
        List<Product> produtos = productRepository.findAll();
        if (produtos.isEmpty()) {
            return null;
        }
        return produtos.get(produtos.size() - 1);
    }

    public Page<Product> listarProdutosPaginados(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findAllByOrderByIdDesc(pageable);
    }

    public Page<Product> buscarProdutosPorNome(String nome, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    public Page<Product> buscarProdutosAtivosPorNome(String nome, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByNomeContainingIgnoreCaseAndAtivoTrue(nome, pageable);
    }
}