document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-suporte');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio real

            // Pega os dados (apenas para exemplo)
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            console.log('Dados do formulário de Suporte:', data);
            
            // Simula o envio
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            
            // Limpa o formulário
            form.reset();
        });
    }
});