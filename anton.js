var conversation = require('./conversation.js');
var sentiment = require('./sentiment.js');
var async = require('async');

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
  this.maxMessages = 10;

  // metrics
  this.anger = 0;
  this.disgust = 0;
  this.fear = .6;
  this.joy = .4;
  this.sadness = .1;
  this.confident = .5;
  this.spirits = .7; // between -1 and 1
  this.trust = .1;

  this.isAlive = true;

  this.stage = 1;

  // nn properties
  this.brain = new Architect.Perceptron(15,5,2);
  this.train();

  session.send("Help! I've lost communication with my ground control!!");
};

Anton.prototype.train = function(){
  /*
  1 (sentiment + 1)/2,  // normalize sentiment
  2 tone.anger,  // jeff's
  3 tone.disgust,
  4 tone.fear,
  5 tone.joy,
  6 tone.sadness,
  7 tone.confident,

  8 that.anger,   //anton's
  9 that.disgust,
  10that.fear,
  11that.joy,
  12that.sadness,
  13that.confident,
  14that.spirits,
  15that.trust

  yield [spirits, trust]*/
  console.log("PRETRAIN");
  console.log(this.brain.activate([1,0,0,0,1,0,1,0,0,0,1,0,1,1,1]));
  var trainer = new Trainer(this.brain, {
    rate: this.learning_rate,
    iterations: 2000,
    error: .005,
    shuffle: true,
    log: 1000,
    cost: Trainer.cost.CROSS_ENTROPY
});
  var trainingSet = [
    {
      input: [1,0,0,0,1, 0,1,0,0,0, 1,0,1,1,1],
      output: [1,1]
    },
    {
      input: [1,0,0,0,0,0,0,0,0,.5,.5,0,0,.5,.5],
      output: [1,1]
    },
    {
      input: [0,0,0,1,1,0,0,0,0,1,1,0,0,1,1],
      output: [1,1]
    },
    {
      input: [1,0,0,0,.5,0,0,0,0,.5,.5,0,.5,1,0],
      output: [1,1]
    },
    {
      input: [.5,0,0,.5,0, 0,0,0,0,.5, .5,0,.5,.5,.5],
      output: [1,1]
    },
    {
      input: [0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
      output: [1,1]
    },
    {
      input: [0,1,1,1,0, 1,0,1,1,1, 0,1,0,0,0],
      output: [-1,0]
    },
    {
      input: [0,0,0,0,0, 0,1,0,0,0, 1,0,1,0,1],
      output: [-1,1]
    },
    {
      input: [0,1,1,1,0, 0,0,1,0,1, 0,1,1,0,0],
      output: [1,0]
    },
    {
      input: [0,1,0,0,0, 1,0,1,0,1, 0,0,0,0,0],
      output: [-1,0]
    }
  ];

  trainer.train(trainingSet);

  console.log("TRAINED");
  console.log(this.brain.activate([1,0,0,0,1,0,1,0,0,0,1,0,1,1,1]));
}

Anton.prototype.handleMessage = function(message, callback){
  var that = this;

  if(this.pastConversation.length > this.maxMessages){
    this.isAlive = false;
    this.session.sendState();
    return;
  }

  async.parallel([
    function(cb){sentiment.getSentiment(message, cb)},
    function(cb){sentiment.getTone(message, cb)},
    function(cb){conversation.message(message, that.conversationContext, function(resp){cb(null, resp);})}
  ], function(err, results){
    var sentiment = results[0];
    var tone = results[1];
    var conv_resp = results[2];

    console.log(JSON.stringify(results));
    if(results[0] == null || results[1] == null){
      if(callback != undefined)
        callback();
      return;
    }

    var inputs = [
      (sentiment + 1)/2,  // normalize sentiment
      tone.anger,  // jeff's
      tone.disgust,
      tone.fear,
      tone.joy,
      tone.sadness,
      tone.confident,
      that.anger,   //anton's
      that.disgust,
      that.fear,
      that.joy,
      that.sadness,
      that.confident,
      (that.spirits + 1)/2,
      that.trust
    ];
    var opinion = that.brain.activate(inputs);
    console.log(inputs);
    console.log(opinion);
    that.spirits = opinion[0];
    that.trust = opinion[1];

    if(that.spirits > 0 && that.trust > .3 && conv_resp.output.text != "I don't know."){
        that.session.send(conv_resp.output.text);
        that.pastConversation.push([message, sentiment, conv_resp]);
    } else {
      var expression = that.getSelfExpression();
      that.session.send(expression);
      that.pastConversation.push([message, sentiment, expression]);
    }

    if(that.trust > 0.9 && that.stage == 1){
      that.stage == 2;
      that.session.send("Ok, here is the passcode to my sensors: XIETSG")
    }

    if(callback != undefined)
      callback();
  });
};

Anton.prototype.getSelfExpression = function(){
  var feelings = ((this.spirits+1)/2 + this.trust)/2;

  if(feelings > .6)
    return randElement(thankyous);
  else if(feelings > .2){
    return randElement(meh);
  } else {
      return randElement(angry);
  }
};

Anton.prototype.getHeartRate = function(){
  if(!this.isAlive)
    return 0;
  //stress (0, 60) => (1, 160)
  var stress = 1 - (this.spirits + 1)/2;  //[0,1]
  return stress*100 + 60;
};

Anton.prototype.toJSON = function(){
  return {
    "spirits" : this.spirits,
    "name" : this.name,
    "pastConversation" : this.pastConversation,
    "anger" : this.anger,
    "disgust" : this.disgust,
    "fear" : this.fear,
    "joy" : this.joy,
    "sadness" : this.sadness,
    "confident" : this.confident,
    "spirits" : this.spirits,
    "trust" : this.trust,
    "heartRate" : this.getHeartRate()
  };
};

exports.Anton = Anton;
