document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-venda');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            console.log('Dados da Venda:', data);
            alert('Venda adicionada com sucesso! Verifique o console para ver os dados.');
            
            form.reset();
        });
    }
});