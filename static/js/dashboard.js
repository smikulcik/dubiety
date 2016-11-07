(function($){

  var UNAUTHENTICATED = 0;
  var AUTHENTICATED = 1;
  var passcode = "XIETSG"

	$.fn.Dashboardify = function(username, onchatinput) {

    var state = UNAUTHENTICATED;
    var connectButton = $('.connectBtn');
    var passcodeInput = $('.passcodeInput');
    var loginPrompt = $('.loginPrompt');
    var dashboardDisplay = $('.dashboardDisplay');


    var heartRate = 60;

    var updateState = function(status){
      if(state === UNAUTHENTICATED){
        loginPrompt.show();
        dashboardDisplay.hide();
      }
      if(state === AUTHENTICATED){
        loginPrompt.hide();
        dashboardDisplay.show();
        playHeartSound();
      }

      if(status !== undefined){
        if(status.hasOwnProperty('anton')){
          if(status.anton.hasOwnProperty('heartRate')){
            heartRate = status.anton.heartRate;
            dashboardDisplay.find('.heartRate').text(Math.floor(heartRate*100)/100);
          }
        }
        if(status.hasOwnProperty('ship')){
          if(status.ship.hasOwnProperty('ventilation')){
            console.log("updating ventilation");
            console.log(status.ship.ventilation);
            dashboardDisplay.find('.ventilation .status').text(status.ship.ventilation.status);
            dashboardDisplay.find('.ventilation .status').removeClass('ok failing');
            dashboardDisplay.find('.ventilation .status').addClass(status.ship.ventilation.state);
            dashboardDisplay.find('.ventilation .action').text(status.ship.ventilation.action);
          }
        }
      }
    };
    updateState();

		connectButton.click(function(event){
			event.preventDefault();
      if(passcodeInput.val().trim() === passcode){
        state = AUTHENTICATED;
        updateState();
      }
		});

		$.fn.Dashboardify.update = function(state){
      updateState(state);
		};

    var heartSound = new Audio("../sounds/heartMon.wav");
    var flatlineSound = new Audio("../sounds/flatlineSound.wav");
    flatlineSound.loop = true;
    var isMuted = false;
    var playHeartSound = function(){
      if(!isMuted){
        heartSound.play();
        $('.heartRate').animate({"opacity": '1'},180)
          .animate({"opacity": '.7'}, 100);
        if(heartRate === 0)
          flatlineSound.play();
      }
      if(heartRate !== 0)
        setTimeout(playHeartSound, 1000*60.0/heartRate - 180);
    };
    $(window).blur(function(){
      isMuted = true;
      //heartSound.pause();
      if(heartRate === 0)
        flatlineSound.pause();
    });
    $(window).focus(function(){
      isMuted = false;
      if(heartRate === 0)
        flatlineSound.play();
    });
	};

}(jQuery));
