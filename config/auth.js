module.exports = {
	'facebookAuth': {
		'clientID': process.env.FBclientID,
		'clientSecret': process.env.FBclientSecret,
		'callbackURL': process.env.FBcallbackURL
	},

	'googleAuth':{
		'clientID': process.env.GclientID,
		'clientSecret': process.env.GclientSecret,
		'callbackURL': process.env.GcallbackURL
	},

	'imgurAuth': {
		'clientID': process.env.IclientID,
		'clientSecret': process.env.IclientSecret,
		'email': process.env.Iemail,
		'password': process.env.Ipassword,
		'albumID': process.env.IalbumID,
		'oAuthURL': process.env.IoAuthURL,
		'baseURL': process.env.IbaseURL
	},

	'session': {
		'secret': process.env.SessionSecret
	}
};