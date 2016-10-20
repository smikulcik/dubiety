(function($){

	$.fn.Chat = function(username) {
		this.append("<div class='history'></div>");
		this.append("<form><input /><button type=submit>Send</button></form>");

		var input = this.find('input');
		var button = this.find('button');
		var chathist = this.find('.history');

		button.click(function(event){
			event.preventDefault();
			var message = input.val();
			chathist.append('<div class=\'me\'><div class=\'username\'>' + 
				username + '</div>' + message + '</div>');
			input.val("");
		});

		$.fn.Chat.receiveMsg = function(message, sender){
			chathist.append('<div class=\'other\'><div class=\'username\'>' + 
				sender + '</div><div class=message>' + message + '</div></div>');
		};
	};

}(jQuery));

