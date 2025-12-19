document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERÊNCIAS DO DOM ---
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('addVendaModal');
    const addVendaForm = document.getElementById('addVendaForm');
    const vendaMessage = document.getElementById('vendaMessage');
    const tableBody = document.querySelector('.table-container tbody');
    
    // Campo escondido para saber qual ID estamos editando/deletando (se necessário)
    const editIdInput = document.createElement('input');
    editIdInput.type = 'hidden';
    editIdInput.id = 'editVendaId';
    addVendaForm.appendChild(editIdInput);


    // --- FUNÇÃO PARA PEGAR O TOKEN (REUTILIZÁVEL) ---
    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken'); 
        if (!token) {
            console.warn('Token de autenticação não encontrado. Requisições podem falhar com 403.');
            return {};
        }
        return {
            'Authorization': `Bearer ${token}`
        };
    };

    // --- LÓGICA DE ABERTURA E FECHAMENTO DO MODAL ---
    const fecharModal = () => {
        modalOverlay.classList.remove('active');
        addVendaForm.reset();
        editIdInput.value = ''; // Limpa o ID de edição ao fechar
        document.querySelector('.modal-header h2').textContent = 'Adicionar Nova Venda';
    };

    const abrirModal = () => {
        addVendaForm.reset();
        editIdInput.value = ''; 
        document.querySelector('.modal-header h2').textContent = 'Adicionar Nova Venda';
        modalOverlay.classList.add('active');
        vendaMessage.textContent = '';
        vendaMessage.className = 'form-message';
    };

    if (openModalBtn) openModalBtn.addEventListener('click', abrirModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', fecharModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) fecharModal();
        });
    }

    // =================================================================
    // 📊 READ: BUSCA E LISTAGEM DAS VENDAS
    // =================================================================

    const carregarVendas = async () => {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando vendas...</td></tr>';
        const headers = getAuthHeaders();
        
        try {
            const response = await fetch(`${API_BASE_URL}/vendas`, {
                method: 'GET',
                headers: { ...headers, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Erro ao buscar vendas. Status: ${response.status}`);
            }

            const dados = await response.json();
            const vendas = Array.isArray(dados) ? dados : [];
            
            tableBody.innerHTML = '';

            if (vendas.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma venda cadastrada.</td></tr>';
                return;
            }

            vendas.forEach(venda => {
                const tr = document.createElement('tr');
                const valorFormatado = `R$ ${parseFloat(venda.valorTotal || 0).toFixed(2).replace('.', ',')}`;
                
                // Função simples para mapear status para classe CSS
                const statusClass = venda.statusPedido === 'ENTREGUE' ? 'status-active' : 
                                    venda.statusPedido === 'PENDENTE' ? 'status-inactive' : 
                                    'status-cancelled';

                tr.innerHTML = `
                    <td>#${venda.id}</td>
                    <td>${venda.consumidorNome || 'N/A'}</td>
                    <td>${valorFormatado}</td>
                    <td>${new Date(venda.dataVenda).toLocaleDateString('pt-BR') || 'N/A'}</td>
                    <td><span class="${statusClass}">${venda.statusPedido || 'PENDENTE'}</span></td>
                    <td class="action-buttons">
                        <button class="btn-icon btn-edit" data-id="${venda.id}" title="Ver Detalhes"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon btn-delete" data-id="${venda.id}" title="Excluir Venda"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error("Erro ao carregar vendas:", error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Erro ao carregar vendas: ${error.message}</td></tr>`;
        }
    };


    // =================================================================
    // 💾 SALVAR VENDA (POST)
    // =================================================================

    if (addVendaForm) {
        addVendaForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            vendaMessage.textContent = 'Salvando venda...';
            vendaMessage.className = 'form-message loading'; 

            try {
                // 1. COLETANDO E VALIDANDO DADOS
                const itensVendaRaw = document.getElementById('itensVendaJson').value.trim();
                let itensVenda;
                try {
                    itensVenda = JSON.parse(itensVendaRaw);
                    if (!Array.isArray(itensVenda) || itensVenda.length === 0) {
                         throw new Error("O JSON de itens está vazio ou não é uma lista.");
                    }
                } catch (jsonError) {
                    vendaMessage.textContent = 'ERRO: O formato dos Itens da Venda (JSON) é inválido.';
                    vendaMessage.className = 'form-message error';
                    return;
                }
                
                // 2. MONTANDO O OBJETO DE DADOS
                const dadosVenda = {
                    idLoja: parseInt(document.getElementById('idLoja').value),
                    idConsumidor: parseInt(document.getElementById('idConsumidor').value),
                    statusPedido: document.getElementById('statusPedido').value,
                    formaPagamento: document.getElementById('formaPagamento').value,
                    valorTotal: parseFloat(document.getElementById('valorTotal').value),
                    desconto: parseInt(document.getElementById('desconto').value),
                    prazoTroca: parseInt(document.getElementById('prazoTroca').value),
                    prazoDevolucao: parseInt(document.getElementById('prazoDevolucao').value),
                    itensVenda: itensVenda
                };
                
                const headers = getAuthHeaders();
                
                // 3. CHAMADA DE API (POST)
                const response = await fetch(`${API_BASE_URL}/vendas`, {
                    method: 'POST',
                    headers: { 
                        ...headers, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(dadosVenda),
                });

                const result = await response.json();

                // 4. TRATAMENTO DA RESPOSTA
                if (response.ok) {
                    vendaMessage.textContent = result.message || `Venda #${result.id || 'nova'} registrada com sucesso!`;
                    vendaMessage.className = 'form-message success';
                    
                    carregarVendas(); // Recarrega a lista para mostrar a nova venda

                    setTimeout(fecharModal, 1500); // Fecha após 1.5s
                } else {
                    vendaMessage.textContent = result.message || `Erro (${response.status}) ao salvar a venda.`;
                    vendaMessage.className = 'form-message error';
                }

            } catch (error) {
                console.error("Erro fatal na comunicação:", error);
                vendaMessage.textContent = `ERRO: ${error.message || 'O servidor da API não está respondendo.'}`;
                vendaMessage.className = 'form-message error';
            }
        });
    }

    // =================================================================
    // 🗑️ DELETE: EXCLUIR VENDA
    // =================================================================

    tableBody.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('button.btn-delete');
        if (!deleteButton) return;

        const id = deleteButton.dataset.id;
        const headers = getAuthHeaders();
        
        if (confirm(`Tem certeza que deseja excluir a Venda #${id} permanentemente?`)) {
            try {
                // DELETE para /vendas/{id}
                const response = await fetch(`${API_BASE_URL}/vendas/${id}`, {
                    method: 'DELETE',
                    headers: headers
                });

                if (response.ok || response.status === 204) {
                    alert(`Venda #${id} excluída com sucesso.`);
                    carregarVendas();
                } else {
                    const errorText = await response.text();
                    alert(`Falha ao excluir. Status: ${response.status}. Detalhe: ${errorText}`);
                }

            } catch (error) {
                console.error("Erro ao deletar:", error);
                alert("Erro de conexão ao tentar deletar a venda.");
            }
        }
    });

    // --- CARGA INICIAL DA PÁGINA ---
    carregarVendas();
});