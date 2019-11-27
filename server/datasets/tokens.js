//Data structure for Notes
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('Token', {
    token: { type: String },
    active: { type: Boolean }
});