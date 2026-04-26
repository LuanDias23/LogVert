/**
 * FAQ Cliente (Consumidor) - Feedbacks API Integration
 * Endpoints:
 *   4. POST /logvert/feedbacks                          — Criar feedback (Bearer Token)
 *   2. GET  /logvert/feedbacks/solicitacoes/{id}        — Listar feedbacks por solicitação (Bearer Token)
 *
 * Request Body (POST):
 * {
 *   "tipoFeedback": "Atendimento",
 *   "nota": 5,
 *   "comentario": "Ótimo atendimento na troca do produto!",
 *   "idLoja": 5,
 *   "idSolicitacao": 1
 * }
 *
 * Response Body:
 * {
 *   "idFeedback": 1,
 *   "tipoFeedback": "Atendimento",
 *   "nota": 5,
 *   "comentario": "Ótimo atendimento na troca do produto!",
 *   "dataFeedback": "25/10/2025",
 *   "idConsumidor": 1,
 *   "nomeConsumidor": "Ana",
 *   "idLoja": 5,
 *   "idSolicitacao": 1
 * }
 */

document.addEventListener('DOMContentLoaded', function () {

    // =============================================
    // CONFIGURAÇÃO
    // =============================================
    const AUTH_API_URL = 'http://localhost:8080/logvert';

    // =============================================
    // ELEMENTOS DOM
    // =============================================
    const feedbackDiv = document.getElementById('feedback-message');
    const formCriar = document.getElementById('form-criar-feedback');
    const formConsultar = document.getElementById('form-consultar-feedbacks');
    const formCard = document.getElementById('feedback-form-card');
    const successDiv = document.getElementById('feedback-success');
    const btnNovoFeedback = document.getElementById('btn-novo-feedback');
    const starRating = document.getElementById('star-rating');
    const inputNota = document.getElementById('input-nota');
    const notaDisplay = document.getElementById('nota-display');
    const consultaResults = document.getElementById('consulta-results');
    const consultaTitle = document.getElementById('consulta-results-title');
    const consultaCards = document.getElementById('consulta-cards-container');
    const consultaEmpty = document.getElementById('consulta-empty');

    // =============================================
    // FUNÇÕES AUXILIARES
    // =============================================
    const getToken = () => localStorage.getItem('authToken');

    const authHeaders = () => ({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    });

    const showFeedback = (message, type) => {
        if (!feedbackDiv) return;
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback-msg ${type}`;
        feedbackDiv.style.display = 'block';
        setTimeout(() => { feedbackDiv.style.display = 'none'; }, 5000);
    };

    const renderStars = (nota) => {
        const n = Math.max(1, Math.min(5, nota));
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    };

    /**
     * Renderiza card de feedback usando contrato exato da API
     */
    const renderFeedbackCard = (f) => `
        <div class="feedback-card">
            <div class="feedback-card-header">
                <span class="feedback-id">#${f.idFeedback}</span>
                <span class="feedback-tipo-badge">${f.tipoFeedback || '—'}</span>
            </div>
            <div class="feedback-stars">${renderStars(f.nota)}</div>
            <p class="feedback-comentario">${f.comentario || 'Sem comentário.'}</p>
            <div class="feedback-card-footer">
                <span class="feedback-consumidor">
                    <i class="fas fa-user"></i> ${f.nomeConsumidor || 'Anônimo'}
                </span>
                <span class="feedback-data">
                    <i class="fas fa-calendar-alt"></i> ${f.dataFeedback || '—'}
                </span>
            </div>
        </div>
    `;


    // =============================================
    // STAR RATING — Seleção interativa de nota (1-5)
    // =============================================
    let selectedNota = 0;

    if (starRating) {
        const starBtns = starRating.querySelectorAll('.star-btn');

        starBtns.forEach(btn => {
            // Hover
            btn.addEventListener('mouseenter', () => {
                const val = parseInt(btn.dataset.value);
                starBtns.forEach(b => {
                    b.classList.toggle('hovered', parseInt(b.dataset.value) <= val);
                });
            });

            // Mouse leave — volta ao estado selecionado
            btn.addEventListener('mouseleave', () => {
                starBtns.forEach(b => {
                    b.classList.remove('hovered');
                });
            });

            // Click — seleciona nota
            btn.addEventListener('click', () => {
                selectedNota = parseInt(btn.dataset.value);
                inputNota.value = selectedNota;
                notaDisplay.textContent = `(${selectedNota}/5)`;

                starBtns.forEach(b => {
                    b.classList.toggle('selected', parseInt(b.dataset.value) <= selectedNota);
                });
            });
        });
    }


    // =============================================
    // SIDEBAR, MOBILE MENU, DROPDOWN (Consumer panel)
    // =============================================
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');

    if (menuToggle) menuToggle.addEventListener('click', () => {
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        }
    });
    if (overlay) overlay.addEventListener('click', () => {
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

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
    // 4. CRIAR FEEDBACK
    // POST /logvert/feedbacks
    // Auth: Bearer Token (Consumidor)
    // Body: { tipoFeedback, nota, comentario, idLoja, idSolicitacao }
    // Status: 201, 401, 404, 409, 422
    // =============================================
    if (formCriar) {
        formCriar.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Coleta valores
            const tipoFeedback = document.getElementById('select-tipo-feedback').value;
            const nota = parseInt(inputNota.value);
            const comentario = document.getElementById('input-comentario').value.trim();
            const idLoja = parseInt(document.getElementById('input-id-loja').value);
            const idSolicitacao = parseInt(document.getElementById('input-id-solicitacao').value);

            // ---- VALIDAÇÕES ----

            if (!idSolicitacao || idSolicitacao < 1) {
                showFeedback('✗ Informe o ID da solicitação.', 'error');
                return;
            }

            if (!idLoja || idLoja < 1) {
                showFeedback('✗ Informe o ID da loja.', 'error');
                return;
            }

            if (!tipoFeedback) {
                showFeedback('✗ Selecione o tipo de feedback.', 'error');
                return;
            }

            // Validação obrigatória: nota entre 1 e 5
            if (!nota || nota < 1 || nota > 5) {
                showFeedback('✗ Selecione uma nota de 1 a 5 estrelas.', 'error');
                return;
            }

            if (!comentario) {
                showFeedback('✗ Escreva um comentário.', 'error');
                return;
            }

            // ---- MONTAR REQUEST BODY (contrato exato) ----
            const requestBody = {
                tipoFeedback,
                nota,
                comentario,
                idLoja,
                idSolicitacao
            };

            const btnSubmit = document.getElementById('btn-enviar-feedback');
            btnSubmit.disabled = true;
            btnSubmit.querySelector('.btn-text').textContent = 'Enviando...';

            try {
                const response = await fetch(`${AUTH_API_URL}/feedbacks`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(requestBody)
                });

                if (response.status === 201) {
                    // Sucesso — feedback criado
                    formCard.style.display = 'none';
                    successDiv.style.display = 'block';
                    showFeedback('✓ Feedback enviado com sucesso!', 'success');
                    formCriar.reset();
                    selectedNota = 0;
                    notaDisplay.textContent = '(selecione)';
                    starRating.querySelectorAll('.star-btn').forEach(b => b.classList.remove('selected'));

                } else if (response.status === 401) {
                    showFeedback('✗ Sessão expirada. Faça login novamente.', 'error');
                    setTimeout(() => { window.location.href = '/login'; }, 2000);

                } else if (response.status === 404) {
                    showFeedback('✗ Solicitação, loja ou consumidor não encontrado. Verifique os IDs.', 'error');

                } else if (response.status === 409) {
                    // Conflict: solicitação não concluída, feedback duplicado ou consumidor divergente
                    let msg = '✗ Não foi possível criar o feedback.';
                    try {
                        const errBody = await response.text();
                        if (errBody) msg = `✗ ${errBody}`;
                    } catch (ex) { /* ignora */ }
                    showFeedback(msg, 'error');

                } else if (response.status === 422) {
                    showFeedback('✗ Erro de validação. Verifique os campos (nota deve ser entre 1 e 5).', 'error');

                } else {
                    showFeedback('✗ Erro inesperado. Tente novamente.', 'error');
                }

            } catch (error) {
                console.error('Erro ao criar feedback:', error);
                showFeedback('✗ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.querySelector('.btn-text').textContent = 'Enviar Feedback';
            }
        });
    }


    // =============================================
    // BOTÃO "ENVIAR OUTRO FEEDBACK"
    // =============================================
    if (btnNovoFeedback) {
        btnNovoFeedback.addEventListener('click', () => {
            successDiv.style.display = 'none';
            formCard.style.display = 'block';
        });
    }


    // =============================================
    // 2. CONSULTAR FEEDBACKS POR SOLICITAÇÃO
    // GET /logvert/feedbacks/solicitacoes/{idSolicitacao}
    // Auth: Bearer Token (Consumidor)
    // Status: 200, 401, 404
    // =============================================
    if (formConsultar) {
        formConsultar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idSolicitacao = parseInt(document.getElementById('input-consulta-solicitacao').value);
            if (!idSolicitacao || idSolicitacao < 1) {
                showFeedback('✗ Informe um ID de solicitação válido.', 'error');
                return;
            }

            const btnSubmit = formConsultar.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;

            try {
                const response = await fetch(`${AUTH_API_URL}/feedbacks/solicitacoes/${idSolicitacao}`, {
                    method: 'GET',
                    headers: authHeaders()
                });

                if (response.status === 200) {
                    const feedbacks = await response.json();

                    if (feedbacks.length === 0) {
                        consultaResults.style.display = 'none';
                        consultaEmpty.style.display = 'block';
                        return;
                    }

                    consultaEmpty.style.display = 'none';
                    consultaTitle.innerHTML = `<i class="fas fa-list"></i> Feedbacks da Solicitação #${idSolicitacao} (${feedbacks.length})`;
                    consultaCards.innerHTML = feedbacks.map(renderFeedbackCard).join('');
                    consultaResults.style.display = 'block';
                    showFeedback(`✓ ${feedbacks.length} feedback(s) encontrado(s).`, 'success');

                } else if (response.status === 401) {
                    showFeedback('✗ Sessão expirada. Faça login novamente.', 'error');
                    setTimeout(() => { window.location.href = '/login'; }, 2000);

                } else if (response.status === 404) {
                    consultaResults.style.display = 'none';
                    consultaEmpty.style.display = 'block';
                    showFeedback('✗ Solicitação não encontrada ou consumidor sem acesso.', 'error');

                } else {
                    showFeedback('✗ Erro inesperado ao consultar feedbacks.', 'error');
                }

            } catch (error) {
                console.error('Erro ao consultar feedbacks:', error);
                showFeedback('✗ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }

});
