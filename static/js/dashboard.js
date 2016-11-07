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

    var updateState = function(){
      if(state === UNAUTHENTICATED){
        loginPrompt.show();
        dashboardDisplay.hide();
      }
      if(state === AUTHENTICATED){
        loginPrompt.hide();
        dashboardDisplay.show();
      }
    };
    updateState();

		connectButton.click(function(event){
			event.preventDefault();
      if(passcodeInput.val().trim() === passcode || true){
        state = AUTHENTICATED;
        updateState();
      }
		});

		$.fn.Dashboardify.update = function(state){
		};
	};

}(jQuery));
