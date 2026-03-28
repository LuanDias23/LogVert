/**
 * ========================================================
 * LOGVERT - Gestão de Consumidores
 * ========================================================
 * Integra com: GET/POST/PUT/PATCH/DELETE /logvert/consumidores
 *
 * @typedef {Object} Consumidor
 * @property {number}  idConsumidor
 * @property {string}  nome
 * @property {string}  cpf_cnpj
 * @property {string}  email
 * @property {string}  celular
 * @property {string}  [telefone]
 * @property {string}  [endereco]
 * @property {string}  status  — "ATIVO" | "INATIVO"
 */

document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. REFERÊNCIAS DO DOM
    // =============================================
    const tableBody          = document.getElementById('consumidoresTableBody');
    const modal              = document.getElementById('consumidorModal');
    const openModalBtn       = document.getElementById('openModalBtn');
    const closeModalBtn      = document.getElementById('closeModalBtn');
    const consumidorForm     = document.getElementById('consumidorForm');
    const modalTitle         = document.getElementById('modalTitle');
    const submitBtn          = document.getElementById('submitBtn');
    const batchDeactivateBtn = document.getElementById('batchDeactivateBtn');
    const selectAllCheckbox  = document.getElementById('selectAllCheckbox');
    const selectedCountEl    = document.getElementById('selectedCount');
    const selectedCountText  = document.getElementById('selectedCountText');
    const loadingOverlay     = document.getElementById('loadingOverlay');
    const loadingText        = document.getElementById('loadingText');
    const confirmOverlay     = document.getElementById('confirmOverlay');
    const confirmTitle       = document.getElementById('confirmTitle');
    const confirmMessage     = document.getElementById('confirmMessage');
    const confirmIcon        = document.getElementById('confirmIcon');
    const confirmCancelBtn   = document.getElementById('confirmCancelBtn');
    const confirmOkBtn       = document.getElementById('confirmOkBtn');
    const toastContainer     = document.getElementById('toastContainer');

    // Campos do formulário
    const nomeInput      = document.getElementById('nome');
    const cpfCnpjInput   = document.getElementById('cpf_cnpj');
    const emailInput     = document.getElementById('email');
    const celularInput   = document.getElementById('celular');
    const telefoneInput  = document.getElementById('telefone');
    const enderecoInput  = document.getElementById('endereco');
    const telefoneGroup  = document.getElementById('telefoneGroup');
    const enderecoGroup  = document.getElementById('enderecoGroup');

    // Estado
    let editingId       = null;   // null = criar, number = editar
    let selectedIds     = new Set();
    let consumidoresList = [];

    // ✅ URL correta — API_BASE_URL já contém /logvert
    const CONSUMIDORES_URL = `${API_BASE_URL}/consumidores`;

    // =============================================
    // 2. UTILIDADES
    // =============================================

    const showLoading = (msg = 'Carregando...') => {
        loadingText.textContent = msg;
        loadingOverlay.classList.add('active');
    };

    const hideLoading = () => {
        loadingOverlay.classList.remove('active');
    };

    const showToast = (message, type = 'info') => {
        const icons = {
            success: 'fa-check-circle',
            error:   'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info:    'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close" title="Fechar">&times;</button>
        `;
        toastContainer.appendChild(toast);

        const removeToast = () => {
            toast.classList.add('toast-removing');
            setTimeout(() => toast.remove(), 300);
        };
        toast.querySelector('.toast-close').addEventListener('click', removeToast);
        setTimeout(removeToast, 5000);
    };

    const showConfirm = (title, message, isDanger = true) => {
        return new Promise((resolve) => {
            confirmTitle.textContent   = title;
            confirmMessage.textContent = message;

            if (isDanger) {
                confirmIcon.className = 'confirm-icon';
                confirmIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                confirmOkBtn.className = 'btn-confirm-danger';
            } else {
                confirmIcon.className = 'confirm-icon warn';
                confirmIcon.innerHTML = '<i class="fas fa-ban"></i>';
                confirmOkBtn.className = 'btn-confirm-warn';
            }

            confirmOverlay.classList.add('active');

            const cleanup = (result) => {
                confirmOverlay.classList.remove('active');
                confirmCancelBtn.removeEventListener('click', onCancel);
                confirmOkBtn.removeEventListener('click', onConfirm);
                resolve(result);
            };
            const onCancel  = () => cleanup(false);
            const onConfirm = () => cleanup(true);

            confirmCancelBtn.addEventListener('click', onCancel);
            confirmOkBtn.addEventListener('click', onConfirm);
        });
    };

    const clearFormErrors = () => {
        consumidorForm.querySelectorAll('.input-error')
            .forEach(el => el.classList.remove('input-error'));
        consumidorForm.querySelectorAll('.field-error-msg')
            .forEach(el => el.textContent = '');
    };

    const setFieldError = (fieldId, message) => {
        const input     = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`${fieldId}-error`);
        if (input)     input.classList.add('input-error');
        if (errorSpan) errorSpan.textContent = message;
    };

    const formatCpfCnpj = (value) => {
        if (!value) return '';
        const nums = value.replace(/\D/g, '');
        if (nums.length <= 11) {
            return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    };

    const formatCelular = (value) => {
        if (!value) return '';
        const nums = value.replace(/\D/g, '');
        if (nums.length === 11) return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (nums.length === 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        return value;
    };

    // =============================================
    // 3. FORMATAÇÃO DE INPUTS (tempo real)
    // =============================================
    cpfCnpjInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length <= 11) {
            val = val.replace(/(\d{3})(\d)/, '$1.$2');
            val = val.replace(/(\d{3})(\d)/, '$1.$2');
            val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            val = val.substring(0, 14);
            val = val.replace(/(\d{2})(\d)/, '$1.$2');
            val = val.replace(/(\d{3})(\d)/, '$1.$2');
            val = val.replace(/(\d{3})(\d)/, '$1/$2');
            val = val.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        }
        e.target.value = val;
    });

    celularInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (val.length > 2)  val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
        if (val.length > 10) val = val.substring(0, 10) + '-' + val.substring(10);
        e.target.value = val;
    });

    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 10);
            if (val.length > 2) val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
            if (val.length > 9) val = val.substring(0, 9) + '-' + val.substring(9);
            e.target.value = val;
        });
    }

    // =============================================
    // 4. LÓGICA DO MODAL
    // =============================================
    const fecharModal = () => {
        modal.classList.remove('active');
        consumidorForm.reset();
        clearFormErrors();
        editingId = null;
    };

    const abrirModalNovo = () => {
        editingId = null;
        clearFormErrors();
        consumidorForm.reset();
        modalTitle.innerHTML  = '<i class="fas fa-user-plus"></i> Novo Consumidor';
        submitBtn.innerHTML   = '<i class="fas fa-save"></i> Salvar Consumidor';
        // POST → mostra endereço, oculta telefone fixo
        enderecoGroup.style.display = 'block';
        telefoneGroup.style.display = 'none';
        modal.classList.add('active');
    };

    const abrirModalEditar = (consumidor) => {
        editingId = consumidor.idConsumidor;
        clearFormErrors();
        modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Consumidor';
        submitBtn.innerHTML  = '<i class="fas fa-save"></i> Atualizar Consumidor';
        // PUT → oculta endereço, mostra telefone fixo
        enderecoGroup.style.display = 'none';
        telefoneGroup.style.display = 'block';

        nomeInput.value      = consumidor.nome     || '';
        cpfCnpjInput.value   = formatCpfCnpj(consumidor.cpf_cnpj) || consumidor.cpf_cnpj || '';
        emailInput.value     = consumidor.email    || '';
        celularInput.value   = formatCelular(consumidor.celular)   || consumidor.celular   || '';
        telefoneInput.value  = formatCelular(consumidor.telefone)  || consumidor.telefone  || '';
        modal.classList.add('active');
    };

    if (openModalBtn)  openModalBtn.addEventListener('click', abrirModalNovo);
    if (closeModalBtn) closeModalBtn.addEventListener('click', fecharModal);
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) fecharModal();
    });

    // =============================================
    // 5. SELEÇÃO MÚLTIPLA (CHECKBOXES)
    // =============================================
    const updateSelectionUI = () => {
        const count = selectedIds.size;
        if (count > 0) {
            selectedCountEl.classList.add('visible');
            selectedCountText.textContent = `${count} selecionado${count > 1 ? 's' : ''}`;
            batchDeactivateBtn.classList.add('enabled');
        } else {
            selectedCountEl.classList.remove('visible');
            batchDeactivateBtn.classList.remove('enabled');
        }

        const allCheckboxes = tableBody.querySelectorAll('.row-checkbox');
        if (allCheckboxes.length > 0 && count === allCheckboxes.length) {
            selectAllCheckbox.checked       = true;
            selectAllCheckbox.indeterminate = false;
        } else if (count > 0) {
            selectAllCheckbox.checked       = false;
            selectAllCheckbox.indeterminate = true;
        } else {
            selectAllCheckbox.checked       = false;
            selectAllCheckbox.indeterminate = false;
        }
    };

    selectAllCheckbox.addEventListener('change', () => {
        const allCheckboxes = tableBody.querySelectorAll('.row-checkbox');
        if (selectAllCheckbox.checked) {
            allCheckboxes.forEach(cb => {
                cb.checked = true;
                selectedIds.add(parseInt(cb.dataset.id));
                cb.closest('tr').classList.add('selected');
            });
        } else {
            allCheckboxes.forEach(cb => {
                cb.checked = false;
                selectedIds.delete(parseInt(cb.dataset.id));
                cb.closest('tr').classList.remove('selected');
            });
        }
        updateSelectionUI();
    });

    // =============================================
    // 6. API — CARREGAR TODOS (GET /consumidores)
    // =============================================
    const carregarConsumidores = async () => {
        tableBody.innerHTML = `
            <tr class="skeleton-row"><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar"></div></td><td><div class="skeleton-bar medium"></div></td><td><div class="skeleton-bar"></div></td><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar short"></div></td></tr>
            <tr class="skeleton-row"><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar"></div></td><td><div class="skeleton-bar medium"></div></td><td><div class="skeleton-bar"></div></td><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar short"></div></td></tr>
            <tr class="skeleton-row"><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar"></div></td><td><div class="skeleton-bar medium"></div></td><td><div class="skeleton-bar"></div></td><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar short"></div></td><td><div class="skeleton-bar short"></div></td></tr>`;

        try {
            const response = await fetch(CONSUMIDORES_URL, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.status === 401) throw new Error('Token inválido ou expirado. Faça login novamente.');
            if (!response.ok) throw new Error(`Erro ao buscar consumidores. Status: ${response.status}`);

            const dados = await response.json();

            // ✅ API retorna array direto conforme documentação
            let consumidores = [];
            if (Array.isArray(dados)) {
                consumidores = dados;
            } else if (dados && Array.isArray(dados.content)) {
                consumidores = dados.content;
            } else if (dados && Array.isArray(dados.data)) {
                consumidores = dados.data;
            }

            consumidoresList = consumidores;
            selectedIds.clear();
            updateSelectionUI();
            tableBody.innerHTML = '';

            if (consumidores.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; padding: 3rem 1rem;">
                            <i class="fas fa-users" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:0.75rem; display:block;"></i>
                            <span style="color:var(--text-muted);">Nenhum consumidor cadastrado.</span>
                        </td>
                    </tr>`;
                return;
            }

            consumidores.forEach((c, idx) => {
                const tr = document.createElement('tr');
                tr.style.animation = `fadeInUp 0.3s ease-out ${idx * 0.04}s backwards`;

                // ✅ Verifica campo "status" (string) retornado pela API
                const isAtivo     = c.status === 'ATIVO';
                const statusClass = isAtivo ? 'status-ativo' : 'status-inativo';
                const statusText  = isAtivo ? 'Ativo' : 'Inativo';

                tr.innerHTML = `
                    <td><input type="checkbox" class="row-checkbox" data-id="${c.idConsumidor}" title="Selecionar"></td>
                    <td>${c.nome || '-'}</td>
                    <td>${formatCpfCnpj(c.cpf_cnpj) || c.cpf_cnpj || '-'}</td>
                    <td>${c.email || '-'}</td>
                    <td>${formatCelular(c.celular) || c.celular || '-'}</td>
                    <td><span class="status-badge ${statusClass}"><span class="status-dot"></span>${statusText}</span></td>
                    <td class="action-buttons">
                        <button class="btn-icon btn-edit"   data-id="${c.idConsumidor}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn-icon btn-delete" data-id="${c.idConsumidor}" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro em carregarConsumidores:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; color:#e53935; padding:2rem;">
                        <i class="fas fa-exclamation-circle" style="margin-right:0.5rem;"></i>
                        ${error.message}
                    </td>
                </tr>`;
        }
    };

    // =============================================
    // 7. API — BUSCAR POR ID (GET /consumidores/{id})
    // =============================================
    const buscarConsumidorPorId = async (id) => {
        const response = await fetch(`${CONSUMIDORES_URL}/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.status === 401) throw new Error('Token inválido. Faça login novamente.');
        if (response.status === 404) throw new Error(`Consumidor ID ${id} não encontrado.`);
        if (!response.ok) throw new Error(`Erro ao carregar consumidor. Status: ${response.status}`);

        return await response.json();
    };

    // =============================================
    // 8. API — CRIAR / ATUALIZAR (POST / PUT)
    // =============================================
    if (consumidorForm) {
        consumidorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();

            const nome     = nomeInput.value.trim();
            const cpf_cnpj = cpfCnpjInput.value.trim();
            const email    = emailInput.value.trim();
            const celular  = celularInput.value.trim();
            const telefone = telefoneInput ? telefoneInput.value.trim() : '';
            const endereco = enderecoInput ? enderecoInput.value.trim() : '';

            // Validação local
            let hasError = false;
            if (!nome)     { setFieldError('nome',     'Nome é obrigatório.');     hasError = true; }
            if (!cpf_cnpj) { setFieldError('cpf_cnpj', 'CPF/CNPJ é obrigatório.'); hasError = true; }
            if (!email)    { setFieldError('email',    'E-mail é obrigatório.');   hasError = true; }
            if (!celular)  { setFieldError('celular',  'Celular é obrigatório.');  hasError = true; }
            if (hasError) return;

            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            try {
                let url    = CONSUMIDORES_URL;
                let method = 'POST';
                let payload = {};

                if (editingId) {
                    // ✅ PUT — campos conforme documentação: nome, cpf_cnpj, email, celular, telefone
                    method  = 'PUT';
                    url     = `${CONSUMIDORES_URL}/${editingId}`;
                    payload = { nome, cpf_cnpj, email, celular, telefone };
                } else {
                    // ✅ POST — campos conforme documentação: nome, cpf_cnpj, email, celular, endereco
                    payload = { nome, cpf_cnpj, email, celular, endereco };
                }

                console.log(`[${method}] ${url}`, payload);

                const response = await fetch(url, {
                    method,
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });

                // ✅ 409 — trata PRIMARY KEY violation separado de CPF/e-mail duplicado
                if (response.status === 409) {
                    let detail = '';
                    try {
                        const json = await response.json();
                        detail = json.mensagem || json.message || json.error || JSON.stringify(json);
                    } catch (_) {}

                    const isPrimaryKeyError = detail.toLowerCase().includes('primary key')
                                           || detail.toLowerCase().includes('id_consumidor');

                    if (isPrimaryKeyError) {
                        showToast('Erro interno no servidor (conflito de ID). Contate o suporte técnico.', 'error');
                        return;
                    }

                    // Conflito real de CPF/e-mail
                    showToast(detail || 'CPF/CNPJ ou e-mail já cadastrado nesta loja.', 'warning');

                    if (detail.toLowerCase().includes('cpf') || detail.toLowerCase().includes('cnpj')) {
                        setFieldError('cpf_cnpj', 'CPF/CNPJ já cadastrado.');
                    }
                    if (detail.toLowerCase().includes('email') || detail.toLowerCase().includes('e-mail')) {
                        setFieldError('email', 'E-mail já cadastrado.');
                    }
                    // Se a mensagem não especificou qual campo, marca os dois
                    if (!detail.toLowerCase().includes('cpf') && !detail.toLowerCase().includes('email')) {
                        setFieldError('cpf_cnpj', 'Possível duplicidade.');
                        setFieldError('email',    'Possível duplicidade.');
                    }
                    return;
                }

                // ✅ 422 — erros de validação do backend
                if (response.status === 422) {
                    let json = {};
                    try { json = await response.json(); } catch (_) {}

                    const errors = json.errors || json.fieldErrors || json;
                    if (typeof errors === 'object') {
                        Object.entries(errors).forEach(([field, msg]) => {
                            setFieldError(field, Array.isArray(msg) ? msg.join(', ') : String(msg));
                        });
                    }
                    showToast('Verifique os campos com erro no formulário.', 'error');
                    return;
                }

                if (response.status === 401) throw new Error('Token inválido. Faça login novamente.');
                if (response.status === 403) throw new Error('Acesso negado.');

                if (!response.ok) {
                    let erroText = '';
                    try {
                        const json = await response.json();
                        erroText = json.mensagem || json.message || JSON.stringify(json);
                    } catch (_) {
                        try { erroText = await response.text(); } catch (_) {}
                    }
                    throw new Error(erroText || `Erro ao salvar consumidor. Status: ${response.status}`);
                }

                // ✅ Sucesso (201 Created ou 200 OK)
                showToast(`Consumidor ${editingId ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
                fecharModal();
                await carregarConsumidores();

            } catch (error) {
                console.error('Erro ao salvar consumidor:', error);
                showToast(`Erro: ${error.message}`, 'error');
            } finally {
                submitBtn.disabled  = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // =============================================
    // 9. API — DESATIVAR EM LOTE (PATCH /consumidores)
    // =============================================
    if (batchDeactivateBtn) {
        batchDeactivateBtn.addEventListener('click', async () => {
            if (selectedIds.size === 0) return;

            const idsArray = Array.from(selectedIds);
            const confirmed = await showConfirm(
                'Desativar consumidores?',
                `Você está prestes a desativar ${idsArray.length} consumidor(es). Deseja continuar?`,
                false
            );
            if (!confirmed) return;

            showLoading('Desativando consumidores...');
            try {
                // ✅ PATCH /consumidores — body: [1, 2, 3]
                const response = await fetch(CONSUMIDORES_URL, {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(idsArray)
                });

                if (response.status === 204 || response.ok) {
                    showToast(`${idsArray.length} consumidor(es) desativado(s) com sucesso!`, 'success');
                    selectedIds.clear();
                    updateSelectionUI();
                    await carregarConsumidores();
                } else {
                    let erroText = '';
                    try { erroText = (await response.json()).message; } catch (_) {}
                    switch (response.status) {
                        case 401: throw new Error('Token inválido. Faça login novamente.');
                        case 403: throw new Error('Acesso negado para desativar estes consumidores.');
                        case 404: throw new Error('Um ou mais consumidores não foram encontrados.');
                        default:  throw new Error(erroText || `Erro ao desativar. Status: ${response.status}`);
                    }
                }
            } catch (error) {
                console.error('Erro ao desativar em lote:', error);
                showToast(`Erro: ${error.message}`, 'error');
            } finally {
                hideLoading();
            }
        });
    }

    // =============================================
    // 10. API — DELETAR (DELETE /consumidores/{id})
    // =============================================
    const deletarConsumidor = async (id) => {
        const confirmed = await showConfirm(
            'Excluir consumidor?',
            `Tem certeza que deseja excluir PERMANENTEMENTE o consumidor ID ${id}? Esta ação não poderá ser desfeita.`,
            true
        );
        if (!confirmed) return;

        showLoading('Excluindo consumidor...');
        try {
            const response = await fetch(`${CONSUMIDORES_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.status === 204 || response.ok) {
                showToast('Consumidor excluído com sucesso!', 'success');
                selectedIds.delete(id);
                updateSelectionUI();
                await carregarConsumidores();
            } else {
                let erroText = '';
                try { erroText = (await response.json()).message; } catch (_) {}
                switch (response.status) {
                    case 401: throw new Error('Token inválido. Faça login novamente.');
                    case 403: throw new Error('Acesso negado para excluir este consumidor.');
                    case 404: throw new Error('Consumidor não encontrado.');
                    default:  throw new Error(erroText || `Erro ao excluir. Status: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            showToast(`Erro: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    };

    // =============================================
    // 11. EVENT DELEGATION — CLIQUES NA TABELA
    // =============================================
    tableBody.addEventListener('click', async (e) => {
        // Checkbox de linha
        const checkbox = e.target.closest('.row-checkbox');
        if (checkbox) {
            const id = parseInt(checkbox.dataset.id);
            if (checkbox.checked) {
                selectedIds.add(id);
                checkbox.closest('tr').classList.add('selected');
            } else {
                selectedIds.delete(id);
                checkbox.closest('tr').classList.remove('selected');
            }
            updateSelectionUI();
            return;
        }

        // Botões Editar / Excluir
        const button = e.target.closest('button.btn-icon');
        if (!button) return;

        const id = parseInt(button.dataset.id);
        if (!id || isNaN(id)) {
            showToast('Erro: Consumidor sem ID válido.', 'error');
            return;
        }

        if (button.classList.contains('btn-edit')) {
            try {
                showLoading('Carregando dados...');
                const consumidor = await buscarConsumidorPorId(id);
                hideLoading();
                abrirModalEditar(consumidor);
            } catch (error) {
                hideLoading();
                showToast(error.message, 'error');
            }

        } else if (button.classList.contains('btn-delete')) {
            await deletarConsumidor(id);
        }
    });

    // =============================================
    // 12. CARGA INICIAL
    // =============================================
    carregarConsumidores();
});     q