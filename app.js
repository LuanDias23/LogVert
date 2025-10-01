const express = require('express');
const bp = require('body-parser');
const cp = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cp());
app.use(express.static('public'));
app.set('view engine', 'hbs');


app.use('/lojista/produtos', (req, res) => {
    res.render('produtos');
});
app.use('/lojista/login', (req, res) => {
    res.render('login');
});
app.use('/lojista/vendas', (req, res) => {
    res.render('vendas');
});





app.use('/lojista/', (req, res) => {
    res.render('menu');
});
app.use((req, res) => { res.redirect('/lojista'); });

console.log('\x1b[36m[INFO]: \x1b[0mNodeJS iniciado na porta 5500.');
app.listen(5500, '0.0.0.0');