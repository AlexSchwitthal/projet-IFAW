const mongoose = require('mongoose');

module.exports = {
	users: function() {
		const usersSchema = new mongoose.Schema({
			_id:  Object,
			login: { type : String , unique : true, required : true },
			password: { type : String, required : true }
		});
		return mongoose.model('users', usersSchema, 'users');
	},

	boards: function() {
		const boardsSchema = new mongoose.Schema({
			_id:  Object,
			creator_id : Object,
			creator_name: String,
			notes : Array,
			users : Array
		});
		return mongoose.model('boards', boardsSchema, 'boards');
	}
};
  