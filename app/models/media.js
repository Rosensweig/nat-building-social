// app/models/media.js

// load dependencies
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var mediaSchema = mongoose.Schema({
	//_id: Number, // unique post id, automatically created
	created: {type: Date, default: Date.now()}, // date and time posted
	location: [String], // location of photo or video file
	user: String, // ID of user who posted it
	public: {type: Boolean, default: false}, // All posts are public within community, 
					// but optionally visible to
					// visitors who aren't logged in
	tags: [String], // tag photo with different subjects
	likes: [String], // array of user IDs, for users who liked post
	video: Boolean, // true for video files. False for photos.
	thumbnail: String //
	// comments: [String] // Comments will now be searched out dynamically, instead of stored here
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = {Media};