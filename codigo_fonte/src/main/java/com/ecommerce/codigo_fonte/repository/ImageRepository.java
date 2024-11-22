package com.ecommerce.codigo_fonte.repository;

import com.ecommerce.codigo_fonte.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByProdutoId(Long produtoId);
}