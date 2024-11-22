package com.ecommerce.codigo_fonte.repository;

import org.springframework.data.jpa.repository.JpaRepository;
 
import com.ecommerce.codigo_fonte.model.Usuario;
 
 
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario  findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
}   