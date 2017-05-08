const auth = require('./auth.js');
const unirest = require('unirest');

const credentials = {
  client: {
    id: auth.imgurAuth.clientID,
    secret: auth.imgurAuth.clientSecret
  },
  auth: {
    tokenHost: auth.imgurAuth.oAuthURL,
    tokenPath: '/oauth2/token',
    authorizePath: '/oauth2/authorize'
  }
};

// Get the access token object. 
const tokenConfig = {
  username: auth.imgurAuth.email,
  password: auth.imgurAuth.password
};

const oauth2 = require('simple-oauth2').create(credentials);
var token = null; //use setup() to get token


module.exports = { 

  setup: function() {
    return new Promise(function (fulfill, reject) {
      oauth2.ownerPassword
        .getToken(tokenConfig)
        .then((result) => {
          token = oauth2.accessToken.create(result);
          fulfill(token);
        })
    });
  }, // closes setup()
   


  // Check if the token is expired. If expired it is refreshed. 
  refreshToken: function(token) {
    return new Promise(function(fulfill, reject) {
      if (token.expired()) {
      	 
      	// Promises 
      	token.refresh()
      	.then((result) => {
      		token = result;
          fulfill(token);
      	}).catch(err => {
          console.log("Error refreshing token: ", err);
          reject(err);
        });
      };
      fulfill(token);
    });
  }, //closes refreshToken()


  uploadFile: function(path, albumID) {
    var self = this;
    return new Promise( function(fulfill, reject) {
      self.refreshToken(token)
      .then(function (token) {
        unirest.post(auth.imgurAuth.baseURL)
        .headers({
          'Authorization': 'Bearer '+token.token.access_token,
          'Content-Type': 'multipart/form-data'
        })
        .field({
          album: albumID, 
          type: 'file'
        })
        .attach('image', './'+path)
        .end(function (response) {
          fulfill(response);
        });
      });
    })
  } //closes uploadFile()



}; //closes module.exports
