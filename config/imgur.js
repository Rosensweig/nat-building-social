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
var token = null;

 
function setup() {
  return new Promise(function (fulfill, reject) {
    console.log('----starting setup----');
    oauth2.ownerPassword
      .getToken(tokenConfig)
      .then((result) => {
        token = oauth2.accessToken.create(result);
        console.log("In setup function, and token is: ",token);
        fulfill(token);
      })
      // .then(token => {
      // token.refresh()
      // }).then((result) => {
      //   token = result;
      //   fulfill(token);
      // })
  });
}
 
// Check if the token is expired. If expired it is refreshed. 
function refreshToken(token) {
  return new Promise(function(fulfill, reject) {
    console.log("In refreshToken(). Token is: ", token);
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
}

function uploadFile(path, albumID) {
  var data = null;
  console.log("test: "+token.token);
  refreshToken(token)
  .then(function (token) {
    console.log("UPLOAD FILE, token is: ",token);
    unirest.post(auth.imgurAuth.baseURL)
    .headers({
      'Authorization': 'Bearer '+token.token.access_token
    })
    .send({
      image: path, 
      album: albumID, 
      type: 'URL'
    })
    .end(function (response) {
      console.log("Imgur response: ", response.body);
      data = response;
    });
  });
  return data
}


// oauth2.ownerPassword
//   .getToken(tokenConfig)
//   .then((result) => {
//     token = oauth2.accessToken.create(result);
//     console.log("In setup function, and token is: ",token);
//     return token;
  setup()
  .then((token) => {
    console.log('----upload token----');
    uploadFile('../uploads/butterfly.jpg', auth.imgurAuth.albumID);
  })
  .catch(err => {
    console.log("Access Token Error", err);
    return err;
  });
