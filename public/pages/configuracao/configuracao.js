document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DAS ABAS (TABS) ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabLinks.length > 0 && tabContents.length > 0) {
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.getAttribute('data-tab');

                // 1. Remove 'active' de todos os links e conteúdos
                tabLinks.forEach(item => item.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // 2. Adiciona 'active' ao link clicado e ao conteúdo correspondente
                link.classList.add('active');
                const activeTabContent = document.getElementById(tabId);
                if (activeTabContent) {
                    activeTabContent.classList.add('active');
                }
            });
        });
    }

});