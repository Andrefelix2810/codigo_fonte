package com.ecommerce.codigo_fonte.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Data
@Entity
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String cpf;
    @Column(name = "data_nascimento")
    private Date dataNascimento;
    private String genero;
    private String senha;

    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String uf;

    @Column(name = "endereco_faturamento")
    private boolean enderecoFaturamento;

    @Column(name = "endereco_entrega")
    private boolean enderecoEntrega;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cliente_id")
    @JsonManagedReference
    private List<Endereco> enderecosEntrega = new ArrayList<>();

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Pedido> pedidos = new ArrayList<>();

    public String getSenha() {
        return senha;
    }

    public String getNome() {
        return nome;
    }
}