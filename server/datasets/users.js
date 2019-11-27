//Data structure for Notes
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('User', {
    name: { type: String },
    email: { type: String },
    image: { type: String },
    password: { type: String },
    joined: { type: String }
});