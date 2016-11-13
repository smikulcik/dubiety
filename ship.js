var Ship = function(){
  this.lights = {
    'state': 'on',
    'status': 'ok', //ok, failing
    'action': 'None'
  };
  this.ventilation = {
    'state': "Air Leak Detected",
    "status": "failing",
    "action": "Engage the Ventilation System Lockdown Override",
    "metrics": {
      "airPressure": 1, //air pressure in atm
    }
  };
};

Ship.prototype.update = function(){
  // change air pressure based on air leak
  if(this.ventilation.status == "failing"){
    this.ventilation.metrics["airPressure"] *= .995;
  }else{
      this.ventilation.metrics["airPressure"] += (1-this.ventilation.metrics["airPressure"])*.95;
  }
};

Ship.prototype.turnOffLights = function(){
  this.lights.state = 'off';
};

Ship.prototype.turnOnLights = function(){
  this.lights.state = 'on';
};

Ship.prototype.toJSON = function(){
  return {
    "lights": this.lights,
    "ventilation": this.ventilation
  };
};

exports.Ship = Ship;
