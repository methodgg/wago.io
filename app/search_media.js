module.exports = function(criteria, req, res, callback) {
    var Media = require('./models/media')
    var Categories = require('./models/categories')
    var User = require('./models/user')

    var async = require('async')
    var moment = require("moment")

    //criteria['meta.deleted']=false

    var sort = criteria.sort || '-version'; delete criteria.sort
    var page = parseInt(criteria.page) || 0; delete criteria.page
    var limit = parseInt(criteria.limit) || 100000; delete criteria.limit
    var zip = criteria.mywagozip || false; delete criteria.mywagozip
    var mywago = []

    Media.aggregate([
      {$lookup: { from: "users", localField: "_userId", foreignField: "_id", as: "owner" }},
      ]).match(criteria)
      .project({ '_id':1, 'meta':1, 'popularity':1, 'owner._id':1, 'owner.account':1, 'files':1, 'stars': { '$size': '$popularity.favorites'} })
      .sort(sort)
      .exec(function(err, results) {
        if (err) console.error(err)
        async.forEachOf(results, function (media, async_key, cb) {
            // parse owner
            if (results[async_key].owner && results[async_key].owner[0] && results[async_key].owner[0].account && results[async_key].owner[0].account.username)
                results[async_key].user = results[async_key].owner[0].account.username
            else
                results[async_key].user = "a Guest"


            // parse latest version
            var latest = media.files.length-1
            if (results[async_key].files[latest]) {
                var ddate = moment(media.files[latest].updated)
                results[async_key].ddate = media.files[latest].updated
                results[async_key].date = ddate.format("MMM Do YYYY")

                results[async_key].file = results[async_key].files[latest]
                delete results[async_key].files

                results[async_key].file.type = media.meta.type
                results[async_key].file.subtype = media.meta.subtype
                if (zip) {
                    results[async_key].file.id = media._id
                    results[async_key].file.name = media.meta.name

                    mywago.push (results[async_key].file)

                    Media.update({ '_id' :  media._id }, { $inc: { 'popularity.downloads': 1 } }, function(){})
                    return cb()
                }
            }
            else {
                results[async_key].ddate = null
                results[async_key].date = ""
            }

            /*results[async_key].categories = {}
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
            } */

            // is this my favorite?
            if (req.user) {
                for (var i=0; i<media.popularity.favorites.length; i++) {
                    if (results[async_key].popularity.favorites[i].equals(req.user._id)) {
                        results[async_key].myfave = true
                        break
                    }
                }

                // unread comments?
                var unreadCount=0
                if (res.locals.unreadComments) {
                    for (i=0; i<res.locals.unreadComments.length; i++) {
                        if (res.locals.unreadComments[i].mediaID==media._id)
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
            function custom_sort(a,b) {
                if (sort=='-version')
                    return b.ddate.getTime() - a.ddate.getTime();
                if (sort=='version')
                    return a.ddate.getTime() - b.ddate.getTime();
            }
            found = {}

            //if (typeof sort=='string')
            //    results.sort(custom_sort)

            if (zip) return callback(err, mywago)

            found.count = results.length
            if (page*10>found.count)
                found.list = {}
            else if (found.count>10)
                found.list = results.slice(page*10, (page+1)*10)
            else
                found.list = results

            callback(err, found) // search callback
        })
    })
}