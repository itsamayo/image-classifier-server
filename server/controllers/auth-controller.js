//Require the datasets
var User = require('../datasets/users');
var _ = require('underscore');
var request = require('request');
var crypto = require('crypto');
    
//Signin
module.exports.signup = function(req, res){
  var user = new User(req.body);
  user.joined = Date.now();
  var hash = crypto.createHmac('sha256', req.body.password)
    .update('you shall not pass')
    .digest('hex');
  user.password = hash;
  user.save(function(err,success){
      if(err){
          res.status(500).json(err);
          return;
      } 
      return res.status(200).json(user);
  });
};

//Signin
module.exports.signin = function(req, res){
  var email = req.body.email;
  var password = crypto.createHmac('sha256', req.body.password)
    .update('you shall not pass')
    .digest('hex');
  User.find({email:email,password:password},function(err, userRes){
      if(err){
          res.status(500).json(err);
          return;
      } else if(!userRes.length){
          res.status(400);
          return;
      }
      var user = userRes[0];
      return res.status(200).json(user);
  });
};

