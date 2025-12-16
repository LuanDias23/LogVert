/**
 * FAQ Page - JavaScript
 * Funcionalidades: Accordion, Filtro por Categoria, Busca
 */

document.addEventListener('DOMContentLoaded', function () {
    // ========================================
    // 1. FAQ ACCORDION
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Fecha outros itens abertos
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle do item atual
            item.classList.toggle('active');
        });
    });

    // ========================================
    // 2. FILTRO POR CATEGORIA
    // ========================================
    const categoryBtns = document.querySelectorAll('.faq-category-btn');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos os botões
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;

            faqItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
        });
    });

    // ========================================
    // 3. BUSCA DE PERGUNTAS
    // ========================================
    const searchInput = document.getElementById('faqSearch');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            // Reset categoria para "Todas" quando buscar
            if (searchTerm) {
                categoryBtns.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-category="all"]')?.classList.add('active');
            }

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question span').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
        });
    }

    // ========================================
    // 4. FORMULÁRIO DE SUPORTE (se existir)
    // ========================================
    const formSuporte = document.getElementById('form-suporte');

    if (formSuporte) {
        formSuporte.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                email: document.getElementById('email').value,
                assunto: document.getElementById('assunto').value,
                descricao: document.getElementById('descricao').value
            };

            // Aqui você pode implementar o envio para um endpoint
            console.log('Dados do formulário:', formData);

            alert('Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.');
            formSuporte.reset();
        });
    }
});