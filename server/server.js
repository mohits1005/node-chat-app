require('./config/config.js')

const _ = require('lodash')
const path = require('path');
const http = require('http');
const express = require('express')
const bodyParser = require('body-parser')

var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');
const { ObjectID } = require('mongodb');
var app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

app.get('/login', (req, res) => {
    // res.send('Hello World');
    res.sendFile('login.html', { root: publicPath });
});

app.get('/register', (req, res) => {
    // res.send('Hello World');
    res.sendFile('register.html', { root: publicPath });
});

app.get('/chat', (req, res) => {
    res.sendFile('chat.html', { root: publicPath });
});

//creating user
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])
    var user = new User(body);
    user.save().then((user) => {
        return user.generateAuthToken();
        // res.send(user);
    }).then((token) => {
        res.header('x-auth', token).send({ user, token });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

//testing middleware token
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

//logging user
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        // res.send(user);
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({user , token});
        })
    }).catch((e) => {
        res.status(400).send('Error');
    });
    // res.send(body);
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});