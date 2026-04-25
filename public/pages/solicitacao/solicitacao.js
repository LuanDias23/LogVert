document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // CONFIGURAÇÃO
    // =============================================
    const AUTH_API_URL = 'http://localhost:8080/logvert';

    // =============================================
    // ELEMENTOS DOM
    // =============================================
    const form = document.getElementById('form-solicitacao');
    const formCard = document.getElementById('form-card');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const submitBtn = document.getElementById('btn-submit');

    // =============================================
    // FUNÇÕES AUXILIARES
    // =============================================
    const getToken = () => localStorage.getItem('authToken');

    const showError = (message) => {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const showSuccess = () => {
        formCard.style.display = 'none';
        successMessage.style.display = 'flex';
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // =============================================
    // CRIAR SOLICITAÇÃO
    // POST /logvert/solicitacoes/criar
    // multipart/form-data:
    //   Parte 1: solicitacao (application/json) → { idItem, quantidade, tipo, motivo }
    //   Parte 2: anexos (image/*, video/*) → arquivos
    // =============================================
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Oculta mensagens anteriores
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';

            // Coleta os valores dos campos
            const idItem = parseInt(document.getElementById('idItem').value);
            const quantidade = parseFloat(document.getElementById('quantidade').value);
            const tipo = document.getElementById('tipo-solicitacao').value;
            const motivoSelect = document.getElementById('motivo').value;
            const detalhes = document.getElementById('detalhes').value;
            const anexosInput = document.getElementById('anexos');

            // Determina o motivo final
            const motivo = motivoSelect === 'Outro' ? detalhes : motivoSelect;

            // Validação básica
            if (!idItem || idItem < 1) {
                showError('✗ Informe o ID do item.');
                return;
            }
            if (!quantidade || quantidade < 1) {
                showError('✗ Informe a quantidade.');
                return;
            }
            if (!tipo) {
                showError('✗ Selecione o tipo de solicitação.');
                return;
            }
            if (!motivo) {
                showError('✗ Selecione ou descreva o motivo.');
                return;
            }

            // Monta o FormData (multipart/form-data)
            const formData = new FormData();

            // Parte 1: solicitacao (JSON)
            const solicitacao = { idItem, quantidade, tipo, motivo };
            formData.append('solicitacao', new Blob([JSON.stringify(solicitacao)], { type: 'application/json' }));

            // Parte 2: anexos (arquivos)
            if (anexosInput && anexosInput.files.length > 0) {
                for (let i = 0; i < anexosInput.files.length; i++) {
                    formData.append('anexos', anexosInput.files[i]);
                }
            }

            // Desabilita o botão
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').textContent = 'Enviando...';

            try {
                const response = await fetch(`${AUTH_API_URL}/solicitacoes/criar`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: formData
                });

                if (response.ok) {
                    // 200 OK - Solicitação criada com sucesso
                    showSuccess();
                    form.reset();

                } else if (response.status === 400) {
                    // 400 Bad Request - Tipo de arquivo inválido
                    showError('✗ Tipo de arquivo inválido. Envie apenas imagens ou vídeos.');

                } else if (response.status === 401) {
                    // 401 Unauthorized - Token inválido
                    showError('✗ Sessão expirada. Faça login novamente.');
                    setTimeout(() => { window.location.href = '/pages/login/login.html'; }, 2000);

                } else if (response.status === 404) {
                    // 404 Not Found - Venda ou item não encontrado
                    showError('✗ Venda ou item não encontrado. Verifique o ID do item.');

                } else if (response.status === 409) {
                    // 409 Conflict - Prazo expirado, quantidade inválida ou status não permite
                    let msg = '✗ Não foi possível criar a solicitação.';
                    try {
                        const errBody = await response.text();
                        if (errBody) msg = `✗ ${errBody}`;
                    } catch (e) { /* ignora */ }
                    showError(msg);

                } else if (response.status === 422) {
                    // 422 Unprocessable Entity - Erro de validação
                    showError('✗ Erro de validação. Verifique os campos preenchidos.');

                } else {
                    showError('✗ Erro inesperado. Tente novamente.');
                }

            } catch (error) {
                console.error('Erro ao criar solicitação:', error);
                showError('✗ Erro de conexão. Verifique sua internet.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = 'Enviar Solicitação';
            }
        });
    }
});
