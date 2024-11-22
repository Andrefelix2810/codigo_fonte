package com.ecommerce.codigo_fonte.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.codigo_fonte.model.Usuario;
import com.ecommerce.codigo_fonte.service.UsuarioService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class UsuarioController {
    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<Usuario> cadastrar(@RequestBody Usuario usuario) {
        try {
            logger.info("Tentando cadastrar usuário: {}", usuario.getEmail());

            // Verificar se o email já está cadastrado
            if (usuarioService.existsByEmail(usuario.getEmail())) {
                return ResponseEntity.status(400).body(null);
            }

            // Validar CPF e verificar se já está cadastrado
            if (!usuarioService.validarCPF(usuario.getCpf())) {
                return ResponseEntity.status(400).body(null);
            }

            // Criptografar a senha antes de salvar
            usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
            usuario.setStatus("Ativo"); // Definir status como ativo

            Usuario usuarioSalvo = usuarioService.salvarUsuario(usuario);
            logger.info("Usuário cadastrado com sucesso: {}", usuario.getEmail());
            return ResponseEntity.ok(usuarioSalvo);
        } catch (Exception e) {
            logger.error("Erro ao cadastrar usuário", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios = usuarioService.listarTodosUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarUsuarioPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody Usuario usuario, HttpSession session) {
        Usuario usuarioEncontrado = usuarioService.buscarUsuarioPorEmail(usuario.getEmail());
        if (usuarioEncontrado == null || !passwordEncoder.matches(usuario.getSenha(), usuarioEncontrado.getSenha())) {
            return ResponseEntity.status(401).body(null);
        }
        session.setAttribute("usuario", usuarioEncontrado);
        
        // Log para verificar o campo "grupo"
        logger.info("Usuário logado: {}", usuarioEncontrado);
        
        return ResponseEntity.ok(usuarioEncontrado);
    }

    @GetMapping("/sessao")
    public ResponseEntity<Usuario> getSessaoUsuario(HttpSession session) {
        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");
        if (usuarioLogado == null) {
            return ResponseEntity.status(401).body(null);
        }
        return ResponseEntity.ok(usuarioLogado);
    }

    @PutMapping("/{id}/alterarStatus")
    public ResponseEntity<Void> alterarStatus(@PathVariable Long id, @RequestBody Usuario usuario) {
        Usuario usuarioExistente = usuarioService.buscarUsuarioPorId(id);
        if (usuarioExistente == null) {
            return ResponseEntity.notFound().build();
        }
        usuarioExistente.setStatus(usuario.getStatus());
        usuarioService.salvarUsuario(usuarioExistente);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
public ResponseEntity<Usuario> atualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioAtualizado, HttpSession session) {
    Usuario usuarioExistente = usuarioService.buscarUsuarioPorId(id);

    if (usuarioExistente == null) {
        return ResponseEntity.notFound().build();
    }

    // Verificar se o usuário logado está tentando alterar seu próprio grupo
    Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");
    if (usuarioLogado != null && usuarioLogado.getId().equals(id) && !usuarioLogado.getGrupo().equals(usuarioAtualizado.getGrupo())) {
        return ResponseEntity.status(403).build();
    }

    // Alterar nome se não for nulo ou vazio
    if (usuarioAtualizado.getNome() != null && !usuarioAtualizado.getNome().isEmpty()) {
        usuarioExistente.setNome(usuarioAtualizado.getNome());
    }

    // Alterar CPF, verificando se já está cadastrado e se não for nulo ou vazio
    if (usuarioAtualizado.getCpf() != null && !usuarioAtualizado.getCpf().isEmpty() && 
        !usuarioExistente.getCpf().equals(usuarioAtualizado.getCpf())) {
        if (usuarioService.validarCPF(usuarioAtualizado.getCpf())) {
            usuarioExistente.setCpf(usuarioAtualizado.getCpf());
        } else {
            return ResponseEntity.status(400).body(null); // CPF inválido
        }
    }

    // Verificar se a senha foi alterada e se não for nula ou vazia
    if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isEmpty()) {
        if (usuarioAtualizado.getSenha().equals(usuarioAtualizado.getSenhaConfirmacao())) {
            usuarioExistente.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
        } else {
            return ResponseEntity.status(400).body(null); // Senhas não conferem
        }
    }

    // Alterar grupo, se permitido e se não for nulo ou vazio
    if (usuarioAtualizado.getGrupo() != null && !usuarioAtualizado.getGrupo().isEmpty()) {
        usuarioExistente.setGrupo(usuarioAtualizado.getGrupo());
    }

    // Salvar alterações
    usuarioService.salvarUsuario(usuarioExistente);

    return ResponseEntity.ok(usuarioExistente);
}
}   
