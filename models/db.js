const mongoose = require('mongoose');

module.exports = {
	connectToDB: function() {
        mongoose.connect('mongodb+srv://alexandreS:CZFzHIlPND0cOWhV@cluster0.asytl.mongodb.net/IFAW?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
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