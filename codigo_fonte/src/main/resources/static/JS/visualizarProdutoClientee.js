 // Capturar o ID do produto a partir da URL
 const urlParams = new URLSearchParams(window.location.search);
 const produtoId = urlParams.get('id');

 // Função para carregar os dados do produto e preencher a página
 function carregarDadosProduto(id) {
     console.log(`Carregando dados do produto com ID: ${id}`);
     fetch(`http://localhost:8080/produtos/${id}`)
         .then(response => response.json())
         .then(produto => {
             console.log('Dados do produto carregados:', produto);
             document.getElementById('productName').innerText = produto.nome;
             document.getElementById('productDescription').innerText = produto.descricaoDetalhada;
             document.getElementById('productPrice').innerText = produto.preco.toFixed(2);
             document.getElementById('productRating').innerText = produto.avaliacao.toFixed(1);

             // Configurar o botão de compra
             const buyButton = document.getElementById('buyButton');
             buyButton.onclick = function() {
                 adicionarAoCarrinho(produto);
             };

             // Buscar as imagens do produto de um banco de dados separado
             console.log(`Carregando imagens do produto com ID: ${id}`);
             fetch(`http://localhost:8080/imagens/produto/${id}`)
                 .then(response => response.json())
                 .then(imagens => {
                     console.log('Imagens carregadas:', imagens);
                     const carouselInner = document.getElementById('carouselImages');
                     carouselInner.innerHTML = ''; // Limpar o conteúdo existente

                     if (imagens.length === 0) {
                         console.log('Nenhuma imagem disponível para este produto.');
                         carouselInner.innerHTML = '<div class="carousel-item active"><p>Sem imagens disponíveis</p></div>';
                     } else {
                         // Encontrar a imagem principal e movê-la para o início da lista
                         const imagemPrincipal = imagens.find(image => image.principal);
                         const outrasImagens = imagens.filter(image => !image.principal);

                         if (imagemPrincipal) {
                             imagens = [imagemPrincipal, ...outrasImagens];
                         }

                         imagens.forEach((image, index) => {
                             const isActive = index === 0 ? 'active' : '';
                             const caminhoImagem = `http://localhost:8081/${image.caminho.split('\\').pop()}`;
                             console.log(`Adicionando imagem ao carrossel: ${caminhoImagem}`);
                             carouselInner.innerHTML += `
                                 <div class="carousel-item ${isActive}">
                                     <img src="${caminhoImagem}" class="d-block w-100 product-image-carousel" alt="Imagem do Produto">
                                 </div>
                             `;
                         });
                     }
                 })
                 .catch(error => {
                     console.error('Erro ao carregar as imagens do produto:', error);
                     alert('Erro ao carregar as imagens do produto.');
                 });
         })
         .catch(error => {
             console.error('Erro ao carregar os dados do produto:', error);
             alert('Erro ao carregar os dados do produto.');
         });
 }

 // Função para adicionar o produto ao carrinho
 function adicionarAoCarrinho(produto) {
     let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
     carrinho.push(produto);
     localStorage.setItem('carrinho', JSON.stringify(carrinho));
     alert('Produto adicionado ao carrinho!');
 }

 // Carregar dados do produto ao carregar a página
 window.onload = function() {
     if (produtoId) {
         carregarDadosProduto(produtoId);
     } else {
         alert('ID do produto não encontrado.');
         window.location.href = 'listarProduto.html'; // Redireciona para a lista de produtos
     }
 };