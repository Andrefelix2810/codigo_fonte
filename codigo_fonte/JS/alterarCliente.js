const token = localStorage.getItem('authToken'); // Obtém o token do localStorage
const clienteId = localStorage.getItem('clienteId'); // Obtém o ID do cliente do localStorage
let enderecosExistentes = []; // Variável global para armazenar endereços existentes

function carregarDadosCliente(id) {
    fetch(`http://localhost:8080/cliente/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('nome').value = data.nome || '';
        document.getElementById('email').textContent = data.email || '';
        document.getElementById('cpf').textContent = data.cpf || '';
        document.getElementById('dataNascimento').value = data.dataNascimento ? new Date(data.dataNascimento).toISOString().split('T')[0] : '';
        document.getElementById('genero').value = data.genero || '';
        document.getElementById('cep').textContent = data.cep || '';
        document.getElementById('logradouro').textContent = data.logradouro || '';
        document.getElementById('numero').textContent = data.numero || '';
        document.getElementById('complemento').textContent = data.complemento || '';
        document.getElementById('bairro').textContent = data.bairro || '';
        document.getElementById('cidade').textContent = data.cidade || '';
        document.getElementById('uf').textContent = data.uf || '';

        const enderecosEntregaDiv = document.getElementById('enderecos-entrega');
        enderecosEntregaDiv.innerHTML = '';
        if (data.enderecosEntrega) {
            enderecosExistentes = data.enderecosEntrega; // Armazena os endereços existentes
            data.enderecosEntrega.forEach((endereco, index) => {
                enderecosEntregaDiv.innerHTML += `
                    <div>
                        <h3>Endereço ${index + 1}</h3>
                        <p>CEP: ${endereco.cep || ''}</p>
                        <p>Logradouro: ${endereco.logradouro || ''}</p>
                        <p>Número: ${endereco.numero || ''}</p>
                        <p>Complemento: ${endereco.complemento || ''}</p>
                        <p>Bairro: ${endereco.bairro || ''}</p>
                        <p>Cidade: ${endereco.cidade || ''}</p>
                        <p>UF: ${endereco.uf || ''}</p>
                        <label for="padrao-${index}">Endereço Padrão:</label>
                        <input type="radio" id="padrao-${index}" name="enderecoPadrao" value="${index}" ${endereco.padrao ? 'checked' : ''}><br>
                    </div>
                `;
            });
        }
    })
    .catch(error => console.error('Erro ao carregar dados do cliente:', error));
}

function buscarEndereco(index) {
    const cep = document.getElementById(`cep-${index}`).value;
    if (cep) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById(`logradouro-${index}`).value = data.logradouro || '';
                document.getElementById(`bairro-${index}`).value = data.bairro || '';
                document.getElementById(`cidade-${index}`).value = data.localidade || '';
                document.getElementById(`uf-${index}`).value = data.uf || '';
            } else {
                alert('CEP não encontrado.');
            }
        })
        .catch(error => console.error('Erro ao buscar endereço:', error));
    }
}

function adicionarEnderecoEntrega() {
    const enderecosEntregaDiv = document.getElementById('enderecos-entrega');
    const index = enderecosEntregaDiv.children.length;
    enderecosEntregaDiv.innerHTML += `
        <div>
            <h3>Endereço ${index + 1}</h3>
            <label for="cep-${index}">CEP:</label>
            <input type="text" id="cep-${index}" name="enderecosEntrega[${index}].cep" onblur="buscarEndereco(${index})"><br>
            <label for="logradouro-${index}">Logradouro:</label>
            <input type="text" id="logradouro-${index}" name="enderecosEntrega[${index}].logradouro"><br>
            <label for="numero-${index}">Número:</label>
            <input type="text" id="numero-${index}" name="enderecosEntrega[${index}].numero"><br>
            <label for="complemento-${index}">Complemento:</label>
            <input type="text" id="complemento-${index}" name="enderecosEntrega[${index}].complemento"><br>
            <label for="bairro-${index}">Bairro:</label>
            <input type="text" id="bairro-${index}" name="enderecosEntrega[${index}].bairro"><br>
            <label for="cidade-${index}">Cidade:</label>
            <input type="text" id="cidade-${index}" name="enderecosEntrega[${index}].cidade"><br>
            <label for="uf-${index}">UF:</label>
            <input type="text" id="uf-${index}" name="enderecosEntrega[${index}].uf"><br>
            <label for="padrao-${index}">Endereço Padrão:</label>
            <input type="radio" id="padrao-${index}" name="enderecoPadrao" value="${index}"><br>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    carregarDadosCliente(clienteId);

    document.getElementById('adicionar-endereco').addEventListener('click', adicionarEnderecoEntrega);

    document.getElementById('form-alterar-cliente').addEventListener('submit', function(event) {
        event.preventDefault();

        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        if (novaSenha && novaSenha !== confirmarSenha) {
            alert('As senhas não coincidem.');
            return;
        }

        const cliente = {
            nome: document.getElementById('nome').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            genero: document.getElementById('genero').value,
            senha: novaSenha || null, // Enviar a nova senha se fornecida
            email: document.getElementById('email').textContent,
            cpf: document.getElementById('cpf').textContent,
            cep: document.getElementById('cep').textContent,
            logradouro: document.getElementById('logradouro').textContent,
            numero: document.getElementById('numero').textContent,
            complemento: document.getElementById('complemento').textContent,
            bairro: document.getElementById('bairro').textContent,
            cidade: document.getElementById('cidade').textContent,
            uf: document.getElementById('uf').textContent,
            enderecosEntrega: [...enderecosExistentes] // Inclui os endereços existentes
        };

        const enderecosEntregaDiv = document.getElementById('enderecos-entrega');
        const enderecosEntrega = enderecosEntregaDiv.querySelectorAll('div');
        enderecosEntrega.forEach((enderecoDiv, index) => {
            const cepElement = document.getElementById(`cep-${index}`);
            const logradouroElement = document.getElementById(`logradouro-${index}`);
            const numeroElement = document.getElementById(`numero-${index}`);
            const complementoElement = document.getElementById(`complemento-${index}`);
            const bairroElement = document.getElementById(`bairro-${index}`);
            const cidadeElement = document.getElementById(`cidade-${index}`);
            const ufElement = document.getElementById(`uf-${index}`);

            if (cepElement && logradouroElement && numeroElement && bairroElement && cidadeElement && ufElement) {
                const endereco = {
                    cep: cepElement.value,
                    logradouro: logradouroElement.value,
                    numero: numeroElement.value,
                    complemento: complementoElement.value,
                    bairro: bairroElement.value,
                    cidade: cidadeElement.value,
                    uf: ufElement.value,
                    padrao: document.getElementById(`padrao-${index}`).checked
                };
                cliente.enderecosEntrega.push(endereco);
            }
        });

        console.log('Dados do cliente a serem enviados:', cliente);

        fetch(`http://localhost:8080/cliente/${clienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cliente)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.text(); // Alterado para response.text() para lidar com respostas de texto
        })
        .then(data => {
            alert('Dados atualizados com sucesso!');
            console.log('Resposta do servidor:', data);
            carregarDadosCliente(clienteId); // Recarregar os dados do cliente para exibir os endereços atualizados
        })
        .catch(error => {
            console.error('Erro ao atualizar dados do cliente:', error);
            alert('Erro ao atualizar dados do cliente: ' + error.message);
        });
    });
});