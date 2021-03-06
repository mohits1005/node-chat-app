require('./config/config.js')

const _ = require('lodash')
const path = require('path');
const http = require('http');
const express = require('express')
const bodyParser = require('body-parser')
const socketIO = require('socket.io')

var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Message } = require('./models/message');
var { authenticate } = require('./middleware/authenticate');
const { ObjectID } = require('mongodb');
var app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
var server = http.createServer(app);
var io = socketIO(server);
const { generateMessage } = require('./utils/message');
const { generateLocationMessage } = require('./utils/message');
const { Messages } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users')
var users = new Users();
var messages = new Messages();
var AYLIENTextAPI = require('aylien_textapi');
var moment = require('moment');


app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: publicPath });
});

app.get('/register', (req, res) => {
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

io.on('connection', (socket) => {
    console.log('New User Connected.');

    socket.on('join', async (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and Room Name are required.');
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        //get message list start
        var messageList = await Message.findMessages().then((data) => {
            return data
        }).catch((e) => {
            return []
        });
        console.log('messageList', {messageList});
        socket.emit('messageList', {messageList});
        //get message list end
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
    });

    socket.on('createMessage', async (message, callback) => {
        var textapi = new AYLIENTextAPI({
            application_id: "457cc307",
            application_key: "e6ad2f1bc6fd90897561fd2ecab2713f"
        });
        
        var user = users.getUser(socket.id);
        //save message start
        var message = new Message({ from: user.name, text: message.text, createdAt: moment().valueOf()});
        var msave = await message.save().then((data) => {
            console.log('message saved in db')
            return
        })
        messages.addMessage(message);
        //save message end
        if (user && isRealString(message.text)) {
            textapi.sentiment({
                'text': message.text
                }, function(error, response) {
                if (error === null) {
                    if (response.polarity === 'neutral'){
                        message.text = message.text + ' :|';
                    }
                    if (response.polarity === 'positive') {
                        message.text = message.text + ' :)';
                    }
                    if (response.polarity === 'negative') {
                        message.text = message.text + ' :(';
                    }
                    io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
                }
                else
                {
                    io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
                }
            });
        }
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected.');
        var user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('neMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    })
});




server.listen(port, () => {
    console.log(`Started on port ${port}`);
});