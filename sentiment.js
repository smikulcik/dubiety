
var watson = require('watson-developer-cloud');

var credentials = {
  "url": "https://gateway-a.watsonplatform.net/calls",
  "note": "It may take up to 5 minutes for this key to become active",
  "apikey": "5dcb87207ccadf5c10d8ba69f6350b746aad1618"
};
var tonecredentials = {
	"url": "https://gateway.watsonplatform.net/tone-analyzer/api",
	"password": "fe3c4rau8zpM",
	"username": "15c2c53a-0138-4d0a-aa1c-96db9cbc1bc5",
  version: 'v3',
  version_date: '2016-05-19'
};

var AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var alchemy_language = new AlchemyLanguageV1(credentials);

var tone_analyzer = new ToneAnalyzerV3(tonecredentials);

exports.getSentiment = function(text, callback) {
	var params = {
	  text: text
	};
	alchemy_language.sentiment(params, function (err, response) {
		if (err){
			if(callback !== undefined)
				callback(err, null);
			else
				console.log("I have no errback" + errback);
		}else{
			if(callback !== undefined){
        if(response.docSentiment.hasOwnProperty("score")){
    				callback(null, parseFloat(response.docSentiment.score));
        } else {
          callback(null, 0.00);
        }
      }
			else
				console.log("I have no callback!! " + callback);
		}
	});
};

exports.getTone = function(text, callback) {
	var params = {
	  text: text
	};
	tone_analyzer.tone(params, function (err, response) {
		if (err){
			if(callback !== undefined)
				callback(err, null);
			else
				console.log("I have no errback" + errback);
		}else{
			if(callback !== undefined){
        var tones = {};
        for(var category_id in response.document_tone.tone_categories){
          for(var tone_id in response.document_tone.tone_categories[category_id].tones){
            var tone = response.document_tone.tone_categories[category_id].tones[tone_id];
            tones[tone.tone_id] = tone.score;
          }
        }
				callback(null, {
          "anger" : tones['anger'],
          "disgust" : tones['disgust'],
          "fear" : tones['fear'],
          "joy" : tones['joy'],
          "sadness" : tones['sadness'],
          "confident" : tones['confident']
        });
      }
			else
				console.log("I have no callback!! " + callback);
		}
	});
};
