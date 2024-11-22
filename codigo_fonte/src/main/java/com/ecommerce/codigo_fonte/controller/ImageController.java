package com.ecommerce.codigo_fonte.controller;

import com.ecommerce.codigo_fonte.model.Image;
import com.ecommerce.codigo_fonte.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/imagens")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ImageController {

    @Autowired
    private ImageService imageService;

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<Image>> buscarImagensPorProdutoId(@PathVariable Long produtoId) {
        List<Image> imagens = imageService.buscarImagensPorProdutoId(produtoId);
        if (imagens.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(imagens);
    }
}