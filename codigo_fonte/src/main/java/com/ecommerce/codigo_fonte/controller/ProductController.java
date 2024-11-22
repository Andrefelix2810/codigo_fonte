package com.ecommerce.codigo_fonte.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ecommerce.codigo_fonte.model.Image;
import com.ecommerce.codigo_fonte.model.Product;
import com.ecommerce.codigo_fonte.service.ProductService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/produtos")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ProductController {
    private static String caminhoImagens = "C:\\Users\\andre\\OneDrive\\Documentos\\imagens\\";
    private static final Logger logger = Logger.getLogger(ProductController.class.getName());

    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<Product> cadastrar(
        @RequestParam("nome") String nome,
        @RequestParam("avaliacao") double avaliacao,
        @RequestParam("descricaoDetalhada") String descricaoDetalhada,
        @RequestParam("preco") double preco,
        @RequestParam("qtdEstoque") int qtdEstoque,
        @RequestPart("imagens") MultipartFile[] imagens,
        @RequestParam("imagemPrincipal") int imagemPrincipalIndex) {
    
        try {
            // Verificar se o índice da imagem principal está dentro do intervalo
            if (imagemPrincipalIndex < 0 || imagemPrincipalIndex >= imagens.length) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            Product product = new Product();
            product.setNome(nome);
            product.setAvaliacao(avaliacao);
            product.setDescricaoDetalhada(descricaoDetalhada);
            product.setPreco(preco);
            product.setQtdEstoque(qtdEstoque);
    
            List<Image> listaImagens = new ArrayList<>();
    
            for (int i = 0; i < imagens.length; i++) {
                MultipartFile imagem = imagens[i];
                if (!imagem.isEmpty()) {
                    String novoNome = System.currentTimeMillis() + "_" + imagem.getOriginalFilename();
                    Path caminhoArquivo = Paths.get(caminhoImagens + novoNome);
                    Files.createDirectories(caminhoArquivo.getParent());
                    Files.write(caminhoArquivo, imagem.getBytes());
    
                    Image img = new Image();
                    img.setCaminho(caminhoArquivo.toString());
                    img.setPrincipal(i == imagemPrincipalIndex);
                    img.setProduto(product);
                    listaImagens.add(img);
                }
            }
    
            product.setImagens(listaImagens);
            Product produtoSalvo = productService.salvarProduto(product);
    
            return ResponseEntity.status(HttpStatus.CREATED).body(produtoSalvo);
        } catch (IOException e) {
            logger.severe("Erro ao salvar a imagem: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Product>> listarProdutos() {
        logger.info("Chamando listarProdutos");
        List<Product> produtos = productService.listarTodosProdutos();
        logger.info("Produtos encontrados: " + produtos.size());
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/listarPaginado")
    public ResponseEntity<Page<Product>> listarProdutosPaginados(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        Page<Product> produtos = productService.listarProdutosPaginados(page, size);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<Product>> buscarProdutosPorNome(
        @RequestParam String nome,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        Page<Product> produtos = productService.buscarProdutosPorNome(nome, page, size);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/ativos")
    public ResponseEntity<Page<Product>> buscarProdutosAtivos(
        @RequestParam String nome,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        Page<Product> produtos = productService.buscarProdutosAtivosPorNome(nome, page, size);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> buscarProdutoPorId(@PathVariable Long id) {
        Product product = productService.buscarProdutoPorId(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}/alterarStatus")
    public ResponseEntity<Void> alterarStatus(@PathVariable Long id, @RequestBody Product produto) {
        Product produtoExistente = productService.buscarProdutoPorId(id);
        if (produtoExistente == null) {
            return ResponseEntity.notFound().build();
        }
        produtoExistente.setAtivo(produto.isAtivo());
        productService.salvarProduto(produtoExistente);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> atualizarProduto(
        @PathVariable Long id,
        @RequestParam("nome") String nome,
        @RequestParam("avaliacao") double avaliacao,
        @RequestParam("descricaoDetalhada") String descricaoDetalhada,
        @RequestParam("preco") double preco,
        @RequestParam("qtdEstoque") int qtdEstoque,
        @RequestParam("ativo") boolean ativo,
        @RequestPart("imagens") MultipartFile[] imagens,
        @RequestParam("imagemPrincipal") int imagemPrincipalIndex) {
        
        Product produtoExistente = productService.buscarProdutoPorId(id);

        if (produtoExistente == null) {
            return ResponseEntity.notFound().build();
        }

        // Verificar se o índice da imagem principal está dentro do intervalo
        if (imagemPrincipalIndex < 0 || imagemPrincipalIndex >= imagens.length) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        // Alterar nome
        produtoExistente.setNome(nome);

        // Alterar avaliação
        produtoExistente.setAvaliacao(avaliacao);

        // Alterar descrição detalhada
        produtoExistente.setDescricaoDetalhada(descricaoDetalhada);

        // Alterar preço
        produtoExistente.setPreco(preco);

        // Alterar quantidade em estoque
        produtoExistente.setQtdEstoque(qtdEstoque);

        // Alterar status ativo/inativo
        produtoExistente.setAtivo(ativo);

        // Atualizar imagens
        List<Image> listaImagens = produtoExistente.getImagens();
        listaImagens.clear();
        for (int i = 0; i < imagens.length; i++) {
            MultipartFile imagem = imagens[i];
            if (!imagem.isEmpty()) {
                try {
                    String novoNome = System.currentTimeMillis() + "_" + imagem.getOriginalFilename();
                    Path caminhoArquivo = Paths.get(caminhoImagens + novoNome);
                    Files.createDirectories(caminhoArquivo.getParent());
                    Files.write(caminhoArquivo, imagem.getBytes());

                    Image img = new Image();
                    img.setCaminho(caminhoArquivo.toString());
                    img.setPrincipal(i == imagemPrincipalIndex);
                    img.setProduto(produtoExistente);
                    listaImagens.add(img);
                } catch (IOException e) {
                    logger.severe("Erro ao salvar a imagem: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
                }
            }
        }
        produtoExistente.setImagens(listaImagens);

        // Salvar alterações
        Product produtoAtualizadoSalvo = productService.salvarProduto(produtoExistente);

        return ResponseEntity.ok(produtoAtualizadoSalvo);
    }
}