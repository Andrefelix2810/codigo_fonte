$(document).ready(function() {
    const apiUrl = 'http://localhost:8080/produtos/';
    const imageApiUrl = 'http://localhost:8080/imagens/produto';
    const token = localStorage.getItem('authToken'); // Supondo que o token esteja armazenado no localStorage

    // IDs dos produtos que você quer buscar
    const produtoIds = [21, 12, 13, 24, 25, 20]; // Substitua pelos IDs dos produtos desejados

    function fetchProductsByIds(ids) {
        const productPromises = ids.map(id => {
            return $.ajax({
                url: apiUrl + id,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        });

        Promise.all(productPromises)
            .then(products => {
                renderProducts(products);
            })
            .catch(error => {
                console.error('Erro ao buscar produtos:', error);
            });
    }

    function fetchProductImages(productId, callback) {
        console.log(`Carregando imagens do produto com ID: ${productId}`);
        fetch(`http://localhost:8080/imagens/produto/${productId}`)
        
            .then(response => response.json())
            .then(imagens => {
                console.log('Imagens carregadas:', imagens);
                const imagemPrincipal = imagens.find(image => image.principal);
                const outrasImagens = imagens.filter(image => !image.principal);

                if (imagemPrincipal) {
                    imagens = [imagemPrincipal, ...outrasImagens];
                }

                callback(imagens);
            })
            .catch(error => {
                console.error(`Erro ao buscar imagens do produto ${productId}:`, error);
                callback([]);
            });
    }

    function renderProducts(products) {
        const productList = $('#productList');
        productList.empty();
        products.forEach(product => {
            fetchProductImages(product.id, function(images) {
                const carouselId = `carousel-${product.id}`;
                const carouselIndicators = images.map((image, index) => `
                    <li data-target="#${carouselId}" data-slide-to="${index}" class="${index === 0 ? 'active' : ''}"></li>
                `).join('');
                const carouselItems = images.map((image, index) => `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="http://localhost:8081/${image.caminho.split('\\').pop()}" class="d-block w-100" alt="Imagem do ${product.nome}">
                    </div>
                `).join('');
                const productCard = `
                    <div class="product-card">
                        <div id="${carouselId}" class="carousel slide" data-ride="carousel">
                            <ol class="carousel-indicators">
                                ${carouselIndicators}
                            </ol>
                            <div class="carousel-inner">
                                ${carouselItems}
                            </div>
                            <a class="carousel-control-prev" href="#${carouselId}" role="button" data-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="sr-only">Anterior</span>
                            </a>
                            <a class="carousel-control-next" href="#${carouselId}" role="button" data-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="sr-only">Próximo</span>
                            </a>
                        </div>
                        <h2>${product.nome}</h2>
                        <p><strong>Preço:</strong> R$ ${product.preco.toFixed(2)}</p>
                        <div class="icon-buttons">
                            <img id="cartIcon-${product.id}" src="IMG/carrinho.png" alt="Carrinho" class="icones" onclick="adicionarAoCarrinhoSemModal(${product.id}, '${product.nome}', ${product.preco}, '${images[0].caminho}')">
                            <img src="IMG/coracao.png" alt="Coração" class="icones">
                            <img src="IMG/info.png" alt="Info" class="icones" onclick="viewProduct(${product.id})">
                        </div>
                    <div class="button mt-2" onclick="adicionarAoCarrinho(${product.id}, '${product.nome}', ${product.preco}, '${images[0].caminho}')">
Compre já
<svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_30_96)">
<path fill="black" d="M0.479167 11.5C0.203024 11.5 -0.0208333 11.7239 -0.0208333 12C-0.0208333 12.2761 0.203024 12.5 0.479167 12.5V11.5ZM22.9231 12.3536C23.1184 12.1583 23.1184 11.8417 22.9231 11.6464L19.7411 8.46447C19.5459 8.2692 19.2293 8.2692 19.034 8.46447C18.8388 8.65973 18.8388 8.97631 19.034 9.17157L21.8625 12L19.034 14.8284C18.8388 15.0237 18.8388 15.3403 19.034 15.5355C19.2293 15.7308 19.5459 15.7308 19.7411 15.5355L22.9231 12.3536ZM0.479167 12.5H22.5696V11.5H0.479167V12.5Z"></path>
</g>
<defs>
<clipPath id="clip0_30_96">
<rect fill="white" height="24" width="24"></rect>
</clipPath>
</defs>
</svg>
</div>
                `;
                productList.append(productCard);
            });
        });
    }
        fetchProductsByIds(produtoIds);


    function renderPagination() {
        const pagination = $('#pagination');
        pagination.empty();
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
            pagination.append(pageItem);
        }
    }

    window.changePage = function(page) {
        currentPage = page;
        fetchProducts(currentPage, $('#searchInput').val());
    };

    window.viewProduct = function(productId) {
        window.location.href = `visualizarProdutoCliente.html?id=${productId}`;
    };

    window.adicionarAoCarrinho = function(productId, nome, preco, imagem) {
        const produto = { id: productId, nome: nome, preco: preco, imagem: imagem, quantidade: 1 };
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const produtoExistente = carrinho.find(item => item.id === productId);

        if (produtoExistente) {
            produtoExistente.quantidade += 1;
        } else {
            carrinho.push(produto);
        }

        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarIndicadorCarrinho();
        $('#cartModal').addClass('active'); // Abrir o modal do carrinho
        carregarCarrinho();
    };

    window.adicionarAoCarrinhoSemModal = function(productId, nome, preco, imagem) {
        const produto = { id: productId, nome: nome, preco: preco, imagem: imagem, quantidade: 1 };
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const produtoExistente = carrinho.find(item => item.id === productId);

        if (produtoExistente) {
            produtoExistente.quantidade += 1;
        } else {
            carrinho.push(produto);
        }

        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarIndicadorCarrinho();

        // Não abrir o modal do carrinho
    };

    window.removerDoCarrinho = function(productId) {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        carrinho = carrinho.filter(item => item.id !== productId);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        carregarCarrinho();
        atualizarIndicadorCarrinho();
    };

    window.incrementarQuantidade = function(productId) {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const produto = carrinho.find(item => item.id === productId);
        if (produto) {
            produto.quantidade += 1;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            carregarCarrinho();
            atualizarIndicadorCarrinho();
        }
    };

    window.decrementarQuantidade = function(productId) {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const produto = carrinho.find(item => item.id === productId);
        if (produto && produto.quantidade > 1) {
            produto.quantidade -= 1;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            carregarCarrinho();
            atualizarIndicadorCarrinho();
        }
    };

    function calcularSubtotal() {
        const cartItems = JSON.parse(localStorage.getItem('carrinho')) || [];
        return cartItems.reduce((subtotal, item) => subtotal + (item.preco * item.quantidade), 0);
    }

    function determinarRegiao(cep) {
        const cepPrefixo = parseInt(cep.substring(0, 2));
        console.log(`CEP Prefixo: ${cepPrefixo}`); // Log para depuração
        if (cepPrefixo >= 0 && cepPrefixo <= 29) {
            return 'regiao1';
        } else if (cepPrefixo >= 30 && cepPrefixo <= 59) {
            return 'regiao2';
        } else if (cepPrefixo >= 60 && cepPrefixo <= 99) {
            return 'regiao3';
        } else {
            return 'desconhecido';
        }
    }
    
    const valoresFrete = {
        'regiao1': 10,
        'regiao2': 20,
        'regiao3': 30
    };
    
    const valoresAdicionais = {
        'correios': 5,
        'sedex': 10,
        'fedex': 15
    };
    
    window.calcularFrete = function() {
        let cep = document.getElementById('cepInput').value;
        cep = cep.replace('-', ''); // Remove o hífen do CEP
        console.log(`CEP: ${cep}`); // Log para depuração
        if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
            const regiao = determinarRegiao(cep);
            console.log(`Região: ${regiao}`); // Log para depuração
            const valorBaseFrete = valoresFrete[regiao] || 0;
    
            // Verifica qual opção de frete foi selecionada
            const tipoFreteSelecionado = document.querySelector('input[name="tipoFrete"]:checked').value;
            console.log(`Tipo de Frete Selecionado: ${tipoFreteSelecionado}`); // Log para depuração
    
            const valorAdicional = valoresAdicionais[tipoFreteSelecionado] || 0;
            console.log(`Valor Adicional: ${valorAdicional}`); // Log para depuração
    
            const valorFreteTotal = valorBaseFrete + valorAdicional;
            console.log(`Valor do Frete Total: ${valorFreteTotal}`); // Log para depuração
    
            document.getElementById('freteValue').innerText = valorFreteTotal.toFixed(2);
            atualizarTotal(); // Atualiza o total no carrinho (se houver)
        } else {
            document.getElementById('freteValue').innerText = '0.00';
            atualizarTotal();
        }
    }

    function calcularTotal() {
        const subtotal = calcularSubtotal();
        const frete = parseFloat(document.getElementById('freteValue').innerText);
        return subtotal + (isNaN(frete) ? 0 : frete);
    }

    function carregarCarrinho() {
        const cartItems = JSON.parse(localStorage.getItem('carrinho')) || [];
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSubtotalElement = document.getElementById('cartSubtotal');
        const cartTotalElement = document.getElementById('cartTotal');
        let cartTotal = 0;

        cartItemsContainer.innerHTML = ''; // Limpar o conteúdo existente

        let itemsProcessed = 0;

        if (cartItems.length ===0) {
            cartSubtotalElement.innerText = cartTotal.toFixed(2);
            cartTotalElement.innerText = cartTotal.toFixed(2);
        }

        cartItems.forEach(item => {
            fetchProductImages(item.id, function(images) {
                const itemTotal = item.preco * item.quantidade;
                cartTotal += itemTotal;

                const cartItem = `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <img src="http://localhost:8081/${images[0].caminho.split('\\').pop()}" alt="Imagem do ${item.nome}">
                            <div class="cart-item-info">
                                <h5>${item.nome}</h5>
                                <p class="cart-item-price">R$ ${item.preco.toFixed(2)} x ${item.quantidade}</p>
                                <div class="quantity-controls">
                                    <button class="btn btn-secondary btn-sm" onclick="decrementarQuantidade(${item.id})">-</button>
                                    <span>${item.quantidade}</span>
                                    <button class="btn btn-secondary btn-sm" onclick="incrementarQuantidade(${item.id})">+</button>
                                </div>
                                <button class="btn btn-danger btn-sm" onclick="removerDoCarrinho(${item.id})">Remover</button>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItem;

                itemsProcessed++;
                if (itemsProcessed === cartItems.length) {
                    cartSubtotalElement.innerText = calcularSubtotal().toFixed(2);
                    cartTotalElement.innerText = calcularTotal().toFixed(2);
                }
            });
        });
    }

    function atualizarTotal() {
        const cartTotalElement = document.getElementById('cartTotal');
        cartTotalElement.innerText = calcularTotal().toFixed(2);
    }

    function atualizarIndicadorCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
        document.getElementById('cartCount').innerText = totalItens;
    }

    window.finalizarCompra = function() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            // Cliente não está logado, redirecionar para a tela de login
            localStorage.setItem('redirectAfterLogin', 'carrinho');
            window.location.href = 'loginCliente.html';
            return;
        }
    
        const cep = document.getElementById('cepInput').value;
        calcularFrete(); // Chama a função calcularFrete para garantir que o frete seja atualizado
        const frete = parseFloat(document.getElementById('freteValue').innerText);
    
        // Armazena o CEP e o frete no localStorage para uso na tela de checkout
        localStorage.setItem('cepEntrega', cep);
        localStorage.setItem('frete', frete.toFixed(2));
    
        // Redirecionar para a tela de checkout
        window.location.href = 'checkout.html';
    };
    


    $('#cartIcon').click(function() {
        $('#cartModal').toggleClass('active');
        carregarCarrinho();
    });

    $('#closeCartModal').click(function() {
        $('#cartModal').removeClass('active');
    });

    fetchProducts();
    atualizarIndicadorCarrinho();

    // Função para atualizar a saudação do usuário
    function atualizarSaudacaoUsuario() {
        const saudacaoUsuario = document.querySelector('.saudacao-usuario');
        const authToken = localStorage.getItem('authToken');
        const nomeUsuario = localStorage.getItem('nomeUsuario'); // Supondo que o nome do usuário esteja armazenado no localStorage

        if (authToken && nomeUsuario) {
            const primeiroNome = nomeUsuario.split(' ')[0];
            saudacaoUsuario.textContent = `Olá, ${primeiroNome}!`;
        } else {
            saudacaoUsuario.textContent = 'Entre';
        }
    }

    // Chamar a função para atualizar a saudação do usuário
    atualizarSaudacaoUsuario();
});
// Função para mostrar o menu suspenso
// Função para mostrar o menu suspenso
function mostrarMenuSuspenso() {
const authToken = localStorage.getItem('authToken');
const userMenu = document.getElementById('userMenu');
const loginOption = document.getElementById('loginOption');
const alterarOption = document.getElementById('alterarOption');
const logoutOption = document.getElementById('logoutOption');
const listaPedido = document.getElementById('listaPedido');

if (authToken) {
loginOption.style.display = 'none';
alterarOption.style.display = 'block';
logoutOption.style.display = 'block';
listaPedido.style.display = 'block';
} else {
loginOption.style.display = 'block';
alterarOption.style.display = 'none';
logoutOption.style.display = 'none';
listaPedido.style.display = 'none';
}

userMenu.style.display = 'block';
}

// Função para esconder o menu suspenso
function esconderMenuSuspenso() {
const userMenu = document.getElementById('userMenu');
userMenu.style.display = 'none';
}

// Adicionar eventos de clique para mostrar e esconder o menu suspenso
const perfilIcon = document.querySelector('.login-link img');
perfilIcon.addEventListener('click', function(event) {
event.stopPropagation();
mostrarMenuSuspenso();
});
document.addEventListener('click', function(event) {
if (!perfilIcon.contains(event.target) && !document.getElementById('userMenu').contains(event.target)) {
esconderMenuSuspenso();
}
});

// Função para deslogar o usuário //
document.getElementById('logoutOption').addEventListener('click', function() {
if (confirm('Você tem certeza que deseja sair?')) {
localStorage.removeItem('authToken');
localStorage.removeItem('nomeUsuario');
location.reload();
}
});

// Função para verificar a sessão e atualizar o menu suspenso
function verificarSessao() {
const authToken = localStorage.getItem('authToken');
const nomeUsuario = localStorage.getItem('nomeUsuario');
const saudacaoUsuario = document.querySelector('.saudacao-usuario');
const loginOption = document.getElementById('loginOption');
const alterarOption = document.getElementById('alterarOption');
const logoutOption = document.getElementById('logoutOption');
const listaPedido = document.getElementById('listaPedido');

if (authToken && nomeUsuario) {
const primeiroNome = nomeUsuario.split(' ')[0];
saudacaoUsuario.textContent = `Olá, ${primeiroNome}!`;
loginOption.style.display = 'none';
alterarOption.style.display = 'block';
logoutOption.style.display = 'block';
listaPedido.style.display = 'block';
} else {
saudacaoUsuario.textContent = 'Entre';
loginOption.style.display = 'block';
alterarOption.style.display = 'none';
logoutOption.style.display = 'none';
listaPedido.style.display = 'none';
}
}

// Chamar a função para verificar a sessão ao carregar a página
document.addEventListener('DOMContentLoaded', verificarSessao);

function carregarProdutosCheckout() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const produtosCheckoutDiv = document.getElementById('produtosCheckout');
    produtosCheckoutDiv.innerHTML = '';

    let subtotal = 0;

    carrinho.forEach(item => {
        const itemTotal = item.preco * item.quantidade;
        subtotal += itemTotal;

        // Buscar a imagem do produto
        fetch(`http://localhost:8080/imagens/produto/${item.id}`)
            .then(response => response.json())
            .then(imagens => {
                const imagemPrincipal = imagens.find(image => image.principal);
                const imagemUrl = imagemPrincipal ? `http://localhost:8081/${imagemPrincipal.caminho.split('\\').pop()}` : 'IMG/default.png';

                produtosCheckoutDiv.innerHTML += `
                    <div class="cart-item">
                        <img src="${imagemUrl}" alt="Imagem do ${item.nome}" class="img-thumbnail" style="width: 100px; height: 100px;">
                        <p>${item.nome} - Quantidade: ${item.quantidade} - Valor Unitário: R$ ${item.preco.toFixed(2)}</p>
                    </div>
                `;
            })
            .catch(error => {
                console.error(`Erro ao buscar imagens do produto ${item.id}:`, error);
                produtosCheckoutDiv.innerHTML += `
                    <div class="cart-item">
                        <img src="IMG/default.png" alt="Imagem do ${item.nome}" class="img-thumbnail" style="width: 100px; height: 100px;">
                        <p>${item.nome} - Quantidade: ${item.quantidade} - Valor Unitário: R$ ${item.preco.toFixed(2)}</p>
                    </div>
                `;
            });
    });

    const frete = 20; // Valor fixo de frete para exemplo
    const total = subtotal + frete;

    produtosCheckoutDiv.innerHTML += `
        <h4>Valores</h4>
        <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
        <p>Frete: R$ ${frete.toFixed(2)}</p>
        <p>Total: R$ ${total.toFixed(2)}</p>
    `;
}