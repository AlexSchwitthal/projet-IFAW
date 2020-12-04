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


/* queries.findAllBoardsById("abc", "def").then(allBoards => {
	console.log(allBoards);
}) */

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

/* app.get('/notes', isAuthenticated, (req, res) => {
	try {
		queries.findBoardById(ssn.login, ssn.password).then(board => {
			if(board != null) {
				res.render('notes', {notes: board.notes});
			}
			else {
				queries.addBoard(ssn.login, ssn.password, "tableau n°1");
				queries.findBoardById(ssn.login, ssn.password).then(newBoard => {
					res.render('notes', {notes: newBoard.notes});
				});
			}
		});
	}
	catch(e) {
		res.redirect("/users");
	}
});
 */

app.get('/notes', isAuthenticated, (req, res) => {
	try {
		queries.findAllBoardsById(ssn.login, ssn.password).then(allBoards => {
			if(allBoards != null) {
				res.render('notes', {notes: allBoards[0].notes, boards: allBoards});
			}
			else {
				queries.addBoard(ssn.login, ssn.password, "Tableau n°1");
				queries.findBoardById(ssn.login, ssn.password).then(newBoard => {
					var newBoards = [newBoard];
					res.render('notes', {notes: newBoard.notes[0], boards: newBoards});
				});
			}
		})
/* 		queries.findBoardById(ssn.login, ssn.password).then(board => {
			if(board != null) {
				res.render('notes', {notes: board.notes});
			}
			
		}); */
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

app.get('/test/:id', (req, res) => {
    res.render('test', {id: req.params.id});
});

app.get('/test', (req, res) => {
	res.render('test');
});

// DEBUT APPEL AJAX
app.put('/saveNote', (req, res) => {
	try {
		if(req.body._id != "") {
			queries.findBoardById(ssn.login, ssn.password).then(board => {
				queries.editNote(board, req.body._id, req.body.text);
			})
		}
	}
	catch(err) {
		console.log(err);
	}
});

app.put('/addNote', (req, res) => {
	queries.findBoardById(ssn.login, ssn.password).then(board => {
		var newNote = queries.addNote(board, "new note");
		res.send(newNote);
	})
});

app.put('/addBoard', (req, res) => {
	queries.addBoard(ssn.login, ssn.password, req.body.boardName).then(newBoard => {
		if(newBoard == "error") {
			res.status(500).send({error: 'you have an error'}); 
		}
		else {
			res.send(newBoard);
		}
		//console.log(newBoard);
	});
});

app.delete('/deleteNote', (req, res) => {
	queries.findBoardById(ssn.login, ssn.password).then(board => {
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