// ------- Sidebar (menu lateral) -------
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuToggle = document.getElementById('menu-toggle');
    const closeBtn = sidebar ? sidebar.querySelector('.close-btn') : null;
    const sidebarLinks = sidebar ? sidebar.querySelectorAll('.sidebar-link') : [];

    function openSidebar() {
        if (!sidebar || !overlay) return;
        sidebar.classList.add('active');
        overlay.classList.add('active');
        sidebar.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!sidebar || !overlay) return;
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        sidebar.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            openSidebar();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
    });

    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Fechar ao clicar em qualquer link da sidebar (bom pra UX)
    if (sidebarLinks && sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                // se link é interno (hash ou #) previne e fecha; se é navegação para outra página, permite.
                const href = link.getAttribute('href');
                if (!href || href === '#' || href.startsWith('javascript:')) {
                    closeSidebar();
                } else {
                    // permitir navegação normal, mas fechar sidebar antes (visual)
                    closeSidebar();
                    // não previne a navegação
                }
            });
        });
    }