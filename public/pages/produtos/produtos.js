document.addEventListener('DOMContentLoaded', () => {

    // --- 1. REFERÊNCIAS DO DOM ---
    const tableBody = document.querySelector('#productsTableBody') 
                   || document.querySelector('.table-container tbody');
    const modal = document.getElementById('addProdutoModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const produtoForm = document.getElementById('addProdutoForm');
    const exportBtn = document.getElementById('exportBtn');

    // Campo oculto para controlar modo edição
    const editIdInput = document.createElement('input');
    editIdInput.type = 'hidden';
    editIdInput.id = 'editId';
    produtoForm.appendChild(editIdInput);

    // Rota base dos produtos conforme documentação
    const PRODUTOS_URL = `${API_BASE_URL}/produtos`;

    // --- 2. LÓGICA DO MODAL ---

    const fecharModal = () => {
        modal.classList.remove('active');
    };

    const abrirModalNovo = () => {
        produtoForm.reset();
        editIdInput.value = '';
        document.querySelector('.modal-header h2').textContent = 'Adicionar Novo Produto';
        document.getElementById('imagem').required = true;
        modal.classList.add('active');
    };

    if (openModalBtn) openModalBtn.addEventListener('click', abrirModalNovo);
    if (closeModalBtn) closeModalBtn.addEventListener('click', fecharModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fecharModal();
        });
    }


    // --- 3. LÓGICA DE API (CRUD) ---

    /**
     * READ: Busca todos os produtos — GET /logvert/produtos?page=0&size=50
     * O backend retorna um objeto Page { content: [...], totalElements, ... }
     */
    const carregarProdutos = async () => {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Carregando produtos...</td></tr>';
        try {
            const response = await fetch(`${PRODUTOS_URL}?page=0&size=50`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.status === 401) throw new Error('Token inválido ou não fornecido. Faça login novamente.');
            if (!response.ok) throw new Error(`Erro ao buscar produtos. Status: ${response.status}`);

            const dados = await response.json();

            // Backend retorna Page<Produto> com campo "content"
            let produtos = [];
            if (Array.isArray(dados)) {
                produtos = dados;
            } else if (dados && Array.isArray(dados.content)) {
                produtos = dados.content;
            }

            tableBody.innerHTML = '';

            if (produtos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
                return;
            }

            produtos.forEach(produto => {
                const tr = document.createElement('tr');

                // Monta URL da imagem do Google Drive usando o fileId retornado pelo backend
                const imageUrl = produto.imagem
                    ? `https://lh3.googleusercontent.com/d/${produto.imagem}`
                    : 'https://placehold.co/40x40/334155/94a3b8?text=?';

                const precoFormatado = `R$ ${parseFloat(produto.preco || 0).toFixed(2).replace('.', ',')}`;

                tr.innerHTML = `
                    <td class="produto-cell">
                        <img src="${imageUrl}"
                             alt="Imagem do produto"
                             class="produto-img-preview"
                             onerror="this.src='https://placehold.co/40x40/334155/94a3b8?text=?'">
                        <span>${produto.descricao || 'Sem descrição'}</span>
                    </td>
                    <td>${precoFormatado}</td>
                    <td>${produto.unidadeMedida || 'UN'}</td>
                    <td class="action-buttons">
                        <button class="btn-icon btn-edit"   data-id="${produto.idProduto}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn-icon btn-delete" data-id="${produto.idProduto}" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro em carregarProdutos:', error);
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#e53935;">${error.message}</td></tr>`;
        }
    };


    /**
     * CREATE / UPDATE: Submit do formulário
     * POST /logvert/produtos          → multipart/form-data (produto JSON + imagem)
     * PUT  /logvert/produtos/{id}     → multipart/form-data (produto JSON + imagem opcional)
     *
     * O JSON do produto contém apenas: descricao, unidadeMedida, preco
     * A loja é identificada pelo token JWT — NÃO enviamos idLoja no body.
     */
    if (produtoForm) {
        produtoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idParaEditar = editIdInput.value;

            // Monta apenas os campos que a API espera no body
            const produtoJson = {
                descricao:      document.getElementById('descricao').value.trim(),
                unidadeMedida:  document.getElementById('unidadeMedida').value.trim(),
                preco:          parseFloat(document.getElementById('preco').value)
            };

            // Validações básicas antes de enviar
            if (!produtoJson.descricao) {
                alert('Informe a descrição do produto.');
                return;
            }
            if (isNaN(produtoJson.preco) || produtoJson.preco < 0) {
                alert('Informe um preço válido e não negativo.');
                return;
            }

            const imagemFile = document.getElementById('imagem').files[0];

            // Na criação (POST), a imagem não é obrigatória pela API,
            // mas o backend aceita multipart mesmo sem ela — enviamos o FormData normalmente.
            const formData = new FormData();
            formData.append('produto', new Blob([JSON.stringify(produtoJson)], {
                type: 'application/json'
            }));
            if (imagemFile) {
                formData.append('imagem', imagemFile);
            }

            const url    = idParaEditar ? `${PRODUTOS_URL}/${idParaEditar}` : PRODUTOS_URL;
            const method = idParaEditar ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method,
                    body: formData,
                    headers: getAuthHeadersForFormData() // apenas Authorization; sem Content-Type (boundary automático)
                });

                // Trata erros de status específicos da documentação
                if (!response.ok) {
                    let mensagem = `Erro ${response.status}`;
                    try {
                        const err = await response.json();
                        mensagem = err.message || err.erro || JSON.stringify(err);
                    } catch {
                        try { mensagem = await response.text(); } catch { /* sem body */ }
                    }

                    switch (response.status) {
                        case 400: throw new Error(`Tipo de arquivo de imagem inválido. ${mensagem}`);
                        case 401: throw new Error('Token inválido. Faça login novamente.');
                        case 403: throw new Error(`Acesso negado ou erro no Google Drive. ${mensagem}`);
                        case 404: throw new Error('Produto não encontrado.');
                        case 409: throw new Error(`Conflito: já existe um produto com essa descrição nesta loja.`);
                        case 422: throw new Error(`Erro de validação nos campos: ${mensagem}`);
                        default:  throw new Error(mensagem);
                    }
                }

                alert(idParaEditar ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
                fecharModal();
                await carregarProdutos();

            } catch (error) {
                console.error('Erro ao salvar produto:', error);
                alert(error.message);
            }
        });
    }


    /**
     * EDIT (GET /logvert/produtos/{id}) e DELETE (DELETE /logvert/produtos/{id})
     * Delegação de evento na tabela
     */
    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button.btn-icon');
        if (!button) return;

        const id = button.dataset.id;

        if (!id || id === 'undefined' || id === 'null') {
            alert('Produto sem ID válido. Atualize a página e tente novamente.');
            return;
        }

        if (button.classList.contains('btn-edit')) {
            // --- EDITAR: busca o produto pelo ID — GET /logvert/produtos/{id} ---
            try {
                const response = await fetch(`${PRODUTOS_URL}/${id}`, {
                    headers: getAuthHeaders()
                });

                if (response.status === 401) throw new Error('Token inválido. Faça login novamente.');
                if (response.status === 403) throw new Error('Este produto pertence a outra loja.');
                if (response.status === 404) throw new Error('Produto não encontrado.');
                if (!response.ok)            throw new Error(`Erro ao carregar produto. Status: ${response.status}`);

                const produto = await response.json();

                // Preenche o formulário com os dados retornados
                // A API retorna: idProduto, descricao, unidadeMedida, preco, imagem, status
                document.getElementById('descricao').value     = produto.descricao    || '';
                document.getElementById('preco').value         = produto.preco        || '';
                document.getElementById('unidadeMedida').value = produto.unidadeMedida || 'UN';
                document.getElementById('imagem').value        = null; // limpa o file input
                document.getElementById('imagem').required     = false; // imagem opcional na edição

                editIdInput.value = String(produto.idProduto);
                document.querySelector('.modal-header h2').textContent = 'Editar Produto';
                modal.classList.add('active');

            } catch (error) {
                console.error('Erro ao preparar edição:', error);
                alert(error.message);
            }

        } else if (button.classList.contains('btn-delete')) {
            // --- DELETAR PERMANENTEMENTE: DELETE /logvert/produtos/{id} ---
            if (!confirm(`Excluir PERMANENTEMENTE o produto ID ${id}? Esta ação não pode ser desfeita.`)) return;

            try {
                const response = await fetch(`${PRODUTOS_URL}/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });

                if (response.status === 204 || response.ok) {
                    alert(`Produto ID ${id} excluído com sucesso.`);
                    await carregarProdutos();
                } else {
                    let mensagem = `Erro ${response.status}`;
                    try { mensagem = await response.text(); } catch { /* sem body */ }

                    switch (response.status) {
                        case 401: throw new Error('Token inválido. Faça login novamente.');
                        case 403: throw new Error('Acesso negado para excluir este produto.');
                        case 404: throw new Error('Produto não encontrado.');
                        case 409: throw new Error('Não é possível excluir: produto vinculado a vendas.');
                        default:  throw new Error(mensagem);
                    }
                }
            } catch (error) {
                console.error('Erro ao deletar produto:', error);
                alert(error.message);
            }
        }
    });


    // --- 4. EXPORTAÇÃO PARA EXCEL ---
    const exportarParaExcel = async () => {
        try {
            const response = await fetch(`${PRODUTOS_URL}?page=0&size=1000`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error(`Falha ao buscar produtos para exportação. Status: ${response.status}`);

            const dados = await response.json();
            const produtos = Array.isArray(dados) ? dados
                           : Array.isArray(dados.content) ? dados.content
                           : [];

            if (produtos.length === 0) {
                alert('Não há produtos para exportar.');
                return;
            }

            // Mapeia usando os campos exatos retornados pela API
            const dadosParaPlanilha = produtos.map(p => ({
                'ID':        p.idProduto,
                'Descrição': p.descricao,
                'Preço':     p.preco,
                'Unidade':   p.unidadeMedida,
                'Status':    p.status
            }));

            const ws = XLSX.utils.json_to_sheet(dadosParaPlanilha);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
            XLSX.writeFile(wb, 'produtos_logvert.xlsx');

        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert(error.message);
        }
    };

    if (exportBtn) exportBtn.addEventListener('click', exportarParaExcel);


    // --- 5. CARGA INICIAL ---
    carregarProdutos();
});