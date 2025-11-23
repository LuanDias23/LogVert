const API_BASE_URL = 'http://localhost:8080/logvert';

/**
 * Pega o token salvo no localStorage.
 * (Esta é a função que busca o token de onde "nós o armazenamos")
 */
function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Cria os headers para chamadas de API que enviam JSON.
 * (Atualizado com o header 'Accept' pedido pelo seu chefe)
 */
function getAuthHeaders() {
    const token = getToken();
    return {
        'Accept': 'application/json', // <-- ADICIONADO
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Cria os headers para chamadas de API que enviam FormData (upload de arquivo).
 * (Atualizado com o header 'Accept' pedido pelo seu chefe)
 * * IMPORTANTE: Nunca definimos o 'Content-Type' aqui; o navegador faz isso.
 */
function getAuthHeadersForFormData() {
    const token = getToken();
    return {
        'Accept': 'application/json', // <-- ADICIONADO
        'Authorization': `Bearer ${token}`
    };
}

// Expor helpers no objeto global `window` para uso em scripts cliente
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
    window.getToken = getToken;
    window.getAuthHeaders = getAuthHeaders;
    window.getAuthHeadersForFormData = getAuthHeadersForFormData;
}