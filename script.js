document.addEventListener('DOMContentLoaded', function() {
    const lojistaForm = document.querySelector('.login-sections .login-box:first-of-type form');
    const clienteForm = document.querySelector('.login-sections .login-box:last-of-type form');
    const contactForm = document.querySelector('.contact-section form');
    const body = document.body;

    // Simulação de banco de dados para testes
    const bancoDeDadosLojistas = [
        { cpfCnpj: '123.456.789-00', senha: 'senha123', url: 'menu.lojista/menu.html' },
        { cpfCnpj: '11.222.333/0001-44', senha: 'teste123', url: 'menu.html' },
        { cpfCnpj: '444.555.666-00', senha: 'lojista456', url: 'menu.html' }
    ];

    // Função para criar e exibir a mensagem de erro
    function showError(inputElement, message) {
        const existingError = inputElement.nextElementSibling;
        if (existingError && existingError.classList.contains('error-message')) {
            existingError.textContent = message;
            return;
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);

        inputElement.classList.add('input-error');
    }

    // Função para remover todas as mensagens de erro
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }

    // Função para exibir o pop-up de sucesso ou erro
    function showPopup(title, message, isSuccess = true) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        
        const popupBox = document.createElement('div');
        popupBox.className = 'popup-box';
        popupBox.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="popup-close-btn">OK</button>
        `;

        if (!isSuccess) {
            popupBox.classList.add('error');
        }

        overlay.appendChild(popupBox);
        body.appendChild(overlay);

        document.querySelector('.popup-close-btn').addEventListener('click', () => {
            body.removeChild(overlay);
        });

        // Adiciona estilos para o pop-up de erro (vermelho)
        if (!isSuccess) {
            const style = document.createElement('style');
            style.innerHTML = `
                .popup-box.error h3 { color: #d9534f; }
                .popup-box.error .popup-close-btn { background-color: #d9534f; }
            `;
            document.head.appendChild(style);
        }
    }

    // Função para adicionar estilos CSS dinamicamente
    function addStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .error-message {
                color: #d9534f;
                font-size: 0.8em;
                text-align: left;
                margin-top: -15px;
                margin-bottom: 10px;
                display: block;
            }
            .input-error {
                border-color: #d9534f !important;
            }

            /* Estilos do pop-up */
            .popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                animation: fadeIn 0.3s forwards;
            }

            .popup-box {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                animation: scaleUp 0.3s forwards;
            }
            
            .popup-box h3 {
                margin-top: 0;
                color: #003366;
            }
            
            .popup-box p {
                color: #555;
            }

            .popup-close-btn {
                background-color: #0d2c4f;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1em;
                margin-top: 20px;
            }

            /* Animações */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes scaleUp {
                from { transform: scale(0.9); }
                to { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // Adiciona os estilos ao carregar a página
    addStyles();

    // Evento de envio do formulário do lojista
    if (lojistaForm) {
        lojistaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors();

            const cpfCnpjInput = lojistaForm.querySelector('input[type="text"]');
            const senhaLojistaInput = lojistaForm.querySelector('input[type="password"]');

            const cpfCnpj = cpfCnpjInput.value.trim();
            const senha = senhaLojistaInput.value.trim();

            if (cpfCnpj === '') {
                showError(cpfCnpjInput, 'Por favor, insira seu CPF/CNPJ.');
            }
            if (senha === '') {
                showError(senhaLojistaInput, 'Por favor, insira sua senha.');
            }
            
            // Se não houver erros de validação básicos, verifica as credenciais
            if (lojistaForm.querySelectorAll('.error-message').length === 0) {
                const lojista = bancoDeDadosLojistas.find(lojista => lojista.cpfCnpj === cpfCnpj && lojista.senha === senha);

                if (lojista) {
                    showPopup('Login com sucesso! ✅', 'Você foi logado com sucesso. Bem-vindo!', true);
                    
                    // Redireciona após 2 segundos para dar tempo de ver a mensagem
                    setTimeout(() => {
                        window.location.href = lojista.url;
                    }, 2000);

                } else {
                    showPopup('Erro de Login ❌', 'Credenciais incorretas. Por favor, verifique seu CPF/CNPJ e senha.', false);
                }
            }
        });
    }

    // Evento de envio do formulário do cliente
    if (clienteForm) {
        clienteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors();

            const codigoInput = clienteForm.querySelector('input[type="text"]');
            const senhaClienteInput = clienteForm.querySelector('input[type="password"]');

            if (codigoInput.value.trim() === '') {
                showError(codigoInput, 'Por favor, insira seu código.');
            }
            if (senhaClienteInput.value.trim() === '') {
                showError(senhaClienteInput, 'Por favor, insira sua senha.');
            }

            if (clienteForm.querySelectorAll('.error-message').length === 0) {
                showPopup('Login com sucesso! ✅', 'Você foi logado com sucesso. Bem-vindo!', true);
                // Limpa os campos após o login
                codigoInput.value = '';
                senhaClienteInput.value = '';
            }
        });
    }

    // Evento de envio do formulário de contato
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors();

            const emailInput = contactForm.querySelector('input[type="email"]');

            if (emailInput.value.trim() === '') {
                showError(emailInput, 'Por favor, insira seu e-mail para contato.');
            } else if (!emailInput.value.includes('@')) {
                showError(emailInput, 'Por favor, insira um e-mail válido.');
            }

            if (contactForm.querySelectorAll('.error-message').length === 0) {
                showPopup('E-mail enviado! ✅', 'Sua solicitação foi recebida. Nossa equipe entrará em contato em breve.', true);
                // Limpa o campo de e-mail após o envio
                emailInput.value = '';
            }
        });
    }
});