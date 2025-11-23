document.addEventListener('DOMContentLoaded', () => {

    // --- Observação: usamos os helpers definidos em /js/api/apiClient.js ---
    // `API_BASE_URL`, `getAuthHeaders()` e `getAuthHeadersForFormData()` são expostos no objeto global `window`.
    
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
            const listUrl = `${API_BASE_URL}/produtos`;
            console.log('Carregar produtos - GET URL:', listUrl, 'headers:', headers);

            const response = await fetch(listUrl, {
                method: 'GET',
                headers: headers // ENVIA TOKEN
            });

            console.log('carregarProdutos response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar produtos. Status: ${response.status}`);
            }
            
            const dados = await response.json();
            console.log('carregarProdutos response body (raw):', dados);

            // Normaliza resposta para um array de produtos.
            // Alguns backends (Spring Data) retornam um objeto Page { content: [...] }
            let produtos = [];
            if (Array.isArray(dados)) {
                produtos = dados;
            } else if (dados && Array.isArray(dados.content)) {
                produtos = dados.content;
            } else if (dados && Array.isArray(dados.data)) {
                produtos = dados.data;
            } else if (dados && Array.isArray(dados.items)) {
                produtos = dados.items;
            } else if (dados && typeof dados === 'object') {
                // se o endpoint retornou apenas o produto criado (objeto), transformamos em array
                if (dados.id || dados.identificador || dados.codigo) {
                    produtos = [dados];
                }
            }

            console.log('carregarProdutos produtos normalizados (length):', produtos.length, produtos);
            
            tableBody.innerHTML = '';
            
            if (produtos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
                return;
            }
            
            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                const imageUrl = produto.imagem || 'https://placehold.co/40x40/334155/94a3b8?text=?';
                // Usa o campo correto do backend
                const idProduto = produto.idProduto;
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

            // --- PRE-CHECK: evita tentar criar produto duplicado por (idLoja + descricao)
            // Faz uma verificação local pedindo todos os produtos e comparando
            if (!editIdInput.value) {
                try {
                    const checkRes = await fetch(`${API_BASE_URL}/produtos`, {
                        method: 'GET',
                        headers: getAuthHeaders()
                    });
                    if (checkRes.ok) {
                        const all = await checkRes.json();
                        const exists = Array.isArray(all) ? all.find(p => {
                            // compara descricao e idLoja (case-insensitive para descricao)
                            return (String(p.idLoja) === String(produtoJson.idLoja)) && (String(p.descricao).trim().toLowerCase() === String(produtoJson.descricao).trim().toLowerCase());
                        }) : null;

                        if (exists) {
                            const goEdit = confirm(`Já existe um produto com mesma descrição nesta loja (ID ${exists.id}). Deseja editar o produto existente em vez de criar?`);
                            if (goEdit) {
                                // seta ID para edição e preenche o form com os dados existentes
                                editIdInput.value = exists.id;
                                document.getElementById('descricao').value = exists.descricao;
                                document.getElementById('preco').value = exists.preco;
                                document.getElementById('unidadeMedida').value = exists.unidadeMedida || 'UN';
                                document.getElementById('idLoja').value = exists.idLoja;
                                document.getElementById('imagem').required = false;
                                document.querySelector('.modal-header h2').textContent = 'Editar Produto (encontrado)';
                                // muda para modo PUT
                            } else {
                                alert('Operação cancelada. Produto semelhante já cadastrado.');
                                return; // aborta o envio para evitar 409
                            }
                        }
                    } else {
                        console.warn('Falha ao verificar produtos antes de criar. Status:', checkRes.status);
                    }
                } catch (err) {
                    console.warn('Erro ao verificar duplicatas antes do POST:', err);
                    // prosseguir mesmo assim (deixamos o servidor validar)
                }
            }

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
                // LOGS ÚTEIS PARA DEBUG: imprime o objeto JS e as entradas do FormData
                console.log('produtoJson (antes do envio):', produtoJson);
                for (const entry of formData.entries()) {
                    // entry[1] pode ser Blob/File; mostramos tipo e tamanho se aplicável
                    const value = entry[1];
                    if (value instanceof File) {
                        console.log('formData entry:', entry[0], 'File =>', value.name, value.type, value.size);
                    } else if (value instanceof Blob) {
                        // pode ser o Blob JSON
                        try {
                            const text = await value.text();
                            console.log('formData entry:', entry[0], 'Blob(text) =>', text);
                        } catch (e) {
                            console.log('formData entry:', entry[0], 'Blob =>', value);
                        }
                    } else {
                        console.log('formData entry:', entry[0], value);
                    }
                }

                const authHeaders = getAuthHeadersForFormData();
                // O Content-Type é omitido aqui, pois o navegador o define corretamente com boundary para FormData
                const response = await fetch(url, {
                    method: method,
                    body: formData,
                    headers: authHeaders // ENVIA TOKEN
                });

                if (!response.ok) {
                    // tenta extrair mensagem amigável do corpo da resposta
                    let erroText = '';
                    try {
                        const json = await response.json();
                        erroText = json.message || JSON.stringify(json);
                    } catch (e) {
                        try { erroText = await response.text(); } catch (e2) { erroText = '' }
                    }

                    if (response.status === 409) {
                        console.warn('Recebido 409 do servidor ao tentar salvar:', erroText);
                        // Tenta localizar o produto existente e oferecer edição ao usuário
                        try {
                            const checkRes = await fetch(`${API_BASE_URL}/produtos`, {
                                method: 'GET',
                                headers: getAuthHeaders()
                            });
                            if (checkRes.ok) {
                                const all = await checkRes.json();
                                const found = Array.isArray(all) ? all.find(p => {
                                    return (String(p.idLoja) === String(produtoJson.idLoja)) && (String(p.descricao).trim().toLowerCase() === String(produtoJson.descricao).trim().toLowerCase());
                                }) : null;

                                if (found) {
                                    const goEdit = confirm(`O produto já existe (ID ${found.id}). Deseja abrir o registro existente para edição?`);
                                    if (goEdit) {
                                        // Preenche o formulário com os dados do produto encontrado
                                        editIdInput.value = found.id;
                                        document.getElementById('descricao').value = found.descricao;
                                        document.getElementById('preco').value = found.preco;
                                        document.getElementById('unidadeMedida').value = found.unidadeMedida || 'UN';
                                        document.getElementById('idLoja').value = found.idLoja;
                                        document.getElementById('imagem').required = false;
                                        document.querySelector('.modal-header h2').textContent = 'Editar Produto (existente)';
                                        modal.classList.add('active');
                                        return; // não lança erro; usuário pode editar e salvar (PUT)
                                    }
                                }
                            }
                        } catch (err) {
                            console.warn('Erro ao buscar produtos após 409:', err);
                        }

                        // se não optar por editar ou não encontrou, lança erro para exibir mensagem
                        throw new Error(erroText || 'Conflito: produto já existe (409).');
                    }

                    throw new Error(erroText || `Erro ao salvar produto. Status: ${response.status}`);
                }

                // Tenta ler o corpo da resposta para debug/feedback
                let returned = null;
                try {
                    // se não houver body (204), json() lançará; tratamos abaixo
                    returned = await response.json();
                    console.log('Resposta do servidor (JSON):', returned);
                } catch (e) {
                    try {
                        const text = await response.text();
                        console.log('Resposta do servidor (text):', text);
                    } catch (e2) {
                        console.log('Resposta do servidor: sem conteúdo legível');
                    }
                }

                // Mostrar confirmação ao usuário e recarregar lista
                console.log(`Produto salvo com status ${response.status}`);
                alert('Produto salvo com sucesso. Atualizando lista...');
                fecharModal();
                await carregarProdutos();

            } catch (error) {
                console.error('Erro ao salvar produto:', error);
                // mostra mensagem mais legível ao usuário
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

        // Validação extra: não prossegue se id for vazio, nulo ou undefined
        if (!id || id === 'undefined' || id === 'null') {
            console.error('ID do produto inválido para ação:', id);
            alert('Erro: Produto selecionado não possui ID válido. Atualize a página e tente novamente.');
            return;
        }

        if (button.classList.contains('btn-edit')) {
            // --- AÇÃO DE EDITAR ---
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/${id}`, { headers: authHeaders }); // ENVIA TOKEN
                if (!response.ok) {
                    throw new Error(`Não foi possível carregar o produto para edição. Status: ${response.status}`);
                }
                const produto = await response.json();

                // Extrai o ID retornado pelo backend (pode ser idProduto, id, produtoId, etc.)
                const produtoIdRetornado = produto.idProduto ?? produto.id ?? produto.produtoId ?? produto.codigo ?? produto.identificador;

                // Preenche o formulário (usa fallbacks caso o backend nomeie campos diferente)
                document.getElementById('descricao').value = produto.descricao ?? produto.nome ?? produto.title ?? '';
                document.getElementById('preco').value = produto.preco ?? produto.valor ?? produto.price ?? '';
                document.getElementById('unidadeMedida').value = produto.unidadeMedida ?? produto.unidade ?? 'UN';
                document.getElementById('idLoja').value = produto.idLoja ?? produto.lojaId ?? produto.id_loja ?? '';

                // Configura o modal para edição
                document.getElementById('imagem').value = null;
                document.getElementById('imagem').required = false;

                // Só define editId se tivermos um ID válido (evita 'undefined' string)
                if (produtoIdRetornado !== undefined && produtoIdRetornado !== null) {
                    editIdInput.value = String(produtoIdRetornado);
                } else {
                    editIdInput.value = '';
                }

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
                    console.log('Tentando deletar produto com ID:', id);
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