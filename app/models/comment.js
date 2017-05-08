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
	parentID: {type: String, default: null}
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = {Comment};