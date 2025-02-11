document.getElementById('product-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obter os valores dos campos
    const nome = document.getElementById("nome").value;
    const avaliacao = document.getElementById("avaliacao").value;
    const descricaoDetalhada = document.getElementById("descricaoDetalhada").value;
    const preco = document.getElementById("preco").value;
    const qtdEstoque = document.getElementById("qtdEstoque").value;
    const imagens = document.getElementById("imagens").files;
    const imagemPrincipal = document.getElementById("imagemPrincipal").value;

    // Criar um objeto FormData para enviar os dados do produto e as imagens
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("avaliacao", avaliacao);
    formData.append("descricaoDetalhada", descricaoDetalhada);
    formData.append("preco", preco);
    formData.append("qtdEstoque", qtdEstoque);

    for (let i = 0; i < imagens.length; i++) {
        formData.append("imagens", imagens[i]);
    }
    formData.append("imagemPrincipal", imagemPrincipal);

    // Chamar a API para cadastrar o produto
    try {
        const response = await fetch("http://localhost:8080/produtos", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao cadastrar o produto: ${errorText}`);
        }

        const result = await response.json();
        console.log('Produto cadastrado com sucesso:', result);
        alert('Produto cadastrado com sucesso!');
        window.location.href = '/produtos';
    } catch (error) {
        console.error('Erro ao cadastrar o produto!', error);
        alert(`Erro ao cadastrar o produto: ${error.message}`);
    }
});

// Atualizar as opções do campo de seleção da imagem principal quando as imagens são carregadas
document.getElementById('imagens').addEventListener('change', (event) => {
    const imagens = event.target.files;
    const imagemPrincipalSelect = document.getElementById('imagemPrincipal');
    imagemPrincipalSelect.innerHTML = ''; // Limpar as opções existentes

    for (let i = 0; i < imagens.length; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = imagens[i].name;
        imagemPrincipalSelect.appendChild(option);
    }
});