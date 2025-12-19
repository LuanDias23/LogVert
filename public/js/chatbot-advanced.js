/**
 * CHATBOT AVANÇADO LOGVERT - LIVIA AI
 * Sistema completo de chatbot integrado com:
 * - Produtos
 * - Vendas
 * - Trocas e Devoluções
 * - Conversas de WhatsApp, Instagram, Messenger
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Livia AI inicializada');

    // =================================================================
    // CONFIGURAÇÕES E ESTADO GLOBAL
    // =================================================================
    const state = {
        currentConversation: null,
        conversations: [],
        activeFilter: 'all',
        aiConfig: {
            tone: 'casual',
            proactivity: 3,
            autoProducts: true,
            autoSales: true,
            autoReturns: true,
            autoInstagramReply: false
        }
    };

    // =================================================================
    // REFERÊNCIAS DO DOM
    // =================================================================
    const conversationsList = document.getElementById('conversationsList');
    const messagesArea = document.getElementById('messagesArea');
    const conversationHeader = document.getElementById('conversationHeader');
    const messageInputArea = document.getElementById('messageInputArea');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const historyTableBody = document.getElementById('historyTableBody');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const testChatBtn = document.getElementById('testChatBtn');

    // Stats
    const totalConversationsEl = document.getElementById('totalConversations');
    const aiResolvedEl = document.getElementById('aiResolved');
    const avgResponseTimeEl = document.getElementById('avgResponseTime');
    const humanHandoffEl = document.getElementById('humanHandoff');

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
    // CARREGAR CONVERSAS DAS REDES SOCIAIS
    // =================================================================
    const loadSocialConversations = async () => {
        try {
            const headers = getAuthHeaders();

            // Simula dados de conversas (futuramente virá do backend)
            // TODO: Integrar com endpoint /logvert/chatbot/conversations
            const mockConversations = [
                {
                    id: 1,
                    platform: 'whatsapp',
                    customerName: 'Maria Silva',
                    customerAvatar: 'https://i.pravatar.cc/100?img=1',
                    lastMessage: 'Oi, gostaria de fazer uma devolução',
                    timestamp: new Date().toISOString(),
                    unread: 2,
                    status: 'active',
                    aiHandled: true
                },
                {
                    id: 2,
                    platform: 'instagram',
                    customerName: 'João Santos',
                    customerAvatar: 'https://i.pravatar.cc/100?img=2',
                    lastMessage: 'Qual o prazo de entrega?',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    unread: 0,
                    status: 'resolved',
                    aiHandled: true
                },
                {
                    id: 3,
                    platform: 'whatsapp',
                    customerName: 'Ana Costa',
                    customerAvatar: 'https://i.pravatar.cc/100?img=3',
                    lastMessage: 'Preciso falar com um atendente',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    unread: 1,
                    status: 'human_requested',
                    aiHandled: false
                },
                {
                    id: 4,
                    platform: 'messenger',
                    customerName: 'Pedro Lima',
                    customerAvatar: 'https://i.pravatar.cc/100?img=4',
                    lastMessage: 'Vocês têm esse produto em azul?',
                    timestamp: new Date(Date.now() - 10800000).toISOString(),
                    unread: 0,
                    status: 'resolved',
                    aiHandled: true
                }
            ];

            state.conversations = mockConversations;
            renderConversations(mockConversations);
            updateStats(mockConversations);

        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
            conversationsList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar conversas</p>
                </div>
            `;
        }
    };

    // =================================================================
    // RENDERIZAR LISTA DE CONVERSAS
    // =================================================================
    const renderConversations = (conversations) => {
        if (conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma conversa encontrada</p>
                    <a href="/integracoes" class="btn btn-primary btn-sm">Ir para Integrações</a>
                </div>
            `;
            return;
        }

        conversationsList.innerHTML = conversations.map(conv => {
            const platformIcons = {
                whatsapp: 'fab fa-whatsapp',
                instagram: 'fab fa-instagram',
                messenger: 'fab fa-facebook-messenger',
                telegram: 'fab fa-telegram'
            };

            const platformColors = {
                whatsapp: '#25D366',
                instagram: '#E1306C',
                messenger: '#00B2FF',
                telegram: '#2AABEE'
            };

            const timeAgo = formatTimeAgo(new Date(conv.timestamp));

            return `
                <div class="conversation-item ${conv.unread > 0 ? 'unread' : ''}" data-id="${conv.id}">
                    <div class="conversation-avatar">
                        <img src="${conv.customerAvatar}" alt="${conv.customerName}">
                        <i class="${platformIcons[conv.platform]}" style="color: ${platformColors[conv.platform]}"></i>
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-meta">
                            <h4>${conv.customerName}</h4>
                            <span class="conversation-time">${timeAgo}</span>
                        </div>
                        <div class="conversation-preview">
                            <p>${conv.lastMessage}</p>
                            ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
                        </div>
                        <div class="conversation-tags">
                            ${conv.aiHandled ? '<span class="tag tag-ai"><i class="fas fa-robot"></i> IA</span>' : '<span class="tag tag-human"><i class="fas fa-user"></i> Humano</span>'}
                            ${conv.status === 'human_requested' ? '<span class="tag tag-alert"><i class="fas fa-exclamation"></i> Aguardando</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar event listeners
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = parseInt(item.dataset.id);
                loadConversationMessages(convId);
            });
        });
    };

    // =================================================================
    // CARREGAR MENSAGENS DE UMA CONVERSA
    // =================================================================
    const loadConversationMessages = async (conversationId) => {
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        state.currentConversation = conversation;

        // Atualizar header
        const platformIcons = {
            whatsapp: 'fab fa-whatsapp',
            instagram: 'fab fa-instagram',
            messenger: 'fab fa-facebook-messenger',
            telegram: 'fab fa-telegram'
        };

        conversationHeader.innerHTML = `
            <div class="conversation-header-info">
                <img src="${conversation.customerAvatar}" alt="${conversation.customerName}">
                <div>
                    <h3>${conversation.customerName}</h3>
                    <span><i class="${platformIcons[conversation.platform]}"></i> ${conversation.platform.charAt(0).toUpperCase() + conversation.platform.slice(1)}</span>
                </div>
            </div>
            <div class="conversation-actions">
                <button class="btn-icon" title="Informações"><i class="fas fa-info-circle"></i></button>
                <button class="btn-icon" title="Buscar"><i class="fas fa-search"></i></button>
                <button class="btn-icon" id="takeoverBtn" title="Assumir conversa"><i class="fas fa-hand-paper"></i></button>
            </div>
        `;

        // Simular mensagens (futuramente virá do backend)
        const mockMessages = await loadMessagesFromBackend(conversationId);

        renderMessages(mockMessages);
        messageInputArea.style.display = 'flex';

        // Scroll para última mensagem
        messagesArea.scrollTop = messagesArea.scrollHeight;
    };

    // =================================================================
    // SIMULAR CARREGAMENTO DE MENSAGENS DO BACKEND
    // =================================================================
    const loadMessagesFromBackend = async (conversationId) => {
        // TODO: Integrar com /logvert/chatbot/messages/{conversationId}

        const messageExamples = {
            1: [ // WhatsApp - Devolução
                { sender: 'customer', text: 'Oi, gostaria de fazer uma devolução', timestamp: new Date(Date.now() - 600000) },
                { sender: 'ai', text: 'Olá! Claro, vou te ajudar com isso. Você tem o número do pedido ou o serial da compra?', timestamp: new Date(Date.now() - 580000), aiIntegration: 'returns' },
                { sender: 'customer', text: 'Sim, é ABC1234-5678-9012', timestamp: new Date(Date.now() - 560000) },
                { sender: 'ai', text: 'Encontrei seu pedido! Compra de R$ 150,00 realizada em 15/12/2025. Qual o motivo da devolução?', timestamp: new Date(Date.now() - 540000), aiIntegration: 'sales', data: { orderId: 'ABC1234-5678-9012', value: 150 } },
                { sender: 'customer', text: 'O produto veio com defeito', timestamp: new Date(Date.now() - 520000) },
                { sender: 'ai', text: 'Entendo, sinto muito por isso. Vou abrir um chamado de devolução para você. Seu prazo é de 30 dias. Deseja continuar?', timestamp: new Date(Date.now() - 500000), aiIntegration: 'returns' }
            ],
            2: [ // Instagram - Prazo
                { sender: 'customer', text: 'Qual o prazo de entrega?', timestamp: new Date(Date.now() - 7200000) },
                { sender: 'ai', text: 'Olá! O prazo de entrega varia de acordo com sua região. Qual seu CEP?', timestamp: new Date(Date.now() - 7190000) },
                { sender: 'customer', text: '01310-100', timestamp: new Date(Date.now() - 7180000) },
                { sender: 'ai', text: 'Para São Paulo - SP o prazo é de 3 a 5 dias úteis! 📦', timestamp: new Date(Date.now() - 7170000) }
            ],
            3: [ // WhatsApp - Solicitou humano
                { sender: 'customer', text: 'Preciso falar com um atendente', timestamp: new Date(Date.now() - 10800000) },
                { sender: 'ai', text: 'Claro! Estou transferindo você para um de nossos atendentes. Aguarde um momento.', timestamp: new Date(Date.now() - 10790000), handoff: true },
                { sender: 'system', text: 'Conversa transferida para atendimento humano. Aguardando disponibilidade...', timestamp: new Date(Date.now() - 10780000) }
            ],
            4: [ // Messenger - Produto
                { sender: 'customer', text: 'Vocês têm esse produto em azul?', timestamp: new Date(Date.now() - 14400000) },
                { sender: 'ai', text: 'Vou verificar no estoque! Qual produto você está procurando?', timestamp: new Date(Date.now() - 14390000), aiIntegration: 'products' },
                { sender: 'customer', text: 'Camiseta básica', timestamp: new Date(Date.now() - 14380000) },
                { sender: 'ai', text: 'Sim! Temos a Camiseta Básica em azul nos tamanhos P, M e G. Valor: R$ 49,90. Deseja comprar?', timestamp: new Date(Date.now() - 14370000), aiIntegration: 'products', data: { product: 'Camiseta Básica', color: 'azul', price: 49.90 } }
            ]
        };

        return messageExamples[conversationId] || [];
    };

    // =================================================================
    // RENDERIZAR MENSAGENS
    // =================================================================
    const renderMessages = (messages) => {
        messagesArea.innerHTML = messages.map(msg => {
            const messageClass = msg.sender === 'customer' ? 'message-customer' :
                                 msg.sender === 'ai' ? 'message-ai' : 'message-system';

            const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            let integrationBadge = '';
            if (msg.aiIntegration) {
                const integrationIcons = {
                    products: '<i class="fas fa-box"></i> Produtos',
                    sales: '<i class="fas fa-shopping-cart"></i> Vendas',
                    returns: '<i class="fas fa-undo"></i> Devoluções'
                };
                integrationBadge = `<div class="ai-integration-badge">${integrationIcons[msg.aiIntegration]}</div>`;
            }

            let dataDisplay = '';
            if (msg.data) {
                dataDisplay = `<div class="message-data">${JSON.stringify(msg.data, null, 2)}</div>`;
            }

            return `
                <div class="message ${messageClass}">
                    <div class="message-content">
                        <p>${msg.text}</p>
                        ${integrationBadge}
                        ${dataDisplay}
                    </div>
                    <span class="message-time">${time}</span>
                </div>
            `;
        }).join('');
    };

    // =================================================================
    // ENVIAR MENSAGEM
    // =================================================================
    const sendMessage = async () => {
        const text = messageInput.value.trim();
        if (!text || !state.currentConversation) return;

        const newMessage = {
            sender: 'human',
            text: text,
            timestamp: new Date()
        };

        // Adicionar mensagem na interface
        const messageHtml = `
            <div class="message message-human">
                <div class="message-content">
                    <p>${text}</p>
                </div>
                <span class="message-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;

        messagesArea.innerHTML += messageHtml;
        messagesArea.scrollTop = messagesArea.scrollHeight;

        messageInput.value = '';

        // TODO: Enviar para backend
        // await fetch(`${API_BASE_URL}/chatbot/send`, { ... })

        console.log('Mensagem enviada:', newMessage);
    };

    sendMessageBtn?.addEventListener('click', sendMessage);
    messageInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // =================================================================
    // FILTROS DE CONVERSA
    // =================================================================
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;
            state.activeFilter = filter;

            const filtered = filter === 'all' ?
                state.conversations :
                state.conversations.filter(c => c.platform === filter);

            renderConversations(filtered);
        });
    });

    // =================================================================
    // ATUALIZAR ESTATÍSTICAS
    // =================================================================
    const updateStats = (conversations) => {
        const total = conversations.length;
        const aiResolved = conversations.filter(c => c.aiHandled).length;
        const percentage = total > 0 ? Math.round((aiResolved / total) * 100) : 0;

        totalConversationsEl.textContent = total;
        aiResolvedEl.textContent = `${percentage}%`;
        avgResponseTimeEl.textContent = '1.2s'; // Mock
        humanHandoffEl.textContent = conversations.filter(c => c.status === 'human_requested').length;
    };

    // =================================================================
    // CARREGAR HISTÓRICO
    // =================================================================
    const loadHistory = async () => {
        // TODO: Integrar com /logvert/chatbot/history
        const mockHistory = [
            { customer: 'Maria Silva', platform: 'whatsapp', type: 'Devolução', status: 'Resolvido', attendedBy: 'IA', timestamp: '19/12/2025 14:30' },
            { customer: 'João Santos', platform: 'instagram', type: 'Dúvida sobre produto', status: 'Resolvido', attendedBy: 'IA', timestamp: '19/12/2025 13:15' },
            { customer: 'Ana Costa', platform: 'whatsapp', type: 'Reclamação', status: 'Em andamento', attendedBy: 'Humano', timestamp: '19/12/2025 12:00' }
        ];

        historyTableBody.innerHTML = mockHistory.map(h => `
            <tr>
                <td>${h.customer}</td>
                <td><i class="fab fa-${h.platform}"></i> ${h.platform.charAt(0).toUpperCase() + h.platform.slice(1)}</td>
                <td>${h.type}</td>
                <td><span class="status-badge ${h.status === 'Resolvido' ? 'status-completed' : 'status-pending'}">${h.status}</span></td>
                <td>${h.attendedBy}</td>
                <td>${h.timestamp}</td>
                <td><button class="btn-icon"><i class="fas fa-eye"></i></button></td>
            </tr>
        `).join('');
    };

    // =================================================================
    // SALVAR CONFIGURAÇÕES
    // =================================================================
    saveConfigBtn?.addEventListener('click', async () => {
        const btn = saveConfigBtn;
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        btn.disabled = true;

        // Coletar configurações
        state.aiConfig = {
            tone: document.getElementById('aiTone')?.value,
            proactivity: document.getElementById('aiProactivity')?.value,
            autoProducts: document.getElementById('autoProducts')?.checked,
            autoSales: document.getElementById('autoSales')?.checked,
            autoReturns: document.getElementById('autoReturns')?.checked,
            autoInstagramReply: document.getElementById('autoInstagramReply')?.checked
        };

        // TODO: Salvar no backend
        // await fetch(`${API_BASE_URL}/chatbot/config`, { method: 'POST', body: JSON.stringify(state.aiConfig) })

        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }, 1000);
    });

    // =================================================================
    // TESTAR CHAT
    // =================================================================
    testChatBtn?.addEventListener('click', () => {
        alert('Funcionalidade de teste será implementada em breve!');
        // TODO: Abrir chat de teste
    });

    // =================================================================
    // UTILITÁRIOS
    // =================================================================
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'agora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return new Date(date).toLocaleDateString('pt-BR');
    };

    // =================================================================
    // INICIALIZAÇÃO
    // =================================================================
    loadSocialConversations();
    loadHistory();

    // Atualizar conversas a cada 30 segundos
    setInterval(loadSocialConversations, 30000);

    console.log('✅ Chatbot avançado carregado!');
});
