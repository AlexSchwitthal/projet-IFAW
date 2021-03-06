const mongoose = require('mongoose');

module.exports = {
	// mapping des utilisateurs
	users: function() {
		const usersSchema = new mongoose.Schema({
			_id:  Object,
			login: { type : String , unique : true, required : true },
			password: { type : String, required : true }
		});
		return mongoose.model('users', usersSchema, 'users');
	},

	// mapping des tableaux
	boards: function() {
		const boardsSchema = new mongoose.Schema({
			_id: Object,
			name: {type : String, unique : true},
			creator_id : Object,
			creator_name: String,
			notes : Array,
			users : Array
		});
		return mongoose.model('boards', boardsSchema, 'boards');
	}
};
  