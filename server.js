var express = require('express');
var handlebars = require('handlebars'),
fs = require('fs');

var app = express();

var PORT = 3000;

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

