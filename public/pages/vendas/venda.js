document.addEventListener('DOMContentLoaded', () => {
    // Referências ao Modal
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('addVendaModal');
    
    // Referências ao Formulário e Mensagem
    const addVendaForm = document.getElementById('addVendaForm');
    const vendaMessage = document.getElementById('vendaMessage'); // Span para exibir o status

    // --- LÓGICA DE ABERTURA E FECHAMENTO DO MODAL ---
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modalOverlay.classList.add('active');
            vendaMessage.textContent = ''; // Limpa a mensagem ao abrir
            vendaMessage.className = 'form-message';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // =================================================================
    // 🚀 LÓGICA DE IMPLEMENTAÇÃO DA API NO BOTÃO "SALVAR VENDA"
    // =================================================================

    if (addVendaForm) {
        // Usamos 'async' para poder fazer chamadas de rede com 'await'
        addVendaForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            vendaMessage.textContent = 'Salvando venda...';
            vendaMessage.className = 'form-message loading'; 

            try {
                // 1. COLETANDO TODOS OS DADOS DO FORMULÁRIO (Usando os IDs corretos)
                const idLoja = document.getElementById('idLoja').value;
                const idConsumidor = document.getElementById('idConsumidor').value;
                const statusPedido = document.getElementById('statusPedido').value;
                const formaPagamento = document.getElementById('formaPagamento').value;
                
                // Conversão de valores
                const valorTotal = parseFloat(document.getElementById('valorTotal').value);
                const desconto = parseInt(document.getElementById('desconto').value);
                const prazoTroca = parseInt(document.getElementById('prazoTroca').value);
                const prazoDevolucao = parseInt(document.getElementById('prazoDevolucao').value);
                
                // Processamento do JSON de Itens
                let itensVenda;
                try {
                    itensVenda = JSON.parse(document.getElementById('itensVendaJson').value.trim());
                } catch (jsonError) {
                    vendaMessage.textContent = 'ERRO: O formato dos Itens da Venda (JSON) é inválido.';
                    vendaMessage.className = 'form-message error';
                    return;
                }

                // 2. MONTANDO O OBJETO DE DADOS PARA O BACKEND
                const dadosVenda = {
                    idLoja: parseInt(idLoja),
                    idConsumidor: parseInt(idConsumidor),
                    statusPedido,
                    formaPagamento,
                    valorTotal,
                    desconto,
                    prazoTroca,
                    prazoDevolucao,
                    itensVenda
                };
                
                // COLETANDO O TOKEN DO LOCALSTORAGE (Se você usar o header Authorization)
                const token = localStorage.getItem('authToken');
                
                // 3. FAZENDO A CHAMADA DE API (POST para /vendas)
                const response = await fetch(`${API_BASE_URL}/vendas`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        // Se o token existe, adicione o cabeçalho Authorization
                        ...(token && { 'Authorization': `Bearer ${token}` }) 
                    },
                    body: JSON.stringify(dadosVenda),
                });

                const result = await response.json();

                // 4. TRATAMENTO DA RESPOSTA
                if (response.ok) { // Status 200, 201, etc.
                    vendaMessage.textContent = result.message || 'Venda registrada com sucesso!';
                    vendaMessage.className = 'form-message success';
                    
                    setTimeout(() => {
                        modalOverlay.classList.remove('active');
                        addVendaForm.reset();
                    }, 1500);

                } else {
                    // Erro do servidor (Status 4xx, 5xx)
                    vendaMessage.textContent = result.message || 'Erro ao salvar a venda. Verifique os dados.';
                    vendaMessage.className = 'form-message error';
                }

            } catch (error) {
                // Erro de rede (servidor desligado ou URL errado)
                console.error("Erro fatal na comunicação:", error);
                vendaMessage.textContent = 'ERRO DE CONEXÃO: O servidor da API não está respondendo.';
                vendaMessage.className = 'form-message error';
            }
        });
    }
});