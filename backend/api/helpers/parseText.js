const xbb = require('./xbb')
const prism = require('markdown-it-prism')
const prismLua = require('prismjs/components/prism-lua')
const prismSass = require('prismjs/components/prism-sass')
const markdown = require('markdown-it')({linkify: true})
markdown.use(prism)

module.exports = function (content, enableLinks) {
  if (!content.text || typeof content.text !== 'string') {
    return ''
  }
  else if (content.format === 'bbcode') {
    return xbb.process({
      text: content.text,
      tags: {},
      removeMisalignedTags: true,
      addInLineBreaks: true,
      enableURLs: enableLinks,
      enableWagoURLs: true
    }).html
  }
  else if (content.format === 'markdown') {
    html = markdown.render(content.text)
    if (!enableLinks) {
      html = html.replace(/<\/?a(?:(?= )[^>]*)?>/g, '')
    }
    return html
  }
  return content.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}