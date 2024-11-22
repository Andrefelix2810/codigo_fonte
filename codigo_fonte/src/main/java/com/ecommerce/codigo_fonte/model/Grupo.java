package com.ecommerce.codigo_fonte.model;

import jakarta.persistence.*;
 
@Entity
public class Grupo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private String nome;
 
    // Getters
    public Long getId() {
        return id;
    }
 
    public String getNome() {
        return nome;
    }
 
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
 
    public void setNome(String nome) {
        this.nome = nome;
    }
}
