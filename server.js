const express = require("express");
const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/test/:id', (req, res) => {
    res.render('test', {id: req.params.id});
});


app.get('/test', (req, res) => {
    res.render('test', {id : "inconnue"});
});


app.listen(3000,() => {
    console.log("j'écoute sur le port 3000");
});
