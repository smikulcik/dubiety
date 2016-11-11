var Ship = function(){
  this.lights = {
    'state': 'on',
    'status': 'ok', //ok, failing
    'action': 'None'
  };
  this.ventilation = {
    'state': "Air Leak Detected",
    "status": "failing",
    "action": "Engage the Ventilation System Lockdown Override"
  };
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
