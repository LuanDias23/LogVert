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
});