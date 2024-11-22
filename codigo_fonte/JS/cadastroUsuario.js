const formCadastro = document.getElementById("form-cadastro");
 
formCadastro.addEventListener("submit", (event) => {
    event.preventDefault();
 
    // Obter os valores dos campos
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;
    const grupo = document.getElementById("grupo").value;
 
    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }   
 
    // Criar um objeto com os dados do usuário
    const usuario = {
        nome,
        cpf,
        email,
        senha,
        grupo,
        ativo: true
    };
 
    // Chamar a API para fazer o cadastro
    fetch("http://localhost:8080/usuarios", {
        method: "POST",
        body: JSON.stringify(usuario),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || "Erro ao cadastrar usuário");
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Usuário cadastrado com sucesso!');
        // Redirecionar ou limpar o formulário após o cadastro bem-sucedido
        formCadastro.reset();
    })
    .catch(error => {
        console.error(error);
        alert(error.message || "Erro ao cadastrar usuário");
    });
})