// --- JavaScript para Lógica do Wizard ---

        let currentStep = 1;
        let selectedOrder = null;
        let selectedProducts = []; // Lista dos itens que serão devolvidos

        // Dados simulados para o cliente
        const clientOrders = [
            { id: 'P-9876', data: '01/10/2025', valor: 'R$ 159.80', status: 'Entregue', 
                items: [
                    { id: 'I-001', nome: 'Camisa Polo Azul', sku: 'CP-AZU-M', valor: 79.90, selected: true }, // SIMULANDO ITEM CLICADO ANTES
                    { id: 'I-002', nome: 'Meia Cano Longo (Preta)', sku: 'ML-PRE-UNI', valor: 19.90, selected: false },
                    { id: 'I-003', nome: 'Calça Jeans Skinny', sku: 'CJ-SK-40', valor: 59.90, selected: true } // SIMULANDO MULTI-SELEÇÃO
                ]
            },
            { id: 'P-9800', data: '15/09/2025', valor: 'R$ 499.00', status: 'Entregue', 
                items: [
                    { id: 'I-004', nome: 'Relógio Smartwatch', sku: 'RSW-001', valor: 499.00, selected: true }
                ]
            }
        ];
        
        // Mapeamento das Ações Desejadas (para Etapa 2)
        const actionOptions = [
            { value: 'troca', label: 'Trocar por Outro Item/Tamanho', detail: 'Ideal para erro de tamanho ou defeito. Processamos o reenvio.' },
            { value: 'vale', label: 'Vale-Crédito na Loja', detail: 'Receba um crédito para usar em qualquer outro produto da loja.' },
            { value: 'reembolso', label: 'Reembolso do Valor', detail: 'O valor será devolvido na forma original de pagamento.' }
        ];

        // --- FUNÇÕES DE INICIALIZAÇÃO E RENDERIZAÇÃO ---

        function renderOrderList() {
            const orderListDiv = document.getElementById('order-list');
            orderListDiv.innerHTML = '';
            
            clientOrders.forEach(order => {
                const div = document.createElement('div');
                div.className = 'order-list-item';
                div.setAttribute('data-order-id', order.id); 
                div.innerHTML = `
                    <p style="margin: 0;"><strong>Pedido ID: ${order.id}</strong> (Data: ${order.data})</p>
                    <small>Itens: ${order.items.length} | Total: ${order.valor}</small>
                `;
                div.onclick = () => selectOrder(order.id);
                orderListDiv.appendChild(div);
            });
            
            // Renderiza as opções de ação na Etapa 2
            const actionGrid = document.getElementById('action-grid');
            actionGrid.innerHTML = actionOptions.map(opt => `
                <label class="action-option">
                    <input type="radio" name="acao-desejada" value="${opt.value}" required>
                    <span>${opt.label}</span>
                    <small style="color: var(--text-muted);">${opt.detail}</small>
                </label>
            `).join('');
        }

        function selectOrder(orderId) {
            const order = clientOrders.find(o => o.id === orderId);
            if (!order) return;
            
            // 1. Atualiza o visual do pedido
            document.querySelectorAll('.order-list-item').forEach(el => el.classList.remove('selected'));
            document.querySelector(`[data-order-id="${orderId}"]`).classList.add('selected');
            
            // 2. Atualiza a lógica
            selectedOrder = order;
            // Popula selectedProducts APENAS com os itens marcados como 'selected: true' na simulação
            selectedProducts = order.items
                .filter(item => item.selected)
                .map(item => ({ 
                    id: item.id, 
                    nome: item.nome, 
                    sku: item.sku, 
                    valor: item.valor 
                }));
                
            renderProductConfirmationList(order.items);
        }

        function renderProductConfirmationList(items) {
            const productListDiv = document.getElementById('product-confirmation-list');
            productListDiv.innerHTML = '';
            
            const itemsToConfirm = items.filter(item => item.selected);

            if (itemsToConfirm.length === 0) {
                 productListDiv.innerHTML = `<p style="color: var(--danger-color);">Nenhum item foi selecionado para troca neste pedido. Por favor, selecione outro pedido ou volte à lista de pedidos.</p>`;
                 document.getElementById('next-step-1').disabled = true;
            } else {
                 itemsToConfirm.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'product-item-fixed';
                    div.innerHTML = `
                        <div>
                            <strong>${item.nome}</strong> (SKU: ${item.sku})
                            <small style="display: block; color: var(--text-muted);">Valor: R$ ${item.valor.toFixed(2)}</small>
                        </div>
                        <span class="check-mark">✔</span>
                    `;
                    productListDiv.appendChild(div);
                });
                document.getElementById('next-step-1').disabled = false;
            }
            
            document.getElementById('selected-order-id').textContent = selectedOrder.id;
            document.getElementById('product-confirmation-card').style.display = 'block';
        }

        // --- FUNÇÕES DE NAVEGAÇÃO E LÓGICA ---

        function updateSteps(step) {
            // Atualização visual do indicador
            document.querySelectorAll('.step').forEach((el, index) => {
                el.classList.remove('active', 'completed');
                if (index + 1 < step) {
                    el.classList.add('completed');
                } else if (index + 1 === step) {
                    el.classList.add('active');
                }
            });
            // Atualização do conteúdo
            document.querySelectorAll('.step-content').forEach((el, index) => {
                el.style.display = (index + 1 === step) ? 'block' : 'none';
            });
            currentStep = step;
        }

        function nextStep(step) {
            if (step === 2) {
                if (!selectedOrder || selectedProducts.length === 0) {
                    alert('⚠️ Por favor, selecione um Pedido e confirme os Itens a serem trocados.');
                    return;
                }
                updateSelectedSummary(); // Atualiza o resumo da Etapa 2
            } else if (step === 3) {
                // Validação da Etapa 2
                if (!document.getElementById('motivo').value || !document.querySelector('input[name="acao-desejada"]:checked')) {
                     alert('⚠️ Por favor, preencha o Motivo e a Solução Desejada na Etapa 2.');
                    return;
                }
                renderReviewSummary(); // Prepara a revisão final
            }
            updateSteps(step);
        }

        function prevStep(step) {
            updateSteps(step);
        }
        
        function updateSelectedSummary() {
             const summaryDiv = document.getElementById('selected-items-summary');
             const names = selectedProducts.map(p => p.nome.split(' (')[0]).join(', ');
             const totalValue = selectedProducts.reduce((sum, p) => sum + p.valor, 0).toFixed(2);
             summaryDiv.innerHTML = `
                 **${selectedProducts.length} item(s) selecionado(s):** ${names}. 
                 (Valor Total: R$ ${totalValue})
             `;
        }
        
        function setupConditionalFields() {
            const motivoSelect = document.getElementById('motivo');
            const uploadArea = document.getElementById('upload-area');
            const sizeColorArea = document.getElementById('size-color-area');

            motivoSelect.addEventListener('change', function() {
                const motivo = this.value;
                
                // Resetar estados
                uploadArea.style.display = 'none';
                sizeColorArea.style.display = 'none';

                // Lógica de exibição
                if (motivo === 'defeito' || motivo === 'divergente') {
                    uploadArea.style.display = 'block';
                } else if (motivo === 'tamanho') {
                    sizeColorArea.style.display = 'block';
                }
            });
        }
        
        function renderReviewSummary() {
            const reviewDiv = document.getElementById('review-summary');
            const motivo = document.getElementById('motivo').value;
            const acao = document.querySelector('input[name="acao-desejada"]:checked').labels[0].textContent;
            const detalhes = document.getElementById('detalhes').value || 'Nenhum detalhe adicional fornecido.';
            const novoItem = document.getElementById('novo-tamanho').value || 'Não se aplica / Aguardar disponibilidade';
            const totalValue = selectedProducts.reduce((sum, p) => sum + p.valor, 0).toFixed(2);
            
            reviewDiv.innerHTML = `
                <p style="color: var(--white-detail);"><strong>Pedido Original:</strong> ${selectedOrder.id}</p>
                <p style="color: var(--white-detail);"><strong>Itens a Devolver:</strong> 
                    ${selectedProducts.map(p => `${p.nome} (R$ ${p.valor.toFixed(2)})`).join('; ')}</p>
                <hr style="border-color: var(--border-color-dark);">
                <p style="color: var(--white-detail);"><strong>Motivo Principal:</strong> <span style="color: var(--danger-color);">${motivo}</span></p>
                <p style="color: var(--white-detail);"><strong>Detalhes:</strong> ${detalhes}</p>
                ${(motivo === 'defeito' || motivo === 'divergente') ? 
                    `<p style="color: var(--white-detail);"><strong>Fotos Anexadas:</strong> ${document.getElementById('anexos').files.length} arquivo(s)</p>` : ''}
                
                <h3 style="color: var(--neon-green); margin-top: 20px;">Ação Desejada e Valores</h3>
                <p style="color: var(--white-detail);"><strong>Solução Escolhida:</strong> ${acao}</p>
                <p style="color: var(--white-detail);"><strong>Valor Total do Crédito/Reembolso:</strong> R$ ${totalValue}</p>
                ${(motivo === 'tamanho' || acao.includes('Trocar')) ? 
                    `<p style="color: var(--white-detail);"><strong>Troca Solicitada:</strong> ${novoItem}</p>` : ''}
            `;
        }

        // --- INICIALIZAÇÃO ---

        document.addEventListener('DOMContentLoaded', () => {
            renderOrderList();
            setupConditionalFields();
            updateSteps(1); // Inicia no Passo 1
            
            document.getElementById('form-troca').addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validações Finais
                if (currentStep !== 3) {
                     alert('⚠️ Por favor, revise todos os passos antes de finalizar.');
                     nextStep(3);
                     return;
                }
                
                const idTroca = 'T-' + Math.floor(Math.random() * 90000 + 10000);
                
                alert(`✅ Solicitação de Troca Registrada com SUCESSO!\n\nID da Troca: ${idTroca} para o pedido ${selectedOrder.id}.\n\nO código de postagem e os próximos passos serão enviados para o seu e-mail.\n\nVocê será redirecionado para a tela de acompanhamento.`);
            });
            
            // Simular a pré-seleção do primeiro pedido para facilitar o teste
            // selectOrder(clientOrders[0].id);
        });
        // --- NOVO CÓDIGO PARA PRÉ-SELEÇÃO FLUIDA ---

// 1. Função auxiliar para ler o código do produto na URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 2. Lógica para processar o clique do catálogo ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // ... (restante do seu código DOMContentLoaded) ...
    
    // CHAMADA PRINCIPAL: Coloque este bloco no final da sua inicialização
    const productIdFromUrl = getUrlParameter('product_id');

    if (productIdFromUrl) {
        let targetOrderId = null;

        // A - Encontrar o Pedido que contém o Produto
        for (const order of clientOrders) {
            if (order.items.some(item => item.id === productIdFromUrl)) {
                targetOrderId = order.id;
                break;
            }
        }

        if (targetOrderId) {
            // B - Simular a Seleção do Pedido
            const targetOrder = clientOrders.find(o => o.id === targetOrderId);
            
            // 1. Marca apenas o item clicado como selecionado
            targetOrder.items.forEach(item => {
                item.selected = (item.id === productIdFromUrl);
            });
            
            // 2. Chama a sua função de seleção e atualiza as variáveis globais
            selectOrder(targetOrderId);
            
            // 3. Atualiza a lista de produtos (apenas com o item clicado)
            selectedProducts = targetOrder.items
                .filter(item => item.selected)
                .map(item => ({ 
                    id: item.id, 
                    nome: item.nome, 
                    sku: item.sku, 
                    valor: item.valor 
                }));
            renderProductConfirmationList(targetOrder.items);
            
            // C - Ação FLUENTE: Avançar direto para o Passo 2
            nextStep(2);
            
            // Opcional: Limpa a URL (para estética)
            history.replaceState(null, '', location.pathname);
        }
    }
});// Função auxiliar para obter o parâmetro da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 2. Lógica para processar o clique do catálogo ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // ...
    // Mude de 'product_id' para 'item_id'
    const productIdFromUrl = getUrlParameter('item_id'); // <-- Mude aqui!

    if (productIdFromUrl) {
        // ... (o restante do código de pré-seleção) ...
    }
});