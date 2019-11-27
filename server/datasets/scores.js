//Data structure for Notes
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('Score', {
    name: { type: String },
    score: { type: Number },
    timeStamp: { type: String }
});