// Capturar o ID do produto a partir da URL
const urlParams = new URLSearchParams(window.location.search);
const produtoId = urlParams.get('id');
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
const userRole = usuario && usuario.grupo ? usuario.grupo : '';
const token = localStorage.getItem('authToken'); // Supondo que o token esteja armazenado no localStorage

// Função para carregar os dados do produto e preencher o formulário
function carregarDadosProduto(id) {
    fetch(`http://localhost:8080/produtos/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados do produto');
            }
            return response.json();
        })
        .then(produto => {
            document.getElementById('nome').value = produto.nome;
            document.getElementById('avaliacao').value = produto.avaliacao;
            document.getElementById('descricaoDetalhada').value = produto.descricaoDetalhada;
            document.getElementById('qtdEstoque').value = produto.qtdEstoque;
            document.getElementById('preco').value = produto.preco;
            document.getElementById('ativo').value = produto.ativo.toString();
            document.getElementById('imagemPrincipal').value = produto.imagemPrincipal;

            // Desabilitar campos se o usuário for estoquista
            if (userRole === 'estoquista') {
                document.getElementById('nome').disabled = true;
                document.getElementById('avaliacao').disabled = true;
                document.getElementById('descricaoDetalhada').disabled = true;
                document.getElementById('preco').disabled = true;
                document.getElementById('ativo').disabled = true;
                document.getElementById('imagens').disabled = true;
                document.getElementById('imagemPrincipal').disabled = true;
            }

            // Carregar imagens existentes
            carregarImagensProduto(id);
        })
        .catch(error => {
            console.error('Erro ao carregar os dados do produto:', error);
            alert('Erro ao carregar os dados do produto.');
        });
}

// Função para carregar as imagens do produto
function carregarImagensProduto(id) {
    fetch(`http://localhost:8080/imagens/produto/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(imagens => {
            const fileNamesDiv = document.getElementById('fileNames');
            fileNamesDiv.innerHTML = ''; // Limpar o conteúdo existente

            if (imagens.length === 0) {
                fileNamesDiv.innerHTML = 'Nenhum arquivo escolhido';
            } else {
                imagens.forEach((image, index) => {
                    const caminhoImagem = `http://localhost:8081/${image.caminho.split('\\').pop()}`;
                    fileNamesDiv.innerHTML += `
                        <div>
                            <img src="${caminhoImagem}" class="product-image" alt="Imagem do Produto">
                            <p>Imagem ${index + 1}</p>
                        </div>
                    `;
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar as imagens do produto:', error);
            alert('Erro ao carregar as imagens do produto.');
        });
}

// Carregar dados do produto ao carregar a página
window.onload = function() {
    if (produtoId) {
        carregarDadosProduto(produtoId);
    } else {
        alert('ID do produto não encontrado.');
        window.location.href = 'listarProdutos.html'; // Redireciona para a lista de produtos
    }
};

// Enviar alterações ao servidor
document.getElementById('formAlterarProduto').onsubmit = async function(e) {
    e.preventDefault();

    const formData = new FormData();
    const qtdEstoque = document.getElementById("qtdEstoque").value;

    if (userRole === 'admin') {
        formData.append("nome", document.getElementById("nome").value);
        formData.append("avaliacao", document.getElementById("avaliacao").value);
        formData.append("descricaoDetalhada", document.getElementById("descricaoDetalhada").value);
        formData.append("preco", document.getElementById("preco").value);
        formData.append("ativo", document.getElementById("ativo").value);

        const imagemPrincipal = document.getElementById("imagemPrincipal").value;
        if (imagemPrincipal) {
            formData.append("imagemPrincipal", imagemPrincipal);
        }

        const imagens = document.getElementById("imagens").files;
        if (imagens.length > 0) {
            for (let i = 0; i < imagens.length; i++) {
                formData.append("imagens", imagens[i]);
            }
        }
    }

    formData.append("qtdEstoque", qtdEstoque);

    const response = await fetch(`http://localhost:8080/produtos/${produtoId}`, {
        method: 'PUT',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        alert("Produto alterado com sucesso!");
        window.location.href = 'listarProdutos.html'; // Redireciona para a lista de produtos
    } else {
        const erro = await response.json();
        alert("Erro ao alterar produto: " + (erro.message || response.statusText));
    }
};