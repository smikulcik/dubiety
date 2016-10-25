var express = require('express');
var bodyParser = require('body-parser')
var handlebars = require('handlebars'),
fs = require('fs'),
process = require('process');
var sentiment = require('./sentiment.js');
var sessions = require('./session.js');

var app = express();
var expressWs = require('express-ws')(app);

var PORT = process.env.PORT || 3000;

app.use(express.static('static'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.ws('/ws', function(ws, req) {
	ws.on('message', function(jsonMsg) {
		var msg;
		try {
			msg = JSON.parse(jsonMsg);
			if(msg.hasOwnProperty('token')){
				var session = sessions.getSession(msg.token, ws);
				session.connect(ws);
				if(msg.hasOwnProperty('msg'))
					session.anton.handleMessage(msg.msg);
			} else {
				console.log("generating token");
				ws.send(JSON.stringify({'token': sessions.getToken()}));
			}
		} catch (e) {
			// do nothing
			throw e;
		}
	});
});

app.get('/', function(req, res) {
	fs.readFile('./html/index.html', 'utf-8', function(err, src){
		var template = handlebars.compile(src);
		var html = template({});
		res.send(html);
	});
});

app.post('/analyze', function(req, res) {
    var text = req.body.text;
	console.log(text);
	sentiment.getSentiment(text, function(response){
		var sent = JSON.stringify(response.docSentiment, null, 2);
		res.send(sent);
		console.log("Analyzed " + text + " and found " + sent);
	}, function(response){
		console.log(response);
		var sent = JSON.stringify(response, null, 2);
		console.log("erred " + text + " and found " + sent);
	});
});


app.listen(PORT, function() {
	console.log('Started Listening!');
});

/*
var synaptic = require('synaptic'); // this line is not needed in the browser
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

function Perceptron(input, hidden, output)
{
    // create the layers
    var inputLayer = new Layer(input);
    var hiddenLayer = new Layer(hidden);
    var outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;

var myPerceptron = new Perceptron(2,3,1);
var myTrainer = new Trainer(myPerceptron);

myTrainer.XOR(); // { error: 0.004998819355993572, iterations: 21871, time: 356 }

console.log(myPerceptron.activate([0,0])); // 0.0268581547421616
console.log(myPerceptron.activate([1,0])); // 0.9829673642853368
console.log(myPerceptron.activate([0,1])); // 0.9831714267395621
console.log(myPerceptron.activate([1,1])); // 0.02128894618097928*/
