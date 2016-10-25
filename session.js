
var anton = require("./anton.js");

var Session = function(token, ws){
  this.token = token;
  this.ws = ws;
  this.anton = new anton.Anton(this);
};

// connect a session to a new websocket
Session.prototype.connect = function(ws) {
  var that = this;
  this.ws = ws;
  anton.ws = ws;

  // configure self cleanup
	this.ws.on('close', function(){
    console.log("Connection closed, cleaning up in 30 seconds if not reconnected " + that.token);
		setTimeout(function(){
      if(that.ws.readyState !== 1){
        console.log("Deleting " + that.token);
        delete sessions[that.token];
      }
		}, 30000); //wait to see if reconnecting in 30 seconds works
	});
}

Session.prototype.send = function(message, errback){
  this.ws.send(JSON.stringify({'token': this.token, 'msg': message}));
};

var nextToken = 1;
var sessions = {};

exports.getToken = function(){
  var token = nextToken;
  nextToken++;
  return token;
};

// session factory
exports.getSession = function(token, ws){
  if(sessions.hasOwnProperty(token)){
    return sessions[token];
  } else {
    var s = new Session(token, ws);
    sessions[token] = s;
    return s;
  }
};
