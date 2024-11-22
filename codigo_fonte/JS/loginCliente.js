document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const loginData = {
        email: form.email.value,
        senha: form.senha.value
    };

    fetch("http://localhost:8080/login", {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('clienteId', data.id); // Armazena o ID do cliente
            localStorage.setItem('nomeUsuario', data.nome); // Armazena o nome do usuário
            alert('Login realizado com sucesso!');
            const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
            if (redirectAfterLogin === 'carrinho') {
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = 'index.html'; // Redirecionar para a página do carrinho
            } else {
                window.location.href = 'index.html'; // Redirecionar para a página inicial ou outra página apropriada
            }
        } else {
            throw new Error(data.message || 'Erro ao realizar login.');
        }
    })
    .catch(error => {
        alert('Erro ao realizar login: ' + error.message);
    });
});