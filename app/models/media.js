// app/models/media.js

// load dependencies
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var mediaSchema = mongoose.Schema({
	//_id: Number, // unique post id, automatically created
	created: {type: Date, default: Date.now()}, // date and time posted
	location: [String], // location of photo or video file
	user: String, // ID of user who posted it
	description: String,
	public: {type: Boolean, default: false}, // All posts are public within community, 
					// but optionally visible to
					// visitors who aren't logged in
	tags: [String], // tag photo with different subjects
	likes: [String], // array of user IDs, for users who liked post
	link: String,
	video: {type: Boolean, default: false}, // true for video files. False for photos.
	deleteHash: String
	// thumbnail: String // separate link not needed, because of imgur's system. Add 't' or 'm'
		// to main link for small and medium thumbnails respectively
	// comments: [String] // Comments will now be searched out dynamically, instead of stored here
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = {Media};