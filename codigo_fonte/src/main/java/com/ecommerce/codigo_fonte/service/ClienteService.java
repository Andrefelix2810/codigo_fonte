package com.ecommerce.codigo_fonte.service;

import com.ecommerce.codigo_fonte.model.Cliente;
import com.ecommerce.codigo_fonte.model.Endereco;
import com.ecommerce.codigo_fonte.repository.ClienteRepository;
import com.ecommerce.codigo_fonte.repository.EnderecoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class ClienteService {

    private static final Logger logger = Logger.getLogger(ClienteService.class.getName());

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Cliente cadastrarCliente(Cliente cliente) {
        validarCliente(cliente);
        cliente.setSenha(passwordEncoder.encode(cliente.getSenha()));

        // Verificação adicional para garantir que o campo cidade não está nulo
        if (cliente.getCidade() == null || cliente.getCidade().isEmpty()) {
            throw new IllegalArgumentException("Cidade não pode ser nula.");
        }

        return clienteRepository.save(cliente);
    }

    public Cliente findByEmail(String email) {
        return clienteRepository.findByEmail(email).orElse(null);
    }

    public Cliente findById(Long id) {
        try {
            return clienteRepository.findById(id).orElse(null);
        } catch (Exception e) {
            logger.severe("Erro ao encontrar cliente por ID: " + e.getMessage());
            throw e;
        }
    }

    public boolean checkPassword(Cliente cliente, String senha) {
        return passwordEncoder.matches(senha, cliente.getSenha());
    }

    public String generateToken(Cliente cliente) {
        // Implementação da geração de token
        // Placeholder para a lógica de geração de token
        return "token-gerado"; // Substitua por uma lógica real de geração de token
    }

    public Cliente atualizarCliente(Cliente cliente, Long id) {
        Cliente clienteExistente = findById(id);
        if (clienteExistente == null) {
            throw new IllegalArgumentException("Cliente não encontrado.");
        }

        // Atualizar os dados do cliente existente com os novos dados
        clienteExistente.setNome(cliente.getNome());
        clienteExistente.setEmail(cliente.getEmail());
        clienteExistente.setCpf(cliente.getCpf());
        clienteExistente.setDataNascimento(cliente.getDataNascimento());
        clienteExistente.setGenero(cliente.getGenero());
        clienteExistente.setCep(cliente.getCep());
        clienteExistente.setLogradouro(cliente.getLogradouro());
        clienteExistente.setNumero(cliente.getNumero());
        clienteExistente.setComplemento(cliente.getComplemento());
        clienteExistente.setBairro(cliente.getBairro());
        clienteExistente.setCidade(cliente.getCidade());
        clienteExistente.setUf(cliente.getUf());

        // Atualizar a senha se fornecida
        if (cliente.getSenha() != null && !cliente.getSenha().isEmpty()) {
            clienteExistente.setSenha(passwordEncoder.encode(cliente.getSenha()));
        }

        // Atualizar endereços de entrega
        clienteExistente.getEnderecosEntrega().clear();
        for (Endereco endereco : cliente.getEnderecosEntrega()) {
            endereco.setCliente(clienteExistente); // Associar o cliente existente ao endereço
            clienteExistente.getEnderecosEntrega().add(endereco);
        }

        return clienteRepository.save(clienteExistente);
    }

    private void validarCliente(Cliente cliente) {
        // Validação de email único
        Optional<Cliente> clienteExistente = clienteRepository.findByEmail(cliente.getEmail());
        if (clienteExistente.isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        // Validação de CPF único
        clienteExistente = clienteRepository.findByCpf(cliente.getCpf());
        if (clienteExistente.isPresent()) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }

        // Validação de CPF
        if (!isValidCPF(cliente.getCpf())) {
            throw new IllegalArgumentException("CPF inválido.");
        }

        // Validação de nome
        if (!cliente.getNome().matches("^([a-zA-Z]{3,}\\s+){1,}[a-zA-Z]{3,}$")) {
            throw new IllegalArgumentException("Nome deve conter pelo menos duas palavras com no mínimo 3 letras cada.");
        }

        // Validação de dados pessoais
        validarDadosPessoais(cliente);

        // Validação de CEP e preenchimento do endereço
        validarCep(cliente);

        // Validação de endereço de faturamento
        validarEnderecoFaturamento(cliente);

        // Copiar endereço de faturamento para entrega, se necessário
        copiarEnderecoFaturamentoParaEntrega(cliente);
    }

    private boolean isValidCPF(String cpf) {
        if (cpf == null || cpf.length() != 11 || !cpf.matches("\\d{11}")) {
            return false;
        }

        int[] weights = {10, 9, 8, 7, 6, 5, 4, 3, 2};
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += (cpf.charAt(i) - '0') * weights[i];
        }

        int firstDigit = 11 - (sum % 11);
        if (firstDigit >= 10) {
            firstDigit = 0;
        }

        sum = 0;
        int[] weights2 = {11, 10, 9, 8, 7, 6, 5, 4, 3, 2};
        for (int i = 0; i < 10; i++) {
            sum += (cpf.charAt(i) - '0') * weights2[i];
        }

        int secondDigit = 11 - (sum % 11);
        if (secondDigit >= 10) {
            secondDigit = 0;
        }

        return cpf.charAt(9) - '0' == firstDigit && cpf.charAt(10) - '0' == secondDigit;
    }

    private void validarDadosPessoais(Cliente cliente) {
        if (cliente.getNome() == null || cliente.getNome().isEmpty() ||
            cliente.getDataNascimento() == null ||
            cliente.getGenero() == null || cliente.getGenero().isEmpty()) {
            throw new IllegalArgumentException("Dados pessoais incompletos.");
        }
    }

    private void validarEnderecoFaturamento(Cliente cliente) {
        if (cliente.getCep() == null || cliente.getCep().isEmpty() ||
            cliente.getLogradouro() == null || cliente.getLogradouro().isEmpty() ||
            cliente.getNumero() == null || cliente.getNumero().isEmpty() ||
            cliente.getBairro() == null || cliente.getBairro().isEmpty() ||
            cliente.getCidade() == null || cliente.getCidade().isEmpty() ||
            cliente.getUf() == null || cliente.getUf().isEmpty()) {
            throw new IllegalArgumentException("Endereço de faturamento incompleto.");
        }
    }

    @SuppressWarnings("unchecked")
    private void validarCep(Cliente cliente) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://viacep.com.br/ws/" + cliente.getCep() + "/json/";
        Map<String, String> endereco = restTemplate.getForObject(url, Map.class);
        if (endereco == null || endereco.get("cep") == null) {
            throw new IllegalArgumentException("CEP inválido.");
        }
        cliente.setLogradouro(endereco.get("logradouro"));
        cliente.setBairro(endereco.get("bairro"));
        cliente.setCidade(endereco.get("localidade")); // Usando o campo correto para cidade
        cliente.setUf(endereco.get("uf"));

        // Adicionando logs para verificar o preenchimento dos campos de endereço
        System.out.println("Logradouro: " + cliente.getLogradouro());
        System.out.println("Bairro: " + cliente.getBairro());
        System.out.println("Cidade: " + cliente.getCidade());
        System.out.println("UF: " + cliente.getUf());

        // Verificação adicional para garantir que os campos de endereço não estão nulos
        if (cliente.getLogradouro() == null || cliente.getLogradouro().isEmpty() ||
            cliente.getBairro() == null || cliente.getBairro().isEmpty() ||
            cliente.getCidade() == null || cliente.getCidade().isEmpty() ||
            cliente.getUf() == null || cliente.getUf().isEmpty()) {
            throw new IllegalArgumentException("Todos os campos de endereço são obrigatórios. Verifique o CEP informado.");
        }
    }

    private void copiarEnderecoFaturamentoParaEntrega(Cliente cliente) {
        if (cliente.isEnderecoEntrega()) {
            Endereco enderecoEntrega = new Endereco();
            enderecoEntrega.setCep(cliente.getCep());
            enderecoEntrega.setLogradouro(cliente.getLogradouro());
            enderecoEntrega.setNumero(cliente.getNumero());
            enderecoEntrega.setComplemento(cliente.getComplemento());
            enderecoEntrega.setBairro(cliente.getBairro());
            enderecoEntrega.setCidade(cliente.getCidade());
            enderecoEntrega.setUf(cliente.getUf());
            cliente.getEnderecosEntrega().add(enderecoEntrega);
        }
    }

    public List<Endereco> listarEnderecos(Long clienteId) {
        // Implementação para listar endereços do cliente
        // Por exemplo, buscar endereços no repositório
        return enderecoRepository.findByClienteId(clienteId);
    }

    public void adicionarEndereco(Endereco endereco) {
        Optional<Cliente> clienteOpt = clienteRepository.findById(endereco.getCliente().getId());
        if (!clienteOpt.isPresent()) {
            throw new IllegalArgumentException("Cliente não encontrado.");
        }
        Cliente cliente = clienteOpt.get();
        endereco.setCliente(cliente);
        enderecoRepository.save(endereco);
    }
}