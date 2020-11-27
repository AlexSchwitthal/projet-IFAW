var http = require('http');

module.exports = {
	getAllUsers: (users) => {
        return users.find((error, users) => {
            if(error) return console.error(error);
            return users;
        });
    }
};
  