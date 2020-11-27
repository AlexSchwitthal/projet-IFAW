const mongoose = require('mongoose');

module.exports = {
	users: function() {
		const usersSchema = new mongoose.Schema({
			_id:  Object,
			prenom: String,
			nom: String
		});
		return mongoose.model('users', usersSchema, 'users');
	}
};
  