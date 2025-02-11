const formLogin = document.getElementById("form-login");

formLogin.addEventListener("submit", (event) => {
    event.preventDefault();

    // Obter os valores dos campos
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    // Criar um objeto com os dados do usuário
    const usuario = {
        email,
        senha,
    };

    // Chamar a API para fazer login
    fetch("http://localhost:8080/usuarios/login", {
        method: "POST",
        body: JSON.stringify(usuario),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Email ou senha incorretos");
        }
        return response.json();
    })
    .then(data => {
        // Armazena as informações do usuário na sessão do navegador
        sessionStorage.setItem("usuario", JSON.stringify(data));

        // Log para verificar o campo "grupo"
        console.log("Usuário logado:", data);

        // Redirecionar para outra página após o login bem-sucedido
        window.location.href = "backoffice.html";
    })
    .catch(error => {
        console.error(error);
        alert("Email ou senha incorretos");
    });
});