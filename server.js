//server.js

//set up----------------------------------

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// configuration ---------------------------
mongoose.connect(confidgDB.url);

// require('./config/passport')(passport); //pass passport for configuration

// set up express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs'); // set up ejs for templating 

//required for passport
app.use(session({secret: 'ilovescotchscotchyscotchscotch'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes -------------------------------
require('./app/routes.js')(app, passport);

// launch -------------------------------
app.listen(port);
console.log('The magic happens on port ' + port);