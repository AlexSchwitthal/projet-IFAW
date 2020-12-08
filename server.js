const express = require("express");
var session = require('express-session');
const bodyParser = require('body-parser');

// initialisation de l'application et de la session
const app = express();
app.use(session({secret:'XASDASDA'}));
var ssn;

// DB
const db = require('./models/db.js').connectToDB();
const queries = require('./models/queries.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
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
	queries.getSpecificUser(req.body.username, req.body.password).then(result => {
		if(result != null) {
			ssn = req.session;
			ssn.login = req.body.username;
			ssn.password = req.body.password;
			res.redirect('/notes');
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
	try {
		queries.addUser(req.body.username.toLowerCase(), req.body.password);
		res.redirect('/login');
	}
	catch(e) {
		res.redirect('/register');
	}
});


app.get('/notes', isAuthenticated, (req, res) => {
	try {
		queries.getAllUsers().then(allUsers => {
			queries.findAllBoardsByUserId(ssn.login, ssn.password).then(allBoards => {
				if(allBoards != null) {
					res.render('notes', {notes: allBoards[0].notes, boards: allBoards, users: allUsers});
				}
				else {
					queries.addBoard(ssn.login, ssn.password, "Tableau n°1");
					queries.findBoardByUserId(ssn.login, ssn.password).then(newBoard => {
						var newBoards = [newBoard];
						res.render('notes', {notes: newBoard.notes[0], boards: newBoards, users: allUsers});
					});
				}
			})
		})
	}
	catch(e) {
		res.redirect("/users");
	}
});


app.get('/users', isAuthenticated, (req, res) => {
	queries.getAllUsers().then(allUsers => {
		res.render('users', {users: allUsers});
	}).catch(err => res.render('users'));
})


// DEBUT APPEL AJAX
app.post('/changeBoard', (req, res) => {
	try {
		if(req.body.boardId != "") {
			queries.findBoardById(req.body.boardId).then(board => {
				if(board == null) {
					res.status(500).send({error: 'une erreur est survenue !'}); 
				}
				else {
					res.send(board.notes);
				}
			});
		}
	}
	catch(err) {
		console.log(err);
	}
});

app.put('/saveNote', (req, res) => {
	try {
		if(req.body._id != "") {
			queries.findBoardById(req.body.boardId).then(board => {
				queries.editNote(board, req.body._id, req.body.text);
				res.send("success");
			})
		}
		else {
			res.status(500).send({error: 'une erreur est survenue !'}); 
		}
	}
	catch(err) {
		console.log(err);
	}
});


app.put('/addNote', (req, res) => {
	queries.findBoardById(req.body.boardId).then(board => {
		var newNote = queries.addNote(board, "new note");
		res.send(newNote);
	});
});

app.put('/addUser', (req, res) => {
	console.log(req.body.name);
	queries.findBoardById(req.body.boardId).then(board => {
		
	})
	res.send("success");
});


app.put('/addBoard', (req, res) => {
	queries.addBoard(ssn.login, ssn.password, req.body.boardName).then(newBoard => {
		if(newBoard == "error") {
			res.status(500).send({error: 'une erreur est survenue !'}); 
		}
		else {
			res.send(newBoard);
		}
	});
});

app.delete('/deleteNote', (req, res) => {
	queries.findBoardById(req.body.boardId).then(board => {
		queries.deleteNote(board, req.body._id);
		res.send("success");
	})
});
// FIN APPEL AJAX


app.all('*', function(req, res) {
    res.render('login');
})

app.listen(4200,() => {
	console.log("j'écoute sur le port 4200");
});



// check login
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