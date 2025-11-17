document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. REFERÊNCIAS DO DOM ---
    const tableBody = document.querySelector('.table-container tbody');
    const modal = document.getElementById('addProdutoModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const produtoForm = document.getElementById('addProdutoForm');
    const exportBtn = document.getElementById('exportBtn'); // Botão de exportar

    // Campo escondido para sabermos qual ID estamos editando
    const editIdInput = document.createElement('input');
    editIdInput.type = 'hidden';
    editIdInput.id = 'editId';
    produtoForm.appendChild(editIdInput);


    // --- 2. LÓGICA DO MODAL ---
    
    // Função para fechar o modal
    const fecharModal = () => {
        modal.classList.remove('active');
    };

    // Função para abrir o modal (para Criar um novo produto)
    const abrirModalNovo = () => {
        produtoForm.reset(); // Limpa o formulário
        editIdInput.value = ''; // Garante que não estamos editando
        document.querySelector('.modal-header h2').textContent = 'Adicionar Novo Produto';
        document.getElementById('imagem').required = true; // Imagem é obrigatória ao criar
        modal.classList.add('active');
    };

    if (openModalBtn) {
        openModalBtn.addEventListener('click', abrirModalNovo);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', fecharModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    // --- 3. LÓGICA DE API (CRUD - Create, Read, Update, Delete) ---

    /**
     * READ: Busca todos os produtos do backend e atualiza a tabela
     */
    const carregarProdutos = async () => {
        try {
            // Usa a variável global do apiClient.js
            const response = await fetch(`${API_BASE_URL}/produtos`);
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos.');
            }
            const produtos = await response.json();
            
            tableBody.innerHTML = ''; // Limpa a tabela
            
            if (produtos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
                return;
            }
            
            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                // O backend retorna a imagem como 'data:image/png;base64,....'
                const imageUrl = produto.imagem || 'https://placehold.co/40x40/334155/94a3b8?text=?';
                const precoFormatado = `R$ ${parseFloat(produto.preco || 0).toFixed(2).replace('.', ',')}`;

                tr.innerHTML = `
                    <td class="produto-cell">
                        <img src="${imageUrl}" alt="Preview" class="produto-img-preview" onerror="this.src='https://placehold.co/40x40/334155/94a3b8?text=Erro'">
                        <span>${produto.descricao || 'Produto sem descrição'}</span>
                    </td>
                    <td>${precoFormatado}</td>
                    <td>${produto.unidadeMedida || 'UN'}</td>
                    <td class="action-buttons">
                        <button class="btn-icon btn-edit" data-id="${produto.id}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn-icon btn-delete" data-id="${produto.id}" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro em carregarProdutos:', error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: red;">Erro ao carregar produtos. Verifique o backend.</td></tr>';
        }
    };

    /**
     * CREATE / UPDATE: Lida com o envio do formulário (com UPLOAD DE IMAGEM)
     */
    if (produtoForm) {
        produtoForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // 1. Cria o objeto JSON com os dados do produto
            const produtoJson = {
                descricao: document.getElementById('descricao').value,
                unidadeMedida: document.getElementById('unidadeMedida').value,
                preco: parseFloat(document.getElementById('preco').value),
                idLoja: parseInt(document.getElementById('idLoja').value, 10)
                // O backend não espera 'imagem' no JSON
            };

            // 2. Cria o FormData para enviar os dados e o arquivo
            const formData = new FormData();
            
            // Adiciona o JSON como um "Blob" (exigido pelo seu backend)
            formData.append('produto', new Blob([JSON.stringify(produtoJson)], {
                type: 'application/json'
            }));

            // 3. Adiciona o arquivo de imagem
            const imagemFile = document.getElementById('imagem').files[0];
            const idParaEditar = editIdInput.value;

            // Só anexa a imagem se ela foi selecionada (ou se for criação)
            if (imagemFile) {
                formData.append('imagem', imagemFile);
            }

            try {
                let response;
                let url = `${API_BASE_URL}/produtos`;
                let method = 'POST';

                if (idParaEditar) {
                    // --- UPDATE (PUT) ---
                    // Adiciona o ID ao JSON (necessário para o backend saber quem editar)
                    produtoJson.id = parseInt(idParaEditar, 10);
                    // Recria o Blob com o ID
                    formData.set('produto', new Blob([JSON.stringify(produtoJson)], {
                        type: 'application/json'
                    }));

                    url = `${API_BASE_URL}/produtos/${idParaEditar}`;
                    method = 'PUT';
                }

                response = await fetch(url, {
                    method: method,
                    body: formData
                    // NÃO definir 'Content-Type', o navegador faz isso
                });

                if (!response.ok) {
                    const erroText = await response.text(); // Pega texto, pode não ser JSON
                    throw new Error(erroText || 'Erro ao salvar produto.');
                }

                fecharModal(); 
                carregarProdutos(); 

            } catch (error) {
                console.error('Erro ao salvar produto:', error);
                alert(`Erro: ${error.message}`);
            }
        });
    }

    /**
     * EDIT (Read One) / DELETE: Lida com cliques nos botões da tabela
     */
    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button.btn-icon');
        if (!button) return;

        const id = button.dataset.id; // Pega o ID do produto

        if (button.classList.contains('btn-edit')) {
            // --- AÇÃO DE EDITAR ---
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
                if (!response.ok) {
                    throw new Error('Não foi possível carregar o produto para edição.');
                }
                const produto = await response.json();

                // Preenche o formulário do modal
                document.getElementById('descricao').value = produto.descricao;
                document.getElementById('preco').value = produto.preco;
                document.getElementById('unidadeMedida').value = produto.unidadeMedida;
                
                // Limpa o campo de arquivo e o torna opcional
                document.getElementById('imagem').value = null;
                document.getElementById('imagem').required = false; 
                
                // Guarda o ID para o envio
                editIdInput.value = produto.id;
                
                // Muda o título e abre o modal
                document.querySelector('.modal-header h2').textContent = 'Editar Produto';
                modal.classList.add('active');

            } catch (error) {
                console.error('Erro ao preparar edição:', error);
                alert(error.message);
            }
        
        } else if (button.classList.contains('btn-delete')) {
            // --- AÇÃO DE DELETAR ---
            if (confirm(`Tem certeza que deseja excluir este produto?`)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const erro = await response.text();
                        throw new Error(erro || 'Erro ao excluir produto.');
                    }
                    
                    carregarProdutos(); // Recarrega a tabela

                } catch (error) {
                    console.error('Erro ao deletar:', error);
                    alert(`Erro: ${error.message}`);
                }
            }
        }
    });

    // --- 4. LÓGICA DE EXPORTAÇÃO (Excel) ---
    const exportarParaExcel = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/produtos`);
            if (!response.ok) throw new Error('Falha ao buscar dados para exportação.');
            const produtos = await response.json();

            if (produtos.length === 0) {
                alert('Não há produtos para exportar.');
                return;
            }

            const dadosParaPlanilha = produtos.map(produto => ({
                'ID': produto.id,
                'Descrição': produto.descricao,
                'Preço': produto.preco,
                'Unidade': produto.unidadeMedida
                // Não exportamos a imagem base64
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