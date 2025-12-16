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

// Rota principal (página inicial estática)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/index/index.html'));
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
      <script src="/pages/menu.lojista/menuLojista.js"></script>
      <script src="/pages/vendas/venda.js"></script>
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