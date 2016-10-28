var conversation = require('./conversation.js');

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

  this.spirits = .7;

  session.send("Help! I've lost communication with my ground control!!");
};
Anton.prototype.handleMessage = function(message){
  var that = this;
  conversation.message(message, this.conversationContext, function(response){
    that.conversationContext = response.context;
    if(response.output.text == "I don't know.")
      that.expressSelf();
    else
      that.session.send(response.output.text);
  })
};

Anton.prototype.expressSelf = function(){
  if(this.spirits > .75)
    this.session.send(randElement(thankyous));
  else if(this.spirits > .25){
    this.session.send(randElement(meh));
  } else {
      this.session.send(randElement(angry));
  }
};

exports.Anton = Anton;
