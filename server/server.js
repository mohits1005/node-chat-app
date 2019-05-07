const http = require('http');
const express = require('express')

const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);

app.get('/', (req, res) => {
    res.send('Hello World');
});
server.listen(port, () => {
    console.log(`Started on port ${port}`);
});