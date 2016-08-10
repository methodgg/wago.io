module.exports = function(criteria, req, res, callback) {
    var AuraCode = require('./models/aura-code')
    var Categories = require('./models/categories')
    var Comments = require('./models/comment')
    var Screenshots = require('./models/aura-screenshot')
    var User = require('./models/user')
    var Wago = require('./models/wagoitem')

    var async = require('async')
    var moment = require("moment")

    var sort = criteria.sort || { "orderByDate": -1 }; delete criteria.sort
    if (sort.meta) sort = sort.meta
    var page = parseInt(criteria.page) || 0; delete criteria.page
    var max_results = parseInt(criteria.max) || 100000; delete criteria.max
    var mywago = criteria.mywago || false; delete criteria.mywago

    criteria.deleted = false

    if (!criteria.anonymous)
        criteria.owner = {$exists: 1}
    else
        delete criteria.anonymous

    // setup hidden/private
    delete criteria.hidden
    delete criteria["private"]
    if (req.user)
        var privacyFilter = { $or: [{ 'owner._id': req.user._id }, { 'private': false, 'hidden': false }] }
    else
        var privacyFilter = { 'private': false, 'hidden': false }


    if (mywago=='count' || mywago=='zip') {
        criteria.type = { $in: ['IMAGE', 'FONT', 'AUDIO'] }
    }

    Wago.aggregate([
      {$lookup: { from: "auracodes", localField: "aura.code", foreignField: "_id", as: "code" }},
      {$unwind: { path: "$code", preserveNullAndEmptyArrays: true }},
      {$lookup: { from: "users", localField: "_userId", foreignField: "_id", as: "owner" }},
      {$unwind: { path: "$owner", preserveNullAndEmptyArrays: true }},
      {$lookup: { from: "aurascreenshots", localField: "_id", foreignField: "auraID", as: "screens" }},
      {$project: { type: "$type", subtype: "$subtype", name: "$name", image: "$image", bundle: "$bundle", aura: "$aura", popularity: "$popularity", deleted: "$deleted", "private": "$private", hidden: "$hidden", modified: "$modified", created: "$created", categories: "$categories", description: "$description", collect: "$collect", code: "$code", screens: {$slice: ["$screens", 1]}, owner: "$owner", stars: { $size: '$popularity.favorites'}, orderByDate: { $ifNull: ["$modified", "$created"]} }},
      {$sort: sort }
      ]).match(privacyFilter).match(criteria)
      .skip(14*page).limit(14)
      .exec(function(err, results) {
        if (err) console.error(err)

            /*res.setHeader('Content-Type', 'application/json')
            res.send(results)
            return*/

        async.forEachOf(results, function (wago, async_key, cb) {
            // parse owner
            if (wago.owner && wago.owner.account && wago.owner.account.username)
                results[async_key].user = wago.owner.account.username
            else
                results[async_key].user = "a Guest"

            // parse latest version
            var ddate = moment(results[async_key].modified || results[async_key].created)
            results[async_key].ddate = results[async_key].modified
            results[async_key].date = ddate.format("MMM Do YYYY")

            if (results[async_key].categories) {
                var parseCategories = results[async_key].categories
                results[async_key].categories = {}
                for(k=0;k<Categories.length;k++) {
                    for(j=0;j<parseCategories.length;j++) {
                        if (parseCategories[j]==Categories[k].id) {
                            results[async_key].categories[Categories[k].id] = Categories[k]
                            if (Categories[k].parent)
                                delete results[async_key].categories[Categories[k].parent]
                        }
                    }
                }
            }

            // is this my favorite?
            if (req.user) {
                for (var i=0; i<wago.popularity.favorites.length; i++) {
                    if (results[async_key].popularity.favorites[i].equals(req.user._id)) {
                        results[async_key].myfave = true
                        break
                    }
                }

                // unread comments?
                var unreadCount=0
                if (res.locals.unreadComments) {
                    for (i=0; i<res.locals.unreadComments.length; i++) {
                        if (res.locals.unreadComments[i].auraID==wago._id)
                            unreadCount++
                    }
                }
                results[async_key].unreadComments = unreadCount
            }

            // setup tooltip
            if (results[async_key].description!="") {
                var xbb = require('./xbbcode')
                results[async_key].description = xbb.process({text: results[async_key].description}).html
            }

            // type-specific filters
            if (results[async_key].type=='WEAKAURAS2' || results[async_key].type=='WEAKAURA2') {
                results[async_key].type = 'WEAKAURA';
            }
            
            if (results[async_key].screens.length>0) {
                results[async_key].thumb = results[async_key].screens[0]
                delete results[async_key].screens
            }

            Comments.count({wagoID: results[async_key]._id}, function(err, count) {
                results[async_key].commentCount = count
                cb()
            })
        },
        function(err) { // forEachOf callback
                var found = {}
                found.count = Math.min(results.length, max_results)
                found.list = results

                callback(err, found) // search callback
        })
    })
}