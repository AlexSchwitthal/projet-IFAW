const express = require("express");
const app = express();
var bodyParser = require("body-parser");

const mongoose = require('mongoose');
const Users = require('./models/users');
const { response } = require("express");

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Max-Age", "1800");
	res.setHeader("Access-Control-Allow-Headers", "content-type");
	res.setHeader("Access-Control-Allow-Methods","PUT, POST, GET, DELETE, PATCH, OPTIONS");
    next();
})

mongoose.connect('mongodb+srv://alexandreS:CZFzHIlPND0cOWhV@cluster0.asytl.mongodb.net/IFAW?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => {
        console.log('Successfully connected to DB!');
    })
    .catch((error) => {
        console.log('Unable to connect to DB!');
        console.error(error);
    });


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/users', (request, response) => {
    Users.find((error, users) => {
        if(error) return console.error(error);
        response.json(users);
    });
});

app.listen(3000,() => {
	console.log("j'écoute sur le port 3000");
});
