const mongoose = require('mongoose');

module.exports = {
	users: function() {
		const usersSchema = new mongoose.Schema({
			_id:  Object,
			login: String,
			password: String
		});
		return mongoose.model('users', usersSchema, 'users');
	}
};
  