package com.ecommerce.codigo_fonte.repository;

import com.ecommerce.codigo_fonte.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
    List<Endereco> findByClienteId(Long clienteId);
}