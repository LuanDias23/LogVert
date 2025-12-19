document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clienteLoginForm');
    const numeroSerialInput = document.getElementById('numeroSerial');
    const loginMessage = document.getElementById('loginMessage');

    // Formata o input automaticamente no padrão ABC1234-5678-9012
    numeroSerialInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Limita o tamanho
        if (value.length > 15) {
            value = value.substring(0, 15);
        }

        // Adiciona os traços automaticamente
        let formatted = '';
        if (value.length > 0) {
            formatted = value.substring(0, 7); // ABC1234
        }
        if (value.length >= 8) {
            formatted += '-' + value.substring(7, 11); // -5678
        }
        if (value.length >= 12) {
            formatted += '-' + value.substring(11, 15); // -9012
        }

        e.target.value = formatted;
    });

    // Inicializa particles.js se disponível
    if (typeof particlesJS !== 'undefined') {
        particlesJS('loginParticles', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: '#4CAF50' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#4CAF50',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    out_mode: 'out'
                }
            },
            retina_detect: true
        });
    }

    // Lida com o envio do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const numeroSerial = numeroSerialInput.value.trim();

        // Valida o formato
        const serialPattern = /^[A-Z]{3}[0-9]{4}-[0-9]{4}-[0-9]{4}$/;
        if (!serialPattern.test(numeroSerial)) {
            showMessage('Formato de serial inválido. Use: ABC1234-5678-9012', 'error');
            return;
        }

        showMessage('Verificando serial...', 'loading');

        try {
            // Chama a API para verificar o serial
            const response = await fetch(`${API_BASE_URL}/vendas/serial/${numeroSerial}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Serial não encontrado. Verifique o número e tente novamente.');
                } else if (response.status === 403) {
                    throw new Error('Acesso negado. Este serial pode estar inativo.');
                } else {
                    throw new Error(`Erro ao verificar serial. Status: ${response.status}`);
                }
            }

            const venda = await response.json();

            // Salva os dados da venda no localStorage para acesso posterior
            localStorage.setItem('clienteSerial', numeroSerial);
            localStorage.setItem('clienteVenda', JSON.stringify(venda));

            showMessage('Serial válido! Redirecionando...', 'success');

            // Redireciona para o menu do cliente após 1.5s
            setTimeout(() => {
                window.location.href = '/pages/menu.cliente/menuCliente.html';
            }, 1500);

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showMessage(error.message || 'Erro ao verificar serial. Tente novamente.', 'error');
        }
    });

    // Função auxiliar para mostrar mensagens
    function showMessage(text, type) {
        loginMessage.textContent = text;
        loginMessage.className = 'login-message show ' + type;
    }
});
