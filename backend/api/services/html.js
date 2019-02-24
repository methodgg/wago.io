
module.exports = function (fastify, opts, next) {
  // generates .js for external embeds
  fastify.get('/embed-js', async (req, res, next) => {
    res.header('Content-Type', 'text/plain')
    
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
  next()
}