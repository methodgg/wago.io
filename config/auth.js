// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '', // your App ID
        'clientSecret'  : '', // your App Secret
        'callbackURL'   : 'https://wago.io/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : '',
        'consumerSecret'    : '',
        'callbackURL'       : 'https://wago.io/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '.apps.googleusercontent.com',
        'clientSecret'  : '',
        'callbackURL'   : 'https://wago.io/auth/google/callback'
    },

    'bnetAuth' : {
        'clientID'      : '',
        'clientSecret'  : '',
        'callbackURL'   : 'https://wago.io/auth/bnet/callback'
    }

};