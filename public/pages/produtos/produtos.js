document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO MODAL ---
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('addProdutoModal');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modalOverlay.classList.add('active');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

    if (modalOverlay) {
        // Fecha o modal se clicar fora da área de conteúdo (no overlay)
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // Lógica para lidar com o envio do formulário
    const addProdutoForm = document.getElementById('addProdutoForm');
    if (addProdutoForm) {
        addProdutoForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio real do formulário
            
            // Aqui você adicionaria a lógica para salvar os dados
            const nome = document.getElementById('nome').value;
            console.log(`Produto "${nome}" salvo!`);
            
            // Fechar o modal após salvar
            modalOverlay.classList.remove('active');
            
            // Limpar o formulário (opcional)
            addProdutoForm.reset();
            
            // Aqui você também poderia adicionar o novo produto na tabela
            // (Isso exigiria uma lógica de DOM mais complexa)
        });
    }
});