document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // --- BLOCO DE ROLAGEM SUAVE REMOVIDO ---
    // O 'welcome.css' (com html { scroll-behavior: smooth; })
    // agora vai cuidar disso sem conflitos.
    // =========================================================


    // --- LÓGICA PARA O MENU MOBILE ---
    // (Seu código original)
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav'); // Assumindo que o ID do seu nav é 'mainNav'
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
        });
    }

    // --- LÓGICA PARA O FAQ ACORDEÃO ---
    // (Seu código original, com uma pequena correção para o 'max-height')
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer'); // Pega a resposta

        if (question && answer) { // Garante que ambos existam
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Fecha todos os outros
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        // Garante que a resposta do outro item exista antes de aplicar o estilo
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = null; // Fecha
                        }
                    }
                });

                // Abre/Fecha o item atual
                if (isActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = null; // Fecha
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px'; // Abre
                }
            });
        }
    });

    // --- LÓGICA DA ANIMAÇÃO DE PARTÍCULAS ---
    // Configuração atualizada para cobrir toda a tela com mais partículas
    const particlesElement = document.getElementById('hero-particles');
    console.log('Particles element:', particlesElement);
    console.log('particlesJS available:', typeof particlesJS !== 'undefined');

    if (typeof particlesJS !== 'undefined' && particlesElement) {
        console.log('Initializing particles...');
        particlesJS("hero-particles", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#1A73E8" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.4, "random": true },
                "size": { "value": 4, "random": true },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#1A73E8",
                    "opacity": 0.3,
                    "width": 1.5
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": true,
                    "out_mode": "out"
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 200,
                        "line_linked": { "opacity": 0.6 }
                    }
                }
            },
            "retina_detect": true
        }, function() {
            console.log('Particles initialized successfully!');
            const canvas = particlesElement.querySelector('canvas');
            if (canvas) {
                console.log('Canvas found:', canvas);
                console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
            } else {
                console.error('Canvas not found inside #hero-particles');
            }
        });
    } else {
        console.error('Particles not initialized:', {
            particlesJSAvailable: typeof particlesJS !== 'undefined',
            elementFound: !!particlesElement
        });
    }

    // --- LÓGICA PARA ANIMAÇÃO DOS NÚMEROS DO PAINEL ---
    // (Seu código original)
    const counters = document.querySelectorAll('.metric-value');

    if (counters.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    // Evita re-animar se já foi animado
                    if (counter.hasAttribute('data-animated')) return;
                    counter.setAttribute('data-animated', 'true');

                    let count = 0;
                    const speed = 100;

                    const updateCount = () => {
                        const inc = Math.max(Math.floor(target / speed), 1);
                        count += inc;

                        if (count < target) {
                            counter.innerText = count;
                            setTimeout(updateCount, 15);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    // --- HEADER FIXO AO ROLAR ---
    const mainHeader = document.querySelector('.main-header');
    const heroSection = document.querySelector('.hero-section');

    if (mainHeader && heroSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        });
    }

    // --- BOTÃO VOLTAR AO TOPO ---
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- FORMULÁRIO DE DEMONSTRAÇÃO ---
    const demoForm = document.getElementById('demoForm');
    const demoMessage = document.getElementById('demoMessage');
    const demoSubmitBtn = document.getElementById('demoSubmitBtn');

    if (demoForm && demoMessage && demoSubmitBtn) {
        const showSpinner = () => {
            demoSubmitBtn.classList.add('loading');
            demoSubmitBtn.disabled = true;
            const spinner = demoSubmitBtn.querySelector('.btn-spinner');
            if (spinner) spinner.style.display = 'inline-block';
        };

        const hideSpinner = () => {
            demoSubmitBtn.classList.remove('loading');
            demoSubmitBtn.disabled = false;
            const spinner = demoSubmitBtn.querySelector('.btn-spinner');
            if (spinner) spinner.style.display = 'none';
        };

        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            demoMessage.textContent = '';
            demoMessage.className = 'form-message';
            showSpinner();

            // Simula envio (substituir por chamada real de API no futuro)
            await new Promise(resolve => setTimeout(resolve, 1500));

            hideSpinner();
            demoMessage.textContent = '✓ Solicitação enviada com sucesso! Entraremos em contato em breve.';
            demoMessage.classList.add('success');

            demoForm.reset();
        });
    }
});