document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // CONFIGURAÇÃO
    // =============================================
    const AUTH_API_URL = 'http://localhost:8080/logvert';
    const PAGE_SIZE = 10;
    let currentPage = 0;
    let currentSolicitacaoId = null;
    let currentSolicitacaoTipo = null;

    // =============================================
    // PARTÍCULAS
    // =============================================
    if (document.getElementById('dashboard-particles') && typeof particlesJS !== 'undefined') {
        particlesJS("dashboard-particles", {
            "particles": {
                "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#1A73E8" },
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
    // ELEMENTOS DOM
    // =============================================
    const tbody = document.getElementById('solicitacoes-tbody');
    const paginationControls = document.getElementById('pagination-controls');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    const paginationInfo = document.getElementById('pagination-info');
    const feedbackDiv = document.getElementById('feedback-message');
    const modalOverlay = document.getElementById('detailsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalLoading = document.getElementById('modal-loading');
    const modalContent = document.getElementById('modal-details-content');

    // =============================================
    // FUNÇÕES AUXILIARES
    // =============================================
    const getToken = () => localStorage.getItem('authToken');

    const authHeaders = () => ({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    });

    const authHeadersNoContentType = () => ({
        'Accept': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    });

    const showFeedback = (message, type) => {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback-message ${type}`;
        feedbackDiv.style.display = 'block';
        setTimeout(() => { feedbackDiv.style.display = 'none'; }, 5000);
    };

    const getStatusBadgeClass = (status) => {
        const map = {
            'Pendente': 'status-pending',
            'Aprovada': 'status-approved',
            'Em Trânsito': 'status-transit',
            'Concluída': 'status-completed',
            'Rejeitada': 'status-rejected',
            'Cancelada': 'status-cancelled'
        };
        return map[status] || 'status-pending';
    };

    const getTypeBadgeClass = (tipo) => {
        return tipo === 'Troca' ? 'type-troca' : 'type-devolucao';
    };

    const openModal = () => {
        if (modalOverlay) modalOverlay.classList.add('active');
    };

    const closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('active');
        currentSolicitacaoId = null;
        currentSolicitacaoTipo = null;
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }


    // =============================================
    // 1. LISTAR SOLICITAÇÕES (PAGINADO)
    // GET /logvert/solicitacoes?page=0&size=10&sort=dataSolicitacao,desc
    // =============================================
    async function loadSolicitacoes(page = 0) {
        try {
            const response = await fetch(
                `${AUTH_API_URL}/solicitacoes?page=${page}&size=${PAGE_SIZE}&sort=dataSolicitacao,desc`,
                { method: 'GET', headers: authHeaders() }
            );

            if (response.status === 401) {
                showFeedback('✗ Sessão expirada. Faça login novamente.', 'error');
                setTimeout(() => { window.location.href = '/login'; }, 2000);
                return;
            }

            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            const data = await response.json();
            renderTable(data.content || []);
            renderPagination(data);
            updateStats(data.content || []);
            currentPage = page;

        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
            tbody.innerHTML = `
                <tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">
                    <i class="fas fa-exclamation-triangle"></i> Erro ao carregar solicitações. Verifique sua conexão.
                </td></tr>`;
        }
    }

    function renderTable(solicitacoes) {
        if (solicitacoes.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">
                    Nenhuma solicitação encontrada.
                </td></tr>`;
            return;
        }

        tbody.innerHTML = solicitacoes.map(sol => `
            <tr class="row-clickable" data-id="${sol.id}">
                <td><span class="text-highlight">#${sol.id}</span></td>
                <td>${sol.dataSolicitacao || '—'}</td>
                <td>${sol.consumidor || '—'}</td>
                <td>#${sol.idVenda || '—'}</td>
                <td><span class="badge ${getTypeBadgeClass(sol.tipo)}">${sol.tipo}</span></td>
                <td><span class="status-badge ${getStatusBadgeClass(sol.statusSolicitacao)}">${sol.statusSolicitacao}</span></td>
                <td class="action-buttons">
                    <button class="btn-icon btn-view-details" data-id="${sol.id}" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Event listeners para abrir detalhes
        document.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                loadSolicitacaoDetails(id);
            });
        });

        document.querySelectorAll('.row-clickable').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.getAttribute('data-id');
                loadSolicitacaoDetails(id);
            });
        });
    }

    function renderPagination(data) {
        if (data.totalPages <= 1) {
            paginationControls.style.display = 'none';
            return;
        }

        paginationControls.style.display = 'flex';
        paginationInfo.textContent = `Página ${data.number + 1} de ${data.totalPages}`;
        btnPrev.disabled = data.first;
        btnNext.disabled = data.last;
    }

    function updateStats(solicitacoes) {
        const pendentes = solicitacoes.filter(s => s.statusSolicitacao === 'Pendente').length;
        const emAndamento = solicitacoes.filter(s =>
            s.statusSolicitacao === 'Aprovada' || s.statusSolicitacao === 'Em Trânsito'
        ).length;

        document.getElementById('stat-pendentes').textContent = pendentes;
        document.getElementById('stat-andamento').textContent = emAndamento;
        document.getElementById('stat-total').textContent = solicitacoes.length;
    }

    // Paginação
    if (btnPrev) btnPrev.addEventListener('click', () => loadSolicitacoes(currentPage - 1));
    if (btnNext) btnNext.addEventListener('click', () => loadSolicitacoes(currentPage + 1));


    // =============================================
    // 2. DETALHES DA SOLICITAÇÃO
    // GET /logvert/solicitacoes/{id}
    // =============================================
    async function loadSolicitacaoDetails(id) {
        currentSolicitacaoId = id;
        openModal();
        modalLoading.style.display = 'block';
        modalContent.style.display = 'none';

        try {
            const response = await fetch(`${AUTH_API_URL}/solicitacoes/${id}`, {
                method: 'GET',
                headers: authHeaders()
            });

            if (response.status === 401) {
                showFeedback('✗ Sessão expirada.', 'error');
                closeModal();
                return;
            }
            if (response.status === 403) {
                showFeedback('✗ Acesso negado. Essa solicitação pertence a outra loja.', 'error');
                closeModal();
                return;
            }
            if (response.status === 404) {
                showFeedback('✗ Solicitação não encontrada.', 'error');
                closeModal();
                return;
            }
            if (!response.ok) throw new Error(`Erro ${response.status}`);

            const sol = await response.json();
            currentSolicitacaoTipo = sol.tipo;
            renderModalDetails(sol);

            // Carrega feedbacks via endpoint dedicado
            loadFeedbacksBySolicitacao(id);

        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            showFeedback('✗ Erro ao carregar detalhes da solicitação.', 'error');
            closeModal();
        }
    }

    /**
     * Carrega feedbacks via endpoint dedicado
     * GET /logvert/feedbacks/solicitacoes/{idSolicitacao}
     * Auth: Bearer Token (Lojista)
     * Status: 200, 401, 404
     */
    async function loadFeedbacksBySolicitacao(idSolicitacao) {
        const feedbacksDiv = document.getElementById('modal-feedbacks-list');
        feedbacksDiv.innerHTML = '<p style="color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Carregando feedbacks...</p>';

        try {
            const response = await fetch(`${AUTH_API_URL}/feedbacks/solicitacoes/${idSolicitacao}`, {
                method: 'GET',
                headers: authHeaders()
            });

            if (response.status === 200) {
                const feedbacks = await response.json();
                if (feedbacks && feedbacks.length > 0) {
                    feedbacksDiv.innerHTML = feedbacks.map(f => `
                        <div class="data-group" style="margin-bottom:8px; padding:8px; border-left:3px solid #f39c12; background:rgba(243,156,18,0.05); border-radius:4px;">
                            <p>
                                <strong>${f.nomeConsumidor || 'Anônimo'}</strong>
                                <span style="margin-left:8px; font-size:0.8rem; color:#f39c12; background:rgba(243,156,18,0.12); padding:2px 8px; border-radius:12px;">${f.tipoFeedback || '—'}</span>
                                — ${'★'.repeat(Math.max(1, Math.min(5, f.nota)))}${'☆'.repeat(5 - Math.max(1, Math.min(5, f.nota)))}
                            </p>
                            <small style="color:var(--text-muted);">${f.comentario || ''} (${f.dataFeedback || '—'})</small>
                        </div>
                    `).join('');
                } else {
                    feedbacksDiv.innerHTML = '<p style="color:var(--text-muted);">Nenhum feedback registrado.</p>';
                }

            } else if (response.status === 401) {
                feedbacksDiv.innerHTML = '<p style="color:var(--text-muted);">Sessão expirada.</p>';

            } else if (response.status === 404) {
                feedbacksDiv.innerHTML = '<p style="color:var(--text-muted);">Nenhum feedback registrado.</p>';

            } else {
                feedbacksDiv.innerHTML = '<p style="color:var(--text-muted);">Erro ao carregar feedbacks.</p>';
            }

        } catch (error) {
            console.error('Erro ao carregar feedbacks:', error);
            feedbacksDiv.innerHTML = '<p style="color:var(--text-muted);">Erro ao carregar feedbacks.</p>';
        }
    }

    function renderModalDetails(sol) {
        // ID
        document.getElementById('modal-sol-id').textContent = `#${sol.id}`;

        // Consumidor
        const c = sol.consumidor || {};
        document.getElementById('modal-consumidor-nome').textContent = c.nome || '—';
        document.getElementById('modal-consumidor-cpf').textContent = c.cpf_cnpj || '—';
        document.getElementById('modal-consumidor-email').textContent = c.email || '—';
        document.getElementById('modal-consumidor-celular').textContent = c.celular || '—';
        document.getElementById('modal-consumidor-endereco').textContent = c.endereco || '—';

        // Venda
        const v = sol.venda || {};
        document.getElementById('modal-venda-id').textContent = v.idVenda || '—';
        document.getElementById('modal-venda-serial').textContent = v.serial || '—';
        document.getElementById('modal-venda-criacao').textContent = v.dataCriacao || '—';
        document.getElementById('modal-venda-entrega').textContent = v.dataEntrega || '—';

        // Produto
        const p = sol.produto || {};
        document.getElementById('modal-produto-descricao').textContent = p.descricao || '—';
        document.getElementById('modal-produto-preco-original').textContent = p.precoOriginal ? `R$ ${p.precoOriginal.toFixed(2)}` : '—';
        document.getElementById('modal-produto-preco-vendido').textContent = p.precoVendido ? `R$ ${p.precoVendido.toFixed(2)}` : '—';
        document.getElementById('modal-produto-quantidade').textContent = p.quantidade || '—';

        // Solicitação
        document.getElementById('modal-sol-tipo').innerHTML = `<span class="badge ${getTypeBadgeClass(sol.tipo)}">${sol.tipo}</span>`;
        document.getElementById('modal-sol-motivo').textContent = sol.motivo || '—';
        document.getElementById('modal-sol-quantidade').textContent = sol.quantidade || '—';
        document.getElementById('modal-sol-data').textContent = sol.dataSolicitacao || '—';
        document.getElementById('modal-sol-status').innerHTML = `<span class="status-badge ${getStatusBadgeClass(sol.statusSolicitacao)}">${sol.statusSolicitacao}</span>`;

        // Anexos
        const anexosDiv = document.getElementById('modal-anexos-list');
        if (sol.anexos && sol.anexos.length > 0) {
            anexosDiv.innerHTML = sol.anexos.map((url, i) => 
                `<p><a href="${url}" target="_blank" class="text-link"><i class="fas fa-external-link-alt"></i> Anexo ${i + 1}</a></p>`
            ).join('');
        } else {
            anexosDiv.innerHTML = '<p style="color:var(--text-muted);">Nenhum anexo.</p>';
        }

        // Histórico
        const historicoDiv = document.getElementById('modal-historico-list');
        if (sol.historico && sol.historico.length > 0) {
            historicoDiv.innerHTML = sol.historico.map(h => `
                <div class="data-group" style="margin-bottom:8px; padding:8px; border-left:3px solid var(--primary-blue); background:rgba(26,115,232,0.05); border-radius:4px;">
                    <p><strong>${h.statusAnterior}</strong> → <strong>${h.statusNovo}</strong></p>
                    <small style="color:var(--text-muted);">${h.dataAtualizacao} — ${h.observacao || ''}</small>
                </div>
            `).join('');
        } else {
            historicoDiv.innerHTML = '<p style="color:var(--text-muted);">Nenhum histórico registrado.</p>';
        }

        // Feedbacks — carregados via endpoint dedicado (loadFeedbacksBySolicitacao)
        // O div #modal-feedbacks-list será populado pela chamada à API

        // Ações condicionais
        const actionsPendente = document.getElementById('modal-actions-pendente');
        const actionsAtualizar = document.getElementById('modal-actions-atualizar');

        actionsPendente.style.display = sol.statusSolicitacao === 'Pendente' ? 'block' : 'none';
        actionsAtualizar.style.display = (sol.statusSolicitacao === 'Aprovada' || sol.statusSolicitacao === 'Em Trânsito') ? 'block' : 'none';

        // Mostrar conteúdo, ocultar loading
        modalLoading.style.display = 'none';
        modalContent.style.display = 'block';
    }


    // =============================================
    // 3. APROVAR SOLICITAÇÃO
    // PUT /logvert/solicitacoes/aprovar/{id}
    // =============================================
    const btnAprovar = document.getElementById('btn-aprovar');
    if (btnAprovar) {
        btnAprovar.addEventListener('click', async () => {
            if (!currentSolicitacaoId) return;
            if (!confirm('Deseja aprovar esta solicitação?')) return;

            btnAprovar.disabled = true;

            try {
                const response = await fetch(`${AUTH_API_URL}/solicitacoes/aprovar/${currentSolicitacaoId}`, {
                    method: 'PUT',
                    headers: authHeaders()
                });

                if (response.ok) {
                    showFeedback('✓ Solicitação aprovada com sucesso!', 'success');
                    closeModal();
                    loadSolicitacoes(currentPage);
                } else if (response.status === 401) {
                    showFeedback('✗ Sessão expirada.', 'error');
                } else if (response.status === 403) {
                    showFeedback('✗ Acesso negado.', 'error');
                } else if (response.status === 404) {
                    showFeedback('✗ Solicitação não encontrada.', 'error');
                } else if (response.status === 409) {
                    showFeedback('✗ Solicitação não pode ser aprovada no status atual.', 'error');
                } else {
                    showFeedback('✗ Erro ao aprovar solicitação.', 'error');
                }
            } catch (error) {
                console.error('Erro ao aprovar:', error);
                showFeedback('✗ Erro de conexão.', 'error');
            } finally {
                btnAprovar.disabled = false;
            }
        });
    }


    // =============================================
    // 4. REPROVAR SOLICITAÇÃO
    // PUT /logvert/solicitacoes/reprovar/{id}
    // =============================================
    const btnReprovar = document.getElementById('btn-reprovar');
    if (btnReprovar) {
        btnReprovar.addEventListener('click', async () => {
            if (!currentSolicitacaoId) return;
            if (!confirm('Deseja reprovar esta solicitação? Os anexos serão excluídos.')) return;

            btnReprovar.disabled = true;

            try {
                const response = await fetch(`${AUTH_API_URL}/solicitacoes/reprovar/${currentSolicitacaoId}`, {
                    method: 'PUT',
                    headers: authHeaders()
                });

                if (response.ok) {
                    showFeedback('✓ Solicitação reprovada com sucesso.', 'success');
                    closeModal();
                    loadSolicitacoes(currentPage);
                } else if (response.status === 401) {
                    showFeedback('✗ Sessão expirada.', 'error');
                } else if (response.status === 403) {
                    showFeedback('✗ Acesso negado.', 'error');
                } else if (response.status === 404) {
                    showFeedback('✗ Solicitação não encontrada.', 'error');
                } else if (response.status === 409) {
                    showFeedback('✗ Solicitação não pode ser reprovada no status atual.', 'error');
                } else {
                    showFeedback('✗ Erro ao reprovar solicitação.', 'error');
                }
            } catch (error) {
                console.error('Erro ao reprovar:', error);
                showFeedback('✗ Erro de conexão.', 'error');
            } finally {
                btnReprovar.disabled = false;
            }
        });
    }


    // =============================================
    // 5. ATUALIZAR STATUS
    // POST /logvert/solicitacoes/atualizar/{id}
    // multipart/form-data: historico (JSON) + novosProdutos (JSON, opcional)
    // =============================================

    // Lógica de mostrar/ocultar campo de novos produtos
    const statusNovoSelect = document.getElementById('status-novo');
    const novosProdutosSection = document.getElementById('novos-produtos-section');

    if (statusNovoSelect) {
        statusNovoSelect.addEventListener('change', () => {
            const isConcluida = statusNovoSelect.value === 'Concluída';
            const isTroca = currentSolicitacaoTipo === 'Troca';
            novosProdutosSection.style.display = (isConcluida && isTroca) ? 'block' : 'none';
        });
    }

    // Adicionar produto na lista
    const btnAddProduto = document.getElementById('btn-add-produto');
    if (btnAddProduto) {
        btnAddProduto.addEventListener('click', () => {
            const list = document.getElementById('novos-produtos-list');
            const index = list.children.length;
            const div = document.createElement('div');
            div.className = 'data-group';
            div.style.marginBottom = '10px';
            div.style.padding = '10px';
            div.style.border = '1px solid var(--border-color)';
            div.style.borderRadius = '6px';
            div.innerHTML = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                    <div>
                        <label style="font-size:0.85rem; color:var(--text-muted);">ID Produto</label>
                        <input type="number" class="np-idProduto" required
                            style="width:100%; padding:6px; border-radius:4px; border:1px solid var(--border-color); background:var(--card-background); color:var(--text-light);">
                    </div>
                    <div>
                        <label style="font-size:0.85rem; color:var(--text-muted);">Quantidade</label>
                        <input type="number" step="0.1" class="np-quantidade" required value="1"
                            style="width:100%; padding:6px; border-radius:4px; border:1px solid var(--border-color); background:var(--card-background); color:var(--text-light);">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <div>
                        <label style="font-size:0.85rem; color:var(--text-muted);">Detalhe</label>
                        <input type="text" class="np-detalhe" placeholder="Ex: Tamanho M"
                            style="width:100%; padding:6px; border-radius:4px; border:1px solid var(--border-color); background:var(--card-background); color:var(--text-light);">
                    </div>
                    <div>
                        <label style="font-size:0.85rem; color:var(--text-muted);">Valor Vendido (R$)</label>
                        <input type="number" step="0.01" class="np-valorVendido" required
                            style="width:100%; padding:6px; border-radius:4px; border:1px solid var(--border-color); background:var(--card-background); color:var(--text-light);">
                    </div>
                </div>
                <button type="button" onclick="this.parentElement.remove()" style="margin-top:5px; background:none; border:none; color:var(--danger-color, #e53935); cursor:pointer; font-size:0.85rem;">
                    <i class="fas fa-trash"></i> Remover
                </button>
            `;
            list.appendChild(div);
        });
    }

    // Enviar atualização de status
    const formAtualizarStatus = document.getElementById('form-atualizar-status');
    if (formAtualizarStatus) {
        formAtualizarStatus.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentSolicitacaoId) return;

            const statusNovo = document.getElementById('status-novo').value;
            const observacao = document.getElementById('observacao-status').value;

            if (!statusNovo || !observacao) {
                showFeedback('✗ Preencha o status e a observação.', 'error');
                return;
            }

            const formData = new FormData();

            // Parte 1: historico (JSON)
            const historico = { statusNovo, observacao };
            formData.append('historico', new Blob([JSON.stringify(historico)], { type: 'application/json' }));

            // Parte 2: novosProdutos (JSON, opcional)
            if (statusNovo === 'Concluída' && currentSolicitacaoTipo === 'Troca') {
                const produtosElements = document.querySelectorAll('#novos-produtos-list > .data-group');
                if (produtosElements.length > 0) {
                    const novosProdutos = Array.from(produtosElements).map(el => ({
                        idProduto: parseInt(el.querySelector('.np-idProduto').value),
                        quantidade: parseFloat(el.querySelector('.np-quantidade').value),
                        detalhe: el.querySelector('.np-detalhe').value,
                        valorVendido: parseFloat(el.querySelector('.np-valorVendido').value)
                    }));
                    formData.append('novosProdutos', new Blob([JSON.stringify(novosProdutos)], { type: 'application/json' }));
                }
            }

            const submitBtn = formAtualizarStatus.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${AUTH_API_URL}/solicitacoes/atualizar/${currentSolicitacaoId}`, {
                    method: 'POST',
                    headers: authHeadersNoContentType(),
                    body: formData
                });

                if (response.ok) {
                    showFeedback('✓ Status atualizado com sucesso!', 'success');
                    closeModal();
                    loadSolicitacoes(currentPage);
                } else if (response.status === 401) {
                    showFeedback('✗ Sessão expirada.', 'error');
                } else if (response.status === 403) {
                    showFeedback('✗ Acesso negado.', 'error');
                } else if (response.status === 404) {
                    showFeedback('✗ Solicitação não encontrada.', 'error');
                } else if (response.status === 409) {
                    showFeedback('✗ Solicitação não pode ser atualizada no status atual.', 'error');
                } else if (response.status === 422) {
                    showFeedback('✗ Erro de validação. Verifique os campos.', 'error');
                } else {
                    showFeedback('✗ Erro ao atualizar status.', 'error');
                }
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                showFeedback('✗ Erro de conexão.', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }


    // =============================================
    // INICIALIZAÇÃO
    // =============================================
    loadSolicitacoes(0);
});