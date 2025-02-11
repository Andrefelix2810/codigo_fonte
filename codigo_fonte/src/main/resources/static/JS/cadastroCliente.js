document.getElementById('cep').addEventListener('blur', function() { //preenche automaticamente quando sai do campo
    const cep = this.value.replace(/\D/g, ''); //remove caracteres não numéricos
    if (cep.length === 8) { // verifica se o CEP tem 8 dígitos
        fetch(`https://viacep.com.br/ws/${cep}/json/`) // Faz uma requisição HTTP para a API, buscando os dados do CEP.
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('logradouro').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('uf').value = data.uf;
                } else {
                    alert('CEP não encontrado.');
                }
            })
            .catch(error => {
                alert('Erro ao buscar CEP: ' + error.message);
            });
    }
});

document.getElementById('cadastroClienteForm').addEventListener('submit', function(event) { //envia os dados para o servidor,  que é ativado quando salva o formulario com o id cadastroClienteForm
    event.preventDefault();
    const form = event.target;
    const cliente = { //coleta os dados do formulario
        nome: form.nome.value,
        email: form.email.value,
        cpf: form.cpf.value,
        dataNascimento: form.dataNascimento.value,
        genero: form.genero.value,
        senha: form.senha.value,
        cep: form.cep.value,
        logradouro: form.logradouro.value, 
        numero: form.numero.value,
        complemento: form.complemento.value,
        bairro: form.bairro.value,
        cidade: form.cidade.value,
        uf: form.uf.value,
        enderecoFaturamento: form.enderecoFaturamento.checked,
        enderecoEntrega: form.enderecoEntrega.checked
    };

    fetch("http://localhost:8080/cliente", { //envia os dados para o servidor
        method: "POST", //Faz uma requisição POST para a URL do servidor.
        body: JSON.stringify(cliente), //Os dados são enviados no corpo da requisição, convertidos para JSON.
        headers: { //O cabeçalho da requisição é configurado para indicar que o conteúdo é JSON.
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error || "Erro ao cadastrar cliente");
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Cliente cadastrado com sucesso!');
        form.reset();
        const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
        if (redirectAfterLogin === 'carrinho') {
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = 'index.html'; // Redirecionar para a página do carrinho
        } else {
            window.location.href = 'index.html'; // Redirecionar para a página inicial ou outra página apropriada
        }
    })
    .catch(error => {
        alert('Erro ao cadastrar cliente: ' + error.message);
    });
});
