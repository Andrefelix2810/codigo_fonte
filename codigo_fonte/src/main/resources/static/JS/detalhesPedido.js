// Capturar o ID do pedido a partir da URL
const urlParams = new URLSearchParams(window.location.search);
const pedidoId = urlParams.get('pedidoId');

// Função para carregar os dados do pedido e preencher a página
function carregarDadosPedido(id) {
    const token = localStorage.getItem('authToken'); // Obtém o token do localStorage

    fetch(`http://localhost:8080/pedido/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(pedido => {
        const detalhesPedidoDiv = document.getElementById('detalhesPedido');
        let produtosHtml = '';
        let subtotal = 0;

        const promises = pedido.itens.map(item => {
            return fetch(`http://localhost:8080/imagens/produto/${item.product.id}`)
                .then(response => response.json())
                .then(imagens => {
                    const imagemPrincipal = imagens.find(image => image.principal);
                    const imagemUrl = imagemPrincipal ? `http://localhost:8081/${imagemPrincipal.caminho.split('\\').pop()}` : 'IMG/default.png';

                    const itemTotal = item.precoUnitario * item.quantidade;
                    subtotal += itemTotal;
                    produtosHtml += `
                        <div class="cart-item">
                            <img src="${imagemUrl}" alt="Imagem do Produto" class="img-thumbnail" style="width: 100px; height: 100px;">
                            <p>${item.product.nome} - Quantidade: ${item.quantidade} - Valor Unitário: R$ ${item.precoUnitario.toFixed(2)}</p>
                        </div>
                    `;
                })
                .catch(error => {
                    console.error(`Erro ao buscar imagens do produto ${item.product.id}:`, error);
                    const itemTotal = item.precoUnitario * item.quantidade;
                    subtotal += itemTotal;
                    produtosHtml += `
                        <div class="cart-item">
                            <img src="IMG/default.png" alt="Imagem do Produto" class="img-thumbnail" style="width: 100px; height: 100px;">
                            <p>${item.product.nome} - Quantidade: ${item.quantidade} - Valor Unitário: R$ ${item.precoUnitario.toFixed(2)}</p>
                        </div>
                    `;
                });
        });

        Promise.all(promises).then(() => {
            const frete = pedido.valorFrete || 20; // Valor fixo de frete para exemplo
            const total = subtotal + frete;

            if (pedido.enderecoEntrega) { // Verificação para garantir que pedido.enderecoEntrega não seja indefinido
                detalhesPedidoDiv.innerHTML = `
                    <h4>Produtos</h4>
                    ${produtosHtml}
                    <h4>Valores</h4>
                    <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
                    <p>Frete: R$ ${frete.toFixed(2)}</p>
                    <p>Total: R$ ${total.toFixed(2)}</p>
                    <h4>Endereço de Entrega</h4>
                    <p>${pedido.enderecoEntrega.logradouro}, ${pedido.enderecoEntrega.numero}, ${pedido.enderecoEntrega.bairro}, ${pedido.enderecoEntrega.cidade} - ${pedido.enderecoEntrega.uf}, CEP: ${pedido.enderecoEntrega.cep}</p>
                    <h4>Forma de Pagamento</h4>
                    <p>${pedido.formaPagamento}</p>
                `;
            } else {
                console.warn('Endereço de entrega indefinido para o pedido:', pedido); // Log de aviso para pedido sem endereço de entrega
                detalhesPedidoDiv.innerHTML = `
                    <h4>Produtos</h4>
                    ${produtosHtml}
                    <h4>Valores</h4>
                    <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
                    <p>Frete: R$ ${frete.toFixed(2)}</p>
                    <p>Total: R$ ${total.toFixed(2)}</p>
                    <h4>Endereço de Entrega</h4>
                    <p>Endereço de entrega não disponível.</p>
                    <h4>Forma de Pagamento</h4>
                    <p>${pedido.formaPagamento}</p>
                `;
            }
        });
    })
    .catch(error => {
        console.error('Erro ao carregar dados do pedido:', error);
        alert('Erro ao carregar dados do pedido: ' + error.message);
    });
}

// Carregar dados do pedido ao carregar a página
window.onload = function() {
    if (pedidoId) {
        carregarDadosPedido(pedidoId);
    } else {
        alert('ID do pedido não encontrado.');
        window.location.href = 'listarPedido.html'; // Redireciona para a lista de pedidos
    }
};