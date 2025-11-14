document.addEventListener('DOMContentLoaded', () => {
    // Lógica para minimizar a sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Lógica para o menu responsivo em telas menores
    const header = document.querySelector('.main-header');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

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
    if (header) {
        header.addEventListener('click', (e) => {
            // Abre o menu se clicar perto da borda esquerda em telas móveis
            if (e.clientX < 60 && window.innerWidth <= 768) {
                openMenu();
            }
        });
    }
    overlay.addEventListener('click', closeMenu);

    // =================================================================
    // --- LÓGICA DE DROPDOWN (SUB-MENU) DA SIDEBAR ---
    // =================================================================
    try {
        // Encontra todos os 'li' que têm sub-menus (assumindo que tenham a classe .has-submenu)
        const sidebarSubmenuToggles = document.querySelectorAll('#sidebar li.has-submenu');

        sidebarSubmenuToggles.forEach(toggleLi => {
            const toggleLink = toggleLi.querySelector('a'); // O link principal do sub-menu

            if (toggleLink) {
                toggleLink.addEventListener('click', (event) => {
                    // Previne a navegação se o link for apenas um toggle (ex: href="#")
                    if (toggleLink.getAttribute('href') === '#') {
                        event.preventDefault();
                    }
                    
                    // Alterna (abre/fecha) o sub-menu
                    toggleLi.classList.toggle('active');

                    // Opcional: Se quiser que apenas um sub-menu fique aberto por vez
                    sidebarSubmenuToggles.forEach(otherLi => {
                        if (otherLi !== toggleLi) {
                            otherLi.classList.remove('active');
                        }
                    });
                });
            }
        });
    } catch (e) {
        console.error("Erro ao configurar os sub-menus da sidebar:", e);
    }
    // =================================================================
    // --- FIM DO BLOCO DE DROPDOWN DA SIDEBAR ---
    // =================================================================

    // --- LÓGICA PARA OS DROPDOWNS DO HEADER ---
    const dropdownToggles = document.querySelectorAll('.header-action-btn');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique feche o menu imediatamente
            const dropdownId = toggle.id.replace('Btn', 'Dropdown');
            const currentDropdown = document.getElementById(dropdownId);

            // Fecha outros dropdowns abertos
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu.id !== dropdownId) {
                    menu.classList.remove('active');
                }
            });
            // Alterna o dropdown atual
            currentDropdown.classList.toggle('active');
        });
    });
    // Fecha os dropdowns se clicar em qualquer outro lugar da janela
    window.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    });

    // =================================================================
    // --- BLOCO ATUALIZADO (LÓGICA FINAL): CORREÇÃO DO LINK ATIVO ---
    // (Comparando o pathname completo, que é mais robusto)
    // =================================================================
    try {
        // 1. Pega o pathname da URL atual (ex: "/devolucoes/devolucoes.html")
        const currentPath = window.location.pathname;

        // 2. Seleciona TODOS os links 'a' dentro de 'li' na sidebar
        const sidebarLinks = document.querySelectorAll('#sidebar li a');

        if (sidebarLinks.length > 0 && currentPath) {
            // 3. Itera sobre cada link
            sidebarLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                
                // Pula se o link não tiver um href ou for só de toggle (#)
                if (!linkHref || linkHref === '#') {
                    return;
                }

                // 4. Pega o pathname do link (ex: "/devolucoes/devolucoes.html")
                // O 'link.pathname' é a propriedade que o browser resolve
                // (ele vai entender o '../devolucoes/devolucoes.html' e converter)
                const linkPath = link.pathname;

                // 5. LIMPA a classe 'active' deste link
                link.classList.remove('active');

                // 6. Compara o pathname completo da página com o pathname do link
                if (linkPath === currentPath) {
                    
                    // ... ADICIONA a classe 'active' ao link
                    link.classList.add('active');

                    // 7. Lógica para abrir sub-menu (se aplicável)
                    const parentUl = link.closest('ul');
                    if (parentUl && parentUl.classList.contains('submenu')) {
                        const parentSubmenuLi = parentUl.closest('li.has-submenu');
                        if (parentSubmenuLi) {
                            parentSubmenuLi.classList.add('active');
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error("Erro ao tentar definir o link ativo da sidebar:", e);
    }
    // =================================================================
    // --- FIM DO BLOCO ATUALIZADO ---
    // =================================================================


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