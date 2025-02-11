// Verifica se o usuário é administrador ou estoquista e exibe as opções correspondentes
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
console.log("Usuário recuperado da sessão:", usuario);

if (usuario && usuario.grupo) {
    if (usuario.grupo === "admin") {
        document.getElementById("admin-option").style.display = "block";
    } else if (usuario.grupo === "estoquista") {
        document.getElementById("estoquista-option").style.display = "block";
    } else {
        console.log("Usuário não é administrador ou estoquista:", usuario);
    }
} else {
    console.log("Grupo de usuário não encontrado:", usuario);
}