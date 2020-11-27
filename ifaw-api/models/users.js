const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    prenom: { type: String, required: true},
    nom: { type: String, required: true },
});

module.exports = mongoose.model('Users', usersSchema);