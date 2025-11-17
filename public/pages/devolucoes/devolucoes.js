document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DA ANIMAÇÃO DE PARTÍCULAS ---
    if (document.getElementById('dashboard-particles') && typeof particlesJS !== 'undefined') {
        particlesJS("dashboard-particles", {
            "particles": {
                "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#1A73E8" }, // Cor AZUL do Lojista
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

    // --- LÓGICA DO MODAL DE DETALHES ---
    const modalOverlay = document.getElementById('detailsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const detailButtons = document.querySelectorAll('.btn-view-details, .row-clickable');

    const openModal = () => {
        if (modalOverlay) modalOverlay.classList.add('active');
    };

    const closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('active');
    };

    // Abre o modal ao clicar em qualquer botão de "ver detalhes" ou na linha da tabela
    detailButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique na linha ative o botão e vice-versa
            // Aqui você poderia carregar os dados específicos da solicitação no modal
            // (Por enquanto, apenas abre o modal de exemplo)
            openModal();
        });
    });

    // Fecha o modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // Fecha o modal se clicar fora da área de conteúdo (no overlay)
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // O menu.lojista/menu.js importado no HTML já cuida da lógica do menu mobile e sidebar.
});