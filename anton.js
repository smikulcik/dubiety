var conversation = require('./conversation.js');

var Anton = function(session){
	this.name = 'Anton';
	this.session = session;
  this.conversationContext = {};

  session.send("Help! I've lost communication with my ground control!!");
};
Anton.prototype.handleMessage = function(message){
  var that = this;
  conversation.message(message, this.conversationContext, function(response){
    that.conversationContext = response.context;
    that.session.send(response.output.text);
  })
};

exports.Anton = Anton;
