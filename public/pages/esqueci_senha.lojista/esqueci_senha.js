document.addEventListener('DOMContentLoaded', () => {

    // URL base da API de autenticação
    const AUTH_API_URL = 'http://localhost:8080/logvert';

    // --- PARTÍCULAS ---
    if (document.getElementById('esqueci-senha-particles') && typeof particlesJS !== 'undefined') {
        particlesJS("esqueci-senha-particles", {
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

    // --- REFERÊNCIAS DOS ELEMENTOS ---
    const message = document.getElementById('recovery-message');
    const stepEmail = document.getElementById('step-email');
    const stepCode = document.getElementById('step-code');
    const stepPassword = document.getElementById('step-password');
    const formEmail = document.getElementById('form-email');
    const formCode = document.getElementById('form-code');
    const formPassword = document.getElementById('form-password');

    // Dados armazenados entre as etapas
    let savedEmail = '';
    let savedCode = '';

    // --- FUNÇÕES AUXILIARES ---
    const showMessage = (text, type) => {
        message.textContent = text;
        message.className = 'form-message ' + type;
    };

    const clearMessage = () => {
        message.textContent = '';
        message.className = 'form-message';
    };

    const showSpinner = (button) => {
        button.disabled = true;
        const spinner = button.querySelector('.btn-spinner');
        if (spinner) spinner.style.display = 'inline-block';
        const btnText = button.querySelector('.btn-text');
        if (btnText) btnText.style.opacity = '0.5';
    };

    const hideSpinner = (button) => {
        button.disabled = false;
        const spinner = button.querySelector('.btn-spinner');
        if (spinner) spinner.style.display = 'none';
        const btnText = button.querySelector('.btn-text');
        if (btnText) btnText.style.opacity = '1';
    };

    const showStep = (step) => {
        stepEmail.style.display = 'none';
        stepCode.style.display = 'none';
        stepPassword.style.display = 'none';
        step.style.display = 'block';
    };


    // =================================================================
    // ETAPA 1: Solicitar código de recuperação
    // POST /logvert/login/lojista/recuperar-senha
    // Payload: { email }
    // =================================================================
    if (formEmail) {
        formEmail.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessage();

            const email = document.getElementById('recovery-email').value.trim();
            const submitBtn = formEmail.querySelector('button[type="submit"]');
            showSpinner(submitBtn);

            try {
                const response = await fetch(`${AUTH_API_URL}/login/lojista/recuperar-senha`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                if (response.ok) {
                    // 200 OK - Código enviado com sucesso
                    savedEmail = email;
                    showMessage('✓ Código de recuperação enviado para o seu e-mail.', 'success');
                    showStep(stepCode);
                } else if (response.status === 404) {
                    // 404 Not Found - Lojista não encontrado
                    showMessage('✗ Nenhum lojista encontrado com este e-mail.', 'error');
                } else if (response.status === 422) {
                    // 422 Unprocessable Entity - Usuário inativo
                    showMessage('✗ Usuário inativo. Entre em contato com o suporte.', 'error');
                } else {
                    showMessage('✗ Erro ao enviar o código. Tente novamente.', 'error');
                }
            } catch (error) {
                console.error('Erro ao solicitar recuperação:', error);
                showMessage('✗ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                hideSpinner(submitBtn);
            }
        });
    }


    // =================================================================
    // ETAPA 2: Validar código de recuperação
    // POST /logvert/login/lojista/validar-recuperacao
    // Payload: { email, codigoRecuperacao }
    // =================================================================
    if (formCode) {
        formCode.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessage();

            const codigoRecuperacao = document.getElementById('recovery-code').value.trim();
            const submitBtn = formCode.querySelector('button[type="submit"]');
            showSpinner(submitBtn);

            try {
                const response = await fetch(`${AUTH_API_URL}/login/lojista/validar-recuperacao`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: savedEmail, codigoRecuperacao }),
                });

                if (response.ok) {
                    // 200 OK - Código válido
                    savedCode = codigoRecuperacao;
                    showMessage('✓ Código validado com sucesso. Defina sua nova senha.', 'success');
                    showStep(stepPassword);
                } else if (response.status === 404) {
                    // 404 Not Found - Código inválido
                    showMessage('✗ Código de recuperação inválido.', 'error');
                } else if (response.status === 410) {
                    // 410 Gone - Código expirado
                    showMessage('✗ Código de recuperação expirado. Solicite um novo código.', 'error');
                } else if (response.status === 422) {
                    // 422 Unprocessable Entity - Código já utilizado
                    showMessage('✗ Este código já foi utilizado. Solicite um novo código.', 'error');
                } else {
                    showMessage('✗ Erro ao validar o código. Tente novamente.', 'error');
                }
            } catch (error) {
                console.error('Erro ao validar código:', error);
                showMessage('✗ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                hideSpinner(submitBtn);
            }
        });
    }


    // =================================================================
    // ETAPA 3: Atualizar senha
    // POST /logvert/login/lojista/atualizar-senha
    // Payload: { email, codigoRecuperacao, novaSenha }
    // =================================================================
    if (formPassword) {
        formPassword.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessage();

            const novaSenha = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitBtn = formPassword.querySelector('button[type="submit"]');

            // Validação client-side: mínimo 8 caracteres
            if (novaSenha.length < 8) {
                showMessage('✗ A senha deve ter no mínimo 8 caracteres.', 'error');
                return;
            }

            // Validação client-side: senhas devem coincidir
            if (novaSenha !== confirmPassword) {
                showMessage('✗ As senhas não coincidem.', 'error');
                return;
            }

            showSpinner(submitBtn);

            try {
                const response = await fetch(`${AUTH_API_URL}/login/lojista/atualizar-senha`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: savedEmail,
                        codigoRecuperacao: savedCode,
                        novaSenha
                    }),
                });

                if (response.ok) {
                    // 200 OK - Senha atualizada com sucesso
                    showMessage('✓ Senha atualizada com sucesso! Redirecionando para o login...', 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else if (response.status === 404) {
                    // 404 Not Found - Código inválido
                    showMessage('✗ Código de recuperação inválido.', 'error');
                } else if (response.status === 410) {
                    // 410 Gone - Código expirado
                    showMessage('✗ Código de recuperação expirado. Solicite um novo código.', 'error');
                } else if (response.status === 422) {
                    // 422 Unprocessable Entity - Senha fraca ou código já utilizado
                    showMessage('✗ Senha fraca (mínimo 8 caracteres) ou código já utilizado.', 'error');
                } else {
                    showMessage('✗ Erro ao atualizar a senha. Tente novamente.', 'error');
                }
            } catch (error) {
                console.error('Erro ao atualizar senha:', error);
                showMessage('✗ Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                hideSpinner(submitBtn);
            }
        });
    }
});