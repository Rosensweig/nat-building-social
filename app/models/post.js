// app/models/post.js

// load dependencies
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var postSchema = mongoose.Schema({
	//_id: Number, // unique post id, automatically created
	created: {type: Date, default: Date.now()}, // date and time posted
	title: String,
	content: String,
	media: [String], // IDs to retrieve photos and videos
	author: String, // ID of user who posted it
	public: {type: Boolean, default: false}, // All posts are public within community, 
					// but optionally visible to
					// visitors who aren't logged in
					// defaults to "no"
	tags: [String], // tag photo with different subjects
	likes: [String], // array of user IDs, for users who liked post
	// comments: [String] // Comments will now be searched out dynamically, instead of stored here
});

const Post = mongoose.model('Post', postSchema);

module.exports = {Post};