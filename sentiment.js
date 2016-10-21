
var watson = require('watson-developer-cloud');

var credentials = {
  "url": "https://gateway-a.watsonplatform.net/calls",
  "note": "It may take up to 5 minutes for this key to become active",
  "apikey": "5dcb87207ccadf5c10d8ba69f6350b746aad1618"
};
var tonecredentials = {
	"url": "https://gateway.watsonplatform.net/tone-analyzer/api",
	"password": "fe3c4rau8zpM",
	"username": "15c2c53a-0138-4d0a-aa1c-96db9cbc1bc5"
};

var AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var alchemy_language = new AlchemyLanguageV1(credentials);

//var tone_analyzer = new ToneAnalyzerV3(tonecredentials);

exports.getSentiment = function(text, callback, errback) {
	var params = {
	  text: text
	};
	alchemy_language.sentiment(params, function (err, response) {
		if (err){
			if(errback !== undefined)
				errback(err);
			else
				console.log("I have no errback" + errback);
		}else{
			if(callback !== undefined)
				callback(response);
			else
				console.log("I have no callback!! " + callback);
		}
	});
};
/*
exports.getTone = function(text, callback, errback) {
	var params = {
	  text: text
	};
	tone_analyzer.tone(params, function (err, response) {
		if (err){
			if(errback !== undefined)
				errback(err);
			else
				console.log("I have no errback" + errback);
		}else{
			if(callback !== undefined)
				callback(response);
			else
				console.log("I have no callback!! " + callback);
		}
	});
};*/
