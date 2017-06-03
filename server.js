// set up ======================================================================
// get all the tools we need
// in /etc/rc.local
// iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
// iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3443

var express  = require('express');
var app      = express();
var port     = 3000; // 80 is routed to 3000
var httpsPort= 3443; // 3443 is routed to 443
var compression = require('compression')

var mongoose = require('mongoose');
var passport = require('passport');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser')
var session      = require('express-session');
const MongoStore = require('connect-mongo')(session);
var fs           = require("fs");
var flash        = require('connect-flash');


// setup database ==============================================================
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database

// Initialize the CDN magic ====================================================
var configCDN = require('./config/express-cdn.js');
var CDN = require('express-cdn')(app, configCDN);

// passport for authentication =================================================
require('./app/passport')(passport); 

// set up our express application ==============================================
app.use(morgan('short')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use(bodyParser({limit: '25mb'})); // get information from html forms
app.use(compression()); // gzip all requests

app.set('view engine', 'ejs'); // set up ejs for templating
app.locals.CDN = CDN()

// required for passport
app.use(session({ secret: '<2(INpAHIsY*lVsv4c?<I.Ghxg@v8k)peo!ANu0fy5$0up@[p%bPT/XfhTdD"%j',
                cookie: { secure: true, maxAge: 2592000000 },
                store: new MongoStore({ mongooseConnection: mongoose.connection })
                }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session               


// routes ======================================================================
app.all('*', function(req, res, next){ // force https
  if (req.secure || req.host=='localhost') { return next(); };
  res.redirect('https://wago.io'+req.url);
});

app.use('/assets', express.static('public'));
app.use('/screenshots', express.static('screenshots'));
app.use('/mywago', express.static('mywago'));
app.use('/api/docs', express.static('public/apidocs'));

require('./app/routes-account.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/routes.js')(app); 

// setup SSL
var https = require('https')
var ssl_options = {
  ca: fs.readFileSync('ssl/wago_io.ca-bundle'),
  key: fs.readFileSync('ssl/wago.io.key'),
  cert: fs.readFileSync('ssl/wago_io.crt')
};

// launch ======================================================================
app.listen(port);
https.createServer(ssl_options, app).listen(httpsPort);

console.log('Server launched');                       