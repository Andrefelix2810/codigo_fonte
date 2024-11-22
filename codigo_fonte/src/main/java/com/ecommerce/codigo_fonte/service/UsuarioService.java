package com.ecommerce.codigo_fonte.service;

import java.util.List;
//import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.codigo_fonte.model.Usuario;
import com.ecommerce.codigo_fonte.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Busca um usuário pelo email
    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    // Valida a senha digitada com a senha armazenada
    public boolean validarSenha(String senhaDigitada, String senhaArmazenada) {
        return passwordEncoder.matches(senhaDigitada, senhaArmazenada);
    }

    // Salva um usuário com a senha criptografada
    public Usuario salvarSenhaUsuario(Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    // Lista todos os usuários
    public List<Usuario> listarTodosUsuarios() {
        return usuarioRepository.findAll();
    }

    // Busca um usuário pelo ID
    public Usuario buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    // Salva um usuário
    public Usuario salvarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // Busca um usuário pelo email
    public Usuario buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    // Verifica se um email já está cadastrado
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    // Valida o CPF com cálculo dos dígitos verificadores
    public boolean validarCPF(String cpf) {
        // Remove quaisquer caracteres não numéricos
        cpf = cpf.replaceAll("[^\\d]", "");
    
        // Verifica se o CPF tem 11 dígitos e se todos os dígitos não são iguais
        if (cpf.length() != 11 || cpf.matches("(\\d)\\1{10}")) {
            return false;
        }
    
        // Calcula o primeiro dígito verificador
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        int firstDigit = 11 - (sum % 11);
        if (firstDigit >= 10) {
            firstDigit = 0;
        }
    
        // Calcula o segundo dígito verificador
        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        int secondDigit = 11 - (sum % 11);
        if (secondDigit >= 10) {
            secondDigit = 0;
        }
    
        // Verifica se os dígitos calculados são iguais aos dígitos do CPF
        return cpf.charAt(9) == Character.forDigit(firstDigit, 10) &&
               cpf.charAt(10) == Character.forDigit(secondDigit, 10);
    

        // Verifica se o CPF já está cadastrado no banco de dados
        
    }
}
