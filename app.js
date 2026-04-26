const express = require('express');
const path = require('path');
const cors = require('cors');
const exphbs = require('express-handlebars');

const app = express();
const port = process.env.PORT || 3000;

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/login', (req, res) => {
  res.render('login', {
    layout: false,
    title: 'LogVert | Login',
    year: new Date().getFullYear(),
    head: `
      <link rel="stylesheet" href="/css/global.css">
      <link rel="stylesheet" href="/pages/login/login.css">
      <link rel="stylesheet" href="/pages/login/demo_mode.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    `,
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/js/api/apiClient.js"></script>
      <script src="/pages/login/login.js" defer></script>
    `
  });
});

app.get('/produtos', (req, res) => {
  res.render('produtos', {
    title: 'Gestão de Produtos',
    year: new Date().getFullYear(),
    head: '<link rel="stylesheet" href="/pages/produtos/produtos.css">',
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/pages/produtos/produtos.js"></script>
    `
  });
});

app.get('/vendas', (req, res) => {
  res.render('vendas', {
    title: 'Gestão de Vendas',
    year: new Date().getFullYear(),
    head: '<link rel="stylesheet" href="/pages/vendas/venda.css">',
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/js/api/apiClient.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/pages/vendas/venda.js"></script>
    `
  });
});

app.get('/consumidores', (req, res) => {
  res.render('consumidores', {
    title: 'Gestão de Consumidores',
    year: new Date().getFullYear(),
    head: '<link rel="stylesheet" href="/pages/consumidores/consumidores.css">',
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/js/api/apiClient.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/pages/consumidores/consumidores.js"></script>
    `
  });
});

app.get('/cliente/dashboard', (req, res) => {
  res.render('menu-cliente', {
    layout: false,
    title: 'LogVert | Painel do Cliente',
    year: new Date().getFullYear()
  });
});

app.get('/assinatura', (req, res) => {
  res.render('assinatura', {
    layout: false,
    title: 'LogVert | Minha Assinatura',
    year: new Date().getFullYear(),
    head: `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      <link rel="stylesheet" href="/css/global.css">
      <link rel="stylesheet" href="/css/global-header.css">
      <link rel="stylesheet" href="/pages/menu.lojista/menuLojista.css">
      <link rel="stylesheet" href="/css/assinatura.css">
    `,
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/js/api/apiClient.js"></script>
      <script src="/js/global-header.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/js/assinatura.js"></script>
    `
  });
});

app.get('/esqueci-senha-lojista', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/esqueci_senha.lojista/esqueci_senha.html'));
});

app.get('/solicitacoes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/devolucoes/devolucoes.html'));
});

app.get('/solicitacoes/nova', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/solicitacao/solicitacao.html'));
});

app.get('/FAQ', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/FAQ/faq.html'));
});

app.get('/menu.lojista', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/menu.lojista/menuLojista.html'));
});

app.get('/FAQ-cliente', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/FAQ_cliente/FAQ.html'));
});

app.get('*', (req, res) => {
  res.status(404).send('Página não encontrada');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});