const mongoose = require('mongoose');

module.exports = {
	getAllUsers: (users) => {
        return users.find((error, users) => {
            if(error) return console.error(error);
            return users;
        });
    },

    addUser: (users, login, password) => {

        const newUser = new users({ 
            _id : mongoose.Types.ObjectId(),
            login: login, 
            password: password
        });

        newUser.save(function (error) {
            if (error) return console.error(error);
        });
    },

    getSpecificUser: (users, login, password) => {
        return users.findOne({login : login, password: password},(error, users) => {
            if(error) return console.error(error);
            return users;
        });
    }
};
  