document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('pedidoId');
    const authToken = localStorage.getItem('authToken');

    if (!pedidoId || !authToken) {
        alert('Pedido não encontrado ou usuário não autenticado.');
        window.location.href = 'listarPedidoEstoquista.html';
        return;
    }

    fetch(`http://localhost:8080/pedido/${pedidoId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(pedido => {
        document.getElementById('numeroPedido').value = pedido.numeroPedido;
        document.getElementById('status').value = pedido.status;
    })
    .catch(error => {
        console.error('Erro ao carregar os dados do pedido:', error);
        alert('Erro ao carregar os dados do pedido: ' + error.message);
    });

    document.getElementById('editarPedidoForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const status = document.getElementById('status').value;

        fetch(`http://localhost:8080/pedido/${pedidoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            alert('Status do pedido atualizado com sucesso!');
            window.location.href = 'listarPedidoEstoquista.html';
        })
        .catch(error => {
            console.error('Erro ao atualizar o status do pedido:', error);
            alert('Erro ao atualizar o status do pedido: ' + error.message);
        });
    });
});