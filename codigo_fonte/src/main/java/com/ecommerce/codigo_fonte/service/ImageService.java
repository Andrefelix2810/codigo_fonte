package com.ecommerce.codigo_fonte.service;

import com.ecommerce.codigo_fonte.model.Image;
import com.ecommerce.codigo_fonte.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImageService {

    @Autowired
    private ImageRepository imageRepository;

    public List<Image> buscarImagensPorProdutoId(Long produtoId) {
        return imageRepository.findByProdutoId(produtoId);
    }
}