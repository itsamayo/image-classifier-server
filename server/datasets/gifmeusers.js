//Data structure for Gif Users
var mongoose = require('mongoose');
module.exports = mongoose.model('GifMeUser', {
    uuid: { type: String },
    joinedDate: { type: String }
});