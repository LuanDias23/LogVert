/**
 * LogVert Chatbot - Lívia (Widget)
 * Componente global de chat flutuante
 */

class LiviaChat {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createDOM();
        this.attachEvents();

        // Simular mensagem inicial após alguns segundos na primeira visita
        if (!sessionStorage.getItem('livia_greeted')) {
            setTimeout(() => {
                this.addMessage('bot', 'Olá! Sou a Lívia, sua assistente virtual. Como posso ajudar com sua logística hoje? 🤖');
                this.showBadge(1);
                sessionStorage.setItem('livia_greeted', 'true');
            }, 3000);
        } else {
            // Restaurar histórico básico (mock)
            this.addMessage('bot', 'Bem-vindo de volta! Precisa de ajuda com alguma devolução?');
        }
    }

    createDOM() {
        // Criar Launcher
        this.launcher = document.createElement('div');
        this.launcher.className = 'livia-launcher';
        this.launcher.innerHTML = `
            <i class="fas fa-comments"></i>
            <i class="fas fa-times"></i>
            <div class="livia-badge" style="display: none;">0</div>
        `;

        // Criar Janela
        this.window = document.createElement('div');
        this.window.className = 'livia-window';
        this.window.innerHTML = `
            <div class="livia-header">
                <div class="livia-avatar">
                    <i class="fas fa-robot"></i>
                    <div class="livia-status-dot"></div>
                </div>
                <div class="livia-info">
                    <h3>Lívia</h3>
                    <p>IA Especialista LogVert</p>
                </div>
            </div>
            <div class="livia-body" id="liviaBody">
                <div class="livia-typing" id="liviaTyping">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                </div>
            </div>
            <div class="livia-footer">
                <input type="text" class="livia-input" placeholder="Digite sua dúvida..." id="liviaInput">
                <button class="livia-send" id="liviaSend">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        document.body.appendChild(this.launcher);
        document.body.appendChild(this.window);

        this.bodyEl = document.getElementById('liviaBody');
        this.inputEl = document.getElementById('liviaInput');
        this.badgeEl = this.launcher.querySelector('.livia-badge');
        this.typingEl = document.getElementById('liviaTyping');
    }

    attachEvents() {
        // Toggle Chat
        this.launcher.addEventListener('click', () => this.toggleChat());

        // Send Message
        document.getElementById('liviaSend').addEventListener('click', () => this.handleSend());
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.launcher.classList.toggle('active', this.isOpen);
        this.window.classList.toggle('active', this.isOpen);

        if (this.isOpen) {
            this.hideBadge();
            this.inputEl.focus();
            this.scrollToBottom();
        }
    }

    handleSend() {
        const text = this.inputEl.value.trim();
        if (!text) return;

        // Adiciona mensagem do usuário
        this.addMessage('user', text);
        this.inputEl.value = '';

        // Simula "Digitando..." e resposta da IA
        this.showTyping();

        // Simulação inteligente de resposta (Mock)
        setTimeout(() => {
            const response = this.generateResponse(text);
            this.hideTyping();
            this.addMessage('bot', response);
        }, 1500 + Math.random() * 1000); // Delay natural (1.5s a 2.5s)
    }

    addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `livia-msg ${sender}`;
        msgDiv.innerHTML = text.replace(/\n/g, '<br>'); // Suporte básico a quebra de linha

        // Insere antes do indicador de "digitando"
        this.bodyEl.insertBefore(msgDiv, this.typingEl);

        this.scrollToBottom();
    }

    showTyping() {
        this.typingEl.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingEl.style.display = 'none';
    }

    scrollToBottom() {
        this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    }

    showBadge(count) {
        if (!this.isOpen) {
            this.badgeEl.textContent = count;
            this.badgeEl.style.display = 'flex';
        }
    }

    hideBadge() {
        this.badgeEl.style.display = 'none';
    }

    // --- CÉREBRO DA IA (Simulação Mock) ---
    generateResponse(input) {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('oi') || lowerInput.includes('ola') || lowerInput.includes('olá')) {
            return 'Olá! Tudo bem? Como posso ajudar você a otimizar suas devoluções hoje?';
        }

        if (lowerInput.includes('devolu') || lowerInput.includes('troca')) {
            return 'Para gerenciar trocas e devoluções, acesse o menu lateral em <strong>"Trocas e Devoluções"</strong>. Lá você pode aprovar ou rejeitar solicitações pendentes.';
        }

        if (lowerInput.includes('preço') || lowerInput.includes('plano') || lowerInput.includes('valor')) {
            return 'Você pode ver detalhes do seu plano atual e opções de upgrade na página <strong>"Minha Assinatura"</strong>, no menu do seu perfil.';
        }

        if (lowerInput.includes('integra') || lowerInput.includes('whatsapp')) {
            return 'Temos novidades! Agora você pode conectar WhatsApp, Telegram e Instagram na nova página de <strong>Integrações</strong>.';
        }

        if (lowerInput.includes('erro') || lowerInput.includes('bug') || lowerInput.includes('ajuda')) {
            return 'Sinto muito que esteja enfrentando problemas. Você pode consultar nossa <strong>Central de Ajuda (FAQ)</strong> ou entrar em contato com o suporte humano pelo email suporte@logvert.com.';
        }

        // Resposta padrão
        return 'Entendi. Ainda estou aprendendo sobre isso! 🧠<br>Enquanto isso, tente navegar pelo menu lateral ou consulte nossa Central de Ajuda.';
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Evita duplicar se já existir
    if (!document.querySelector('.livia-launcher')) {
        window.liviaChat = new LiviaChat();
    }
});
