/**
 * Assinatura Page - JavaScript
 * Integração com Stripe para gerenciamento de assinaturas
 */

// ========================================
// CONFIGURAÇÃO STRIPE
// ========================================
// IMPORTANTE: Substitua pela sua chave pública do Stripe
const STRIPE_PUBLIC_KEY = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';

// Inicializar Stripe (será feito quando a chave for configurada)
let stripe = null;
let elements = null;
let cardElement = null;

// IDs dos preços no Stripe (configurar no dashboard do Stripe)
const STRIPE_PRICE_IDS = {
    essencial: 'price_essencial_id',
    profissional: 'price_profissional_id',
    empresa: 'price_empresa_id'
};

document.addEventListener('DOMContentLoaded', function () {
    initStripe();
    initModals();
    initPlanButtons();
    initPaymentButtons();
});

// ========================================
// 1. INICIALIZAÇÃO DO STRIPE
// ========================================
function initStripe() {
    // Verificar se a chave do Stripe foi configurada
    if (STRIPE_PUBLIC_KEY.includes('XXXX')) {
        console.warn('Stripe: Configure sua chave pública para habilitar pagamentos.');
        return;
    }

    try {
        stripe = Stripe(STRIPE_PUBLIC_KEY);
        elements = stripe.elements({
            fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap' }]
        });

        // Criar elemento de cartão com estilo customizado
        const style = {
            base: {
                color: '#f0f6fc',
                fontFamily: 'Roboto, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': { color: '#a0aec0' }
            },
            invalid: {
                color: '#ff6b6b',
                iconColor: '#ff6b6b'
            }
        };

        cardElement = elements.create('card', { style });

        // Montar elemento quando modal abrir
        const cardContainer = document.getElementById('card-element');
        if (cardContainer) {
            // Será montado quando o modal abrir
        }

        console.log('Stripe inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar Stripe:', error);
    }
}

// ========================================
// 2. GERENCIAMENTO DE MODAIS
// ========================================
function initModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Fechar modal no X
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    // Fechar modal clicando fora
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => closeModal(modal));
        }
    });

    // Botão de gerenciar pagamento
    const managePaymentBtn = document.getElementById('managePaymentBtn');
    if (managePaymentBtn) {
        managePaymentBtn.addEventListener('click', () => {
            openModal('cardModal');
        });
    }

    // Botões de alterar/adicionar cartão
    const changeCardBtn = document.getElementById('changeCardBtn');
    const addCardBtn = document.getElementById('addCardBtn');

    [changeCardBtn, addCardBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => openModal('cardModal'));
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');

        // Montar elemento Stripe se for o modal de cartão
        if (modalId === 'cardModal' && cardElement) {
            const container = document.getElementById('card-element');
            if (container && !container.hasChildNodes()) {
                cardElement.mount('#card-element');
            }
        }
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
    }
}

// ========================================
// 3. BOTÕES DE PLANOS
// ========================================
function initPlanButtons() {
    const planButtons = document.querySelectorAll('.btn-plan:not(.current)');
    const upgradePlanBtn = document.getElementById('upgradePlanBtn');

    planButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.plan-card');
            const planName = card.dataset.plan;
            const priceId = card.dataset.priceId;

            if (btn.classList.contains('upgrade')) {
                handleUpgrade(planName, priceId);
            } else if (btn.classList.contains('downgrade')) {
                handleDowngrade(planName);
            }
        });
    });

    // Botão de upgrade no card principal
    if (upgradePlanBtn) {
        upgradePlanBtn.addEventListener('click', () => {
            // Scroll para seção de planos
            document.querySelector('.plans-section')?.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

function handleUpgrade(planName, priceId) {
    // Mostrar modal de confirmação
    const modal = document.getElementById('upgradeModal');
    const planNameEl = document.getElementById('upgradePlanName');
    const planPriceEl = document.getElementById('upgradePlanPrice');

    if (planNameEl) {
        planNameEl.textContent = planName.charAt(0).toUpperCase() + planName.slice(1);
    }

    if (planPriceEl) {
        const prices = {
            essencial: 'R$ 9,90/mês',
            profissional: 'R$ 49,90/mês',
            empresa: 'Sob consulta'
        };
        planPriceEl.textContent = prices[planName] || 'Sob consulta';
    }

    openModal('upgradeModal');

    // Handler para confirmar upgrade
    const confirmBtn = document.getElementById('confirmUpgradeBtn');
    if (confirmBtn) {
        confirmBtn.onclick = () => confirmUpgrade(planName, priceId);
    }
}

async function confirmUpgrade(planName, priceId) {
    const confirmBtn = document.getElementById('confirmUpgradeBtn');

    try {
        // Mostrar loading
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        confirmBtn.disabled = true;

        // Chamada à API do backend para atualizar assinatura no Stripe
        const response = await fetch('/api/subscription/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId, planName })
        });

        if (!response.ok) {
            throw new Error('Erro ao processar upgrade');
        }

        const result = await response.json();

        // Sucesso
        alert('Upgrade realizado com sucesso! Seu novo plano já está ativo.');
        closeModal(document.getElementById('upgradeModal'));

        // Recarregar página para atualizar dados
        window.location.reload();
    } catch (error) {
        console.error('Erro no upgrade:', error);
        alert('Erro ao processar upgrade. Tente novamente ou entre em contato com o suporte.');
    } finally {
        confirmBtn.innerHTML = 'Confirmar Upgrade';
        confirmBtn.disabled = false;
    }
}

function handleDowngrade(planName) {
    const confirm = window.confirm(
        `Deseja realmente fazer downgrade para o plano ${planName}? ` +
        `Você perderá acesso a recursos do plano atual no próximo ciclo de faturamento.`
    );

    if (confirm) {
        // Implementar lógica de downgrade
        console.log('Processando downgrade para:', planName);
        alert('Downgrade agendado. A mudança será aplicada no próximo ciclo de faturamento.');
    }
}

// ========================================
// 4. FORMULÁRIO DE CARTÃO
// ========================================
function initPaymentButtons() {
    const cardForm = document.getElementById('cardForm');

    if (cardForm) {
        cardForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!stripe || !cardElement) {
                alert('Sistema de pagamento não configurado. Entre em contato com o suporte.');
                return;
            }

            const submitBtn = cardForm.querySelector('button[type="submit"]');
            const cardholderName = document.getElementById('cardholderName').value;
            const errorDisplay = document.getElementById('card-errors');

            try {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                submitBtn.disabled = true;

                // Criar Payment Method no Stripe
                const { paymentMethod, error } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    billing_details: { name: cardholderName }
                });

                if (error) {
                    errorDisplay.textContent = error.message;
                    return;
                }

                // Enviar para o backend
                const response = await fetch('/api/subscription/payment-method', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentMethodId: paymentMethod.id })
                });

                if (!response.ok) {
                    throw new Error('Erro ao salvar cartão');
                }

                alert('Cartão salvo com sucesso!');
                closeModal(document.getElementById('cardModal'));
                window.location.reload();
            } catch (error) {
                console.error('Erro ao salvar cartão:', error);
                errorDisplay.textContent = 'Erro ao processar. Verifique os dados e tente novamente.';
            } finally {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Cartão';
                submitBtn.disabled = false;
            }
        });
    }
}

// ========================================
// 5. FUNÇÕES AUXILIARES PARA STRIPE API
// ========================================

/**
 * Busca dados da assinatura atual
 * Chamar no carregamento da página para preencher dados dinâmicos
 */
async function fetchSubscriptionData() {
    try {
        const response = await fetch('/api/subscription/current');
        if (!response.ok) throw new Error('Erro ao buscar assinatura');

        const data = await response.json();

        // Atualizar UI com dados da assinatura
        updateSubscriptionUI(data);
    } catch (error) {
        console.error('Erro ao buscar dados da assinatura:', error);
    }
}

function updateSubscriptionUI(data) {
    const elements = {
        currentPlanName: document.getElementById('currentPlanName'),
        currentPlanPrice: document.getElementById('currentPlanPrice'),
        nextBillingDate: document.getElementById('nextBillingDate'),
        paymentMethod: document.getElementById('paymentMethod'),
        planUsage: document.getElementById('planUsage')
    };

    if (data.plan && elements.currentPlanName) {
        elements.currentPlanName.textContent = data.plan.name;
    }
    if (data.plan && elements.currentPlanPrice) {
        elements.currentPlanPrice.textContent = data.plan.price;
    }
    if (data.nextBilling && elements.nextBillingDate) {
        elements.nextBillingDate.textContent = formatDate(data.nextBilling);
    }
    if (data.paymentMethod && elements.paymentMethod) {
        elements.paymentMethod.textContent = `**** ${data.paymentMethod.last4}`;
    }
    if (data.usage && elements.planUsage) {
        elements.planUsage.textContent = `${data.usage.current}/${data.usage.limit}`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Busca histórico de faturas
 */
async function fetchInvoices() {
    try {
        const response = await fetch('/api/subscription/invoices');
        if (!response.ok) throw new Error('Erro ao buscar faturas');

        const invoices = await response.json();
        renderInvoices(invoices);
    } catch (error) {
        console.error('Erro ao buscar faturas:', error);
    }
}

function renderInvoices(invoices) {
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody || !invoices.length) return;

    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td><span class="invoice-id">${invoice.id}</span></td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.plan}</td>
            <td>R$ ${invoice.amount.toFixed(2).replace('.', ',')}</td>
            <td>
                <span class="status-badge ${invoice.status === 'paid' ? 'status-completed' : 'status-pending'}">
                    ${invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                </span>
            </td>
            <td>
                <a href="${invoice.pdfUrl}" target="_blank" class="btn-icon" title="Baixar PDF">
                    <i class="fas fa-download"></i>
                </a>
            </td>
        </tr>
    `).join('');
}
