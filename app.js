const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/index/index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path), (err) => {
    if (err) {
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor frontend rodando em http://localhost:${port}`);
  console.log('Acesse seu site em: http://localhost:3000');
});