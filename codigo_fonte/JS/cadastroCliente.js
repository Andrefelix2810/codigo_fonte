document.getElementById('cep').addEventListener('blur', function() {
    const cep = this.value.replace(/\D/g, '');
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
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

document.getElementById('cadastroClienteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const cliente = {
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

    fetch("http://localhost:8080/cliente", {
        method: "POST",
        body: JSON.stringify(cliente),
        headers: {
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
