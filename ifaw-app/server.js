const express = require("express");
const app = express();
const bodyParser = require('body-parser');
var queries = require('./models/queries.js');

/* queries.callAPI("http://localhost:3500/users").then((data) => {
	const response = {
		statusCode: 200,
		body: JSON.stringify(data),
	};
	console.log(response);
return response;
}); */
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
	queries.callAPI("http://localhost:3000/users").then((data, err) => {
		if(err) return err;
		res.render('users', {users: data})
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
