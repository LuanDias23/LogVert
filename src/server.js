const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// --- CONFIG GLOBAL ---
app.use(cors());
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Helper para montar caminhos das páginas
const page = (...segments) =>
    path.join(__dirname, '..', 'public', 'pages', ...segments);

// --- ROTAS DE PÁGINAS ---

// Index
app.get('/', (req, res) => {
    res.sendFile(page('index', 'index.html'));
});

// Login
app.get('/login', (req, res) => {
    res.sendFile(page('login', 'login.html'));
});

// Menu Lojista
app.get('/menu-lojista', (req, res) => {
    res.sendFile(page('menu.lojista', 'menuLojista.html'));
});

// Produtos
app.get('/produtos', (req, res) => {
    res.sendFile(page('produtos', 'produtos.html'));
});

// Vendas (AJUSTADO)
app.get('/vendas', (req, res) => {
    res.sendFile(page('vendas', 'venda.html'));
});

// Menu Cliente
app.get('/menu-cliente', (req, res) => {
    res.sendFile(page('menu.cliente', 'menuCliente.html'));
});

// FAQ
app.get('/faq', (req, res) => {
    res.sendFile(page('FAQ', 'faq.html'));
});

// FAQ Cliente
app.get('/faq-cliente', (req, res) => {
    res.sendFile(page('FAQ_cliente', 'FAQ.html'));
});

// Esqueci senha Lojista
app.get('/esqueci-senha-lojista', (req, res) => {
    res.sendFile(page('esqueci_senha.lojista', 'esqueci_senha.html'));
});

// Esqueci senha Cliente
app.get('/esqueci-senha-cliente', (req, res) => {
    res.sendFile(page('esqueci_senha.cliente', 'esqueci_senha.html'));
});

// Trocas / Devoluções
app.get('/devolucoes', (req, res) => {
    res.sendFile(page('devolucoes', 'devolucoes.html'));
});

// Dados pessoais Cliente
app.get('/dados', (req, res) => {
    res.sendFile(page('dados.pessoais', 'meus_dados.html'));
});

// Configuração Lojista
app.get('/configuracao', (req, res) => {
    res.sendFile(page('configuracao', 'configuracao.html'));
});

// Chatbot
app.get('/chatbot', (req, res) => {
    res.sendFile(page('chatbot', 'chatbot.html'));
});

// Catálogo
app.get('/catalogo', (req, res) => {
    res.sendFile(page('catalogo', 'catalogo.html'));
});

// Carreiras
app.get('/carreiras', (req, res) => {
    res.sendFile(page('carreiras', 'carreiras.html'));
});

// Sobre Nós
app.get('/sobre-nos', (req, res) => {
    res.sendFile(page('sobre-nos', 'sobre-nos.html'));
});

// Política
app.get('/politica', (req, res) => {
    res.sendFile(page('politica-termos', 'politica.html'));
});

// Termos
app.get('/termos', (req, res) => {
    res.sendFile(page('politica-termos', 'termos.html'));
});

// Termos
app.get('/solicitacao', (req, res) => {
    res.sendFile(page('/solicitacao', 'solicitacao.html'));
});

// --- API LOGIN ---

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (email === 'lojista@email.com' && password === '123456') {
        return res.status(200).json({
            message: "Login bem-sucedido!",
            redirectTo: "/menu-lojista"
        });
    }

    return res.status(401).json({ message: "Email ou senha inválidos." });
});

app.post('/api/login-cliente', (req, res) => {
    const { codigo, senha } = req.body;

    if (codigo === 'CODIGO123' && senha === '123') {
        return res.status(200).json({
            message: "Login bem-sucedido!",
            redirectTo: "/menu-cliente"
        });
    }

    return res.status(401).json({ message: "Código ou senha inválidos." });
});

// --- START ---
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});
