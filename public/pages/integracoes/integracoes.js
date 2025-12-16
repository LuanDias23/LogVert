/**
 * Integrações Page - JavaScript
 * Gerencia modais de conexão e formulários de integração
 */

document.addEventListener('DOMContentLoaded', function () {
    // ========================================
    // 1. MODAIS DE INTEGRAÇÃO
    // ========================================
    const connectButtons = document.querySelectorAll('.btn-connect[data-modal]');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const modals = document.querySelectorAll('.modal-overlay');

    // Abrir modal ao clicar no botão
    connectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        });
    });

    // Fechar modal ao clicar no X
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Fechar modal ao clicar fora
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => modal.classList.remove('active'));
        }
    });

    // ========================================
    // 2. FORMULÁRIO WHATSAPP
    // ========================================
    const whatsappForm = document.getElementById('whatsappForm');

    if (whatsappForm) {
        whatsappForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const token = document.getElementById('whatsappToken').value;
            const phone = document.getElementById('whatsappPhone').value;
            const phoneId = document.getElementById('whatsappPhoneId').value;

            // Preparar dados para API
            const integrationData = {
                platform: 'whatsapp',
                credentials: {
                    accessToken: token,
                    phoneNumber: phone,
                    phoneNumberId: phoneId
                }
            };

            try {
                // Aqui você implementará a chamada real à sua API
                console.log('Conectando WhatsApp:', integrationData);

                // Simular sucesso
                alert('WhatsApp conectado com sucesso!');
                document.getElementById('whatsappModal').classList.remove('active');

                // Atualizar status do card
                updateCardStatus('whatsapp', true);
            } catch (error) {
                console.error('Erro ao conectar WhatsApp:', error);
                alert('Erro ao conectar. Verifique os dados e tente novamente.');
            }
        });
    }

    // ========================================
    // 3. FORMULÁRIO TELEGRAM
    // ========================================
    const telegramForm = document.getElementById('telegramForm');

    if (telegramForm) {
        telegramForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const token = document.getElementById('telegramToken').value;

            const integrationData = {
                platform: 'telegram',
                credentials: {
                    botToken: token
                }
            };

            try {
                console.log('Conectando Telegram:', integrationData);

                alert('Telegram conectado com sucesso!');
                document.getElementById('telegramModal').classList.remove('active');

                updateCardStatus('telegram', true);
            } catch (error) {
                console.error('Erro ao conectar Telegram:', error);
                alert('Erro ao conectar. Verifique o token e tente novamente.');
            }
        });
    }

    // ========================================
    // 4. OAUTH BUTTONS (Instagram/Messenger)
    // ========================================
    const oauthButtons = document.querySelectorAll('.btn-oauth');

    oauthButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // URLs de OAuth serão configuradas no backend
            const platform = btn.classList.contains('instagram') ? 'instagram' : 'messenger';

            // Redirecionar para OAuth (a implementar)
            console.log(`Iniciando OAuth para ${platform}`);

            // Simular popup de OAuth
            alert(`A integração OAuth com ${platform} será implementada em breve. Configure suas credenciais no Meta Business Suite.`);
        });
    });

    // ========================================
    // 5. HELPER: ATUALIZAR STATUS DO CARD
    // ========================================
    function updateCardStatus(platform, connected) {
        const card = document.querySelector(`[data-platform="${platform}"]`);
        if (!card) return;

        const status = card.querySelector('.integration-status');
        const button = card.querySelector('.btn-connect');

        if (connected) {
            status.className = 'integration-status connected';
            status.textContent = 'Conectado';
            button.innerHTML = '<i class="fas fa-cog"></i> Configurar';
        } else {
            status.className = 'integration-status disconnected';
            status.textContent = 'Desconectado';
            button.innerHTML = '<i class="fas fa-plug"></i> Conectar';
        }

        // Atualizar contador
        updateConnectedCount();
    }

    function updateConnectedCount() {
        const connectedCards = document.querySelectorAll('.integration-status.connected').length;
        const totalCards = document.querySelectorAll('.integracao-card:not([data-platform="ecommerce"])').length;

        const statValue = document.querySelector('.integracoes-stats .stat-card:first-child .stat-value');
        if (statValue) {
            statValue.textContent = `${connectedCards} / ${totalCards + 1}`;
        }
    }
});
