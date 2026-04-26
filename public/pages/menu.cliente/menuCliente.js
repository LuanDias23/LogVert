document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // CONFIGURAÇÃO
    // =============================================
    const AUTH_API_URL = 'http://localhost:8080/logvert';

    // =============================================
    // LÓGICA DO PAINEL (Sidebar, Mobile Menu, Dropdown)
    // =============================================

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Menu responsivo
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');

    const openMenu = () => {
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        }
    };
    const closeMenu = () => {
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    };

    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    // Dropdowns do header
    const dropdownToggles = document.querySelectorAll('.header-action-btn');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const dropdownId = toggle.id.replace('Btn', 'Dropdown');
            const currentDropdown = document.getElementById(dropdownId);

            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu.id !== dropdownId) menu.classList.remove('active');
            });
            if (currentDropdown) currentDropdown.classList.toggle('active');
        });
    });
    window.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    });

    // Partículas
    if (document.getElementById('dashboard-particles') && typeof particlesJS !== 'undefined') {
        particlesJS("dashboard-particles", {
            "particles": {
                "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.3 } } }
            },
            "retina_detect": true
        });
    }


    // =============================================
    // FUNÇÕES AUXILIARES
    // =============================================
    const getToken = () => localStorage.getItem('authToken');

    const authHeaders = () => ({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    });

    const getStatusBadgeClass = (status) => {
        const map = {
            'Pendente': 'status-pending',
            'Aprovada': 'status-approved',
            'Em Trânsito': 'status-sent',
            'Concluída': 'status-completed',
            'Rejeitada': 'status-rejected',
            'Cancelada': 'status-cancelled'
        };
        return map[status] || 'status-pending';
    };

    const feedbackDiv = document.getElementById('feedback-message');
    const showFeedback = (message, type) => {
        if (!feedbackDiv) return;
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback-message ${type}`;
        feedbackDiv.style.display = 'block';
        setTimeout(() => { feedbackDiv.style.display = 'none'; }, 5000);
    };


    // =============================================
    // CARREGAR SOLICITAÇÕES DO CONSUMIDOR
    // GET /logvert/solicitacoes (usa o mesmo endpoint, filtrado pelo token do consumidor)
    // =============================================
    const grid = document.getElementById('solicitacoes-cliente-grid');
    const loadingDiv = document.getElementById('loading-solicitacoes');
    const emptyDiv = document.getElementById('empty-message');

    let solicitacoesData = []; // Cache local para uso no modal

    async function loadMinhasSolicitacoes() {
        if (!grid) return;

        try {
            const response = await fetch(
                `${AUTH_API_URL}/solicitacoes?page=0&size=50&sort=dataSolicitacao,desc`,
                { method: 'GET', headers: authHeaders() }
            );

            if (response.status === 401) {
                showFeedback('✗ Sessão expirada. Faça login novamente.', 'error');
                setTimeout(() => { window.location.href = '/login'; }, 2000);
                return;
            }

            if (!response.ok) throw new Error(`Erro ${response.status}`);

            const data = await response.json();
            const solicitacoes = data.content || [];
            solicitacoesData = solicitacoes;

            if (loadingDiv) loadingDiv.style.display = 'none';

            if (solicitacoes.length === 0) {
                if (emptyDiv) emptyDiv.style.display = 'block';
                return;
            }

            renderSolicitacoes(solicitacoes);

        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
            if (loadingDiv) loadingDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle fa-2x" style="color: #e53935;"></i>
                <p>Erro ao carregar solicitações. Verifique sua conexão.</p>`;
        }
    }

    function renderSolicitacoes(solicitacoes) {
        grid.innerHTML = solicitacoes.map(sol => {
            const canCancel = sol.statusSolicitacao === 'Pendente' || sol.statusSolicitacao === 'Aprovada';

            return `
                <div class="card" data-id="${sol.id}">
                    <div class="card-header">
                        <h3>Solicitação #${sol.id}</h3>
                        <span class="status-badge ${getStatusBadgeClass(sol.statusSolicitacao)}">${sol.statusSolicitacao}</span>
                    </div>
                    <p class="card-product">${sol.tipo} — ${sol.motivo || ''}</p>
                    <small style="color: var(--text-muted);">${sol.dataSolicitacao || ''}</small>
                    <div style="margin-top: 10px; display: flex; gap: 8px;">
                        <a href="#" class="card-details" data-id="${sol.id}">Ver detalhes <i class="fa-solid fa-arrow-right"></i></a>
                        ${canCancel ? `<a href="#" class="card-cancel" data-id="${sol.id}" style="color: #e53935; text-decoration: none; font-weight: 500;">Cancelar</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Event listeners para detalhes
        document.querySelectorAll('.card-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                openDetailsModal(id);
            });
        });

        // Event listeners para cancelar
        document.querySelectorAll('.card-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                cancelarSolicitacao(id);
            });
        });
    }


    // =============================================
    // MODAL DE DETALHES
    // =============================================
    let currentSolId = null;

    function openDetailsModal(id) {
        const sol = solicitacoesData.find(s => String(s.id) === String(id));
        if (!sol) return;

        currentSolId = id;

        const modal = document.getElementById('modalDetalhes');
        const modalPedido = document.getElementById('modalPedido');
        const modalStatus = document.getElementById('modalStatus');
        const modalProduto = document.getElementById('modalProduto');
        const modalTipo = document.getElementById('modalTipo');
        const modalMotivo = document.getElementById('modalMotivo');
        const modalData = document.getElementById('modalData');
        const modalAtualizacao = document.getElementById('modalAtualizacao');
        const consumerActions = document.getElementById('modal-consumer-actions');

        if (!modal) return;

        modalPedido.textContent = `Solicitação #${sol.id}`;
        modalStatus.textContent = sol.statusSolicitacao;
        modalStatus.className = `status-badge ${getStatusBadgeClass(sol.statusSolicitacao)}`;
        modalProduto.textContent = `Venda #${sol.idVenda}`;
        if (modalTipo) modalTipo.textContent = sol.tipo || '—';
        if (modalMotivo) modalMotivo.textContent = sol.motivo || '—';
        if (modalData) modalData.textContent = sol.dataSolicitacao || '—';
        if (modalAtualizacao) modalAtualizacao.textContent = sol.dataAtualizacao || 'Sem atualização';

        // Mostrar botão cancelar se status permite
        const canCancel = sol.statusSolicitacao === 'Pendente' || sol.statusSolicitacao === 'Aprovada';
        if (consumerActions) consumerActions.style.display = canCancel ? 'block' : 'none';

        modal.classList.add('active');
    }

    // Fechar modal
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close-btn')) {
            const modal = document.getElementById('modalDetalhes');
            if (modal) modal.classList.remove('active');
        }
        if (e.target.id === 'modalDetalhes') {
            const modal = document.getElementById('modalDetalhes');
            if (modal) modal.classList.remove('active');
        }
    });


    // =============================================
    // CANCELAR SOLICITAÇÃO
    // PUT /logvert/solicitacoes/cancelar/{id}
    // Body: { idItem, quantidade, tipo, motivo }
    // =============================================
    const btnCancelar = document.getElementById('btn-cancelar-sol');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            if (currentSolId) cancelarSolicitacao(currentSolId);
        });
    }

    async function cancelarSolicitacao(id) {
        if (!confirm('Deseja cancelar esta solicitação? Esta ação não pode ser desfeita.')) return;

        const sol = solicitacoesData.find(s => String(s.id) === String(id));
        if (!sol) {
            showFeedback('✗ Solicitação não encontrada.', 'error');
            return;
        }

        // Monta o body conforme documentação
        const body = {
            idItem: 1, // ID do item (será corrigido pelo back-end se necessário)
            quantidade: 1.0,
            tipo: sol.tipo ? sol.tipo.toLowerCase() : 'troca',
            motivo: 'Cancelamento solicitado pelo consumidor'
        };

        try {
            const response = await fetch(`${AUTH_API_URL}/solicitacoes/cancelar/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(body)
            });

            if (response.ok) {
                showFeedback('✓ Solicitação cancelada com sucesso.', 'success');
                const modal = document.getElementById('modalDetalhes');
                if (modal) modal.classList.remove('active');
                loadMinhasSolicitacoes();

            } else if (response.status === 401) {
                showFeedback('✗ Sessão expirada.', 'error');
            } else if (response.status === 403) {
                showFeedback('✗ Acesso negado.', 'error');
            } else if (response.status === 404) {
                showFeedback('✗ Solicitação ou item não encontrado.', 'error');
            } else if (response.status === 409) {
                showFeedback('✗ Solicitação não pode ser cancelada no status atual.', 'error');
            } else if (response.status === 422) {
                showFeedback('✗ Erro de validação.', 'error');
            } else {
                showFeedback('✗ Erro ao cancelar solicitação.', 'error');
            }

        } catch (error) {
            console.error('Erro ao cancelar:', error);
            showFeedback('✗ Erro de conexão.', 'error');
        }
    }


    // =============================================
    // LÓGICA EXISTENTE: Formulário de Solicitação (ativado em solicitacao.html)
    // =============================================
    const form = document.getElementById('form-solicitacao');
    const formCard = document.querySelector('.form-card');
    const successMessage = document.getElementById('successMessage');

    if (form && !document.getElementById('idItem')) {
        // Fallback para a lógica antiga se o form existir sem o novo JS
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            if (formCard) formCard.style.display = 'none';
            if (successMessage) {
                successMessage.style.display = 'flex';
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }


    // =============================================
    // LÓGICA EXISTENTE: Formulário "Meus Dados"
    // =============================================
    const dadosForm = document.getElementById('form-meus-dados');
    const dadosSuccessMessage = document.getElementById('successMessage');

    if (dadosForm) {
        dadosForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (dadosSuccessMessage) {
                dadosSuccessMessage.style.display = 'flex';
                dadosSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setTimeout(() => {
                if (dadosSuccessMessage) dadosSuccessMessage.style.display = 'none';
            }, 5000);
        });
    }


    // =============================================
    // LÓGICA EXISTENTE: Formulário "Alterar Senha"
    // =============================================
    const senhaForm = document.getElementById('form-alterar-senha');
    const passwordSuccessMessage = document.getElementById('passwordSuccessMessage');

    if (senhaForm) {
        senhaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (passwordSuccessMessage) {
                passwordSuccessMessage.style.display = 'flex';
                passwordSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setTimeout(() => {
                if (passwordSuccessMessage) passwordSuccessMessage.style.display = 'none';
            }, 5000);
        });
    }


    // =============================================
    // LÓGICA EXISTENTE: Acordeão (FAQ)
    // =============================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.accordion-item');
            const content = item.querySelector('.accordion-content');

            document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                const activeContent = activeItem.querySelector('.accordion-content');
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeContent.style.maxHeight = null;
                }
            });

            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });


    // =============================================
    // INICIALIZAÇÃO
    // =============================================
    if (grid) {
        loadMinhasSolicitacoes();
    }
});
