const {Post} = require('./models/post.js');
const {Media} = require('./models/media.js');
const {Comment} = require('./models/comment.js');
const User = require('./models/user.js');

const fileSystem = require('fs');
const async = require('async');
const imgur = require('../config/imgur.js');

imgur.setup();

module.exports = function(app, passport, auth, upload) {


// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// POST SECTION =========================
	app.get('/post', isLoggedIn, function(req, res) {
		res.render('post.ejs', {
			user : req.user
		});
	});


	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/feed', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('loginMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/feed', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/feed',
				failureRedirect : '/'
			}));

	// // twitter --------------------------------

	// 	// send to twitter to do the authentication
	// 	app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

	// 	// handle the callback after twitter has authenticated the user
	// 	app.get('/auth/twitter/callback',
	// 		passport.authenticate('twitter', {
	// 			successRedirect : '/profile',
	// 			failureRedirect : '/'
	// 		}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : '/feed',
				failureRedirect : '/'
			}));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/feed', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/feed',
				failureRedirect : '/'
			}));

	// // twitter --------------------------------

	// 	// send to twitter to do the authentication
	// 	app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

	// 	// handle the callback after twitter has authorized the user
	// 	app.get('/connect/twitter/callback',
	// 		passport.authorize('twitter', {
	// 			successRedirect : '/profile',
	// 			failureRedirect : '/'
	// 		}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

		// the callback after google has authorized the user
		app.get('/connect/google/callback',
			passport.authorize('google', {
				successRedirect : '/feed',
				failureRedirect : '/'
			}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// twitter --------------------------------
	app.get('/unlink/twitter', function(req, res) {
		var user           = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// google ---------------------------------
	app.get('/unlink/google', function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

/////////////////////////////////////////////////////////////
/////// CRUD Operations /////////////////////////////////////
/////////////////////////////////////////////////////////////


// POST
	app.post('/post', isLoggedIn, (req, res) => {

		upload(req,res,function(err) {
		    if(err) {
		        return res.end("Error uploading file.");
		    }

		    var count = 0;
		    var numFiles = req.files.length;
		    req.body.media = [];

	    	for (var i=0; i<req.files.length; i++) {
	    		doUpload(i);
	    	}


		    function doUpload(i){
		    	imgur.uploadFile(req.files[i].path,auth.imgurAuth.albumID)
		    		.then(function(json){
		    			var json = JSON.parse(json.raw_body);
		    			req.body.media.push(formMedia(json));
		    			fileSystem.unlink(req.files[i].path, (err) => {
		    				if (err) {
		    					console.log(err);
		    				}
		    			});
		    			checkComplete();
		    			return i;
		    		})
		    		.catch(function(err){
		    			console.error('---imgur error---', err.message);
		    		});
		    }

		    function formMedia(json){
		    	var mediaData = {
		    		user: req.user._id,
		    		link: json.data.link,
		    		width: json.data.width,
		    		height: json.data.height,
		    		deleteHash: json.data.deletehash,
		    		imgID: json.data.id,
		    		ext: json.data.link.split(".").pop()
		    	};
		    	var id = "";

		    	var media = new Media(mediaData);
		    	media.save();
		    	return {id: media._id, imgID: media.imgID, ext: media.ext};
		    }

		    function checkComplete(){
		    	count++;
		    	if(count==numFiles){
	    		    const requiredFields = ['title', 'content'];
	    		    for (let i=0; i<requiredFields.length; i++) {
	    		    	const field = requiredFields[i];
	    		    	if (!(field in req.body)) {
	    		    		const message = `Missing \`${field}\` in request body`;
	    		    		console.error(message);
	    		    		return res.status(400).send(message);
	    		    	}
	    		    }
	    		    Post
	    		    .create({
	    				title: req.body.title,
	    				content: req.body.content,
	    				author: req.user._id,
	    				media: req.body.media
	    		    })
	    		    .then(newPost => {
	    		    	console.log(newPost);
	    		    	var users={};
	    		    	users[req.user._id]=req.user.name;
	    		    	var comments={};
	    		    	comments[newPost._id] = [];
	    		    	res.render('singlePost.ejs', {
	    		    		feed: [newPost],
	    		    		user: req.user,
	    		    		comments: comments,
	    		    		users: users
	    		    	});
	    		    })
	    		    .catch(err => {
	    		        console.error(err);
	    		        res.status(500).json({error:'Something went wrong'});
	    		    });
		    	}
		    }
		}); //ends multer upload
	}); //ends POST /post



	app.post('/comment', isLoggedIn, (req, res) => {
		// console.log('Request body---',req.body);
		// console.log('Full request---', req);
		Comment
	    .create({
			comment: req.body.comment,
			authorID: req.user._id,
			postID: req.body.postID
	    })
	    .then(comment => {
	    	// console.log("Comment successfully posted: \n"+comment);
	    	res.status(200).json(comment);
	    })
	    // .then(post => {
	    // 	console.log("Found post: "+post);
	    // 	res.render('singlePost.ejs', {
	    // 		feed: [post]
	    // 	});
	    // })
	    .catch(err => {
	        console.error(err);
	        res.status(500).json({error: 'Something went wrong'});
	    });

	}); //ends POST /feed



	// GET

	// get a feed of posts
	app.get('/feed/:perPage/:page', isLoggedIn, (req, res) => {
		var posts = [];
		var postIDs = [];
		var comments = {};
		var userIDs= [];
		var users= {};
		var count;
		Post.count({}, function(err, c) {
			if (err) {
				console.log("-----Database error, counting posts-----", err);
				res.status(500).json(err);
			}
			count=c;
		});
		Post.find().sort("-created").skip(req.params.perPage*(req.params.page-1)).limit(parseInt(req.params.perPage)).exec()
		.then((postsArray, err) => {
			if (err) {
				console.log("-----Database error, Posts-----", err);
				res.status(500).json(err);
			}
			posts = postsArray;
			for(var i=0;i<posts.length;i++){
		        postIDs.push(posts[i]._id);
		        comments[posts[i]._id] = [];
		        if (userIDs.indexOf(posts[i].author)<0) {
					userIDs.push(posts[i].author);
				}
		    }
		    return Comment.find({postID: {$in:postIDs}});
		}).then((com, err) => {
			if (err) {
				console.log("-----Database error, Comments-----", err);
				res.status(500).json(err);
			}
			for (var i=0; i<com.length; i++) {
				comments[com[i].postID].push(com[i]);
				if (userIDs.indexOf(com[i].authorID)<0) {
					userIDs.push(com[i].authorID);
				}
			}
			return User.find({_id: {$in:userIDs}});
		}).then((us, err) => {
			if (err) {
				console.log("-----Database error, Users-----", err);
				res.status(500).json(err);
			}
			for (var i=0; i<us.length; i++) {
				users[us[i]._id]=us[i].name;
			}
			res.render('feed.ejs', {
				feed: posts,
				comments: comments,
				user: req.user,
				users: users,
				perPage: req.params.perPage,
				page: req.params.page,
				count: count
			});
		});
	});

	app.get('/feed', isLoggedIn, function(req, res) {
		res.redirect('/feed/10/1');
	});

	// get a single media file
	app.get('/media/:mediaID/:postID/:index/:length', isLoggedIn, function (req, res) {
		var media = Media.findOne({_id: req.params.mediaID});
		var post = Post.findOne({_id: req.params.postID});

		Promise.all([
			media, 
			post
		]).then( ([media, post]) => {
			res.render('media.ejs', {
				media: media,
				post: post,
				index: parseInt(req.params.index),
				len: parseInt(req.params.length),
				user: req.user
			});
		});

	});

	//get a single post
	app.get('/post/:postID', isLoggedIn, function (req, res) {
		var userIDs = [];
		var post;
		var comments={};
		var users = {};
		Post.findOne({_id: req.params.postID}).exec().then((p, err) => {
			if (err) {
				console.log("-----Database error, Post-----", err);
				res.status(500).json(err);
			}
			post=p;
			userIDs.push(post.author);
			return Comment.find({postID: post._id});
		}).then( function(com, err) {
			if (err) {
				console.log("-----Database error, Comments-----", err);
				res.status(500).json(err);
			}
			comments[post._id]=com;
			for (i=0; i<com.length; i++){
				if (userIDs.indexOf(com[i].authorID)<0) {
					userIDs.push(com[i].authorID);
				}
			}
			return User.find({_id: {$in:userIDs}});
		}).then( function(us, err) {
			for (var i=0; i<us.length; i++) {
				users[us[i]._id]=us[i].name;
			}
			res.render('singlePost.ejs', {
				feed: [post],
				comments: comments,
				user: req.user,
				users: users
			});
		});
	});


	app.get('/profile/:userID', isLoggedIn, function(req, res) {
		var selfProfile= (req.params.userID==req.user._id);
		var user;
		if (selfProfile) {
			user=req.user;
		} else {
			user = User.findOne({_id: req.params.userID});
		}
		Post.find({author:req.params.userID}).sort("-created").then(feed => {
			res.render('profile.ejs', {
				user : user,
				selfProfile: selfProfile,
				feed: feed
			});
		});
		
	});



	// DELETE

	// delete post
	app.delete('/post/:postID', isLoggedIn, function(req, res) {
		Post.findOne({_id:req.params.postID}).exec().then((post, err) => {
			if (err) {
				console.log("-----Database error, can't find post-----", err);
				res.status(500).json(err);
			}
			if (!(post.author==req.user._id)) {
				console.log("-----Permissions error, can't delete another user's post-----", err);
				res.status(500).json(err);
			}
			Post.findByIdAndRemove(req.params.postID).exec().then((post, err) => {
				if (err) {
					console.log("-----Database error, can't delete post-----", err);
					res.status(500).json(err);
				}
				Comment.remove({postID:req.params.postID, justOne: false});
				res.status(200).json(post);
			});
		});
	})


	//PUT

	//edit profile description
	app.put('/profile/:userID', isLoggedIn, function(req, res) {
		if (!(req.user._id==req.params.userID)) {
			console.log("-----Permissions error, can't edit another user's profile-----", err);
			res.status(500).json(err);
		}

		User.findOneAndUpdate({_id: req.params.userID}, {$set:{"local.description": req.body.description}}).exec()
		.then(function(user, err) {
			if (err) {
				console.log("-----Error updating profile-----", err);
				res.status(500).json(err);
			}
			res.status(200).json(user);
		});
	});



}; // ends module.exports


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}