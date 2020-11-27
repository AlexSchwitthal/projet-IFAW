const express = require("express");
const app = express();
const bodyParser = require('body-parser');

const db = require('./models/db.js').connectToDB();
const users = require('./models/collections.js').users();
const queries = require('./models/queries.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
	res.render('login');
});


app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res) => {
	res.render('loginForm', {username: req.body.username, password: req.body.password});
});

app.get('/users', (req, res) => {
	console.log();
	queries.getAllUsers(users).then(allUsers => {
		res.render('users', {users: allUsers});
	}).catch(err => res.render('users'));
})

app.get('/test/:id', (req, res) => {
    res.render('test', {id: req.params.id});
});


app.get('/test', (req, res) => {
	res.render('test');
});

app.all('*', function(req, res) {
    res.render('login');
})

app.listen(4200,() => {
	console.log("j'écoute sur le port 4200");
});
