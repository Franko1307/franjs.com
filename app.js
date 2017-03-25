var express = require("express");
var app = express();
var bodyParser  = require('body-parser');
var http = require('http').Server(app);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

require('./routes/routes.js')(app);

http.listen(8080,'localhost',function() {
    console.log('app.js is running on localhost:8080');
});
