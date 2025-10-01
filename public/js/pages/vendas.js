document.addEventListener('DOMContentLoaded', () => {
    // ------- Forms & inputs -------
    const formAdicionar = document.getElementById('form-adicionar');
    const formBuscar = document.getElementById('form-buscar');
    const formEditarRemover = document.getElementById('form-editar-remover');

    const addProdutoInput = document.getElementById('add-produto');
    const addDescricaoInput = document.getElementById('add-descricao');
    const addPrecoInput = document.getElementById('add-preco');
    const addEstoqueInput = document.getElementById('add-estoque');
    const addCategoriaInput = document.getElementById('add-categoria');

    const searchIdInput = document.getElementById('search-id');
    const editProdutoInput = document.getElementById('edit-produto');
    const editDescricaoInput = document.getElementById('edit-descricao');
    const editPrecoInput = document.getElementById('edit-preco');
    const editEstoqueInput = document.getElementById('edit-estoque');
    const editCategoriaInput = document.getElementById('edit-categoria');

    const btnBuscar = document.getElementById('btn-buscar');
    const btnRemover = document.getElementById('btn-remover');
    const fieldsetEdit = document.getElementById('fieldset-edit');

    // Simulação de DB
    let produtos = [];
    let proximoId = 1;

    // Funções
    function limparFormularioAdicionar() {
        if (formAdicionar) formAdicionar.reset();
    }

    function limparFormularioEditar() {
        if (formEditarRemover) formEditarRemover.reset();
        if (searchIdInput) searchIdInput.value = '';
        if (fieldsetEdit) fieldsetEdit.disabled = true;
    }

    function adicionarProduto(event) {
        event.preventDefault();
        if (!addProdutoInput || !addPrecoInput || !addEstoqueInput) return;

        const novoProduto = {
            id: proximoId++,
            nome: addProdutoInput.value.trim(),
            descricao: addDescricaoInput ? addDescricaoInput.value.trim() : '',
            preco: parseFloat(addPrecoInput.value) || 0,
            estoque: parseInt(addEstoqueInput.value, 10) || 0,
            categoria: addCategoriaInput ? addCategoriaInput.value.trim() : ''
        };

        produtos.push(novoProduto);
        alert(`Produto "${novoProduto.nome}" adicionado com sucesso! ID: ${novoProduto.id}`);
        console.log("Banco de dados de produtos:", produtos);
        limparFormularioAdicionar();
    }

    function buscarProduto() {
        if (!searchIdInput) return;
        const idParaBuscar = parseInt(searchIdInput.value, 10);
        if (isNaN(idParaBuscar)) {
            alert("Por favor, digite um ID válido.");
            return;
        }
        const produtoEncontrado = produtos.find(p => p.id === idParaBuscar);

        if (produtoEncontrado) {
            if (editProdutoInput) editProdutoInput.value = produtoEncontrado.nome;
            if (editDescricaoInput) editDescricaoInput.value = produtoEncontrado.descricao;
            if (editPrecoInput) editPrecoInput.value = produtoEncontrado.preco;
            if (editEstoqueInput) editEstoqueInput.value = produtoEncontrado.estoque;
            if (editCategoriaInput) editCategoriaInput.value = produtoEncontrado.categoria;

            if (fieldsetEdit) fieldsetEdit.disabled = false;
            alert("Produto encontrado e carregado para edição.");
        } else {
            alert("Produto com o ID informado não foi encontrado.");
            limparFormularioEditar();
        }
    }

    function editarProduto(event) {
        event.preventDefault();
        if (!searchIdInput) return;
        const idParaEditar = parseInt(searchIdInput.value, 10);
        const indexProduto = produtos.findIndex(p => p.id === idParaEditar);

        if (indexProduto !== -1) {
            produtos[indexProduto] = {
                ...produtos[indexProduto],
                nome: editProdutoInput ? editProdutoInput.value.trim() : produtos[indexProduto].nome,
                descricao: editDescricaoInput ? editDescricaoInput.value.trim() : produtos[indexProduto].descricao,
                preco: editPrecoInput ? (parseFloat(editPrecoInput.value) || 0) : produtos[indexProduto].preco,
                estoque: editEstoqueInput ? (parseInt(editEstoqueInput.value, 10) || 0) : produtos[indexProduto].estoque,
                categoria: editCategoriaInput ? editCategoriaInput.value.trim() : produtos[indexProduto].categoria,
            };
            alert(`Produto ID ${idParaEditar} atualizado com sucesso!`);
            console.log("Banco de dados de produtos:", produtos);
            limparFormularioEditar();
        } else {
            alert("Ocorreu um erro ao salvar. Produto não encontrado.");
        }
    }

    function removerProduto() {
        if (!searchIdInput) return;
        const idParaRemover = parseInt(searchIdInput.value, 10);
        if (isNaN(idParaRemover)) {
            alert("ID inválido.");
            return;
        }

        const confirmacao = confirm(`Tem certeza que deseja remover o produto com ID ${idParaRemover}?`);
        if (!confirmacao) return;

        produtos = produtos.filter(p => p.id !== idParaRemover);
        alert(`Produto ID ${idParaRemover} removido com sucesso.`);
        console.log("Banco de dados de produtos:", produtos);
        limparFormularioEditar();
    }

    // Event listeners (com checagem de existência)
    if (formAdicionar) formAdicionar.addEventListener('submit', adicionarProduto);
    if (btnBuscar) btnBuscar.addEventListener('click', buscarProduto);
    if (formEditarRemover) formEditarRemover.addEventListener('submit', editarProduto);
    if (btnRemover) btnRemover.addEventListener('click', removerProduto);

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

    // debug: log inicial
    console.log('Script inicializado — elementos encontrados:', {
        formAdicionar: !!formAdicionar,
        formEditarRemover: !!formEditarRemover,
        menuToggle: !!menuToggle,
        sidebar: !!sidebar
    });
});