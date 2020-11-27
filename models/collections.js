const mongoose = require('mongoose');

module.exports = {
	users: function() {
		const usersSchema = new mongoose.Schema({
			_id:  Object,
			login: { type : String , unique : true, required : true },
			password: { type : String, required : true }
		});
		return mongoose.model('users', usersSchema, 'users');
	}
};
  