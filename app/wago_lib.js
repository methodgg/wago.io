wagofn = {
    // collect user and global variables
    collectVars: function(req, res, next) {
        var async = require('async');

        async.parallel([
            function(cb) {  // find unread comments
                if (req.user) {
                    var Comment = require('./models/comment');
                    Comment.find({usersTagged: {$elemMatch: {userID: req.user._id, read: false}}}).exec(function(err, comments) {
                        res.locals.unreadComments = comments
                        cb()
                    })
                }
                else cb()
            },
            function(cb) { // find user collections
                if (req.user) {
                    var Collection = require('./models/wagoitem');
                    Collection.find({'_userId': req.user._id, type: "COLLECTION"}).exec(function(err, collections) {
                        req.user.collections = collections
                        cb()
                    })      
                }
                else cb()
            },
            function(cb) { // setup helpers
                if (req.user && req.user.account && !req.user.account.username)
                    req.user.account.username = ""

                res.locals.user = req.user;
                res.locals.site = {title: "WAGO", description: "Database of WeakAuras"}

                // bb code parser
                res.locals.xbb = require('./xbbcode')

                res.locals.aura = {}
                res.locals.static = require('./static_vars');

                var Aura = require('./models/wagoitem');
                res.locals.category_menu = require('./models/categories')

                async.forEachOf(res.locals.category_menu, function (item, key, cb2) {
                    Aura.count({ 'categories' : item.id, 'private':0, 'hidden':0 }, function(err, count) {
                        if (err) return callback(err);
                        res.locals.category_menu[key].count = count
                        cb2()
                    })

                }, function(err) {
                    cb()
                })
            }

        ], function() {
            next()
        })
    }

}

module.exports = wagofn