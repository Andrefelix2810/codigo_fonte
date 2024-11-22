const token = localStorage.getItem('authToken'); // Obtém o token do localStorage
const clienteId = localStorage.getItem('clienteId'); // Obtém o ID do cliente do localStorage
let enderecosExistentes = []; // Variável global para armazenar endereços existentes

function carregarDadosCliente(id) {
    fetch(`http://localhost:8080/cliente/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const enderecosEntregaDiv = document.getElementById('enderecos-entrega');
        enderecosEntregaDiv.innerHTML = '';
        if (data.enderecosEntrega) {
            enderecosExistentes = data.enderecosEntrega; // Armazena os endereços existentes
            data.enderecosEntrega.forEach((endereco, index) => {
                enderecosEntregaDiv.innerHTML += `
                    <div>
                        <h3>Endereço ${index + 1}</h3>
                        <p>CEP: ${endereco.cep || ''}</p>
                        <p>Logradouro: ${endereco.logradouro || ''}</p>
                        <p>Número: ${endereco.numero || ''}</p>
                        <p>Complemento: ${endereco.complemento || ''}</p>
                        <p>Bairro: ${endereco.bairro || ''}</p>
                        <p>Cidade: ${endereco.cidade || ''}</p>
                        <p>UF: ${endereco.uf || ''}</p>
                        <label for="endereco-${index}">Endereço Padrão:</label>
                        <input type="radio" id="endereco-${index}" name="enderecoPadrao" value="${index}" ${endereco.padrao ? 'checked' : ''}><br>
                    </div>
                `;
            });

            document.querySelectorAll('input[name="enderecoPadrao"]').forEach(input => {
                input.addEventListener('change', function() {
                    document.getElementById('proximaEtapa').disabled = false;
                });
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar dados do cliente:', error);
        alert('Erro ao carregar dados do cliente: ' + error.message);
    });
}

function buscarEndereco() {
    const cep = document.getElementById('cep').value;
    if (cep) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById('logradouro').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('uf').value = data.uf || '';
            } else {
                alert('CEP não encontrado.');
            }
        })
        .catch(error => console.error('Erro ao buscar endereço:', error));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    carregarDadosCliente(clienteId);

    document.getElementById('cep').addEventListener('blur', buscarEndereco);

    document.getElementById('formNovoEndereco').addEventListener('submit', function(event) {
        event.preventDefault();

        const novoEndereco = {
            cep: document.getElementById('cep').value,
            logradouro: document.getElementById('logradouro').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            uf: document.getElementById('uf').value,
            cliente: {
                id: clienteId
            }
        };

        console.log('Novo Endereço:', novoEndereco);

        fetch(`http://localhost:8080/cliente/endereco`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(novoEndereco)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.text(); // Alterado para response.text() para lidar com respostas de texto
        })
        .then(data => {
            alert('Endereço adicionado com sucesso!');
            $('#enderecoModal').modal('hide');
            carregarDadosCliente(clienteId); // Recarrega os dados do cliente para atualizar a lista de endereços
        })
        .catch(error => {
            console.error('Erro ao adicionar endereço:', error);
            alert('Erro ao adicionar endereço: ' + error.message);
        });
    });

    document.getElementById('proximaEtapa').addEventListener('click', function() {
        const enderecoSelecionado = document.querySelector('input[name="enderecoPadrao"]:checked');
        if (enderecoSelecionado) {
            localStorage.setItem('enderecoEntrega', enderecoSelecionado.value);
            document.getElementById('formaPagamento').style.display = 'block';
            document.getElementById('enderecos-entrega').style.display = 'none';
            document.getElementById('adicionarEndereco').style.display = 'none';
            document.getElementById('proximaEtapa').style.display = 'none';
            document.querySelector('.timeline-step:nth-child(1)').classList.remove('active');
            document.querySelector('.timeline-step:nth-child(1)').classList.add('completed');
            document.querySelector('.timeline-step:nth-child(2)').classList.add('active');
        } else {
            alert('Por favor, selecione um endereço de entrega.');
        }
    });

    document.querySelectorAll('input[name="formaPagamento"]').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'cartao') {
                document.getElementById('dadosCartao').style.display = 'block';
            } else {
                document.getElementById('dadosCartao').style.display = 'none';
            }
        });
    });

    document.getElementById('validarPagamento').addEventListener('click', function() {
        const formaPagamentoSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
        if (!formaPagamentoSelecionada) {
            alert('Por favor, selecione uma forma de pagamento.');
            return;
        }

        if (formaPagamentoSelecionada.value === 'cartao') {
            const numeroCartao = document.getElementById('numeroCartao').value;
            const codigoVerificador = document.getElementById('codigoVerificador').value;
            const nomeCompleto = document.getElementById('nomeCompleto').value;
            const dataVencimento = document.getElementById('dataVencimento').value;
            const parcelas = document.getElementById('parcelas').value;

            if (!numeroCartao || !codigoVerificador || !nomeCompleto || !dataVencimento || !parcelas) {
                alert('Por favor, preencha todos os campos do cartão de crédito.');
                return;
            }
        }

        // Exibir a tela de resumo do pedido
        document.getElementById('formaPagamento').style.display = 'none';
        document.getElementById('resumoPedido').style.display = 'block';
        document.querySelector('.timeline-step:nth-child(2)').classList.remove('active');
        document.querySelector('.timeline-step:nth-child(2)').classList.add('completed');
        document.querySelector('.timeline-step:nth-child(3)').classList.add('active');

        // Preencher os detalhes do pedido
        const detalhesPedidoDiv = document.getElementById('detalhesPedido');
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const enderecoSelecionado = enderecosExistentes[localStorage.getItem('enderecoEntrega')];
        const formaPagamento = formaPagamentoSelecionada.value === 'boleto' ? 'Boleto' : formaPagamentoSelecionada.value === 'pix' ? 'Pix' : 'Cartão de Crédito';

        let produtosHtml = '';
        let subtotal = 0;

        carrinho.forEach(item => {
            const itemTotal = item.preco * item.quantidade;
            subtotal += itemTotal;
            produtosHtml += `
                <p>${item.nome} - Quantidade: ${item.quantidade} - Valor Unitário: R$ ${item.preco.toFixed(2)}</p>
            `;
        });

        const frete = 20; // Valor fixo de frete para exemplo
        const total = subtotal + frete;

        detalhesPedidoDiv.innerHTML = `
            <h4>Produtos</h4>
            ${produtosHtml}
            <h4>Valores</h4>
            <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
            <p>Frete: R$ ${frete.toFixed(2)}</p>
            <p>Total: R$ ${total.toFixed(2)}</p>
            <h4>Endereço de Entrega</h4>
            <p>${enderecoSelecionado.logradouro}, ${enderecoSelecionado.numero}, ${enderecoSelecionado.bairro}, ${enderecoSelecionado.cidade} - ${enderecoSelecionado.uf}, CEP: ${enderecoSelecionado.cep}</p>
            <h4>Forma de Pagamento</h4>
            <p>${formaPagamento}</p>
        `;
    });

    document.getElementById('concluirCompra').addEventListener('click', function() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        let subtotal = 0;

        carrinho.forEach(item => {
            subtotal += item.preco * item.quantidade;
        });

        // Recupera o valor do frete do localStorage
        const frete = parseFloat(localStorage.getItem('frete')) || 0;
        const total = subtotal + frete;

        const enderecoSelecionado = enderecosExistentes[localStorage.getItem('enderecoEntrega')];
        const formaPagamentoSelecionada = document.querySelector('input[name="formaPagamento"]:checked').value;

        const pedido = {
            valorTotal: total,
            status: 'aguardando pagamento',
            itens: carrinho.map(item => ({
                product: { id: item.id }, // Certifique-se de que o produto está sendo referenciado corretamente
                quantidade: item.quantidade,
                precoUnitario: item.preco
            })),
            clienteId: clienteId, // Adiciona o clienteId ao objeto pedido
            enderecoEntrega: enderecoSelecionado, // Adiciona o endereço de entrega ao objeto pedido
            formaPagamento: formaPagamentoSelecionada // Adiciona a forma de pagamento ao objeto pedido
        };

        fetch(`http://localhost:8080/pedido/concluir?clienteId=${clienteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pedido)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            alert(`Pedido ${data.numeroPedido} criado com sucesso! Valor: R$ ${data.valorTotal.toFixed(2)}`);
            // Limpar o carrinho após a conclusão da compra
            localStorage.removeItem('carrinho');
            localStorage.removeItem('frete');
            // Redirecionar ou atualizar a página conforme necessário
        })
        .catch(error => {
            console.error('Erro ao concluir compra:', error);
            alert('Erro ao concluir compra: ' + error.message);
        });
    });
});

// Função para carregar produtos no checkout
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

    // Chamar a função calcularFrete para garantir que o frete seja atualizado
    calcularFrete();

    const frete = parseFloat(document.getElementById('freteValue').innerText);
    const total = subtotal + (isNaN(frete) ? 0 : frete);

    produtosCheckoutDiv.innerHTML += `
        <h4>Valores</h4>
        <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
        <p>Frete: R$ ${frete.toFixed(2)}</p>
        <p>Total: R$ ${total.toFixed(2)}</p>
    `;
}
document.addEventListener('DOMContentLoaded', function() {
    // Função para atualizar as informações do cartão
    function atualizarCartao() {
        const numeroCartao = document.getElementById('numeroCartao').value;
        const nomeCompleto = document.getElementById('nomeCompleto').value;
        const dataVencimento = document.getElementById('dataVencimento').value;
        const codigoVerificador = document.getElementById('codigoVerificador').value;

        document.querySelector('.flip-card-front .number').textContent = numeroCartao || '#### #### #### ####';
        document.querySelector('.flip-card-front .name').textContent = nomeCompleto || 'NOME COMPLETO';
        document.querySelector('.flip-card-front .date_8264').textContent = dataVencimento ? dataVencimento.split('-').reverse().join(' / ') : 'MM / AA';
        document.querySelector('.flip-card-back .code').textContent = codigoVerificador || '***';
    }

    // Adicionar event listeners aos campos do formulário
    document.getElementById('numeroCartao').addEventListener('input', atualizarCartao);
    document.getElementById('nomeCompleto').addEventListener('input', atualizarCartao);
    document.getElementById('dataVencimento').addEventListener('input', atualizarCartao);
    document.getElementById('codigoVerificador').addEventListener('input', atualizarCartao);
});