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


    findBoardById: function(login, password) {
        try {
            return this.getSpecificUser(login, password).then(currentUser => {
                return boards.findOne({creator_id : currentUser._id}, (error, board) => {
                    if(error) return console.error(error);
                    return board;
                });
            });
        }
        catch(err) {
            console.log(err);
        }

    },

    addBoard: function(login, password) {
        this.getSpecificUser(login, password).then(currentUser => {
            const newBoard = new boards({
                _id : mongoose.Types.ObjectId(),
                creator_id : currentUser._id,
                creator_name : currentUser.login,
                notes: [],
                users: []
            });

            newBoard.save(function (error) {
                if (error) {
                    console.error(error);
                    return error;
                };
            });
        });
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
    }
};
  