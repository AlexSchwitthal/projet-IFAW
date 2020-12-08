const mongoose = require('mongoose');
const users = require('./collections.js').users();
const boards = require('./collections.js').boards();

module.exports = {
	getAllUsers: function() {
        return users.find((error, users) => {
            if(error) return console.error(error);
            return users;
        });
    },

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

    getSpecificUser: function(login, password) {
        return users.findOne({login : login, password: password},(error, user) => {
            if(error) return console.error(error);
            return user;
        });
    },

    findBoardById : function(boardId) {
        return boards.findOne({_id : mongoose.Types.ObjectId(boardId)},(error, board) => {
            if(error) return console.error(error);
            return board;
        });
    },

    findBoardByUserId: async function(login, password) {
        try {
            const currentUser = await this.getSpecificUser(login, password);
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

    findAllBoardsByUser: async function(login) {
        return boards.find().or([{ "users.name": login }, {creator_name: login}]);
    },

    addBoard: async function(login, password, boardName) {
        const currentUser = await this.getSpecificUser(login, password);
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

    addNote: function(board, text) {
        var newNote = {
            _id : mongoose.Types.ObjectId(),
            text: text
        }
        board.notes.push(newNote);
        board.save();
        return newNote;
    },

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

    chooseColor: function(board, noteId){
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
  