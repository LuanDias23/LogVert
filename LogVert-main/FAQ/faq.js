document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-suporte');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            console.log('Dados do formulário de Suporte:', data);
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            
            form.reset();
        });
    }
});