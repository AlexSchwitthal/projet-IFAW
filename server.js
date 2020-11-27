const express = require("express");
var session = require('express-session');
const bodyParser = require('body-parser');

// initialisation de l'application et de la session
const app = express();
app.use(session({secret:'XASDASDA'}));
var ssn;

// DB
const db = require('./models/db.js').connectToDB();
const users = require('./models/collections.js').users();
const queries = require('./models/queries.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(function(req, res, next) {
	ssn = req.session; 
	if(ssn.login) {
		res.locals.login = ssn.login;
		res.locals.password = ssn.password;
	}
	next();
});


app.get('/', (req, res) => {
	res.redirect('login');
});


app.get('/login', isNotAuthenticated, (req, res) => {
	res.render('login');
});

app.post('/login', (req, res) => {
	queries.getSpecificUser(users, req.body.username, req.body.password).then(result => {
		if(result != null) {
			ssn = req.session;
			ssn.login = req.body.username;
			ssn.password = req.body.password;
			res.redirect('/users');
		}
		else {
			res.redirect('/login');
		}
	});
});

app.get('/logout', isAuthenticated, (req, res) => {
	req.session.destroy();
	res.redirect('/login');
});

app.get('/register', isNotAuthenticated, (req, res) => {
	res.render('register');
})

app.post('/register', (req, res) => {
	queries.addUser(users, req.body.username.toLowerCase(), req.body.password);
	res.redirect('/login');
});


app.get('/users', isAuthenticated, (req, res) => {
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


function isAuthenticated(req, res, next) {
	ssn = req.session; 
	if(ssn.login) {
		return next();
	}
	res.redirect('/login');
}

function isNotAuthenticated(req, res, next) {
	ssn = req.session; 
	if(ssn.login == undefined) {
		return next();
	}
	res.redirect('/users');
}