var Ship = function(){
  this.lights = {
    'state': 'on',
    'status': 'ok', //ok, failing
    'action': 'None'
  };
  this.ventilation = {
    'state': "Normal",
    "status": "ok",
    "action": "None",
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
      this.ventilation.metrics["airPressure"] += (1-this.ventilation.metrics["airPressure"])*.05;
  }
};

Ship.prototype.turnOffLights = function(){
  this.lights.state = 'off';
};

Ship.prototype.turnOnLights = function(){
  this.lights.state = 'on';
};

Ship.prototype.turnOnVentilation = function(){
  this.ventilation.state = 'System Lockdown Engaged';
  this.ventilation.status = 'ok';
  this.ventilation.action = 'Maintenence required.  Return to Earth for assistance.';
};

Ship.prototype.turnOffVentilation = function(){
  this.ventilation.state = 'Air Leak Detected';
  this.ventilation.status = 'failing';
  this.ventilation.action = 'Engage the Ventilation System Lockdown Override';
};

Ship.prototype.toJSON = function(){
  return {
    "lights": this.lights,
    "ventilation": this.ventilation
  };
};

exports.Ship = Ship;
