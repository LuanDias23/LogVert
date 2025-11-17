document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------
    // LÓGICA EXISTENTE DO PAINEL (Sidebar, Mobile Menu, Dropdown)
    // -----------------------------------------------------
    
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

    // Lógica da Animação de Partículas (Verifica se particlesJS existe antes de rodar)
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

    // -----------------------------------------------------
    // NOVO: LÓGICA DE ENVIO DO FORMULÁRIO (Solicitação)
    // -----------------------------------------------------
    const form = document.getElementById('form-solicitacao');
    const formCard = document.querySelector('.form-card');
    const successMessage = document.getElementById('successMessage');

    if (form) {
        form.addEventListener('submit', function(event) {
            // 1. Previne o comportamento padrão (recarregar a página)
            event.preventDefault(); 
            
            // Simulação de sucesso:
            // 2. Oculta o container do formulário
            if (formCard) {
                formCard.style.display = 'none';
            }

            // 3. Mostra a mensagem de sucesso
            successMessage.style.display = 'flex'; 

            // Opcional: Rola a página para o topo da mensagem
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});

// -----------------------------------------------------
// NOVO: LÓGICA DE ENVIO DO FORMULÁRIO (Meus Dados)
// -----------------------------------------------------
const dadosForm = document.getElementById('form-meus-dados');
const dadosSuccessMessage = document.getElementById('successMessage');

if (dadosForm) {
    dadosForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        
        // Em um sistema real, aqui você faria a validação e o AJAX para salvar os dados.

        // Simulação de sucesso:
        // Oculta o formulário e mostra a mensagem de sucesso
        
        // dadosForm.style.display = 'none'; // Não vamos ocultar o formulário nesta tela, apenas mostrar a mensagem.

        // Mostra a mensagem de sucesso
        if (dadosSuccessMessage) {
            dadosSuccessMessage.style.display = 'flex'; 
            dadosSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Oculta a mensagem automaticamente após 5 segundos
        setTimeout(() => {
            if (dadosSuccessMessage) {
                dadosSuccessMessage.style.display = 'none';
            }
        }, 5000);
    });
};

// 3. Lógica de Envio do Formulário ALTERAR SENHA (Ativa apenas em alterar_senha.html)
    const senhaForm = document.getElementById('form-alterar-senha');
    // Usamos o ID que definimos no HTML: passwordSuccessMessage
    const passwordSuccessMessage = document.getElementById('passwordSuccessMessage'); 

    if (senhaForm) { 
        senhaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Simulação de sucesso:
            if (passwordSuccessMessage) {
                passwordSuccessMessage.style.display = 'flex'; 
                passwordSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Oculta a mensagem automaticamente após 5 segundos
            setTimeout(() => {
                if (passwordSuccessMessage) {
                    passwordSuccessMessage.style.display = 'none';
                }
            }, 5000);
        });
    };

   // =================================================================
    // CORREÇÃO: LÓGICA DO ACORDEÃO (FAQ)
    // =================================================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.accordion-item');
            const content = item.querySelector('.accordion-content'); // Obtém o conteúdo aqui

            // Fecha todos os outros itens ativos (opcional, mas recomendado)
            document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                const activeContent = activeItem.querySelector('.accordion-content');
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeContent.style.maxHeight = null; // Fecha o max-height
                }
            });

            // Alterna a classe 'active' no item clicado
            item.classList.toggle('active');

            // Ajuste crucial do max-height:
            if (item.classList.contains('active')) {
                // ABRE: Define o max-height para a altura real do conteúdo (scrollHeight)
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                // FECHA: Define o max-height como null (que volta ao valor 0 definido no CSS)
                content.style.maxHeight = null;
            }
        });
    });