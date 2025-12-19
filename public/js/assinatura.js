/**
 * PÁGINA DE ASSINATURA - LOGVERT
 * Gerenciamento de planos, pagamentos e cartões de crédito
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('💳 Sistema de Assinatura carregado');

    // =================================================================
    // FUNÇÕES DE AUTENTICAÇÃO
    // =================================================================
    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('Token não encontrado');
            return {};
        }
        return { 'Authorization': `Bearer ${token}` };
    };

    // =================================================================
    // CARREGAR HISTÓRICO DE PAGAMENTOS
    // =================================================================
    const loadPaymentHistory = async () => {
        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/payments/history
            // const response = await fetch(`${API_BASE_URL}/payments/history`, {
            //     method: 'GET',
            //     headers: headers
            // });

            // Mock de pagamentos
            const mockPayments = [
                {
                    id: 1,
                    date: '15/12/2024',
                    description: 'Plano Professional - Mensal',
                    method: 'Visa •••• 4242',
                    amount: 'R$ 197,00',
                    status: 'paid',
                    invoiceUrl: '#'
                },
                {
                    id: 2,
                    date: '15/11/2024',
                    description: 'Plano Professional - Mensal',
                    method: 'Visa •••• 4242',
                    amount: 'R$ 197,00',
                    status: 'paid',
                    invoiceUrl: '#'
                },
                {
                    id: 3,
                    date: '15/10/2024',
                    description: 'Plano Professional - Mensal',
                    method: 'Visa •••• 4242',
                    amount: 'R$ 197,00',
                    status: 'paid',
                    invoiceUrl: '#'
                },
                {
                    id: 4,
                    date: '15/09/2024',
                    description: 'Plano Starter - Mensal',
                    method: 'Visa •••• 4242',
                    amount: 'R$ 97,00',
                    status: 'paid',
                    invoiceUrl: '#'
                }
            ];

            renderPaymentHistory(mockPayments);

        } catch (error) {
            console.error('Erro ao carregar histórico de pagamentos:', error);
        }
    };

    const renderPaymentHistory = (payments) => {
        const tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;

        if (payments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p>Nenhum pagamento encontrado</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = payments.map(payment => {
            const statusClass = payment.status === 'paid' ? 'paid' :
                              payment.status === 'pending' ? 'pending' : 'failed';
            const statusText = payment.status === 'paid' ? 'Pago' :
                             payment.status === 'pending' ? 'Pendente' : 'Falhou';
            const statusIcon = payment.status === 'paid' ? 'check-circle' :
                             payment.status === 'pending' ? 'clock' : 'times-circle';

            return `
                <tr>
                    <td>${payment.date}</td>
                    <td>${payment.description}</td>
                    <td><i class="fab fa-cc-${payment.method.toLowerCase().includes('visa') ? 'visa' : 'mastercard'}"></i> ${payment.method}</td>
                    <td style="font-weight: 700;">${payment.amount}</td>
                    <td>
                        <span class="payment-status ${statusClass}">
                            <i class="fas fa-${statusIcon}"></i>
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <button class="btn-download-invoice" onclick="downloadInvoice(${payment.id})">
                            <i class="fas fa-download"></i>
                            Nota Fiscal
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    // Download de nota fiscal
    window.downloadInvoice = async (paymentId) => {
        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/payments/{id}/invoice
            // const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/invoice`, {
            //     method: 'GET',
            //     headers: headers
            // });

            alert(`Download da nota fiscal #${paymentId} iniciado!`);

        } catch (error) {
            console.error('Erro ao baixar nota fiscal:', error);
            alert('Erro ao baixar nota fiscal');
        }
    };

    // =================================================================
    // CARREGAR CARTÕES DE CRÉDITO
    // =================================================================
    const loadCreditCards = async () => {
        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/payment-methods
            // const response = await fetch(`${API_BASE_URL}/payment-methods`, {
            //     method: 'GET',
            //     headers: headers
            // });

            // Mock de cartões
            const mockCards = [
                {
                    id: 1,
                    brand: 'visa',
                    last4: '4242',
                    holder: 'João da Silva',
                    expiry: '12/25',
                    isDefault: true
                },
                {
                    id: 2,
                    brand: 'mastercard',
                    last4: '8888',
                    holder: 'João da Silva',
                    expiry: '06/26',
                    isDefault: false
                }
            ];

            renderCreditCards(mockCards);

        } catch (error) {
            console.error('Erro ao carregar cartões:', error);
        }
    };

    const renderCreditCards = (cards) => {
        const cardsGrid = document.getElementById('cardsGrid');
        if (!cardsGrid) return;

        if (cards.length === 0) {
            cardsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-credit-card" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Nenhum cartão cadastrado</p>
                </div>
            `;
            return;
        }

        cardsGrid.innerHTML = cards.map(card => `
            <div class="credit-card ${card.brand} ${card.isDefault ? 'default' : ''}">
                <div class="card-actions">
                    ${!card.isDefault ? '<button class="card-action-btn" onclick="setDefaultCard(' + card.id + ')" title="Tornar padrão"><i class="fas fa-star"></i></button>' : ''}
                    <button class="card-action-btn" onclick="removeCard(${card.id})" title="Remover"><i class="fas fa-trash"></i></button>
                </div>
                <div class="card-header-cc">
                    <div class="card-brand">
                        <i class="fab fa-cc-${card.brand}"></i>
                    </div>
                    ${card.isDefault ? '<div class="default-badge"><i class="fas fa-star"></i> Padrão</div>' : ''}
                </div>
                <div class="card-number">
                    •••• •••• •••• ${card.last4}
                </div>
                <div class="card-footer-cc">
                    <div class="card-holder">
                        <div>Nome</div>
                        <div class="card-holder-name">${card.holder}</div>
                    </div>
                    <div class="card-expiry">
                        <div>Validade</div>
                        <div class="card-expiry-date">${card.expiry}</div>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Tornar cartão padrão
    window.setDefaultCard = async (cardId) => {
        if (!confirm('Tornar este cartão o método de pagamento padrão?')) return;

        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/payment-methods/{id}/set-default
            // const response = await fetch(`${API_BASE_URL}/payment-methods/${cardId}/set-default`, {
            //     method: 'PATCH',
            //     headers: headers
            // });

            alert('Cartão definido como padrão!');
            loadCreditCards();

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao definir cartão como padrão');
        }
    };

    // Remover cartão
    window.removeCard = async (cardId) => {
        if (!confirm('Tem certeza que deseja remover este cartão?')) return;

        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/payment-methods/{id}
            // const response = await fetch(`${API_BASE_URL}/payment-methods/${cardId}`, {
            //     method: 'DELETE',
            //     headers: headers
            // });

            alert('Cartão removido com sucesso!');
            loadCreditCards();

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao remover cartão');
        }
    };

    // =================================================================
    // MODAL: ADICIONAR CARTÃO
    // =================================================================
    const addCardModal = document.getElementById('addCardModal');
    const addCardBtn = document.getElementById('addCardBtn');
    const closeAddCardModal = document.getElementById('closeAddCardModal');
    const cancelAddCard = document.getElementById('cancelAddCard');
    const addCardForm = document.getElementById('addCardForm');

    addCardBtn?.addEventListener('click', () => {
        addCardModal.classList.add('active');
    });

    closeAddCardModal?.addEventListener('click', () => {
        addCardModal.classList.remove('active');
    });

    cancelAddCard?.addEventListener('click', () => {
        addCardModal.classList.remove('active');
    });

    // Máscara para número do cartão
    const cardNumberInput = document.getElementById('cardNumber');
    cardNumberInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    // Máscara para validade
    const cardExpiryInput = document.getElementById('cardExpiry');
    cardExpiryInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // Submit do formulário
    addCardForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageEl = document.getElementById('cardFormMessage');
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardName = document.getElementById('cardName').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;

        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/payment-methods
            // const response = await fetch(`${API_BASE_URL}/payment-methods`, {
            //     method: 'POST',
            //     headers: {
            //         ...headers,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         number: cardNumber,
            //         name: cardName,
            //         expiry: cardExpiry,
            //         cvv: cardCVV
            //     })
            // });

            messageEl.textContent = 'Cartão adicionado com sucesso!';
            messageEl.className = 'form-message success';

            setTimeout(() => {
                addCardModal.classList.remove('active');
                addCardForm.reset();
                messageEl.className = 'form-message';
                loadCreditCards();
            }, 1500);

        } catch (error) {
            console.error('Erro:', error);
            messageEl.textContent = 'Erro ao adicionar cartão. Verifique os dados.';
            messageEl.className = 'form-message error';
        }
    });

    // =================================================================
    // MODAL: UPGRADE DE PLANO
    // =================================================================
    const upgradeModal = document.getElementById('upgradeModal');
    const closeUpgradeModal = document.getElementById('closeUpgradeModal');
    const cancelUpgrade = document.getElementById('cancelUpgrade');
    const confirmUpgrade = document.getElementById('confirmUpgrade');

    const upgradeButtons = document.querySelectorAll('.btn-plan.upgrade');
    upgradeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const planName = btn.dataset.plan;
            openUpgradeModal(planName);
        });
    });

    closeUpgradeModal?.addEventListener('click', () => {
        upgradeModal.classList.remove('active');
    });

    cancelUpgrade?.addEventListener('click', () => {
        upgradeModal.classList.remove('active');
    });

    const openUpgradeModal = (planName) => {
        const planDetails = {
            'enterprise': {
                name: 'Enterprise',
                price: 397,
                currentPlan: 'Professional',
                currentPrice: 197
            }
        };

        const plan = planDetails[planName];
        if (!plan) return;

        const upgradeSummary = document.getElementById('upgradeSummary');
        const proratedAmount = plan.price - plan.currentPrice;

        upgradeSummary.innerHTML = `
            <div class="upgrade-summary-item">
                <span>Plano atual:</span>
                <span>${plan.currentPlan} - R$ ${plan.currentPrice}/mês</span>
            </div>
            <div class="upgrade-summary-item">
                <span>Novo plano:</span>
                <span>${plan.name} - R$ ${plan.price}/mês</span>
            </div>
            <div class="upgrade-summary-item">
                <span>Cobrança proporcional hoje:</span>
                <span>R$ ${proratedAmount.toFixed(2)}</span>
            </div>
            <div class="upgrade-summary-item">
                <span>Próxima cobrança:</span>
                <span>R$ ${plan.price} em 15/01/2025</span>
            </div>
        `;

        upgradeModal.classList.add('active');

        confirmUpgrade.onclick = async () => {
            await performUpgrade(planName);
        };
    };

    const performUpgrade = async (planName) => {
        const messageEl = document.getElementById('upgradeFormMessage');

        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/subscription/upgrade
            // const response = await fetch(`${API_BASE_URL}/subscription/upgrade`, {
            //     method: 'POST',
            //     headers: {
            //         ...headers,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ plan: planName })
            // });

            messageEl.textContent = 'Upgrade realizado com sucesso!';
            messageEl.className = 'form-message success';

            setTimeout(() => {
                upgradeModal.classList.remove('active');
                location.reload();
            }, 1500);

        } catch (error) {
            console.error('Erro:', error);
            messageEl.textContent = 'Erro ao realizar upgrade. Tente novamente.';
            messageEl.className = 'form-message error';
        }
    };

    // =================================================================
    // INICIALIZAÇÃO
    // =================================================================
    loadPaymentHistory();
    loadCreditCards();

    console.log('✅ Sistema de Assinatura pronto!');
});
