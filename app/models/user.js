// app/models/user.js

// load dependencies
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//define the schema for the user model
var userSchema = mongoose.Schema({
	local : {
		name: String,
		email : String,
		password : String,
		imageID: String,
		imageURL: {type:String, default: "/images/userIcon.png"},
		description: {type: String, default: "No description yet."}
	},
	facebook : {
		id : String,
		token : String,
		email : String,
		name : String
	},
	twitter : {
		id : String,
		token : String,
		displayName : String,
		username : String
	},
	google : {
		id : String,
		token : String,
		email : String,
		name : String
	}

});

userSchema.virtual("name").get(function(){
	if (this.local.name) {
		return this.local.name;
	} else if (this.google.name) {
		return this.google.name;
	} else if (this.facebook.name) {
		return this.facebook.name;
	} else return "No name yet"
});

userSchema.virtual("description").get(function(){
	if (this.local.description) {
		return this.local.description;
	} else return "This user has not written a description yet."
});

userSchema.virtual("description").set(function(description){
	this.local.description= description;
})

userSchema.virtual("imageURL").get(function(){
	return this.local.imageURL;
});

userSchema.virtual("imageID").get(function(){
	if (this.local.imageID) {
		return this.local.imageID;
	} else return undefined;
})

// methods ----------------------------
// generating a hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to the app
module.exports = mongoose.model('User', userSchema);