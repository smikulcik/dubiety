var express = require('express');
var handlebars = require('handlebars'),
fs = require('fs');

var app = express();
var expressWs = require('express-ws')(app);

var PORT = 3000;

var antons = {};

var Anton = function(ws){
	this.name = 'Anton';
	this.ws = ws;
};
Anton.prototype.handleMessage = function(message){
	this.ws.send(message.toUpperCase());
};

app.ws('/ws', function(ws, req) {
	var anton = new Anton(ws);
	ws.on('message', function(msg) {
		anton.handleMessage(msg);
	});
});

app.get('/', function(req, res) {
	fs.readFile('./html/index.html', 'utf-8', function(err, src){
		var template = handlebars.compile(src);
		var html = template({});
		console.log(html);
		res.send(html);
	});
});
app.use(express.static('static'));

app.listen(PORT, function() {
	console.log('Started Listening!');
});
