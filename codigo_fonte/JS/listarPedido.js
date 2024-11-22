document.addEventListener('DOMContentLoaded', function() {
    const authToken = localStorage.getItem('authToken');
    const clienteId = localStorage.getItem('clienteId'); // Supondo que o ID do cliente esteja armazenado no localStorage

    if (!authToken || !clienteId) {
        alert('Você precisa estar logado para ver seus pedidos.');
        window.location.href = 'login.html';
        return;
    }

    fetch(`http://localhost:8080/pedido/listarPorCliente?clienteId=${clienteId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => {
        console.log('Status da resposta:', response.status); // Log do status da resposta
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(pedidos => {
        console.log('Pedidos recebidos:', pedidos); // Adicione este log para verificar a resposta da API
        const tableBody = document.getElementById('pedidoTable');
        tableBody.innerHTML = '';

        // Ordenar pedidos por data de forma decrescente
        pedidos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

        pedidos.forEach(pedido => {
            console.log('Data de criação original:', pedido.dataCriacao); // Log da data original
            const dataCriacao = new Date(pedido.dataCriacao);
            console.log('Data de criação convertida:', dataCriacao); // Log da data convertida
            const dataFormatada = isNaN(dataCriacao) ? 'Data Inválida' : dataCriacao.toLocaleDateString('pt-BR');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.numeroPedido}</td>
                <td>${dataFormatada}</td>
                <td>R$ ${pedido.valorTotal.toFixed(2)}</td>
                <td>${pedido.status}</td>
                <td><button class="btn btn-info" onclick="verDetalhes(${pedido.id})">Ver Detalhes</button></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Erro ao buscar os pedidos:', error);
        alert('Erro ao buscar os pedidos: ' + error.message); // Adicione um alerta para o usuário
    });
});

function verDetalhes(pedidoId) {
    // Redirecionar para uma página de detalhes do pedido (implementar conforme necessário)
    window.location.href = `detalhesPedido.html?pedidoId=${pedidoId}`;
}