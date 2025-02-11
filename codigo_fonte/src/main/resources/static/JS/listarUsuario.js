function carregarUsuarios() {
    fetch('http://localhost:8080/usuarios/listar')
        .then(response => response.json())
        .then(usuarios => {
            const userTable = document.getElementById('userTable');
            userTable.innerHTML = '';

            usuarios.forEach(usuario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nome}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.status}</td>
                    <td>${usuario.grupo}</td>
                    <td>
                        <button onclick="alterarUsuario(${usuario.id})" class="btn btn-warning btn-sm">Alterar</button>
                        <button onclick="confirmarAlteracaoStatus(${usuario.id}, '${usuario.status}')" class="btn btn-${usuario.status === 'Ativo' ? 'danger' : 'success'} btn-sm">
                            ${usuario.status === 'Ativo' ? 'Inativar' : 'Reativar'}
                        </button>
                    </td>
                `;
                userTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os usuários:', error);
        });
}

window.onload = carregarUsuarios;

function alterarUsuario(id) {
    window.location.href = `alterarUsuario.html?id=${id}`;
}

function confirmarAlteracaoStatus(id, statusAtual) {
    const novoStatus = statusAtual === 'Ativo' ? 'Inativo' : 'Ativo';
    const confirmacao = confirm(`Você realmente deseja ${novoStatus === 'Ativo' ? 'reativar' : 'inativar'} este usuário?`);
    if (confirmacao) {
        alterarStatus(id, novoStatus);
    }
}

function alterarStatus(id, novoStatus) {
    fetch(`http://localhost:8080/usuarios/${id}/alterarStatus`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
    }).then(() => {
        carregarUsuarios();
    }).catch(error => {
        console.error('Erro ao alterar o status do usuário:', error);
    });
}

function filtrarUsuarios() {
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const rows = document.getElementById('userTable').getElementsByTagName('tr');
   
    Array.from(rows).forEach(row => {
        const nome = row.getElementsByTagName('td')[1].textContent.toLowerCase();
        row.style.display = nome.includes(searchName) ? '' : 'none';
    });
}

function irParaCadastro() {
    window.location.href = "cadastroUsuario.html";
}