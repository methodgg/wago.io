// config/passport.js

// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var BnetStrategy     = require('passport-bnet').Strategy;
var PatreonStrategy  = require('passport-patreon').Strategy;
var DiscordStrategy = require('passport-discord').Strategy;

// load up the user model
var User            = require('./models/user');
var Patreon         = require('./models/patreon');
var configAuth      = require('../config/auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            user.save(function(err) {
                if (err)
                    throw err;
                return done(null, user);
            });
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        console.error('signing up')
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
            // check if the user is already logged in
            if (req.user)
                var user = req.user
            else
                var user = false

            // make sure passwords match
            if (password != req.body.password2) {
                console.error('passwords do not match')

                return done(null, false, req.flash('signupMessage', 'Passwords do not match. Please try again.'));
            }

            // minimum password length
            else if (password.length<6)
                return done(null, false, req.flash('signupMessage', 'Password is too short. Please use at least six characters.'));

            else if (user && user.account.username == username) {
                user.account.password = user.generateHash(password);
                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
            else {
                console.error('check if user exists')
                // we are checking to see if the user already exists
                User.findOne({ 'account.username' :  new RegExp('^'+username+'$', "i") }, function(err, found) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (found) {
                        return done(null, false, req.flash('signupMessage', 'That username is already taken. Please try another.'));
                    } else {

                        if (user) {
                            user.account.password = user.generateHash(password);
                            user.account.username = username;
                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }
                        else {
                            console.error('create new user')
                            // if there is no user with that email
                            // create the user
                            var newUser            = new User();

                            // set the user's local credentials
                            newUser.account.username    = username;
                            newUser.account.password = newUser.generateHash(password);

                            // save the user
                            newUser.save(function(err) {
                                console.error('error?', err)
                                if (err)
                                    throw err;
                                req.flash('signupMessage', 'Your account has been created.');
                                return done(null, newUser);
                            });
                        }
                    }

                });
            }

        });

    }));
                                                     
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

        // we are checking to see if the user trying to login already exists
        User.findOne({ 'account.username' :  new RegExp('^'+username+'$', "i") }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'Invalid login')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.account.password || !user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Invalid login')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));
    

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        profileFields    : ['id', 'email', 'first_name', 'last_name']

    },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                // update the current users facebook credentials
                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));

    // =========================================================================
    // BATTLE.NET===============================================================
    // =========================================================================
    passport.use(new BnetStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.bnetAuth.clientID,
        clientSecret    : configAuth.bnetAuth.clientSecret,
        callbackURL     : configAuth.bnetAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },

    // bnet will send back the token and profile
    function(req, token, refreshToken, profile, done) {          
        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their bnet id
                User.findOne({ 'battlenet.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that bnet id, create them
                        var newUser            = new User();

                        // set all of the bnet information in our user model
                        newUser.battlenet.id         = profile.id; // set the users bnet id
                        newUser.battlenet.token      = profile.token; // we will save the token that bnet provides to the user
                        newUser.battlenet.name       = profile.battletag; // look at the passport user profile to see how names are returned
                        newUser.battlenet.region     = profile.region
                        if (profile.characters)
                            newUser.battlenet.characters = profile.characters;
                        else
                            newUser.battlenet.characters = []

                        for (i=0;i<newUser.battlenet.characters.length;i++) {
                            if (newUser.battlenet.characters[i].level>=100 && newUser.battlenet.characters[i].achievementPoints>=800) {
                                newUser.account.verified_human = true
                                break
                            }
                        }

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                // update the current users battlenet credentials
                user.battlenet.id         = profile.id;
                user.battlenet.token      = profile.token;
                user.battlenet.name       = profile.battletag;

                if (profile.region && profile.characters.length>0) {
                    user.battlenet.region     = profile.region
                    user.battlenet.characters = profile.characters

                    if (!user.account.verified_human) {
                        for (i=0;user.battlenet.characters.length;i++) {
                            if (user.battlenet.characters[i].level>=100 && user.battlenet.characters[i].achievementPoints>=800) {
                                user.account.verified_human = true
                                break
                            }
                        }
                    }
                }

                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true

    },
    function(req, token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Twitter
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        // set all of the user data that we need
                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        // save our user into the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                // update the current users twitter credentials
                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true

    },
    function(req, token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // try to find the user based on their google id
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser          = new User();

                        // set all of the relevant information
                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                // update the current users twitter credentials
                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = profile.emails[0].value; // pull the first email

                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));


    // =========================================================================
    // PATREON =================================================================
    // =========================================================================
    passport.use(new PatreonStrategy({

        clientID        : configAuth.patreonAuth.clientID,
        clientSecret    : configAuth.patreonAuth.clientSecret,
        callbackURL     : configAuth.patreonAuth.callbackURL,
        scope           : "users pledges-to-me",
        passReqToCallback : true

    },
    function(req, token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // try to find the user based on their patreon id
                User.findOne({ 'patreon.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser          = new User();

                        // set all of the relevant information
                        newUser.patreon.id    = profile.id;
                        newUser.patreon.access_token = token;
                        newUser.patreon.refresh_token = refreshToken;
                        newUser.patreon.amount_cents = 0;
                        newUser.patreon.created_at = null
                        newUser.patreon.declined_since = null
                        newUser.patreon.profile = profile;

                        Patreon.findOne({"patron_id": profile.id}).sort("-event_date").exec(function(err, patron) {
                            if (!patron) {
                                // save the user
                                newUser.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, newUser);
                                })
                                return
                            }
                            else {
                                if (patron.event_type=='CREATE') {
                                    newUser.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                                    newUser.patreon.created_at = patron.content.data.attributes.created_at;
                                }
                                else if (patron.event_type=='UPDATE') {
                                    newUser.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                                    newUser.patreon.created_at = patron.content.data.attributes.created_at;
                                }
                                else if (patron.event_type=='DELETE') {
                                    newUser.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                                    newUser.patreon.declined_since = patron.content.data.attributes.declined_since;
                                }

                                newUser.roles.subscriber = false
                                if (newUser.patreon.amount_cents>=patron.subscriber_cents)
                                    newUser.roles.subscriber = true

                                newUser.roles.gold_subscriber = false
                                if (newUser.patreon.amount_cents>=patron.gold_subscriber_cents)
                                    newUser.roles.gold_subscriber = true

                                // save the user
                                newUser.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, newUser);
                                })
                            }
                        })
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                // update the current users patreon info
                user.patreon.id    = profile.id;
                user.patreon.access_token = token;
                user.patreon.refresh_token = refreshToken;
                user.patreon.amount_cents = 0;
                user.patreon.created_at = null
                user.patreon.declined_since = null
                user.patreon.profile = profile;

                Patreon.findOne({"patron_id": profile.id}).sort("-event_date").exec(function(err, patron) {
                    if (!patron) {
                        // save the user
                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        })
                    }
                    else {
                        if (patron.event_type=='CREATE') {
                            user.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                            user.patreon.created_at = patron.content.data.attributes.created_at;
                        }
                        else if (patron.event_type=='UPDATE') {
                            user.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                            user.patreon.created_at = patron.content.data.attributes.created_at;
                        }
                        else if (patron.event_type=='DELETE') {
                            user.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                            user.patreon.declined_since = patron.content.data.attributes.declined_since;
                        }

                        user.roles.subscriber = false
                        if (user.patreon.amount_cents>=patron.subscriber_cents)
                            user.roles.subscriber = true

                        user.roles.gold_subscriber = false
                        if (user.patreon.amount_cents>=patron.gold_subscriber_cents)
                            user.roles.gold_subscriber = true

                        // save the user
                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        })
                    }
                })
            }
        });
    }));

    // =========================================================================
    // DISCORD =================================================================
    // =========================================================================
    passport.use(new DiscordStrategy(
    {
        clientID        : configAuth.discordAuth.clientID,
        clientSecret    : configAuth.discordAuth.clientSecret,
        callbackURL     : configAuth.discordAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },

    // discord will send back the token and profile
    function(req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their bnet id
                User.findOne({ 'discord.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that bnet id, create them
                        var newUser            = new User();

                        // set all of the bnet information in our user model
                        newUser.discord.id         = profile.id; // set the users bnet id
                        newUser.discord.discriminator      = profile.discriminator; // we will save the token that bnet provides to the user
                        newUser.discord.name       = profile.username; // look at the passport user profile to see how names are returned

                        require('./wago_lib').SendWagoBotMessage(profile.id, "Hi there! Use your Wago user account page to setup some options in how I can interact with you. <https://wago.io/account>")


                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                // update the current users battlenet credentials
                user.discord.id         = profile.id;
                user.discord.discriminator      = profile.discriminator;
                user.discord.name       = profile.username;

                require('./wago_lib').SendWagoBotMessage(profile.id, "Hi there! Use your Wago user account page to setup some options in how I can interact with you. <https://wago.io/account>")

                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));

};
