const http = require('http');
const express = require('express')
const path = require('path');

const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    // res.send('Hello World');
    res.render(index);
});
server.listen(port, () => {
    console.log(`Started on port ${port}`);
});