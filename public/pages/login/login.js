document.addEventListener('DOMContentLoaded', () => {
    const lojistaCard = document.getElementById('lojistaCard');
    const clienteCard = document.getElementById('clienteCard');
    const showClienteBtn = document.getElementById('showCliente');
    const showLojistaBtn = document.getElementById('showLojista');
    const body = document.body;

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
    loadParticles(particlesConfigLojista); // Carrega a versão azul inicial

    // --- LÓGICA DA ANIMAÇÃO DOS CARDS ---
    const switchCards = (cardToShow, cardToHide) => {
        if (cardToShow.classList.contains('active')) return;

        // Adiciona/Remove a classe do tema no body
        if (cardToShow === clienteCard) {
            body.classList.add('theme-cliente');
            loadParticles(particlesConfigCliente); // Carrega partículas verdes
        } else {
            body.classList.remove('theme-cliente');
            loadParticles(particlesConfigLojista); // Carrega partículas azuis
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
    // --- LÓGICA DE INTEGRAÇÃO (AJUSTADA) ---
    // =================================================================

    // --- Formulário 1: Login do Lojista ---
    const lojistaForm = document.getElementById('lojista-form');
    const lojistaMessage = document.getElementById('lojista-message');

    if (lojistaForm) {
        lojistaForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o recarregamento da página

            // Usa os IDs corretos do seu HTML
            const email = document.getElementById('lojista-email').value;
            const password = document.getElementById('lojista-senha').value;

            lojistaMessage.textContent = 'Entrando...';
            lojistaMessage.className = 'form-message animate-item'; // Mantém a classe de animação

            try {
                // *** AJUSTE AQUI ***
                // Agora usa a variável do apiClient.js
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }), // Envia email e password
                });

                const result = await response.json();

                if (response.ok) {
                    lojistaMessage.textContent = result.message;
                    lojistaMessage.classList.add('success');
                    setTimeout(() => {
                        window.location.href = "/pages/menu.lojista/menuLojista.html"; // Redireciona para o menuLojista.html
                    }, 1000);
                } else {
                    lojistaMessage.textContent = result.message; // Ex: "Email ou senha inválidos."
                    lojistaMessage.classList.add('error');
                }
            } catch (error) {
                console.error(error); // Isso vai mostrar o erro real no console (F12)
                lojistaMessage.textContent = 'Erro de conexão com o servidor.';
                lojistaMessage.classList.add('error');
            }
        });
    }

    // --- Formulário 2: Login do Cliente ---
    const clienteForm = document.getElementById('cliente-form');
    const clienteMessage = document.getElementById('cliente-message');

    if (clienteForm) {
        clienteForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o recarregamento da página

            const codigo = document.getElementById('cliente-codigo').value;
            const senha = document.getElementById('cliente-senha').value;

            clienteMessage.textContent = 'Entrando...';
            clienteMessage.className = 'form-message animate-item'; // Mantém a classe de animação

            try {
                // *** AJUSTE AQUI ***
                // Agora usa a variável do apiClient.js
                const response = await fetch(`${API_BASE_URL}/login-cliente`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigo, senha }),
                });

                const result = await response.json();

                if (response.ok) {
                    clienteMessage.textContent = result.message;
                    clienteMessage.classList.add('success');
                    setTimeout(() => {
                        window.location.href = result.redirectTo; // Redireciona para o menuCliente.html
                    }, 1000);
                } else {
                    clienteMessage.textContent = result.message; // Ex: "Código ou senha inválidos."
                    clienteMessage.classList.add('error');
                }
            } catch (error) {
                console.error(error); // Isso vai mostrar o erro real no console (F12)
                clienteMessage.textContent = 'Erro de conexão com o servidor.';
                clienteMessage.classList.add('error');
            }
        });
    }
});