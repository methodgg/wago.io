module.exports = function(criteria, req, res, callback) {
    var Aura = require('./models/aura')
    var AuraCode = require('./models/aura-code')
    var Categories = require('./models/categories')
    var Collection = require('./models/collection')
    var Media = require('./models/media')
    var Screenshots = require('./models/aura-screenshot')
    var User = require('./models/user')

    var async = require('async')
    var moment = require("moment")

    //criteria['meta.deleted']=false

    var sort = criteria.sort || '-updated'; delete criteria.sort
    var page = parseInt(criteria.page) || 0; delete criteria.page
    var max_results = parseInt(criteria.max) || 100000; delete criteria.max

    AuraCode.aggregate([
      {$group: { _id: "$auraID" , updated: { $max: "$updated"} }},
      {$lookup: { from: "auracodes", localField: "updated", foreignField: "updated", as: "code" }},
      {$unwind: "$code" },
      {$lookup: { from: "auras", localField: "_id", foreignField: "_id", as: "aura" }},
      {$unwind: "$aura" },
      {$lookup: { from: "users", localField: "aura._userId", foreignField: "_id", as: "owner" }},
      {$unwind: { path: "$owner", preserveNullAndEmptyArrays: true }},
      {$lookup: { from: "aurascreenshots", localField: "_id", foreignField: "auraID", as: "screens" }},
      {$project: { _id: "$_id", _userId: "$owner._id", updated: "$updated", code: "$code", "owner.account": "$owner.account", meta: "$aura.meta", popularity: "$aura.popularity", stars: { $size: '$aura.popularity.favorites'}, screens: "$screens" }}
      ]).match(criteria)
      .sort(sort)
      .skip(14*page).limit(14)
      .exec(function(err, results) {
           if (err) console.error(err)
           // res.setHeader('Content-Type', 'application/json')
           // res.send(results)
           // return

            async.parallel([
                // process each aura type
                function(parallel_cb) {
                    async.forEachOf(results, function (aura, async_key, cb) {
                        if (aura.meta.type==1) aura.type='SNIPPET'
                        else aura.type='WEAKAURA'

                        // parse owner
                        if (aura.owner && aura.owner.account && aura.owner.account.username)
                            results[async_key].user = aura.owner.account.username
                        else
                            results[async_key].user = "a Guest"

                        // parse latest version
                        var ddate = moment(results[async_key].updated)
                        results[async_key].ddate = results[async_key].updated
                        results[async_key].date = ddate.format("MMM Do YYYY")


                        results[async_key].categories = {}
                        if (aura.meta && aura.meta.categories) {
                            for(k=0;k<Categories.length;k++) {
                                for(j=0;j<aura.meta.categories.length;j++) {
                                    if (aura.meta.categories[j]==Categories[k].id) {
                                        results[async_key].categories[Categories[k].id] = Categories[k]
                                        if (Categories[k].parent)
                                            delete results[async_key].categories[Categories[k].parent]
                                    }
                                }
                            }
                        }

                        // is this my favorite?
                        if (req.user) {
                            for (var i=0; i<aura.popularity.favorites.length; i++) {
                                if (results[async_key].popularity.favorites[i].equals(req.user._id)) {
                                    results[async_key].myfave = true
                                    break
                                }
                            }

                            // unread comments?
                            var unreadCount=0
                            if (res.locals.unreadComments) {
                                for (i=0; i<res.locals.unreadComments.length; i++) {
                                    if (res.locals.unreadComments[i].auraID==aura._id)
                                        unreadCount++
                                }
                            }
                            results[async_key].unreadComments = unreadCount
                        }

                        // setup tooltip
                        if (results[async_key].meta.description!="") {
                            var xbb = require('./xbbcode')
                            results[async_key].meta.description = xbb.process({text: results[async_key].meta.description}).html
                        }

                        cb()
                    },

                    function(err) { // forEachOf callback
                        parallel_cb(err)
                    })
                },

                // get media types
                function(parallel_cb) {
                    parallel_cb()
                },

                // get collection types
                function(parallel_cb) {
                if (req.user && req.user.account && req.user.account.username!="Ora") return parallel_cb()
                    //Collection.aggrate([
                    //]).match(criteria)
                    //.exec(function(err, collections) {

                    //})
                    parallel_cb()
                    //Collection.find
                }],

                // parallel callback
                function(err) {
                    var found = {aura:0, media:0, collection:0}
                    for (i=0;i<results.length;i++) {
                        if (results[i].type=='WEAKAURA' || results[i].type=='SNIPPET')
                            found.aura++
                    }
                    found.count = results.length+1
                    found.list = results

                    callback(err, found) // search callback
                })



    })
}













