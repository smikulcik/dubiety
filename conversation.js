var watson = require('watson-developer-cloud');

var conversation = watson.conversation({
  "url": "https://gateway.watsonplatform.net/conversation/api",
  "password": "AuekwHMbmeFt",
  "username": "f2ff9936-b675-41d1-bcba-5e377d8da5e7",
  version: 'v1',
  version_date: '2016-09-20'
});

exports.message = function(input, context, cbFunc){

  conversation.message({
    workspace_id: 'cb2920fb-1719-41e1-99a8-96691233d004',
    input: {'text': input},
    context: context
  },  function(err, response) {
    if (err)
      console.log('error:', err);
    else if(cbFunc !== undefined)
      cbFunc(response);
  });
};
