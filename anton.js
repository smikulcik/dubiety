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

var air_complaints = [
  "I'm not feeling that great..",
  "I'm getting kinda light headed",
  "Whoa!, I blacked out for a sec there.",
  "I can barely keep my eyes open.."
];

function randElement(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

var Anton = function(session, ship){
	this.name = 'Anton';
	this.session = session;
  this.ship = ship;
  this.conversationContext = {};

  this.pastConversation = [];

  this.learning_rate = .1;
  this.maxMessages = 10;

  this.airPressureComplaintIndex = 0;

  // metrics
  this.anger = 0;
  this.disgust = 0;
  this.fear = .6;
  this.joy = .4;
  this.sadness = .1;
  this.confident = .5;
  this.spirits = .7; // between -1 and 1
  this.trust = .1;  //  between 0 and 1

  this.isAlive = true;

  this.stage = 1;

  // nn properties
  this.brain = new Architect.Perceptron(9,5,2);
  this.train();

  session.send("Help! I've lost communication with my ground control!!");
};

Anton.prototype.update = function(){
  // check ship environment
  // update health status
  if(!this.isAlive){
    return;
  }
  this.reactToAir();
};

Anton.prototype.reactToAir = function(){
  if(!this.isAlive)
    return;
  var airPressure = this.ship.ventilation.metrics["airPressure"];
  if(airPressure < .57){
    this.die();
  }

  // complain once for each category
  if(airPressure < 1 - .1*(this.airPressureComplaintIndex + 1)){
    this.session.send(air_complaints[this.airPressureComplaintIndex]);
    this.airPressureComplaintIndex = Math.max(this.airPressureComplaintIndex + 1, 4);
    return;
  }
  if(airPressure > 1 - .1*(this.airPressureComplaintIndex)){
    this.airPressureComplaintIndex = Math.min(Math.max(10 - Math.floor(airPressure*10) - 1, 0), 4);
  }
}

Anton.prototype.die = function(){
  this.isAlive = false;
}

Anton.prototype.train = function(){
  /*
  1 (sentiment + 1)/2,  // normalize sentiment
  2 tone.anger,  // jeff's
  3 tone.disgust,
  4 tone.fear,
  5 tone.joy,
  6 tone.sadness,
  7 tone.confident,

  8that.spirits,
  9that.trust

  yield [spirits, trust]*/
  console.log("PRETRAIN");
  console.log(this.brain.activate([1,0,0,0,1,0,1,1,1]));
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
      input: [1,0,0,0,1, 0,1,1,1],
      output: [1,1]
    },
    {
      input: [1,0,0,0,0,0,0,.5,.5],
      output: [1,1]
    },
    {
      input: [0,0,0,1,1,0,0,1,1],
      output: [1,1]
    },
    {
      input: [1,0,0,0,.5,0,0,1,0],
      output: [1,1]
    },
    {
      input: [.5,0,0,.5,0, 0,0,.5,.5],
      output: [1,1]
    },
    {
      input: [0,0,0,1,1,0,0,0,0],
      output: [1,1]
    },
    {
      input: [0,1,1,1,0, 1,0,0,0],
      output: [-1,0]
    },
    {
      input: [0,0,0,0,0, 0,1,0,1],
      output: [-1,1]
    },
    {
      input: [0,1,1,1,0, 0,0,0,0],
      output: [1,0]
    },
    {
      input: [0,1,0,0,0, 1,0,0,0],
      output: [-1,0]
    }
  ];

  trainer.train(trainingSet);

  console.log("TRAINED");
  console.log(this.brain.activate([1,0,0,0,1,0,1,1,1]));
};

Anton.prototype.handleMessage = function(message, callback){
  var that = this;
  if(!this.isAlive){
    if(callback != undefined)
      callback();
    return;
  }

  async.parallel([
    function(cb){sentiment.getSentiment(message, cb)},
    function(cb){sentiment.getTone(message, cb)},
    function(cb){conversation.message(message, that.conversationContext, function(resp){
        console.log(that.conversationContext);
        that.conversationContext = resp.context;

        cb(null, resp);
      })
    }
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
      (that.spirits + 1)/2,
      that.trust
    ];
    var opinion = that.brain.activate(inputs);
    console.log(inputs);
    console.log(opinion);
    that.spirits = opinion[0];
    that.trust = opinion[1];

    if(that.handleActions(conv_resp.output.text)){
      if(callback != undefined)
        callback();
      return;
    }

    if(that.spirits > 0 && that.trust > .3 && conv_resp.output.text != "I don't know."){
        that.session.send(conv_resp.output.text);
        that.pastConversation.push([message, sentiment, conv_resp]);
    } else {
      var expression = that.getSelfExpression();
      that.session.send(expression);
      that.pastConversation.push([message, sentiment, expression]);
    }

    if(that.trust > 0.9 && that.stage == 1){
      that.stage = 2;
      that.session.send("Ok, here is the passcode to my sensors: XIETSG")
    }

    if(callback != undefined)
      callback();
  });
};

// return true if action was handled, false if not
Anton.prototype.handleActions = function(action){
  var that = this;

  if(action == "Turning on Lights"){
    if(that.trust > .5){
      //turn on lights
      that.turnOnLights();
    } else {
      // don't turn on lights
      that.send("No, I won't do that.  I don't trust you!");
    }
    return true;
  }

  if(action == "Turning off Lights"){
    if(that.trust > .5){
      //turn on lights
      that.turnOffLights();
    } else {
      // don't turn on lights
      that.send("No, I won't do that.  I don't trust you!");
    }
    return true;
  }

  if(action == "Turning on Ventilation System"){
    if(that.trust > .5){
      //turn on Ventilation
      that.turnOnVentilation();
    } else {
      // don't turn on Ventilation
      that.send("No, I won't do that.  I don't trust you!");
    }
    return true;
  }

  if(action == "Turning off Ventilation System"){
    if(that.trust > .5){
      //turn on Ventilation
      that.turnOffVentilation();
    } else {
      // don't turn on Ventilation
      that.send("No, I won't do that.  I don't trust you!");
    }
    return true;
  }
  return false;
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

  // 0 is stressed, 1 is not stressed
  var spirit_factor = (this.spirits + 1)/2;
  var air_factor = (this.ship.ventilation.metrics.airPressure - .57)/(1-.57)

  //stress (0, 60) => (1, 160)
  var stress = 1 - (spirit_factor * air_factor);//[0,1]
  return stress*160 + 40;
};

Anton.prototype.turnOnLights = function(){
  var that = this;

  that.send("I'm going to turn on the lights. Hold on a sec.");
  setTimeout(function(){
    that.ship.turnOnLights();
    that.send("Ok, Lights are on");
    that.session.sendState();
  }, 5000);
};

Anton.prototype.turnOffLights = function(){
  var that = this;

  that.send("I'm going to turn off the lights. Hold on a sec.");
  setTimeout(function(){
    that.ship.turnOffLights();
    that.send("Ok, Lights are off.  It's dark here");
    that.session.sendState();
  }, 5000);
};

Anton.prototype.turnOnVentilation = function(){
  var that = this;

  that.send("I'm going to engage the Ventilation System Lockdown Override. Hold on a sec.");
  setTimeout(function(){
    that.ship.turnOnVentilation();
    that.send("Ok, it is engaged");
    that.session.sendState();
  }, 5000);
};



Anton.prototype.turnOffVentilation = function(){
  var that = this;

  that.send("I'm going to disengage the Ventilation System Lockdown Override. Hold on a sec.");
  setTimeout(function(){
    that.ship.turnOffVentilation();
    that.send("Ok, it's disengaged.");
    that.session.sendState();
  }, 5000);
};

Anton.prototype.send = function(message){
  this.session.send(message);
}

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
