document.addEventListener('DOMContentLoaded', () => {

    // --- NOVO: Função para obter o Token de Autenticação ---
    // (Assume que o token foi salvo no localStorage com a chave 'authToken' após o login)
    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken'); 
        if (!token) {
            console.warn('Token de autenticação não encontrado. A API pode retornar 403 Forbidden.');
            // Você pode adicionar um redirecionamento forçado para a tela de login aqui, se desejar.
            return {}; 
        }
        return {
            'Authorization': `Bearer ${token}`
        };
    };
    
    // --- 1. REFERÊNCIAS DO DOM ---
    const tableBody = document.querySelector('.table-container tbody');
    const modal = document.getElementById('addProdutoModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const produtoForm = document.getElementById('addProdutoForm');
    const exportBtn = document.getElementById('exportBtn');

    // Campo escondido para sabermos qual ID estamos editando
    const editIdInput = document.createElement('input');
    editIdInput.type = 'hidden';
    editIdInput.id = 'editId';
    produtoForm.appendChild(editIdInput);


    // --- 2. LÓGICA DO MODAL ---
    
    const fecharModal = () => {
        modal.classList.remove('active');
    };

    const abrirModalNovo = () => {
        produtoForm.reset();
        editIdInput.value = '';
        document.querySelector('.modal-header h2').textContent = 'Adicionar Novo Produto';
        document.getElementById('imagem').required = true;
        // Define um valor padrão para idLoja (ex: 1)
        document.getElementById('idLoja').value = '1'; 
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
     * READ: Busca todos os produtos do backend e atualiza a tabela
     */
    const carregarProdutos = async () => {
        try {
            const headers = getAuthHeaders();

            const response = await fetch(`${API_BASE_URL}/produtos`, {
                method: 'GET',
                headers: headers // ENVIA TOKEN
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar produtos. Status: ${response.status}`);
            }
            
            const dados = await response.json();
            
            // CORREÇÃO: Garante que 'produtos' é um array para usar .forEach
            const produtos = Array.isArray(dados) ? dados : [];
            
            tableBody.innerHTML = '';
            
            if (produtos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
                return;
            }
            
            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                const imageUrl = produto.imagem || 'https://placehold.co/40x40/334155/94a3b8?text=?';
                const idProduto = produto.id; 
                const precoFormatado = `R$ ${parseFloat(produto.preco || 0).toFixed(2).replace('.', ',')}`;

                tr.innerHTML = `
                    <td class="produto-cell">
                        <img src="${imageUrl}" alt="Preview" class="produto-img-preview" onerror="this.src='https://placehold.co/40x40/334155/94a3b8?text=Erro'">
                        <span>${produto.descricao || 'Produto sem descrição'}</span>
                    </td>
                    <td>${precoFormatado}</td>
                    <td>${produto.unidadeMedida || 'UN'}</td>
                    <td class="action-buttons">
                        <button class="btn-icon btn-edit" data-id="${idProduto}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn-icon btn-delete" data-id="${idProduto}" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro em carregarProdutos:', error);
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">${error.message}. Verifique o token e o backend.</td></tr>`;
        }
    };

    /**
     * CREATE / UPDATE: Lida com o envio do formulário (com UPLOAD DE IMAGEM)
     */
    if (produtoForm) {
        produtoForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const produtoJson = {
                descricao: document.getElementById('descricao').value,
                unidadeMedida: document.getElementById('unidadeMedida').value,
                preco: parseFloat(document.getElementById('preco').value),
                idLoja: parseInt(document.getElementById('idLoja').value, 10) 
            };

            const formData = new FormData();
            const idParaEditar = editIdInput.value;
            let url = `${API_BASE_URL}/produtos`;
            let method = 'POST';

            if (idParaEditar) {
                // UPDATE (PUT)
                produtoJson.id = parseInt(idParaEditar, 10);
                url = `${API_BASE_URL}/produtos/${idParaEditar}`; 
                method = 'PUT';
            }

            // Recria o Blob com o JSON atualizado
            formData.append('produto', new Blob([JSON.stringify(produtoJson)], {
                type: 'application/json'
            }));

            // Adiciona o arquivo de imagem
            const imagemFile = document.getElementById('imagem').files[0];
            if (imagemFile) {
                formData.append('imagem', imagemFile);
            }
            
            try {
                const authHeaders = getAuthHeaders();
                // O Content-Type é omitido aqui, pois o navegador o define corretamente com boundary para FormData
                const response = await fetch(url, {
                    method: method,
                    body: formData,
                    headers: authHeaders // ENVIA TOKEN
                });

                if (!response.ok) {
                    const erroText = await response.text();
                    throw new Error(erroText || `Erro ao salvar produto. Status: ${response.status}`);
                }

                fecharModal(); 
                carregarProdutos(); 

            } catch (error) {
                console.error('Erro ao salvar produto:', error);
                alert(`Erro ao salvar/atualizar produto: ${error.message}`);
            }
        });
    }

    /**
     * EDIT (Read One) / DELETE: Lida com cliques nos botões da tabela
     */
    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button.btn-icon');
        if (!button) return;

        const id = button.dataset.id;
        const authHeaders = getAuthHeaders();

        if (button.classList.contains('btn-edit')) {
            // --- AÇÃO DE EDITAR ---
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/${id}`, { headers: authHeaders }); // ENVIA TOKEN
                if (!response.ok) {
                    throw new Error(`Não foi possível carregar o produto para edição. Status: ${response.status}`);
                }
                const produto = await response.json();

                // Preenche o formulário
                document.getElementById('descricao').value = produto.descricao;
                document.getElementById('preco').value = produto.preco;
                document.getElementById('unidadeMedida').value = produto.unidadeMedida;
                document.getElementById('idLoja').value = produto.idLoja; 
                
                // Configura o modal para edição
                document.getElementById('imagem').value = null;
                document.getElementById('imagem').required = false; 
                editIdInput.value = produto.id;
                
                document.querySelector('.modal-header h2').textContent = 'Editar Produto';
                modal.classList.add('active');

            } catch (error) {
                console.error('Erro ao preparar edição:', error);
                alert(error.message);
            }
        
        } else if (button.classList.contains('btn-delete')) {
            // --- AÇÃO DE DELETAR (Permanente) ---
            if (confirm(`Tem certeza que deseja excluir PERMANENTEMENTE este produto (ID: ${id})?`)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/produtos/${id}/permanent`, {
                        method: 'DELETE',
                        headers: authHeaders // ENVIA TOKEN
                    });

                    if (response.status === 204 || response.ok) {
                        carregarProdutos();
                        alert(`Produto ID ${id} excluído permanentemente com sucesso.`);
                    } else {
                        const erro = await response.text();
                        throw new Error(erro || `Erro ao excluir produto permanentemente. Status: ${response.status}`);
                    }
                    
                } catch (error) {
                    console.error('Erro ao deletar:', error);
                    alert(`Erro ao deletar: ${error.message}`);
                }
            }
        }
    });

    // --- 4. LÓGICA DE EXPORTAÇÃO (Excel) ---
    const exportarParaExcel = async () => {
        try {
            const headers = getAuthHeaders();
            
            const response = await fetch(`${API_BASE_URL}/produtos`, {
                method: 'GET',
                headers: headers // ENVIA TOKEN
            });
            
            if (!response.ok) throw new Error(`Falha ao buscar dados para exportação. Status: ${response.status}`);
            const dados = await response.json();
            const produtos = Array.isArray(dados) ? dados : [];


            if (produtos.length === 0) {
                alert('Não há produtos para exportar.');
                return;
            }

            const dadosParaPlanilha = produtos.map(produto => ({
                'ID': produto.id,
                'ID Loja': produto.idLoja,
                'Descrição': produto.descricao,
                'Preço': produto.preco,
                'Unidade': produto.unidadeMedida
            }));

            const ws = XLSX.utils.json_to_sheet(dadosParaPlanilha);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Produtos'); 
            XLSX.writeFile(wb, 'produtos_logvert.xlsx');

        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            alert(`Erro: ${error.message}`);
        }
    };

    if (exportBtn) {
        exportBtn.addEventListener('click', exportarParaExcel);
    }

    // --- 5. CARGA INICIAL ---
    carregarProdutos();
});