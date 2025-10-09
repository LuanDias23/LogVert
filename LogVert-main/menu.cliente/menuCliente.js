document.addEventListener('DOMContentLoaded', () => {
    // Lógica para minimizar a sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Lógica para o menu responsivo em telas menores
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');

    const openMenu = () => {
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        }
    };
    const closeMenu = () => {
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    };
    
    if (menuToggle) { menuToggle.addEventListener('click', openMenu); }
    if (overlay) { overlay.addEventListener('click', closeMenu); }

    // Lógica para os dropdowns do header
    const dropdownToggles = document.querySelectorAll('.header-action-btn');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const dropdownId = toggle.id.replace('Btn', 'Dropdown');
            const currentDropdown = document.getElementById(dropdownId);

            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu.id !== dropdownId) {
                    menu.classList.remove('active');
                }
            });
            if(currentDropdown) {
                currentDropdown.classList.toggle('active');
            }
        });
    });
    window.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    });

    // Lógica da Animação de Partículas
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
});