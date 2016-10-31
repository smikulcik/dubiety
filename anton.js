var conversation = require('./conversation.js');
var sentiment = require('./sentiment.js');


var synaptic = require('synaptic'); // this line is not needed in the browser
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

var thankyous = [
  "Thanks! It really mean's a lot to me.",
  "You make me feel so much better",
  "I feel like I will make it back to Earth"
];

var meh  = [
    "Well, the ship doesn't look the best",
    "I have been through worse before",
    "Maybe I shouldn't have reached out for help",
    "Who are you anyways?"
];

var angry = [
  "You are so mean!",
  "I knew I never should have messaged you",
  "I'll be fine on my own",
  "JUST BE QUIET!!!",
  ".."
];

function randElement(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

var Anton = function(session){
	this.name = 'Anton';
	this.session = session;
  this.conversationContext = {};

  this.pastConversation = [];

  this.learning_rate = .1;

  // metrics
  this.spirits = .7; // between -1 and 1

  // nn properties
  this.trust_nn = new Architect.Perceptron(1,2,1);
  //this.trust_nn.activate([])

  session.send("Help! I've lost communication with my ground control!!");
};

Anton.prototype.handleMessage = function(message){
  var that = this;

  sentiment.getSentiment(message, function(score){
    //exponential weighted error
    that.spirits = that.spirits*(1-that.learning_rate) + score*that.learning_rate;
    conversation.message(message, that.conversationContext, function(response){
      that.conversationContext = response.context;
      if(response.output.text == "I don't know.")
        that.expressSelf();
      else
        that.session.send(response.output.text);

      that.pastConversation.push([message, score, response]);
    });
  });
};

Anton.prototype.expressSelf = function(){
  if(this.spirits > .75)
    this.session.send(randElement(thankyous));
  else if(this.spirits > -.4){
    this.session.send(randElement(meh));
  } else {
      this.session.send(randElement(angry));
  }
};

Anton.prototype.toJSON = function(){
  return {
    "spirits" : this.spirits,
    "name" : this.name,
    "pastConversation" : this.pastConversation
  };
}

exports.Anton = Anton;
