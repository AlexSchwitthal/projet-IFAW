const mongoose = require('mongoose');
const users = require('./collections.js').users();
const boards = require('./collections.js').boards();

module.exports = {

    // récupère la liste des utilisateurs
	getAllUsers: function() {
        return users.find((error, users) => {
            if(error) return console.error(error);
            return users;
        });
    },

    // ajoute un utilisateur dans la base de données
    addUser: function(login, password) {
        const newUser = new users({ 
            _id : mongoose.Types.ObjectId(),
            login: login, 
            password: password
        });

        newUser.save(function (error) {
            if (error) {
                console.error(error);
                return error;
            };
        });
    },

    // récupère un utilisateur en fonction d'un login donné
    getSpecificUser: function(login) {
        return users.findOne({login : login},(error, user) => {
            if(error) return console.error(error);
            return user;
        });
    },

    // récupère un tableau en fonction d'une ID donnée
    findBoardById : function(boardId) {
        return boards.findOne({_id : mongoose.Types.ObjectId(boardId)},(error, board) => {
            if(error) return console.error(error);
            return board;
        });
    },

    // récupère un tableau en fonction du login d'un utilisateur donné
    findBoardByUserId: async function(login) {
        try {
            const currentUser = await this.getSpecificUser(login);
            return boards.findOne({ creator_id: currentUser._id }, (error, board) => {
                if (error)
                    return console.error(error);
                return board;
            });
        }
        catch(err) {
            console.log(err);
        }
    },

    // récupère un tableau en fonction de l'id d'un utlisateur et du nom d'un tableau
    findBoardByName: function(userId, boardName) {
        try {
            return boards.findOne({ creator_id: userId, name: boardName }, (error, board) => {
                if (error)
                    return console.error(error);
                return board;
            });
        }
        catch(err) {
            console.log(err);
        }
    },

    // récupère tous les tableaux où un nom d'utilisateur apparait (créateur ou utilisateur)
    findAllBoardsByUser: async function(login) {
        return boards.find().or([{ "users.name": login }, {creator_name: login}]);
    },

    // ajoute un tableau dans la base de données
    addBoard: async function(login, boardName) {
        const currentUser = await this.getSpecificUser(login);
        const checkBoard = await this.findBoardByName(currentUser._id, boardName);
        if(checkBoard != null) {
            return "error";
        }
        const newBoard = new boards({
            _id: mongoose.Types.ObjectId(),
            name: boardName,
            creator_id: currentUser._id,
            creator_name: currentUser.login,
            notes: [],
            users: []
        });
        newBoard.save(function (error) {
            if (error) {
                console.error(error);
                return error;
            }
        });
        return newBoard;
    },

    // ajoute une note à un tableau donné
    addNote: function(board, text, color, x, y) {
        var newNote = {
            _id : mongoose.Types.ObjectId(),
            text: text,
            color: color,
            x: x,
            y: y
        }
        board.notes.push(newNote);
        board.save();
        return newNote;
    },

    // change le texte d'une note
    editNote: function(board, noteId, text) {
        text = text.split('$nbsp;').join('');
        text = text.split('$amp;').join('');
        text = text.split('&lt;').join('');
        text = text.split('$gt;').join('');
        text = text.split('<br>').join('');
        text = text.split('<div>').join('');
        text = text.split('</div>').join('');
        boards.updateOne(
        { 
            "_id": mongoose.Types.ObjectId(board._id),
            "notes._id": mongoose.Types.ObjectId(noteId)  
        }, 
        { 
            "$set": 
            { 
               "notes.$.text": text
            }
        }, 
        function(err) {
            if(err) return err;
        });
        board.save();
    },

    // change la couleur d'une note
    chooseColor: function(board, noteId, color){
        boards.updateOne(
            {
                _id: mongoose.Types.ObjectId(board._id),
                "notes._id": mongoose.Types.ObjectId(noteId)  
            },  
            { 
                "$set": 
                { 
                   "notes.$.color": color
                }
            },           
            function(err){
                if(err) return err;
            }
        );
        board.save();
    },

    // change la position d'une note
    editNotePosition: function(board, noteId, x, y) {
        boards.updateOne(
        { 
            "_id": mongoose.Types.ObjectId(board._id),
            "notes._id": mongoose.Types.ObjectId(noteId) 
        }, 
        { 
            "$set": 
            { 
               "notes.$.x": x,
               "notes.$.y": y
            }
        }, 
        function(err) {
            if(err) return err;
        });
        board.save();
    },

    // supprime une note
    deleteNote: function(board, noteId) {
        boards.updateOne(
            {
                _id: mongoose.Types.ObjectId(board._id)
            }, 
            {
                $pull: 
                {
                    notes: 
                    {
                        _id: mongoose.Types.ObjectId(noteId)
                    }
                }
            }, 
            function(err){
                if(err) return err;
            }
        );
        board.save();
    },

    // supprime un utilisateur d'un tableau
    removeUserFromBoard: function(board, userId) {
        boards.updateOne(
            {
                _id: mongoose.Types.ObjectId(board._id)
            }, 
            {
                $pull: 
                {
                    users: 
                    {
                        _id: mongoose.Types.ObjectId(userId)
                    }
                }
            }, 
            function(err){
                if(err) return err;
            }
        );
        board.save();
    },


    // ajoute un utilisateur à un tableau
    addUserToBoard: function(board, userId, userName) {
        if (board.users.some(e => e.name === userName)) {
            return "error";
        }
        else {
            var newUser = {
                _id : mongoose.Types.ObjectId(userId),
                name : userName
            }
            board.users.push(newUser);
            board.save();
            return newUser;
        }
    },
};
  