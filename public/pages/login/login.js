document.addEventListener('DOMContentLoaded', () => {
    const lojistaCard = document.getElementById('lojistaCard');
    const clienteCard = document.getElementById('clienteCard');
    const showClienteBtn = document.getElementById('showCliente');
    const showLojistaBtn = document.getElementById('showLojista');
    const body = document.body;

    // URL base da API de autenticação (separada da API_BASE_URL dos outros módulos)
    const AUTH_API_URL = 'http://localhost:8080/logvert';

    // --- FUNÇÕES DE CONTROLE DO SPINNER ---
    const showSpinner = (button) => {
        button.classList.add('loading');
        button.disabled = true;
        const spinner = button.querySelector('.btn-spinner');
        if (spinner) spinner.style.display = 'inline-block';
    };

    const hideSpinner = (button) => {
        button.classList.remove('loading');
        button.disabled = false;
        const spinner = button.querySelector('.btn-spinner');
        if (spinner) spinner.style.display = 'none';
    };

    // --- LÓGICA DAS PARTÍCULAS ---
    const baseConfig = {
        "particles": {
            "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
            "shape": { "type": "circle" }, "opacity": { "value": 0.2, "random": true },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
            "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
        },
        "interactivity": { "events": { "onhover": { "enable": true, "mode": "grab" } } }
    };
    const particlesConfigLojista = { ...baseConfig, particles: { ...baseConfig.particles, color: { "value": "#1A73E8" } } };
    const particlesConfigCliente = { ...baseConfig, particles: { ...baseConfig.particles, color: { "value": "#388e3c" } } };

    const loadParticles = (config) => {
        if (typeof particlesJS !== 'undefined') {
            particlesJS("login-particles", config);
        }
    };
    loadParticles(particlesConfigLojista);

    // --- LÓGICA DA ANIMAÇÃO DOS CARDS ---
    const switchCards = (cardToShow, cardToHide) => {
        if (cardToShow.classList.contains('active')) return;

        if (cardToShow === clienteCard) {
            body.classList.add('theme-cliente');
            loadParticles(particlesConfigCliente);
        } else {
            body.classList.remove('theme-cliente');
            loadParticles(particlesConfigLojista);
        }

        cardToHide.classList.add('is-leaving');
        cardToHide.classList.remove('active');

        cardToShow.classList.add('active');
        cardToShow.classList.add('is-entering');

        const items = cardToShow.querySelectorAll('.animate-item');
        items.forEach(item => item.style.animation = 'none');

        setTimeout(() => {
            cardToHide.classList.remove('is-leaving');
            cardToShow.classList.remove('is-entering');
            items.forEach(item => item.style.animation = '');
        }, 800);
    };

    if (showClienteBtn) {
        showClienteBtn.addEventListener('click', () => switchCards(clienteCard, lojistaCard));
    }
    if (showLojistaBtn) {
        showLojistaBtn.addEventListener('click', () => switchCards(lojistaCard, clienteCard));
    }

    // Estado inicial
    setTimeout(() => { lojistaCard.classList.add('active'); }, 100);


    // =================================================================
    // --- LÓGICA DE INTEGRAÇÃO COM A API ---
    // =================================================================

    // --- Formulário 1: Login do Lojista ---
    // Endpoint: POST /logvert/login
    // Payload: { email, password }
    // Resposta: { token }
    const lojistaForm = document.getElementById('lojista-form');
    const lojistaMessage = document.getElementById('lojista-message');

    if (lojistaForm) {
        lojistaForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('lojista-email').value;
            const senha = document.getElementById('lojista-senha').value;
            const submitBtn = document.getElementById('lojista-submit-btn');

            // Limpa mensagem anterior e mostra spinner
            lojistaMessage.textContent = '';
            lojistaMessage.className = 'form-message animate-item';
            showSpinner(submitBtn);

            try {
                const response = await fetch(`${AUTH_API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: senha }),
                });

                if (response.ok) {
                    // 200 OK - Login bem-sucedido
                    const result = await response.json();

                    if (result.token) {
                        localStorage.setItem('authToken', result.token);
                        localStorage.setItem('userRole', 'lojista');
                        localStorage.setItem('userName', result.userName || email);
                    }

                    setTimeout(() => {
                        window.location.href = "/menu.lojista";
                    }, 300);

                } else if (response.status === 401) {
                    // 401 Unauthorized - Credenciais inválidas
                    lojistaMessage.textContent = '✗ Email ou senha inválidos.';
                    lojistaMessage.classList.add('error');
                } else if (response.status === 422) {
                    // 422 Unprocessable Entity - Erro de validação ou usuário inativo
                    lojistaMessage.textContent = '✗ Erro de validação. Verifique seus dados.';
                    lojistaMessage.classList.add('error');
                } else {
                    // Outros erros
                    lojistaMessage.textContent = '✗ Erro ao fazer login. Tente novamente.';
                    lojistaMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Erro no login:', error);

                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    lojistaMessage.textContent = '✗ Erro de conexão. Verifique sua internet.';
                } else {
                    lojistaMessage.textContent = '✗ Erro ao fazer login. Tente novamente.';
                }
                lojistaMessage.classList.add('error');
            } finally {
                hideSpinner(submitBtn);
            }
        });
    }

    // --- Formulário 2: Login do Consumidor ---
    // Endpoint: POST /logvert/login/consumidores
    // Payload: { serial, password }
    // Resposta: { token }
    const clienteForm = document.getElementById('cliente-form');
    const clienteMessage = document.getElementById('cliente-message');

    if (clienteForm) {
        clienteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const serial = document.getElementById('cliente-codigo').value;
            const senha = document.getElementById('cliente-senha').value;
            const submitBtn = document.getElementById('cliente-submit-btn');

            // Limpa mensagem anterior e mostra spinner
            clienteMessage.textContent = '';
            clienteMessage.className = 'form-message animate-item';
            showSpinner(submitBtn);

            try {
                const response = await fetch(`${AUTH_API_URL}/login/consumidores`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serial, password: senha }),
                });

                if (response.ok) {
                    // 200 OK - Login bem-sucedido
                    const result = await response.json();

                    if (result.token) {
                        localStorage.setItem('authToken', result.token);
                        localStorage.setItem('userRole', 'cliente');
                        localStorage.setItem('clientSerial', serial);
                    }

                    setTimeout(() => {
                        window.location.href = '/cliente/dashboard';
                    }, 300);

                } else if (response.status === 401) {
                    // 401 Unauthorized - Serial ou senha inválidos
                    clienteMessage.textContent = '✗ Serial ou senha inválidos.';
                    clienteMessage.classList.add('error');
                } else if (response.status === 422) {
                    // 422 Unprocessable Entity - Erro de validação
                    clienteMessage.textContent = '✗ Erro de validação. Verifique seus dados.';
                    clienteMessage.classList.add('error');
                } else {
                    // Outros erros
                    clienteMessage.textContent = '✗ Erro ao fazer login. Tente novamente.';
                    clienteMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Erro no login do cliente:', error);

                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    clienteMessage.textContent = '✗ Erro de conexão. Verifique sua internet.';
                } else {
                    clienteMessage.textContent = '✗ Erro ao fazer login. Tente novamente.';
                }
                clienteMessage.classList.add('error');
            } finally {
                hideSpinner(submitBtn);
            }
        });
    }
});