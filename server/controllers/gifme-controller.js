//Require the datasets
var GifMeUser = require('../datasets/gifmeusers');
var request = require('request');
var slackUrl = "https://hooks.slack.com/services/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";

module.exports.appUsed = (req, res) => {
    var data = {
        text: ":parrotdad:"
    };
    data = JSON.stringify(data);
    request.post({url:slackUrl,form:data},function (err, result, body) {
        if(err) {
          res.status(500).json({error:err}); 
        } else {
          res.status(200).json({msg:result}); 
        }
    });
}