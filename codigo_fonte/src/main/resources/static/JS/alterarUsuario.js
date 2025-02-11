        // Capturar o ID do usuário a partir da URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        const loggedInUserId = 1; // Substitua por uma maneira de obter o ID do usuário logado
 
        // Função para carregar os dados do usuário e preencher o formulário
        function carregarDadosUsuario(id) {
            fetch(`http://localhost:8080/usuarios/${id}`)
                .then(response => response.json())
                .then(usuario => {
                    document.getElementById('nome').value = usuario.nome;
                    document.getElementById('cpf').value = usuario.cpf;
                    document.getElementById('grupo').value = usuario.grupo;
 
                    // Desabilitar o campo de grupo se estiver editando o próprio usuário
                    if (id === loggedInUserId) {
                        document.getElementById('grupo').disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar os dados do usuário:', error);
                    alert('Erro ao carregar os dados do usuário.');
                });
        }
 
        // Carregar dados do usuário ao carregar a página
        window.onload = function() {
            if (userId) {
                carregarDadosUsuario(userId);
            } else {
                alert('ID do usuário não encontrado.');
                window.location.href = 'listarUsuarios.html'; // Redireciona para a lista de usuários
            }
        };
 
        // Enviar alterações ao servidor
        document.getElementById('formAlterarUsuario').onsubmit = async function(e) {
            e.preventDefault();
 
            const nome = document.getElementById("nome").value;
            const cpf = document.getElementById("cpf").value;
            const senha = document.getElementById("senha").value;
            const senhaConfirmacao = document.getElementById("senhaConfirmacao").value;
            const grupo = document.getElementById("grupo").value;
 
            if (senha && senha !== senhaConfirmacao) {
                alert('As senhas não coincidem.');
                return;
            }
 
            const usuario = {
                nome,
                cpf,
                senha,
                senhaConfirmacao,
                grupo: (userId !== loggedInUserId) ? grupo : undefined // Enviar o grupo apenas se não for o próprio usuário
            };
 
            const response = await fetch(`http://localhost:8080/usuarios/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });
 
            if (response.ok) {
                alert("Usuário alterado com sucesso!");
                window.location.href = 'listaUsuario.html'; // Redireciona para a lista de usuários
            } else {
                const erro = await response.json();
                alert("Erro ao alterar usuário: " + (erro.message || response.statusText));
            }
        };