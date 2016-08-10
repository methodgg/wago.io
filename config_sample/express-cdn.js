// config/express-cdn.js

const path = require('path');

module.exports = {
    publicDir  : path.join(__dirname, '../public')
  , viewsDir   : path.join(__dirname, '../views')
  , domain     : 's3-us-west-2.amazonaws.com/static.wago.io'
  , bucket     : 'static.wago.io'
  , region     : 'us-west-2'
//  , endpoint   : 'static.wago.io.s3-website-us-west-2.amazonaws.com'
  , key        : ''
  , secret     : ''
  , port       : 443
  , ssl        : true
  , production : true
};