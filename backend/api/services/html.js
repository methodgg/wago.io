const image = require('../helpers/image')

module.exports = function (fastify, opts, next) {
  // generates .js for external embeds
  fastify.get('/embed-js', async (req, res, next) => {
    res.header('Content-Type', 'text/javascript')
    
    const wago = await WagoItem.lookup(req.query.id)
    if (!wago) {
      return res.code(404).send("document.write('Error. Wago not found.')")
    }

    if (wago.hidden || wago.private) {
      return res.code(403).send("document.write('Error. Not allowed to embed this Wago.')") 
    }

    const code = await WagoCode.lookup(wago._id)
    if (!code) {
      return res.code(404).send("document.write('Error. Wago not found.')")
    }
    else if (code.json && code.json.match(commonRegex.WeakAuraBlacklist)) {
      return res.send("document.write('This WeakAura includes blacklisted functions. Embedding is not allowed.')")
    }
    var theme = {}
    if (req.query.style === 'light') {
      var theme = {buttonBG: '#FFF', buttonHover: '#F4F4F4', textColor: 'rgba(0,0,0,.87)', logo: 'https://media.wago.io/favicon/apple-touch-icon-57x57.png'}
    }
    else if (req.query.style === 'dark') {
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

  // return static preview content for twitter/discord bots
  fastify.get('/twitter-card-html', async (req, res) => {
    // set defaults
    var data = {
      title: 'Wago.io',
      description: 'Wago.io is a database of sharable World of Warcraft addon elements',
      url: req.query.url,
      image: 'https://media.wago.io/site/twitter-card-bg.png'
    }
    if (req.query.url && req.query.url.match(/^wago.io\/([^\/]+)/)) {
      const wagoID = req.query.url.match(/^wago.io\/([^\/]+)/)
      const doc = await WagoItem.lookup(wagoID[1])
      if (doc && doc.private) {
        res.code(404)
        res.send('No content here!')
        return
      }
      else if (doc) {
        data.title = escapeHTML(doc.name)
        if (doc.description) {
          // remove line breaks and bbcode tags
          
          data.description = escapeHTML(doc.description.replace(/\n/g, ' ').replace(/\[\/?(?:b|center|code|color|face|font|i|justify|large|left|li|list|noparse|ol|php|quote|right|s|size|small|sub|sup|taggeduser|table|tbody|tfoot|thead|td|th|tr|u|ul|url|\*).*?\]/g, ''))
        }
        data.image = 'https://data.wago.io/html/twitter-card-image?id=' + doc._id
        data.image = 'http://ubuntu:3030/html/twitter-card-image?id=' + doc._id
      }
    }
    res.header('Content-Type', 'text/html')
    res.send(TemplateEngine(previewTemplate, data))
  })

  // generate image for twitter or disord preview
  fastify.get('/twitter-card-image', async (req, res) => {
    if (!req.query.id) {
      res.code(404)
      res.send('No image here')
      return
    }
    const doc = await WagoItem.lookup(req.query.id)
    if (doc && doc.private) {
      res.code(404)
      res.send('No content here!')
      return
    }
    const screen = await Screenshot.findForWago(req.query.id, true)
    if (screen && screen.localFile) {
      if (doc.type === 'WEAKAURAS2') {
        doc.type = 'WEAKAURA'
      }
      var user
      if (doc._userId) {
        user = await User.findById(doc._userId).exec()
        if (user) {
          user = {name: user.account.username, avatar: user.profile.avatar.gif || user.profile.avatar.png}
        }
      }
      const img = await image.createTwitterCard(`/${screen.auraID}/${screen.localFile}`, doc.name, doc.type, user)
      if (img) {
        res.header('Content-Type', 'image/jpeg')
        res.cache(86400).send(img)
        return
      }
    }

    res.code(404)
    res.send('No content here')
  })
  next()
}

const previewTemplate = `<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=0">
    <title><%this.title%></title>
    <meta name="description" content="<%this.description.substr(0, 120)%>">
    <meta name="og:type" content="article">
    <meta name="og:title" content="<%this.title%>">
    <meta name="og:url" content="<%this.url%>">
    <meta name="og:image" content="<%this.image%>">
    <meta name="og:description" content="<%this.description.substr(0, 120)%>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@Wago_io">
    <meta name="twitter:title" content="<%this.title%>">
    <meta name="twitter:description" content="<%this.description.substr(0, 120)%>">
    <meta name="twitter:image" content="<%this.image%>">
 </head>
<body>
  <div id="app">
    <img src="<%this.image%>"/>
    <p><%this.description%></p>
  </div>
</body>`

// thanks to http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
const TemplateEngine = function(html, data) {
  var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
  var add = function(line, js) {
      js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
          (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
      return add;
  }
  while(match = re.exec(html)) {
      add(html.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
  }
  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';

  return new Function(code.replace(/[\r\t\n]/g, '')).apply(data);
}

const escapeHTML = (html) => {
  return html.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

