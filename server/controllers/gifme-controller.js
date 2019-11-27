//Require the datasets
var GifMeUser = require('../datasets/gifmeusers');
var request = require('request');
var slackUrl = "https://hooks.slack.com/services/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";

module.exports.updateUsers = function(req, res){
    GifMeUser.find({uuid:req.body.uuid}, function(err, users){
        if(err){
            console.log(err);
        }
        if(!users.length){
            var joinedDate = new Date();
            var newUser = new GifMeUser(req.body);
            newUser.joinedDate = joinedDate;
            newUser.save(function(err, success){
                if(err){
                    console.log(err);
                    return;
                }
                GifMeUser.count({}, function(err, count){
                    if(err){
                        console.log(err);
                        return;
                    }
                    var payload = {
                        text: "Eyyy new user :parrotdad: There are now " + count + " users"
                    };
                    payload = JSON.stringify(payload);
                    request.post({url:slackUrl,form:payload},function (err, result, body) {
                        if(err) {
                          return err;
                        } 
                    }); 
                });
            });
        } else {
            // Usage tracking
            var data = {
                text: ":parrotwave1: :parrotwave2: :parrotwave3: :parrotwave4: :parrotwave5: :parrotwave6: :parrotwave7: "
            };
            data = JSON.stringify(data);
            request.post({url:slackUrl,form:data},function (err, result, body) {
                if(err) {
                  return err;
                } 
            }); 
        }
        res.status(200);
    });
};