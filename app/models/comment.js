// app/models/comment.js

// load dependencies
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var commentSchema = mongoose.Schema({
	//_id: String, unique comment ID mongoose creates for us
	comment: String,
	created: {type: Date, default: Date.now()},
	postID: String,
	authorID: String,
	parentID: {type: String, default: null} //not yet implemented. Will be parent comment, not parent post, when you can reply to a specific comment.
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = {Comment};