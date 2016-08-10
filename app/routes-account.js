module.exports = function(app, passport) {
    app.use(require('./wago_lib').collectVars);

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        if (req.isAuthenticated())
            // if already signed in redirect to account page
            res.redirect('/account');
        else
            // render the page and pass in any flash data if it exists
            res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/account', // redirect to the secure account section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local'), function (req, res) {
        // req.user is now defined
        res.redirect('/account')
    })

    // =====================================
    // ACCOUNT SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // view account (/account) located in main routes.js file

    // update profile
    app.post('/account/update/profile', isLoggedIn, function(req, res) {
        var User = require('./models/user')
        username = req.body.profilename.replace(/[.,\/@#!$%\^&\*;:{}=`~()\s]/g,"").substring(0, 22)

        // if username is blank
        if (username=="") {
            req.flash('profileMsg', "Please enter a profile name.")
            res.redirect('/account')
            return
        }

        // if not updating username
        if (username==req.user.account.username) {
            // update user profile
            User.findById(req.user._id, function(err, user) {
                if (!err) {
                    user.profile.visibility = req.body.profilevisibility
                    user.account.default_aura_visibility = req.body.auravisibility
                    user.save(function() {
                        req.flash('profileMsg', "Your profile has been updated.")
                        res.redirect('/account')
                    })
                }
                else {
                    req.flash('profileMsg', "Yikes! An error occurred.")
                    res.redirect('/account')
                }
            })
            return
        }

        // make sure username does not already exist in DB
        User.count({ 'account.username' :  new RegExp('^'+username+'$', "i") }, function(err, exists) {
            if (exists>0) {
                req.flash('profileMsg', "Sorry, that name is already in use. Please try another.")
                res.redirect('/account')
                return
            }

            // update user profile
            User.findById(req.user._id, function(err, user) {
                if (!err) {
                    user.profile.visibility = req.body.profilevisibility
                    user.account.username = username
                    user.save(function() {
                        req.flash('profileMsg', "Your profile has been updated.")
                        res.redirect('/account')
                        return
                    })
                }
                else {
                    req.flash('profileMsg', "Yikes! An error occurred.")
                    res.redirect('/account')
                    return
                }
            })
        })
    })

    app.post('/account/update/password', isLoggedIn, function(req, res) {
        var User = require('./models/user');
        if (req.body.password != req.body.password2) {
            req.flash('accountMsg', 'Passwords do not match. Please try again.');
            res.redirect('/account')
            return
        }

        // minimum password length
        else if (req.body.password.length<6) {
            req.flash('accountMsg', 'Password is too short. Please use at least six characters.');
            res.redirect('/account')
            return
        }

        User.findById(req.user._id, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }
            user.account.password = user.generateHash(req.body.password);
            // save the user
            user.save(function(err) {
                if (err)
                    throw err;

                req.flash('accountMsg', 'Your password has been updated.');
                res.redirect('/account')
            });
        })
    })

    // Connect local account to existing social account
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authorize('local-signup', {
        successRedirect : '/account', // redirect to the secure profile section
        failureRedirect : '/account', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/account',
            failureRedirect : '/'
        }));

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/account',
            failureRedirect : '/'
        }));

    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var User = require('./models/user');
        User.findById(req.user._id, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }
            user.facebook = undefined
            user.save(function(err) {
                if (err)
                    throw err;
                res.redirect('/account')
            });
        })
    })


    // =====================================
    // BATTLE.NET ROUTES====================
    // =====================================
    // route for bnet authentication and login
    app.get('/auth/bnet', passport.authenticate('bnet', { scope : 'wow.profile' }));

    // handle the callback after bnet has authenticated the user
    app.get('/auth/bnet/callback',
        passport.authenticate('bnet', {
            successRedirect : '/account',
            failureRedirect : '/'
        }));

    // send to bnet to do the authentication
    app.get('/connect/bnet', passport.authorize('bnet', { scope : 'wow.profile' }));

    // handle the callback after bnet has authorized the user
    app.get('/connect/bnet/callback',
        passport.authorize('bnet', {
            successRedirect : '/account',
            failureRedirect : '/'
        }));

    app.get('/unlink/bnet', isLoggedIn, function(req, res) {
        var User = require('./models/user');
        User.findById(req.user._id, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }
            user.battlenet = undefined
            user.save(function(err) {
                if (err)
                    throw err;
                res.redirect('/account')
            });
        })
    })


    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/account',
            failureRedirect : '/'
        }));

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/account',
            failureRedirect : '/'
        }));

    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var User = require('./models/user');
        User.findById(req.user._id, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }
            user.twitter = undefined
            user.save(function(err) {
                if (err)
                    throw err;
                res.redirect('/account')
            });
        })
    })


    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
                successRedirect : '/account',
                failureRedirect : '/'
        }));

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/account',
            failureRedirect : '/'
        }));

    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var User = require('./models/user');
        User.findById(req.user._id, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }
            user.google = undefined
            user.save(function(err) {
                if (err)
                    throw err;
                res.redirect('/account')
            });
        })
    })

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}

            