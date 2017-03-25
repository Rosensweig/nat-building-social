//server.js

//set up----------------------------------

var express = require('express');
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
// var imgur = require('imgur');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var auth = require('./config/auth.js');
var multer = require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
  }
});
var upload = multer({ storage : storage}).array('imageInput');

var configDB = require('./config/database.js');

mongoose.Promise = global.Promise;

// configuration ---------------------------
var app = express();
mongoose.connect(configDB.url);
//imgur.setCredentials(auth.imgurAuth.email, auth.imgurAuth.password, auth.imgurAuth.clientID);

require('./config/passport')(passport); //pass passport for configuration

// set up express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs'); // set up ejs for templating 

//required for passport
app.use(session({secret: auth.session.secret}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes -------------------------------
require('./app/routes.js')(app, passport, auth, upload); 

// launch -------------------------------
app.listen(port);
console.log('The magic happens on port ' + port);

