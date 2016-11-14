
var anton = require("./anton.js");
var ship = require("./ship.js");

var Session = function(token, ws){
  this.token = token;
  this.ws = ws;
  this.ship = new ship.Ship(this);
  this.anton = new anton.Anton(this, this.ship);

  this.startTime = undefined;

  this.updateLoop = 0;
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
        clearInterval(this.updateLoop);
      }
		}, 30000); //wait to see if reconnecting in 30 seconds works
	});

  clearInterval(this.updateLoop);
  this.updateLoop = setInterval(function(){that.update()}, 1000);
};

Session.prototype.setStartTime = function(time){
  this.startTime = time;
}

Session.prototype.update = function(){
  this.ship.update();
  this.anton.update();
  this.sendState();
};

Session.prototype.send = function(message, errback){
  var that = this;
  if(this.ws.readyState !== 1)
    return;
  this.ws.send(JSON.stringify({
    'token': this.token,
    'msg': message,
    'state': that.getState()
  }));
};

Session.prototype.sendState = function(errback){
  if(this.ws.readyState !== 1)
    return;
  this.ws.send(JSON.stringify({
    'token': this.token,
    'state': this.getState()
  }));
};

Session.prototype.getState = function(){
  return {
    'anton': this.anton,
    'ship': this.ship,
    'game': {
      'isOver': this.isGameOver(),
      'state': this.getGameState()
    }
  };
};

Session.prototype.isGameOver = function(){
  //if you are dead, the game is over
  if(this.anton && !this.anton.isAlive){
    console.log("anton died");
    return true;
  }
  //if you are alive after 3 minutes, help comes to save anton
  if(this.ship.areAllSystemsGo() && (new Date()) - this.startTime > 3*60*1000){
    console.log("Help came and all system go");
    return true;
  }
  return false;
};

Session.prototype.getGameState = function(){
    if(this.anton && this.anton.isAlive){
      return true;
    return false;
    }
};

Session.prototype.toJSON = function(){
  return {
    "token": this.token,
    "ws" : {
      "state" : this.ws.readyState
    },
    "anton" : this.anton,
    "startTime": this.startTime
  }
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
exports.getSessions = function(){
  return sessions;
};
