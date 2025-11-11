document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DA ANIMAÇÃO DE PARTÍCULAS ---
    if (document.getElementById('page-particles') && typeof particlesJS !== 'undefined') {
        particlesJS("page-particles", {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": false } },
            },
            "retina_detect": true
        });
    }

    // --- LÓGICA DO MENU MOBILE (COPIADA DO WELCOME.JS) ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
        });
    }

    // O welcome.js não é carregado aqui, então a lógica do FAQ não é necessária.
});