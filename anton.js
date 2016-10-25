
var Anton = function(session){
	this.name = 'Anton';
	this.session = session;

  session.send("Help! I've lost communication with my ground control!!")
};
Anton.prototype.handleMessage = function(message){
	this.session.send(message.toUpperCase());
};

exports.Anton = Anton;
