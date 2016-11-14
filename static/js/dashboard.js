(function($){

  var UNAUTHENTICATED = 0;
  var AUTHENTICATED = 1;
  var passcode = "XIETSG"

	$.fn.Dashboardify = function() {

    var state = UNAUTHENTICATED;
    var isActive = true;
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
      }

      if(status !== undefined){
        if(status.hasOwnProperty('anton')){
          if(status.anton.hasOwnProperty('heartRate')){
            heartRate = status.anton.heartRate;
            dashboardDisplay.find('.heartRate').text(Math.floor(heartRate*100)/100);
          }
        }
        if(status.hasOwnProperty('ship')){
          for(var ss_id in status.ship){
            var subsystem = status.ship[ss_id];
            dashboardDisplay.find("." + ss_id).find('.state').text(subsystem.state);
            dashboardDisplay.find("." + ss_id).find('.state').removeClass('ok failing');
            dashboardDisplay.find("." + ss_id).find('.state').addClass(subsystem.status);
            dashboardDisplay.find("." + ss_id).find('.action').text(subsystem.action);

            for(var metric in subsystem.metrics){
              var m_val = Math.round(subsystem.metrics[metric]*1000)/1000;
              dashboardDisplay.find("." + ss_id).find('.' + metric).text(m_val);
            }
          }
        }
      }
    };
    updateState();

		connectButton.click(function(event){
			event.preventDefault();
      if(passcodeInput.val().trim().toUpperCase() === passcode){
        state = AUTHENTICATED;
        updateState();
      }
		});

		$.fn.Dashboardify.update = function(state){
      updateState(state);
		};

    $.fn.Dashboardify.disable = function(){
      isActive = false;
    };

    var heartSound = new Audio("../sounds/heartMon.wav");
    var flatlineSound = new Audio("../sounds/flatlineSound.wav");
    flatlineSound.loop = true;
    var isMuted = true;
    var playHeartSound = function(){
      if(!isMuted && state === AUTHENTICATED && isActive){
        heartSound.play();
        $('.heartRate').animate({"opacity": '1'},180)
          .animate({"opacity": '.7'}, 100);
        if(heartRate === 0)
          flatlineSound.play();
      }
      if(heartRate !== 0)
        setTimeout(playHeartSound, 1000*60.0/heartRate);
    };
    playHeartSound();

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
