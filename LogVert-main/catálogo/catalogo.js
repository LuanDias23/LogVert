document.addEventListener('DOMContentLoaded', () => {
    const catalogLayout = document.getElementById('catalog-layout');
    const toggleButton = document.getElementById('toggle-filters-btn');
    const filterLinks = document.querySelectorAll('.filter-category');
    const productGrid = document.getElementById('product-grid');
    const productCards = document.querySelectorAll('.product-card');

    // ----------------------------------------------------
    // Passo 1: Lógica para MOSTRAR/ESCONDER o menu lateral
    // ----------------------------------------------------
    toggleButton.addEventListener('click', () => {
        // Alterna a classe 'filters-hidden' no layout principal
        catalogLayout.classList.toggle('filters-hidden');

        // Atualiza o texto e ícone do botão
        const isHidden = catalogLayout.classList.contains('filters-hidden');
        if (isHidden) {
            toggleButton.innerHTML = '<i class="fas fa-search"></i> Filtrar por Categoria';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-times-circle"></i> Fechar Filtros';
        }
    });

    // ----------------------------------------------------
    // Passo 2: Lógica para FILTRAR por Categoria (e Disponibilidade)
    // ----------------------------------------------------
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Remove a classe 'active' de todos os links de categoria
            filterLinks.forEach(item => item.classList.remove('active'));

            // 2. Adiciona a classe 'active' apenas no link clicado
            link.classList.add('active');

            // 3. Obtém o filtro de categoria selecionado
            const selectedCategory = link.getAttribute('data-filter');

            // 4. Executa a filtragem
            filterProducts(selectedCategory);
        });
    });

    function filterProducts(categoryFilter) {
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            // Lógica principal de filtragem de categoria
            const matchesCategory = categoryFilter === 'all' || cardCategory === categoryFilter;
            
            if (matchesCategory) {
                // Se o produto combina, ele é mostrado
                card.style.display = 'flex'; 
            } else {
                // Se não combina, ele é escondido
                card.style.display = 'none';
            }
        });
    }

    // Inicialmente, mostra todos os produtos (no caso de recarregar a página)
    filterProducts('all'); 
});