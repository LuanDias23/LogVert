/**
 * COMPONENTE DE HEADER GLOBAL LOGVERT
 * Gerencia notícias, notificações, configurações e tema
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Header Global LogVert carregado');

    // =================================================================
    // INICIALIZAR TEMA DO LOCALSTORAGE
    // =================================================================
    const savedTheme = localStorage.getItem('logvert-theme') || 'dark';
    document.body.classList.toggle('theme-light', savedTheme === 'light');
    updateThemeIcon();

    // =================================================================
    // CONTROLE DE DROPDOWNS
    // =================================================================
    const dropdowns = document.querySelectorAll('.header-dropdown');
    const iconButtons = document.querySelectorAll('[data-dropdown]');
    const closeButtons = document.querySelectorAll('.dropdown-close');

    // Abrir/Fechar dropdown ao clicar no ícone
    iconButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownId = btn.dataset.dropdown;
            const dropdown = document.getElementById(dropdownId);

            // Fechar todos os outros dropdowns
            dropdowns.forEach(d => {
                if (d.id !== dropdownId) {
                    d.classList.remove('active');
                }
            });

            // Toggle do dropdown clicado
            dropdown.classList.toggle('active');
        });
    });

    // Fechar dropdown ao clicar no X
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dropdowns.forEach(d => d.classList.remove('active'));
        });
    });

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-icon-btn') && !e.target.closest('.header-dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });

    // =================================================================
    // TOGGLE DE TEMA CLARO/ESCURO
    // =================================================================
    const themeToggleBtn = document.getElementById('themeToggle');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('theme-light');
            const newTheme = isLight ? 'light' : 'dark';
            localStorage.setItem('logvert-theme', newTheme);
            updateThemeIcon();

            // Feedback visual
            themeToggleBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggleBtn.style.transform = '';
            }, 500);
        });
    }

    function updateThemeIcon() {
        const themeIcon = document.querySelector('#themeToggle i');
        if (!themeIcon) return;

        const isLight = document.body.classList.contains('theme-light');
        themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    }

    // =================================================================
    // CARREGAR NOTÍCIAS DA PLATAFORMA
    // =================================================================
    const loadNews = async () => {
        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com backend /logvert/news
            // const response = await fetch(`${API_BASE_URL}/news`, {
            //     method: 'GET',
            //     headers: headers
            // });

            // Mock de notícias enquanto backend não está pronto
            const mockNews = [
                {
                    id: 1,
                    title: 'Nova integração com Telegram',
                    description: 'Agora você pode conectar seu bot do Telegram diretamente na plataforma!',
                    icon: 'fa-telegram',
                    time: '2h atrás',
                    type: 'feature'
                },
                {
                    id: 2,
                    title: 'Atualização do sistema de IA',
                    description: 'Livia AI agora responde 40% mais rápido e com maior precisão.',
                    icon: 'fa-robot',
                    time: '1 dia atrás',
                    type: 'update'
                },
                {
                    id: 3,
                    title: 'Novo relatório de vendas disponível',
                    description: 'Acesse insights detalhados sobre suas vendas mensais.',
                    icon: 'fa-chart-line',
                    time: '3 dias atrás',
                    type: 'info'
                }
            ];

            renderNews(mockNews);

        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
        }
    };

    const renderNews = (news) => {
        const newsContent = document.getElementById('newsContent');
        if (!newsContent) return;

        if (news.length === 0) {
            newsContent.innerHTML = `
                <div class="dropdown-empty">
                    <i class="fas fa-newspaper"></i>
                    <p>Nenhuma novidade no momento</p>
                </div>
            `;
            return;
        }

        newsContent.innerHTML = news.map(item => `
            <div class="dropdown-item news-item">
                <div class="news-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="news-content">
                    <div class="dropdown-item-header">
                        <span class="dropdown-item-title">${item.title}</span>
                        <span class="dropdown-item-time">${item.time}</span>
                    </div>
                    <p class="dropdown-item-description">${item.description}</p>
                </div>
            </div>
        `).join('');
    };

    // =================================================================
    // CARREGAR NOTIFICAÇÕES
    // =================================================================
    const loadNotifications = async () => {
        try {
            const headers = getAuthHeaders();

            // TODO: Integrar com backend /logvert/notifications
            // const response = await fetch(`${API_BASE_URL}/notifications`, {
            //     method: 'GET',
            //     headers: headers
            // });

            // Mock de notificações
            const mockNotifications = [
                {
                    id: 1,
                    title: 'Nova devolução solicitada',
                    description: 'Cliente Maria Silva solicitou devolução do pedido #12345',
                    time: '5 min atrás',
                    unread: true
                },
                {
                    id: 2,
                    title: 'Venda aprovada',
                    description: 'Venda #98765 foi processada com sucesso',
                    time: '1h atrás',
                    unread: true
                },
                {
                    id: 3,
                    title: 'Produto em estoque baixo',
                    description: 'O produto "Camiseta Básica" está com apenas 5 unidades',
                    time: '3h atrás',
                    unread: false
                }
            ];

            renderNotifications(mockNotifications);
            updateNotificationBadge(mockNotifications);

        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    };

    const renderNotifications = (notifications) => {
        const notifContent = document.getElementById('notificationsContent');
        if (!notifContent) return;

        if (notifications.length === 0) {
            notifContent.innerHTML = `
                <div class="dropdown-empty">
                    <i class="fas fa-bell"></i>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }

        notifContent.innerHTML = notifications.map(notif => `
            <div class="dropdown-item notification-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
                <div class="dropdown-item-header">
                    <span class="dropdown-item-title">${notif.title}</span>
                    <span class="dropdown-item-time">${notif.time}</span>
                </div>
                <p class="dropdown-item-description">${notif.description}</p>
            </div>
        `).join('');

        // Marcar como lida ao clicar
        notifContent.querySelectorAll('.notification-item.unread').forEach(item => {
            item.addEventListener('click', async () => {
                const notifId = item.dataset.id;
                item.classList.remove('unread');

                // TODO: Marcar como lida no backend
                // await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
                //     method: 'PATCH',
                //     headers: getAuthHeaders()
                // });

                updateNotificationBadge(
                    notifications.filter(n => n.id !== parseInt(notifId) || !n.unread)
                );
            });
        });
    };

    const updateNotificationBadge = (notifications) => {
        const badge = document.querySelector('#notificationsBtn .notification-badge');
        if (!badge) return;

        const unreadCount = notifications.filter(n => n.unread).length;

        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
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
    // NAVEGAÇÃO DE CONFIGURAÇÕES
    // =================================================================
    const settingsItems = document.querySelectorAll('.settings-item');
    settingsItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const href = item.getAttribute('href');
            if (href && href !== '#') {
                window.location.href = href;
            }
        });
    });

    // =================================================================
    // INICIALIZAÇÃO
    // =================================================================
    loadNews();
    loadNotifications();

    // Atualizar notificações a cada 30 segundos
    setInterval(loadNotifications, 30000);

    console.log('✅ Header Global LogVert pronto!');
});
