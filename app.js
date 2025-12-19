const express = require('express');
const path = require('path');
const cors = require('cors');
const exphbs = require('express-handlebars');

const app = express();
const port = process.env.PORT || 3000;

// View engine (Handlebars) - compatibility with different versions
const exphbsModule = exphbs;
if (exphbsModule && exphbsModule.engine) {
  app.engine('handlebars', exphbsModule.engine({ defaultLayout: 'main' }));
} else {
  app.engine('handlebars', exphbsModule({ defaultLayout: 'main' }));
}
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir recursos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal (página inicial com Handlebars) - sem layout
app.get('/', (req, res) => {
  res.render('index', {
    layout: false,  // Index tem estrutura HTML própria
    title: 'LogVert | Logística Reversa Inteligente',
    year: new Date().getFullYear(),
    head: `
      <link rel="stylesheet" href="/pages/index/welcome.css">
    `,
    pageScripts: `
      <script src="/js/api/apiClient.js"></script>
      <script src="/pages/index/welcome.js" defer></script>
    `
  });
});

// Rota que renderiza a view de produtos usando Handlebars
app.get('/produtos', (req, res) => {
  res.render('produtos', {
    title: 'Gestão de Produtos',
    year: new Date().getFullYear(),
    head: `
      <link rel="stylesheet" href="/pages/produtos/produtos.css">
    `,
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/pages/produtos/produtos.js"></script>
    `
  });
});

// Rota que renderiza a view de vendas usando Handlebars
app.get('/vendas', (req, res) => {
  res.render('vendas', {
    title: 'Gestão de Vendas',
    year: new Date().getFullYear(),
    head: `
      <link rel="stylesheet" href="/pages/vendas/venda.css">
    `,
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/js/api/apiClient.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/pages/vendas/venda.js"></script>
    `
  });
});

// Rota para Chatbot com Handlebars (sem layout)
app.get('/chatbot', (req, res) => {
  res.render('chatbot', {
    layout: false,  // Chatbot tem estrutura HTML própria
    title: 'LogVert | Livia AI - Chatbot',
    year: new Date().getFullYear(),
    head: `
      <link rel="stylesheet" href="/css/global.css">
      <link rel="stylesheet" href="/pages/menu.lojista/menuLojista.css">
      <link rel="stylesheet" href="/css/chatbot-advanced.css">
      <link rel="stylesheet" href="/css/chatbot-extra-effects.css">
    `,
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/js/api/apiClient.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/js/chatbot-advanced.js"></script>
    `
  });
});

// Rota para Integrações com Handlebars (sem layout)
app.get('/integracoes', (req, res) => {
  res.render('integracoes', {
    layout: false,  // Integrações tem estrutura HTML própria
    title: 'LogVert | Integrações',
    year: new Date().getFullYear(),
    head: `
      <link rel="stylesheet" href="/css/global.css">
      <link rel="stylesheet" href="/pages/menu.lojista/menuLojista.css">
      <link rel="stylesheet" href="/pages/integracoes/integracoes.css">
    `,
    pageScripts: `
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      <script src="/js/api/apiClient.js"></script>
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/js/integracoes-advanced.js"></script>
    `
  });
});

// Rota para Cliente Login com Handlebars
app.get('/cliente/login', (req, res) => {
  res.render('cliente-login', {
    title: 'LogVert | Área do Cliente',
    year: new Date().getFullYear()
  });
});

// Rota para Assinatura com Handlebars (sem layout)
app.get('/assinatura', (req, res) => {
  res.render('assinatura', {
    layout: false,  // Assinatura tem estrutura HTML própria
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

// Rota para Login com Handlebars (sem layout)
app.get('/login', (req, res) => {
  res.render('login', {
    layout: false,  // Login tem estrutura HTML própria
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

// Fallback para servir arquivos estáticos por caminho (mantém comportamento anterior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path), (err) => {
    if (err) {
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor frontend rodando em http://localhost:${port}`);
  console.log('Acesse seu site em: http://localhost:' + port);
});