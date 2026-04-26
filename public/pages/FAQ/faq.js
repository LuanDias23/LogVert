/**
 * FAQ Page (Lojista) - Feedbacks API Integration
 * Endpoints:
 *   1. GET /logvert/feedbacks/{id}             — Buscar feedback por ID (Bearer Token)
 *   2. GET /logvert/feedbacks/solicitacoes/{id} — Buscar feedbacks por solicitação (Bearer Token)
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
    const formBuscaId = document.getElementById('form-busca-id');
    const formBuscaSolicitacao = document.getElementById('form-busca-solicitacao');
    const inputFeedbackId = document.getElementById('input-feedback-id');
    const inputSolicitacaoId = document.getElementById('input-solicitacao-id');
    const resultsSection = document.getElementById('feedback-results');
    const resultsTitle = document.getElementById('results-title');
    const cardsContainer = document.getElementById('feedback-cards-container');
    const emptyResults = document.getElementById('empty-results');
    const btnClearResults = document.getElementById('btn-clear-results');

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

    /**
     * Renderiza estrelas (★/☆) com base na nota (1-5)
     */
    const renderStars = (nota) => {
        const n = Math.max(1, Math.min(5, nota));
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    };

    /**
     * Renderiza um card de feedback seguindo o contrato da API:
     * { idFeedback, tipoFeedback, nota, comentario, dataFeedback, idConsumidor, nomeConsumidor, idLoja, idSolicitacao }
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
            <div class="feedback-card-meta">
                <span><i class="fas fa-store"></i> Loja: ${f.idLoja ?? '—'}</span>
                <span><i class="fas fa-clipboard-list"></i> Solicitação: ${f.idSolicitacao ?? '—'}</span>
            </div>
        </div>
    `;

    /**
     * Exibe os feedbacks na área de resultados
     */
    const showResults = (feedbacks, title) => {
        if (!feedbacks || feedbacks.length === 0) {
            resultsSection.style.display = 'none';
            emptyResults.style.display = 'block';
            return;
        }

        emptyResults.style.display = 'none';
        resultsTitle.innerHTML = `<i class="fas fa-list"></i> ${title}`;
        cardsContainer.innerHTML = feedbacks.map(renderFeedbackCard).join('');
        resultsSection.style.display = 'block';
    };

    const clearResults = () => {
        resultsSection.style.display = 'none';
        emptyResults.style.display = 'none';
        cardsContainer.innerHTML = '';
    };


    // =============================================
    // 1. BUSCAR FEEDBACK POR ID
    // GET /logvert/feedbacks/{id}
    // Auth: Bearer Token (Lojista)
    // Status: 200, 401, 404
    // =============================================
    if (formBuscaId) {
        formBuscaId.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = parseInt(inputFeedbackId.value);
            if (!id || id < 1) {
                showFeedback('✗ Informe um ID de feedback válido.', 'error');
                return;
            }

            const btnSubmit = formBuscaId.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;

            try {
                const response = await fetch(`${AUTH_API_URL}/feedbacks/${id}`, {
                    method: 'GET',
                    headers: authHeaders()
                });

                if (response.status === 200) {
                    const feedback = await response.json();
                    showResults([feedback], `Feedback #${feedback.idFeedback}`);
                    showFeedback('✓ Feedback encontrado.', 'success');

                } else if (response.status === 401) {
                    showFeedback('✗ Sessão expirada. Faça login novamente.', 'error');
                    setTimeout(() => { window.location.href = '/login'; }, 2000);

                } else if (response.status === 404) {
                    clearResults();
                    emptyResults.style.display = 'block';
                    showFeedback('✗ Feedback não encontrado.', 'error');

                } else {
                    showFeedback('✗ Erro inesperado ao buscar feedback.', 'error');
                }

            } catch (error) {
                console.error('Erro ao buscar feedback por ID:', error);
                showFeedback('✗ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }


    // =============================================
    // 2. BUSCAR FEEDBACKS POR SOLICITAÇÃO
    // GET /logvert/feedbacks/solicitacoes/{idSolicitacao}
    // Auth: Bearer Token (Lojista ou Consumidor)
    // Status: 200, 401, 404
    // =============================================
    if (formBuscaSolicitacao) {
        formBuscaSolicitacao.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idSolicitacao = parseInt(inputSolicitacaoId.value);
            if (!idSolicitacao || idSolicitacao < 1) {
                showFeedback('✗ Informe um ID de solicitação válido.', 'error');
                return;
            }

            const btnSubmit = formBuscaSolicitacao.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;

            try {
                const response = await fetch(`${AUTH_API_URL}/feedbacks/solicitacoes/${idSolicitacao}`, {
                    method: 'GET',
                    headers: authHeaders()
                });

                if (response.status === 200) {
                    const feedbacks = await response.json();
                    showResults(feedbacks, `Feedbacks da Solicitação #${idSolicitacao} (${feedbacks.length} encontrado${feedbacks.length !== 1 ? 's' : ''})`);
                    if (feedbacks.length > 0) {
                        showFeedback(`✓ ${feedbacks.length} feedback(s) encontrado(s).`, 'success');
                    }

                } else if (response.status === 401) {
                    showFeedback('✗ Sessão expirada. Faça login novamente.', 'error');
                    setTimeout(() => { window.location.href = '/login'; }, 2000);

                } else if (response.status === 404) {
                    clearResults();
                    emptyResults.style.display = 'block';
                    showFeedback('✗ Solicitação não encontrada ou sem acesso.', 'error');

                } else {
                    showFeedback('✗ Erro inesperado ao buscar feedbacks.', 'error');
                }

            } catch (error) {
                console.error('Erro ao buscar feedbacks por solicitação:', error);
                showFeedback('✗ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }


    // =============================================
    // LIMPAR RESULTADOS
    // =============================================
    if (btnClearResults) {
        btnClearResults.addEventListener('click', () => {
            clearResults();
            if (inputFeedbackId) inputFeedbackId.value = '';
            if (inputSolicitacaoId) inputSolicitacaoId.value = '';
        });
    }
});