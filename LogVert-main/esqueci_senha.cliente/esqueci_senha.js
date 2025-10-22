document.addEventListener('DOMContentLoaded', () => {
    // Configuração das Partículas (VERDE)
    if (typeof particlesJS !== 'undefined') {
        particlesJS("login-particles", {
            "particles": {
                "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#388e3c" }, // Cor VERDE
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
});