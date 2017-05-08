const {Post} = require('./models/post.js');
const {Media} = require('./models/media.js');
const {Comment} = require('./models/comment.js');
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
	    		    	res.render('singlePost.ejs', {
	    		    		feed: [newPost]
	    		    	});
	    		    	//res.status(201).json(newPost);
	    		    })
	    		    .catch(err => {
	    		        console.error(err);
	    		        res.status(500).json({error: 'Something went wrong'});
	    		    });
		    	}
		    }

		    console.log('---files---',req.files);
			
		    
		}); //ends multer upload
	}); //ends POST /post


	    	// /posts/?page=5&offset=10
	    	// /posts/5/10
	    	// req.query.page
	    	// req.query.offset
	    	

	    	//var skip = 10;
	    	// var page = 5;
	    	// Post.find({userid: req.user._id, $limit: 10, $skip: skip*page, date: {$gte: 2017-04-01, $lte: 2017-05-01}})

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
	app.get('/feed', isLoggedIn, (req, res) => {
		var postsArray = [];
		var count = 0;
		Post.find().sort("-created").skip(0).limit(10).exec((err, posts) => {
			if (err) {
				console.log("-----Database error-----", err);
				res.status(500).json(err);
			}
			postsArray = posts;
			for (var i=0; i<posts.length; i++) {
				findComments(i);
			}
		});

		function findComments(i){
			Comment.find({postID: postsArray[i]._id}, function(err,comments){
				postsArray[i].comments = comments;
				checkComplete();
			});
		}

		function checkComplete(){
			count++;
			if(count == postsArray.length){
				res.render('feed.ejs', {
					feed: postsArray,
					user: req.user
				});
			}
		}
	});

	// get a single media file
	app.get('/media/:mediaID/:postID/:index/:length', isLoggedIn, function (req, res) {
		var media = Media.findOne({_id: req.params.mediaID});
		var post = Post.findOne({_id: req.params.postID});

		Promise.all([
			media, 
			post
		]).then( ([media, post]) => {
			console.log("Promises complete, media= "+media+"\n and post= "+post);
			res.render('media.ejs', {
				media: media,
				post: post,
				index: parseInt(req.params.index),
				len: parseInt(req.params.length),
				user: req.user
			})
		});

	});

	//get a single post
	app.get('/post/:postID', isLoggedIn, function (req, res) {
		Post.findOne({_id: req.params.postID}).exec().then(post => {
			res.render('singlePost.ejs', {
				feed: [post]
			})
		})
	})


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
		})
		
	});



}; // ends module.exports


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}