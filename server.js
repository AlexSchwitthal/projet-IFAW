const express = require("express");
var session = require('express-session');
const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');

// initialisation de l'application et de la session
const app = express();
app.use(session({secret:'XASDASDA'}));
var ssn;

// DB
require('./models/db.js').connectToDB();
const queries = require('./models/queries.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
//app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	ssn = req.session; 
	if(ssn.login) {
		res.locals.login = ssn.login;
		res.locals.password = ssn.password;

		/* 		var cookie = req.cookies.login;
		if (cookie === undefined) {
		  	res.cookie('login', ssn.login, { maxAge: 900000, httpOnly: true });
		  	res.cookie('nbConnexions', 0, { maxAge: 900000, httpOnly: true });
		}  */
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
	queries.getSpecificUser(req.body.username).then(result => {
		if(result != null) {
			ssn = req.session;
			ssn.login = req.body.username;
			ssn.password = req.body.password;
			//res.cookie('nbConnexions', ++req.cookies.nbConnexions, { maxAge: 900000, httpOnly: true });
			res.redirect('/notes');
		}
		else {
			res.render('login', {erreur : "nom d'utilisateur ou mot de passe incorrect !"});
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
	if(req.body.username == "" || req.body.password == "") {
		res.render('register', {erreur : "il doit y avoir un nom d'utilisateur et un mot de passe !"})
	}
	try {
		queries.getSpecificUser(req.body.username).then(result => {
			if(result == null) {
				queries.addUser(req.body.username.toLowerCase(), req.body.password);
				res.render('login', {success : "votre compte a bien été crée !"});
			}
			else {
				res.render('register', {erreur : "ce nom d'utilisateur est déjà pris :("});
			}
		});
	}
	catch(e) {
		res.redirect('/register');
	}
});


app.get('/notes/', isAuthenticated, (req, res) => {
	try {
		queries.getAllUsers().then(allUsers => {
			queries.findAllBoardsByUser(ssn.login).then(async function (allBoards) {
				if(allBoards.length != 0) {
					if(req.query.board) {
						for(var board of allBoards) {
							if(board._id == req.query.board) {
								res.render('notes', {board: board, boards: allBoards, users: allUsers});
							}
						}
					}
					else {
						res.render('notes', {board: allBoards[0], boards: allBoards, users: allUsers});
					}
				}
				else {
					await queries.addBoard(ssn.login, "Tableau n°1");
					queries.findBoardByUserId(ssn.login).then(newBoard => {
						var newBoards = [newBoard];
						res.render('notes', {board: newBoards[0], boards: newBoards, users: allUsers});
					});
				}
			})
		})
	}
	catch(e) {
		console.log(e);
		res.redirect("/users");
	}
});


app.get('/users', isAuthenticated, (req, res) => {
	queries.findAllBoardsByUser(ssn.login).then(allBoards => {
		queries.getAllUsers().then(allUsers => {
			res.render('users', {users: allUsers, boards : allBoards});
		}).catch( () => res.render('users'));
	})
});



// ---------- DEBUT APPEL AJAX ----------
app.post('/changeBoard', (req, res) => {
	try {
		if(req.body.boardId != "") {
			queries.findBoardById(req.body.boardId).then(board => {
				if(board == null) {
					res.status(500).send({error: 'une erreur est survenue !'}); 
				}
				else {
					queries.getAllUsers().then(allUsers => {
						res.send({board: board, users: allUsers, currentUser: ssn.login});
					});
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
		var newNote = queries.addNote(board, "new note", req.body.color);
		res.send(newNote);
	});
});

app.put('/addUser', (req, res) => {
	queries.findBoardById(req.body.boardId).then(board => {
		var result = queries.addUserToBoard(board, req.body._id, req.body.name);
		if(result == "error") {
			res.status(500).send({error: 'une erreur est survenue !'}); 
		}
		else {
			res.send("success");
		}
	})

});

app.delete('/removeUser', (req, res) => {
	queries.findBoardById(req.body.boardId).then(board => {
		queries.removeUserFromBoard(board, req.body._id);
		res.send("success");
	})
});

app.put('/addBoard', (req, res) => {
	queries.addBoard(ssn.login, req.body.boardName).then(newBoard => {
		if(newBoard == "error") {
			res.status(500).send({error: 'une erreur est survenue !'}); 
		}
		else {
			res.send(newBoard);
		}
	});
});

app.put('/chooseColor', (req, res) => {
	queries.findBoardById(req.body.boardId).then(board => {
		queries.chooseColor(board, req.body._id, req.body.color);
		res.send("success");
	})
});

app.delete('/deleteNote', (req, res) => {
	queries.findBoardById(req.body.boardId).then(board => {
		queries.deleteNote(board, req.body._id);
		res.send("success");
	})
});
// ---------- FIN APPEL AJAX ----------


app.all('*', function(req, res) {
	if(ssn.login) {
		res.redirect('/users');
	}
	else {
		res.redirect('/login');
	}
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