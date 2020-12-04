const mongoose = require('mongoose');

DB_SRV = require('./../config.json').DB_SRV;
DB_NAME = require('./../config.json').DB_NAME;
DB_USER = require('./../config.json').DB_USER;
DB_PWD = require('./../config.json').DB_PWD;


module.exports = {
	connectToDB: function() {
        mongoose.connect('mongodb+srv://' + DB_USER + ':' + DB_PWD + '@' + DB_SRV + '/' + DB_NAME + '?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
        .then(() => {
            console.log('Successfully connected to DB!');
        })
        .catch((error) => {
            console.log('Unable to connect to DB!');
            console.error(error);
        });
        return mongoose;
	}
};