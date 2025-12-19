/**
 * INTEGRAÇÕES AVANÇADAS LOGVERT
 * Gerenciamento de integrações de redes sociais com backend
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔌 Sistema de Integrações carregado');

    // =================================================================
    // REFERÊNCIAS DO DOM
    // =================================================================
    const connectedChannelsEl = document.getElementById('connectedChannels');
    const automatedMessagesEl = document.getElementById('automatedMessages');
    const resolvedTicketsEl = document.getElementById('resolvedTickets');

    // Modais
    const modals = {
        whatsapp: document.getElementById('whatsappModal'),
        instagram: document.getElementById('instagramModal'),
        messenger: document.getElementById('messengerModal'),
        telegram: document.getElementById('telegramModal')
    };

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
    // ABRIR/FECHAR MODAIS
    // =================================================================
    document.querySelectorAll('.btn-connect').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            if (modals[modalId.replace('Modal', '')]) {
                modals[modalId.replace('Modal', '')].classList.add('active');
                document.querySelector('.overlay').classList.add('active');
            }
        });
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            Object.values(modals).forEach(modal => {
                modal.classList.remove('active');
            });
            document.querySelector('.overlay').classList.remove('active');
        });
    });

    document.querySelector('.overlay')?.addEventListener('click', () => {
        Object.values(modals).forEach(modal => {
            modal.classList.remove('active');
        });
        document.querySelector('.overlay').classList.remove('active');
    });

    // =================================================================
    // CARREGAR STATUS DAS INTEGRAÇÕES
    // =================================================================
    const loadIntegrationStatus = async () => {
        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/integrations/status
            // const response = await fetch(`${API_BASE_URL}/integrations/status`, {
            //     method: 'GET',
            //     headers: headers
            // });

            // Mock de dados enquanto backend não está pronto
            const mockStatus = {
                whatsapp: false,
                instagram: false,
                messenger: false,
                telegram: false,
                stats: {
                    connectedChannels: 0,
                    totalChannels: 5,
                    automatedMessages: 0,
                    resolvedTickets: 0
                }
            };

            updateIntegrationUI(mockStatus);

        } catch (error) {
            console.error('Erro ao carregar status das integrações:', error);
        }
    };

    // =================================================================
    // ATUALIZAR UI COM STATUS
    // =================================================================
    const updateIntegrationUI = (status) => {
        // Atualizar badges de status
        Object.keys(status).forEach(platform => {
            if (platform !== 'stats') {
                const statusEl = document.getElementById(`status-${platform}`);
                if (statusEl) {
                    if (status[platform]) {
                        statusEl.textContent = 'Conectado';
                        statusEl.className = 'integration-status connected';

                        // Atualizar botão
                        const card = document.querySelector(`[data-platform="${platform}"]`);
                        const btn = card?.querySelector('.btn-connect');
                        if (btn) {
                            btn.innerHTML = '<i class="fas fa-check"></i> Conectado';
                            btn.classList.add('connected');
                            btn.onclick = () => disconnectPlatform(platform);
                        }
                    } else {
                        statusEl.textContent = 'Desconectado';
                        statusEl.className = 'integration-status disconnected';
                    }
                }
            }
        });

        // Atualizar estatísticas
        if (status.stats) {
            connectedChannelsEl.textContent = `${status.stats.connectedChannels} / ${status.stats.totalChannels}`;
            automatedMessagesEl.textContent = status.stats.automatedMessages;
            resolvedTicketsEl.textContent = status.stats.resolvedTickets;
        }
    };

    // =================================================================
    // CONECTAR WHATSAPP (META BUSINESS API)
    // =================================================================
    const whatsappForm = document.getElementById('whatsappForm');
    whatsappForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageEl = document.getElementById('whatsappMessage');
        messageEl.textContent = 'Conectando ao WhatsApp Business API...';
        messageEl.className = 'form-message loading';

        const token = document.getElementById('whatsappToken').value;
        const phone = document.getElementById('whatsappPhone').value;
        const phoneId = document.getElementById('whatsappPhoneId').value;

        try {
            const headers = getAuthHeaders();

            // INTEGRAÇÃO REAL: Meta WhatsApp Business API
            // Primeiro valida o token fazendo uma chamada à API da Meta
            const metaValidation = await fetch(`https://graph.facebook.com/v18.0/${phoneId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!metaValidation.ok) {
                throw new Error('Token do WhatsApp inválido ou Phone ID incorreto');
            }

            const metaData = await metaValidation.json();
            console.log('✅ WhatsApp validado:', metaData);

            // Agora salva no backend LogVert
            const response = await fetch(`${API_BASE_URL}/integrations/whatsapp`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    phone,
                    phoneId,
                    verifiedName: metaData.verified_name || phone,
                    displayPhoneNumber: metaData.display_phone_number || phone
                })
            });

            const result = await response.json();

            if (response.ok) {
                messageEl.textContent = '✅ WhatsApp Business conectado com sucesso!';
                messageEl.className = 'form-message success';

                // Configurar webhook automaticamente
                await setupWhatsAppWebhook(phoneId, token);

                setTimeout(() => {
                    modals.whatsapp.classList.remove('active');
                    document.querySelector('.overlay').classList.remove('active');
                    loadIntegrationStatus();
                }, 2000);
            } else {
                throw new Error(result.message || 'Erro ao salvar integração');
            }

        } catch (error) {
            console.error('❌ Erro ao conectar WhatsApp:', error);
            messageEl.textContent = error.message || 'Erro de conexão. Verifique os dados e tente novamente.';
            messageEl.className = 'form-message error';
        }
    });

    // Configurar webhook do WhatsApp automaticamente
    const setupWhatsAppWebhook = async (phoneId, token) => {
        try {
            const webhookUrl = `${API_BASE_URL}/webhooks/whatsapp`;
            const verifyToken = 'logvert_webhook_verify_token';

            const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/subscribed_apps`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscribed_fields: ['messages', 'message_status']
                })
            });

            if (response.ok) {
                console.log('✅ Webhook do WhatsApp configurado');
            } else {
                console.warn('⚠️ Erro ao configurar webhook automático');
            }
        } catch (error) {
            console.warn('⚠️ Webhook não pôde ser configurado automaticamente:', error);
        }
    };

    // =================================================================
    // CONECTAR INSTAGRAM (META GRAPH API - OAUTH 2.0)
    // =================================================================
    const connectInstagramBtn = document.getElementById('connectInstagramBtn');
    connectInstagramBtn?.addEventListener('click', async () => {
        const messageEl = document.getElementById('instagramMessage');
        messageEl.textContent = 'Redirecionando para Facebook Login...';
        messageEl.className = 'form-message loading';

        try {
            // INTEGRAÇÃO REAL: Meta Instagram Graph API via OAuth
            const fbAppId = 'YOUR_FACEBOOK_APP_ID'; // TODO: Configurar no backend
            const redirectUri = `${window.location.origin}/integracoes/instagram/callback`;
            const scope = 'instagram_basic,instagram_manage_messages,pages_show_list,pages_messaging';

            // Construir URL do OAuth
            const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
                `client_id=${fbAppId}` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&scope=${encodeURIComponent(scope)}` +
                `&response_type=code` +
                `&state=${generateStateToken()}`;

            // Salvar estado para validação CSRF
            sessionStorage.setItem('instagram_oauth_state', generateStateToken());

            // Redirecionar para OAuth do Facebook
            window.location.href = oauthUrl;

        } catch (error) {
            console.error('❌ Erro ao iniciar OAuth do Instagram:', error);
            messageEl.textContent = 'Erro ao conectar Instagram. Tente novamente.';
            messageEl.className = 'form-message error';
        }
    });

    // Processar callback do Instagram OAuth
    if (window.location.pathname === '/integracoes/instagram/callback') {
        processInstagramCallback();
    }

    async function processInstagramCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const savedState = sessionStorage.getItem('instagram_oauth_state');

        if (!code || state !== savedState) {
            alert('❌ Erro de autenticação: Estado inválido');
            window.location.href = '/integracoes';
            return;
        }

        try {
            const headers = getAuthHeaders();

            // Enviar código para backend trocar por access token
            const response = await fetch(`${API_BASE_URL}/integrations/instagram/oauth/callback`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });

            const result = await response.json();

            if (response.ok) {
                sessionStorage.removeItem('instagram_oauth_state');
                alert('✅ Instagram conectado com sucesso!');
                window.location.href = '/integracoes';
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('❌ Erro no callback do Instagram:', error);
            alert('Erro ao conectar Instagram');
            window.location.href = '/integracoes';
        }
    }

    function generateStateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // =================================================================
    // CONECTAR MESSENGER (META GRAPH API - OAUTH 2.0)
    // =================================================================
    const connectMessengerBtn = document.getElementById('connectMessengerBtn');
    connectMessengerBtn?.addEventListener('click', async () => {
        const messageEl = document.getElementById('messengerMessage');
        messageEl.textContent = 'Redirecionando para Facebook Login...';
        messageEl.className = 'form-message loading';

        try {
            // INTEGRAÇÃO REAL: Meta Messenger API via OAuth
            const fbAppId = 'YOUR_FACEBOOK_APP_ID'; // TODO: Configurar no backend
            const redirectUri = `${window.location.origin}/integracoes/messenger/callback`;
            const scope = 'pages_messaging,pages_show_list,pages_manage_metadata';

            // Construir URL do OAuth
            const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
                `client_id=${fbAppId}` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&scope=${encodeURIComponent(scope)}` +
                `&response_type=code` +
                `&state=${generateStateToken()}`;

            // Salvar estado para validação CSRF
            sessionStorage.setItem('messenger_oauth_state', generateStateToken());

            // Redirecionar para OAuth do Facebook
            window.location.href = oauthUrl;

        } catch (error) {
            console.error('❌ Erro ao iniciar OAuth do Messenger:', error);
            messageEl.textContent = 'Erro ao conectar Messenger. Tente novamente.';
            messageEl.className = 'form-message error';
        }
    });

    // Processar callback do Messenger OAuth
    if (window.location.pathname === '/integracoes/messenger/callback') {
        processMessengerCallback();
    }

    async function processMessengerCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const savedState = sessionStorage.getItem('messenger_oauth_state');

        if (!code || state !== savedState) {
            alert('❌ Erro de autenticação: Estado inválido');
            window.location.href = '/integracoes';
            return;
        }

        try {
            const headers = getAuthHeaders();

            // Enviar código para backend trocar por access token
            const response = await fetch(`${API_BASE_URL}/integrations/messenger/oauth/callback`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });

            const result = await response.json();

            if (response.ok) {
                sessionStorage.removeItem('messenger_oauth_state');
                alert('✅ Messenger conectado com sucesso!');
                window.location.href = '/integracoes';
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('❌ Erro no callback do Messenger:', error);
            alert('Erro ao conectar Messenger');
            window.location.href = '/integracoes';
        }
    }

    // =================================================================
    // CONECTAR TELEGRAM (BOT API)
    // =================================================================
    const telegramForm = document.getElementById('telegramForm');
    telegramForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageEl = document.getElementById('telegramMessage');
        messageEl.textContent = 'Validando bot do Telegram...';
        messageEl.className = 'form-message loading';

        const botToken = document.getElementById('telegramToken').value;

        try {
            const headers = getAuthHeaders();

            // INTEGRAÇÃO REAL: Telegram Bot API
            // Primeiro valida o token chamando getMe
            const telegramValidation = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);

            if (!telegramValidation.ok) {
                throw new Error('Token do Telegram inválido');
            }

            const botData = await telegramValidation.json();

            if (!botData.ok) {
                throw new Error('Token do Telegram inválido');
            }

            console.log('✅ Bot Telegram validado:', botData.result);

            // Configurar webhook antes de salvar no backend
            const webhookUrl = `${API_BASE_URL}/webhooks/telegram`;
            await setupTelegramWebhook(botToken, webhookUrl);

            // Agora salva no backend LogVert
            const response = await fetch(`${API_BASE_URL}/integrations/telegram`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    botToken,
                    botUsername: botData.result.username,
                    botName: botData.result.first_name,
                    botId: botData.result.id
                })
            });

            const result = await response.json();

            if (response.ok) {
                messageEl.textContent = `✅ Bot @${botData.result.username} conectado com sucesso!`;
                messageEl.className = 'form-message success';

                setTimeout(() => {
                    modals.telegram.classList.remove('active');
                    document.querySelector('.overlay').classList.remove('active');
                    loadIntegrationStatus();
                }, 2000);
            } else {
                throw new Error(result.message || 'Erro ao salvar integração');
            }

        } catch (error) {
            console.error('❌ Erro ao conectar Telegram:', error);
            messageEl.textContent = error.message || 'Erro de conexão. Verifique o token e tente novamente.';
            messageEl.className = 'form-message error';
        }
    });

    // Configurar webhook do Telegram
    const setupTelegramWebhook = async (botToken, webhookUrl) => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: webhookUrl,
                    allowed_updates: ['message', 'callback_query'],
                    drop_pending_updates: false
                })
            });

            const result = await response.json();

            if (result.ok) {
                console.log('✅ Webhook do Telegram configurado:', webhookUrl);
            } else {
                console.warn('⚠️ Erro ao configurar webhook do Telegram:', result.description);
            }

        } catch (error) {
            console.warn('⚠️ Webhook do Telegram não pôde ser configurado:', error);
        }
    };

    // =================================================================
    // DESCONECTAR PLATAFORMA
    // =================================================================
    const disconnectPlatform = async (platform) => {
        if (!confirm(`Deseja realmente desconectar ${platform}?`)) return;

        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com /logvert/integrations/{platform}
            const response = await fetch(`${API_BASE_URL}/integrations/${platform}`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                alert(`${platform} desconectado com sucesso!`);
                loadIntegrationStatus();
            } else {
                alert('Erro ao desconectar');
            }

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao desconectar');
        }
    };

    // =================================================================
    // INICIALIZAÇÃO
    // =================================================================
    loadIntegrationStatus();

    console.log('✅ Sistema de Integrações pronto!');
});
