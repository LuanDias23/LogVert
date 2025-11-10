document.addEventListener('DOMContentLoaded', () => {
    const filterBtn = document.getElementById('filterBtn');
    const clearBtn = document.getElementById('clearBtn');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const tableBody = document.getElementById('salesTableBody');

    // Função para parsear a data da tabela (formato "dd/mm/aaaa")
    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('/').map(Number);
        // O mês no objeto Date é 0-indexado (0 = Jan, 11 = Dez)
        return new Date(year, month - 1, day);
    }

    // Função para filtrar a tabela
    function filterTable() {
        let startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        let endDate = endDateInput.value ? new Date(endDateInput.value) : null;

        if (startDate) {
            startDate.setHours(0, 0, 0, 0); // Início do dia
        }
        if (endDate) {
            endDate.setHours(23, 59, 59, 999); // Fim do dia
        }

        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const dateCell = row.querySelector('td:nth-child(2)'); // 2ª coluna (Data)
            if (!dateCell) return;

            const rowDate = parseDate(dateCell.textContent);

            // Verifica se a data da linha está dentro do intervalo
            let show = true;
            if (startDate && rowDate < startDate) {
                show = false;
            }
            if (endDate && rowDate > endDate) {
                show = false;
            }

            row.style.display = show ? '' : 'none';
        });
    }

    // Função para limpar o filtro
    function clearFilter() {
        startDateInput.value = '';
        endDateInput.value = '';

        // Mostra todas as linhas
        tableBody.querySelectorAll('tr').forEach(row => {
            row.style.display = '';
        });
    }

    // Adiciona os eventos
    if (filterBtn) {
        filterBtn.addEventListener('click', filterTable);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilter);
    }
});