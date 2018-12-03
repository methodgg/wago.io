// sets favorite for a wago
server.post('/wago/star', (req, res, next) => {
  if (!req.user) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).select('popularity').then((wago) => {
    if (!wago) {
      return res.send(404, {error: "no_wago"})
    }

    if (req.body.addStar) {
      WagoFavorites.addStar(wago, req.user._id)
      res.send({updated: true, count: wago.popularity.favorite_count+1 })
    }
    else {
      WagoFavorites.removeStar(wago, req.user._id)
      res.send({updated: true, count: wago.popularity.favorite_count-1 })
    }    
  })
})

// update wago name
server.post('/wago/update/name', (req, res) => {
  if (!req.user || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }
  else if (!req.body.name) {
    return res.send(401, {error: "invalid input"})
  }
  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    wago.name = req.body.name
    wago.save().then(() => {
      res.send({success: true})
    })
  })
})

// update game mode
server.post('/wago/update/gameMode', (req, res) => {
  if (!req.user || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }

  if (req.body.mode === '' || req.body.mode === 'beta-bfa') {
    WagoItem.findById(req.body.wagoID).then((wago) => {
      if (!wago || !wago._userId.equals(req.user._id)) {
        return res.send(404, {error: "no_wago"})
      }

      if (req.body.mode === '') {
        var i = wago.categories.indexOf('beta-bfa')
        if (i >= 0) {
          wago.categories.splice(i, 1)
        }
      }
      else if (req.body.mode === 'beta-bfa') {
        var i = wago.categories.indexOf('beta-bfa')
        if (i === -1) {
          wago.categories.push('beta-bfa')
        }
      }
      wago.save().then(() => {
        res.send({success: true})
      })
    })
  }
  else {
    res.send({success: false})
  }
})

// update wago slug
server.post('/wago/update/slug', (req, res) => {
  if (!req.user || !req.user.access.custom_slug || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }
  else if (!req.body.slug) {
    req.body.slug = null
  }
  else if (req.body.slug.match(/[\s%#/\\<>]/) || (req.body.slug.length < 7 && !req.body.slug.match(/[^\u0000-\u007F]/))) {
    return res.send(401, {error: "invalid input"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    // if removing a custom slug
    if (!req.body.slug) {
      wago.custom_slug = null
      wago.save().then(() => {
        res.send({success: true})
      })
    }
    else {
      // make sure slug is unique
      WagoItem.lookup(req.body.slug).then((doc) => {
        if (!doc || doc._id === wago._id) {
          wago.custom_slug = req.body.slug
          wago.save().then(() => {
            res.send({success: true})
          })
        }
        else {
          res.send({exists: true})
        }
      })
    }
  })
})

// update wago description
server.post('/wago/update/desc', (req, res) => {
  if (!req.user || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    wago.description = req.body.desc || ''
    wago.description_format = req.body.format || 1 // 1=BBcode, 2=Markdown
    wago.save().then(() => {
      res.send({success: true})
    })
  })
})

// update wago visibility
server.post('/wago/update/visibility', (req, res) => {
  if (!req.user || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    wago.hidden = false
    wago.private = false
    if (req.body.visibility === 'Hidden') {
      wago.hidden = true
    }
    else if (req.body.visibility === 'Private') {
      wago.private = true
    }

    wago.save().then(() => {
      res.send({success: true, hidden: wago.hidden, private: wago.private})
    })
  })
})

// update wago categories
server.post('/wago/update/categories', (req, res) => {
  if (!req.user || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    // retain system tags
    var systemTags = Categories.filterSystemTags(wago.categories)

    if (!req.body.cats) {
      wago.categories = []
    }
    else {
      wago.categories = Categories.validateCategories(req.body.cats.split(','))
    }
    wago.relevancy = Categories.relevanceScores(wago.categories)

    // re-add system tags
    wago.categories = wago.categories.concat(systemTags)

    // check if this import should have any system tags applied
    wago.save().then(() => {
      res.send({success: true})
    })
  })
})

// upload image
server.post('/wago/upload/image', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.files || !req.files.file) {
    return res.send(403, {error: "forbidden"})
  }

  var img = req.files.file.name || ''
  var match = img.match(/\.(png|jpg|gif|jpeg)$/i)
  if (img && match) {
    WagoItem.findById(req.body.wagoID).then((wago) => {
      if (!wago || !wago._userId.equals(req.user._id)) {
        return res.send(404, {error: "no_wago"})
      }
      
      // setup database entry
      var screen = new Screenshot()
      screen.auraID = wago._id
      screen.localFile = screen._id.toString() + '.' + match[1] // filename

      // prepare save location
      try {
        fs.mkdirSync('/nfs/media/screenshots/' + wago._id)
      }
      catch (e) {
        if (e.code !== 'EEXIST') {
          logger.error({label: 'Error creating screenshot directory', error: e})
          return res.send({error: 'could not save'})
        }
      }

      // store image
      // fs.rename fails on live servers because can not rename to a different drive
      var mv = require('mv')
      mv(req.files.file.path, '/nfs/media/screenshots/' + wago._id + '/' + screen.localFile, function(err) {
        if (err) {
          logger.error({label: 'Error saving screenshot file', error: e})
          res.send({error: 'could not save'})
        }
        else {
          screen.save().then((doc) => {
            res.send({success: true, _id: doc._id.toString(), src: doc.url})
          })
        }
      })
    })
  }
})

// add image/video by URL
server.post('/wago/upload/image/url', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.url) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }
    
    var isVideo = videoParser.parse(req.body.url)
    // if youtube video detected
    if (isVideo) {
      var video = new Video()
      video.wagoID = wago._id
      video.source = isVideo.provider
      video.videoID = isVideo.id
      video.videoType = isVideo.mediaType

      // if we need to check API for thumbnail
      if (video.source === 'twitch') {
        // get thumbnail twitch API
        request.get('https://api.twitch.tv/kraken/videos/'+video.videoID, function(error, response, content) {
          try {
            var json = JSON.parse(content)
            if (json && json.preview) {
              var video = new Video()
              video.thumb = json.preview
              video.save().then((doc) => {
                res.send({success: true, _id: doc._id.toString(), embed: doc.embed, thumb: doc.thumbnail, url: doc.url, type: 'video'})
              })              
            }
            else {
              res.send({error: 'invalid_twitch'})
            }
          }
          catch(e) {
            logger.error({label: 'Error fetching from twitch API', error: e})
            res.send({error: 'invalid_twitch'})
          }
        })
      }

      else if (video.source === 'vimeo') {
        request.get('https://vimeo.com/api/oembed.json?url=https://vimeo.com/'+video.videoID, function(error, response, content) {
          try {
            var json = JSON.parse(content)
            if (json && json.thumbnail_url) {
              video.thumb = json.thumbnail_url.replace(/\.webp/, '.png')
              video.save().then((doc) => {
                res.send({success: true, _id: doc._id.toString(), embed: doc.embed, thumb: doc.thumbnail, url: doc.url, type: 'video'})
              })              
            }
            else {
              res.send({error: 'invalid_twitch'})
            }
          }
          catch(e) {
            logger.error({label: 'Error fetching from vimeo API', error: e})
            res.send({error: 'invalid_twitch'})
          }
        })
      }
      // else thumbnail can be generated from existing data
      else {
        video.save().then((doc) => {
          res.send({success: true, _id: doc._id.toString(), embed: doc.embed, thumb: doc.thumbnail, url: doc.url, type: 'video'})
        })
      }
    }

    // must be regular image
    else {
      // check for imgur and giphy, others?
      // otherwise default to regular image
      request(req.body.url, {encoding: null}, function(err, resp, buffer) {
        var mmm = require('mmmagic')
        var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)
        magic.detect(buffer, (err, mime) => {
          var match = mime.match(/^image\/(png|jpg|gif|jpeg)/)
          // if image type detected then save file
          if (match) {
            if (match[1] === 'jpeg') {
              match[1] = 'jpg'
            }
            // setup database entry
            var screen = new Screenshot()
            screen.auraID = wago._id
            screen.localFile = screen._id.toString() + '.' + match[1] // filename

            // prepare save location
            try {
              fs.mkdirSync('/nfs/media/screenshots/' + wago._id)
            }
            catch (e) {
              if (e.code !== 'EEXIST') {
                logger.error({label: 'Error creating screenshot directory', error: e})
                return res.send({error: 'could not save'})
              }
            }

            // store image
            fs.writeFile('/nfs/media/screenshots/' + wago._id + '/' + screen.localFile, buffer, function(err) {
              if (err) {
                logger.error({label: 'Error saving image file', error: e})
                res.send({error: 'could not save'})
              }
              else {
                screen.save().then((doc) => {
                  res.send({success: true, _id: doc._id.toString(), src: doc.url, type: 'screenshot'})
                })
              }
            })
          }
          else {
            logger.warn({label: 'invalid mime', mime})
            res.send({error: 'No image found'})
          }
        })
      })
    }
  })
})

// add pasted image/base 64 format
server.post('/wago/upload/image/base64', (req, res) => {
  if (!req.user || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    var img = req.body.image || req.body.file || ''
    var match = img.match(/^data:image\/(png|jpg|gif|jpeg);base64,/i)
    if (img && match) {
      if (match[1] === 'jpeg') {
        match[1] = 'jpg'
      }
      // prepare image
      var data = img.replace(/^data:image\/\w+;base64,/, "")
      var buffer = new Buffer(data, 'base64')

      // setup database entry
      var screen = new Screenshot()
      screen.auraID = wago._id
      screen.localFile = screen._id.toString() + '.' + match[1] // filename

      // prepare save location
      try {
        fs.mkdirSync('/nfs/media/screenshots/' + wago._id)
      }
      catch (e) {
        if (e.code !== 'EEXIST') {
          logger.error({label: 'Error creating screenshot directory', error: e})
          return res.send({error: 'could not save'})
        }
      }

      // store image
      fs.writeFile('/nfs/media/screenshots/' + wago._id + '/' + screen.localFile, buffer, (err) => {
        if (err) {
          logger.error({label: 'Error saving image file', error: e})
          res.send({error: 'could not save'})
        }
        else {
          screen.save().then((doc) => {
            res.send({success: true, _id: doc._id.toString(), src: doc.url})
          })
        }
      })
    }
  })
})

// delete screenshot
server.post('/wago/update/delete/screenshot', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.screen) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    Screenshot.findById(req.body.screen).then((screen) => {
      if (screen) {
        screen.remove().then(() => {
          res.send({success: true}) 
        })
      }
      else {
        res.send({success: true})
      }
    })
  })
})

// delete screenshot
server.post('/wago/update/delete/video', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.video) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    Video.findById(req.body.video).then((video) => {
      if (video) {
        video.remove().then(() => {
          res.send({success: true}) 
        })
      }
      else {
        res.send({success: true})
      }
    })
  })
})

// sort screenshots
server.post('/wago/update/sort/screenshots', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.screens) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    async.eachOfSeries(req.body.screens.split(','), (item, key, done) => {
      Screenshot.findById(item).then((screen) => {
        if (screen.auraID == wago._id) {
          screen.sort = key
          screen.save().then(() => {
            done()
          })
        }
        else {
          done('noaccess')
        }
      })
    }, (err) => {
      if (err) {
        return res.send(403, {error: "forbidden"})
      }
      else {
        res.send({success: true})
      }
    })
  })
})

// sort videos
server.post('/wago/update/sort/videos', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.videos) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    async.eachOfSeries(req.body.videos.split(','), (item, key, done) => {
      Video.findById(item).then((video) => {
        if (video.wagoID == wago._id) {
          video.sort = key
          video.save().then(() => {
            done()
          })
        }
        else {
          done('noaccess')
        }
      })
    }, (err) => {
      if (err) {
        return res.send(403, {error: "forbidden"})
      }
      else {
        res.send({success: true})
      }
    })
  })
})

// delete wago import
server.post('/wago/update/delete/confirm', (req, res) => {
  if (!req.user || !req.body.wagoID) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_wago"})
    }

    wago.deleted = true
    var today = new Date()
    var expires = new Date(today.getFullYear(), today.getMonth(), today.getDate()+14)
    wago.expires_at = expires

    wago.save().then(() => {
      res.send({success: true})
    })
  })
})

// Add to collection
server.post('/wago/collection/add', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.collectionID) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.collectionID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_collection"})
    }

    if (wago.collect.length === 0 || wago.collect.indexOf(req.body.wagoID) === -1) {
      wago.collect.push(req.body.wagoID)
      wago.save().then(() => {
        res.send({success: true, added: true, name: wago.name, slug: wago.slug})
      })
    }
    else {
      res.send({error: 'Already in collection'})
    }    
  })
})

// Remove from collection
server.post('/wago/collection/remove', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.collectionID) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.collectionID).then((wago) => {
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.send(404, {error: "no_collection"})
    }

    if (wago.collect.length > 0) {
      var i = wago.collect.indexOf(req.body.wagoID)
      if (i > -1) {
        wago.collect.splice(i, 1)
        wago.save().then(() => {
          res.send({success: true, removed: true})
        })
      }
      else {
        res.send({error: 'Not in collection'})
      }
    }
    else {
      res.send({error: 'Not in collection'})
    }    
  })
})

// create new collection
server.post('/wago/collection/new', (req, res) => {
  if (!req.user || !req.body.wagoID || !req.body.name) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).select('_id').then((wago) => {
    var collection = new WagoItem()
    collection.name = req.body.name
    collection._userId = req.user._id
    collection.type = 'COLLECTION'
    collection.collect.push(req.body.wagoID)

    collection.save().then((doc) => {
      res.send({success: true, name: doc.name, collectionID: doc._id})
    })
  })
})

// gets embed javascript
server.get('/wago/embed', (req, res, next) => {
  res.header('Content-Type', 'text/plain')
  
  WagoItem.lookup(req.params.id).then((wago) => {
    if (!wago) {
      return res.send(404, "document.write('Error. Wago not found.')")
    }

    if (wago.hidden || wago.private) {
      return res.send(403, "document.write('Error. Not allowed to embed this Wago.')") 
    }

    WagoCode.lookup(wago._id).then((code) => {
      if (!code) {
        return res.send('No wago found.')
      }
      else if (code.json && code.json.match(commonRegex.WeakAuraBlacklist)) {
        return res.send('This WeakAura includes blacklisted functions. Embedding is not allowed.')
      }
      var theme = {}
      if (req.params.style === 'light') {
        var theme = {buttonBG: '#FFF', buttonHover: '#F4F4F4', textColor: 'rgba(0,0,0,.87)', logo: 'https://media.wago.io/favicon/apple-touch-icon-57x57.png'}
      }
      else if (req.params.style === 'dark') {
        var theme = {buttonBG: '#000', buttonHover: '#040404', textColor: 'rgba(255,255,255,.87)', logo: 'https://media.wago.io/favicon/apple-touch-icon-57x57.png'}
      }

      var embed = {}
      embed.id = wago._id
      embed.name = wago.name
      embed.url = wago.url
      embed.theme = theme
      if (embed.theme.logo) {
        embed.theme.logoHTML = `<a href="${embed.url}"><img src="${embed.theme.logo}"></a>`
      }
      else {
        embed.theme.logoHTML = ''
      }
      embed.code = code.encoded

      var js = `function wagoCopy(e,o){o=o.code;var t;e&&e.querySelector&&(t=e.querySelector(".clickToCopy"));var n=document.createElement("textarea");n.style.cssText="position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:0;outline:none;boxShadow:none;background:transparent",n.value=o,document.body.appendChild(n),n.select();try{return document.execCommand("copy"),document.body.removeChild(n),t&&(t.textContent="Copied!",setTimeout(function(){t.textContent="Click to copy"},3e3)),!0}catch(d){return document.body.removeChild(n),!1}}void 0===window.wagoCopy;`
      js = js + `var wago=wago||{};wago["c${wago.id}"]=${JSON.stringify(embed)};`
      if (embed.theme.logo) {
        js = js + `document.write('<style>#wago-${embed.id} a{display:inline;padding:0 2px;margin:0;border:0}#wago-${embed.id} img{display:inline;padding:0;margin:0;border:0;height:50px}#wago-${embed.id} button{display:inline;padding:4px 16px;min-width: 130px;background-color:${embed.theme.buttonBG};cursor:pointer;color:${embed.theme.textColor};border:0;text-align:center;vertical-align:top;border-radius:6px}#wago-${embed.id} button:hover{background-color:${theme.buttonHover}}#wago-${wago._id} .clickToCopy{display:block;padding:0;margin:0;font-size:10px}#wago-${embed.id} .wagoName{display:block;padding:0;margin:4px 0;font-weight:bold;font-size:13px}</style>');`
      }
      js = js + `document.write('<span id="wago-${embed.id}" class="wagoEmbed">${embed.theme.logoHTML}<button onclick="wagoCopy(this, wago.c${wago.id})" class="wagoCopyButton"><small class="clickToCopyWago">Click to copy import string from wago.io</small><div class="wagoName">${embed.name}</div></button></span>');`  

      res.send(js)
    })
  })
})

/* moved to /api */
server.get('/wago/raw/encoded', (req, res, next) => {
  req.pathname = '/api/raw/encoded'
  req.query = undefined // since redirect is combining query and params
  res.redirect(req, next);
})