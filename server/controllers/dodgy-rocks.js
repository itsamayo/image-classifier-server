//Require the datasets
var Score = require('../datasets/scores');
var Token = require('../datasets/tokens');
var request = require('request');
var cron = require('cron').CronJob;
var slackUrl = "https://hooks.slack.com/services/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";

//Slack notification for new highscores
function postHSToSlack(name,score){
    if(name == ""){
        name = ":trollface:";
    }
    Score.find({name:{$ne:""}},function(err,data){
        if(err){
           return; 
        }
        var scores = data;
        if(score > scores[5].score){
            var payload = {
                text: "new highscore of " + score + " set by " + name + " :rage3: that’s a new top 5 score"
            };
            payload = JSON.stringify(payload);
            request.post({url:slackUrl,form:payload},function (err, result, body) {
                if(err) {
                  return err;
                }
            });
            newHSPush();
        } else if (score > scores[10].score){
            var payload3 = {
                text: "new highscore of " + score + " set by " + name + " :rage1: that’s a new top 10 score"
            };
            payload3 = JSON.stringify(payload3);
            request.post({url:slackUrl,form:payload3},function (err, result, body) {
                if(err) {
                  return err;
                }
            });
        } else {
            var payload2 = {
                text: "new highscore of " + score + " set by " + name
            };
            payload2 = JSON.stringify(payload2);
            request.post({url:slackUrl,form:payload2},function (err, result, body) {
                if(err) {
                  return err;
                }
            });
        }
    }).sort({score:-1}).limit(11);
}

//Push for new top 5 high score
function newHSPush(){
    Token.find({active:true},function(err, tokens){
        if(err){
            console.log("error sending push: " + err);
        }
        tokens.forEach(function(token){
            var deviceId = token.token;
            request({
                url: 'https://fcm.googleapis.com/fcm/send',
                method: 'POST',
                headers: {
                  'Content-Type' :' application/json',
                  'Authorization': 'key=AAAAvgNP5qs:APA91bGH4M8P-9o0JlOgD8bg7ejFGtTeKf8W7O-Hnh1PsGBrD95mnxSnnMey0kStEEvVxfbUgDw18zi_P7-T4kk5O7pLAB1Tjb0iUQx0S7d_Xffdp_mWIVLdVqAD7WNwUdBq2bHa0EDu'
                },
                body: JSON.stringify(
                  { "notification": {
                      "title": "New Challenger",
                      "text": "Someone just made their way into the top 5"
                    },
                    "to" : deviceId
                  }
                )
                }, function(error, response, body) {
                if (error) { 
                  console.error(error, response, body); 
                }
                else if (response.statusCode >= 400) { 
                  console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage+'\n'+body); 
                }
                else {
                  console.log('Done! Sent notification to ' + deviceId);
                }
            });     
        });
        console.log('Done! Sent notifications to ' + tokens.length + ' device/s');
    });
}

//Score count update to Slack
function postScoreCountToSlack(){
    Score.find({name:{$ne:""}},function(err,data){
        if(err){
           return; 
        }
        var count = data.length;
        var payload = {
            text: "There are now " + count + " real scores on the leaderboard :finnadie:"
        };
        payload = JSON.stringify(payload);
        request.post({url:slackUrl,form:payload},function (err, result, body) {
            if(err) {
              return err;
            } 
        });
    });
}

//Slack webhook test
module.exports.slackTest = function(req, res){
    postToSlack(250);
    res.status(200).json("Okay");
}

//Save a new highscore to the leaderboard
module.exports.createScore = function(req, res){
  var name = req.body.name.toLowerCase();
  var newScore = new Score(req.body);
  var timeStamp = Date.now();
  newScore.name = name;
  newScore.timeStamp = timeStamp;
  if(newScore.name.length > 8){
      newScore.name = name.slice(0, 8) + "..";
  }
  newScore.save(function(err,success){
      if(err){
          res.status(500).json(err);
          return;
      } 
      postHSToSlack(req.body.name.toLowerCase(), req.body.score);
      return res.status(200).json(newScore);
  });
};

//Get the scores and players current position
module.exports.getScores = function(req, res){
    console.log(req.url);
    var usersBest = req.url.slice(32);
    Score.find({name:{$ne:""}},function(err,data){
        if(err){
           res.status(500).json(err);
           return; 
        }
        var scores = data;
        if(scores.findIndex(x => x.score==Number(usersBest))>=5){
            var usersPos = scores.findIndex(x => x.score==Number(usersBest)) + 1;
            var obj = {
                name: "userPosition",
                score: usersPos
            }
            scores.splice(0, 0, obj);
            console.log('sent scores with user position as ' + usersPos);
            return res.status(200).json({"Items":scores});
        } else {
             var obj2 = {
                name: "userPosition",
                score: -1
            }
            scores.splice(0, 0, obj2);
            console.log('sent scores with user position as ' + -1);
            return res.status(200).json({"Items":scores});
        }
    }).sort({score:-1});
};

//Get the firebase token for users on app start
module.exports.updateFirebaseToken = function(req, res){
    Token.find({token:req.body.token},function(err, tokens){
        if(err){
            return res.status(500).json(err);
        } else if(!tokens.length){
            var newToken = new Token(req.body);
            newToken.active = true;
            newToken.save(function(err,success){
                if(err){
                    res.status(500).json(err);
                }
                console.log("new token added to DB");
                return res.status(200).json(newToken);
            });
        } else {
            var usersToken = tokens[0];
            usersToken.active = true;
            usersToken.save();
            console.log('users already has a token');
        }
    });
};

//Custom push sending to all users
module.exports.sendCustomPushToAll = function(req, res) {
    var title = req.body.title;
    var message = req.body.message;
    Token.find({active:true},function(err, tokens){
        if(err){
            return res.status(500).json("error sending push");
        }
        tokens.forEach(function(token){
            var deviceId = token.token;
            request({
                url: 'https://fcm.googleapis.com/fcm/send',
                method: 'POST',
                headers: {
                  'Content-Type' :' application/json',
                  'Authorization': 'key=AAAAvgNP5qs:APA91bGH4M8P-9o0JlOgD8bg7ejFGtTeKf8W7O-Hnh1PsGBrD95mnxSnnMey0kStEEvVxfbUgDw18zi_P7-T4kk5O7pLAB1Tjb0iUQx0S7d_Xffdp_mWIVLdVqAD7WNwUdBq2bHa0EDu'
                },
                body: JSON.stringify(
                  { "notification": {
                      "title": title,
                      "text": message
                    },
                    "to" : deviceId
                  }
                )
                }, function(error, response, body) {
                if (error) { 
                  console.error(error, response, body); 
                }
                else if (response.statusCode >= 400) { 
                  console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage+'\n'+body); 
                }
                else {
                  console.log('Done! Sent notification to ' + deviceId);
                }
            });     
        });
        res.status(200).json('Done! Sent notifications to ' + tokens.length + ' device/s');
    });
};

//Send score count updates
// var eightamscores = new cron('1 6 * * *', function(callback) {
//   postScoreCountToSlack();
//   }, function () {
//     console.log('Sent scores to Slack');
//   },
//   true /* Start the job right now */
// );

// //Send score count updates
// var twelvepmscores = new cron('1 10 * * *', function(callback) {
//   postScoreCountToSlack();
//   }, function () {
//     console.log('Sent scores to Slack');
//   },
//   true /* Start the job right now */
// );

// //Send score count updates
// var fivepmscores = new cron('1 15 * * *', function(callback) {
//   postScoreCountToSlack();
//   }, function () {
//     console.log('Sent scores to Slack');
//   },
//   true /* Start the job right now */
// );