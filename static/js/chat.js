(function($){

	var scrollToBottom = function(el){
		el.get(0).scrollTop = el.get(0).scrollHeight;
	}

	$.fn.Chat = function(username, onchatinput) {
		this.append("<div class='history'></div>");
		this.append("<form><input /><button type=submit>Send</button></form>");

		var input = this.find('input');
		var button = this.find('button');
		var history = this.find('.history');

		button.click(function(event){
			event.preventDefault();
			var message = input.val();
			history.append('<div class=\'me\'><div class=\'username\'>' +
				username + '</div>' + message + '</div>');
			input.val("");
			scrollToBottom(history);
			if(onchatinput !== undefined && typeof(onchatinput) === 'function')
				onchatinput(message);
		});

		$.fn.Chat.receiveMsg = function(message, sender){
			history.append('<div class=\'other\'><div class=\'username\'>' +
				sender + '</div><div class=message>' + message + '</div></div>');

			scrollToBottom(history);
		};
	};

}(jQuery));
