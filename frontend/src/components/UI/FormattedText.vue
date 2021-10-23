<template>
  <div v-bind:class="{ noFormat: truncate && truncate > 0 }" :class="'usertext ' + (text.format || 'bbcode') ">
    <slot></slot>
  </div>
</template>

<script>
import XBBCode from '../libs/xbbcode'
import mdUnderline from '../libs/markdownUnderline'
import flowchart from 'flowchart.js'
import prism from 'markdown-it-prism'
import 'prismjs/components/prism-lua'
import 'prismjs/components/prism-sass'

// Actual default values
var md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    return ''; // use external default escaping
  }
});

export default {
  props: ['text', 'truncate', 'plaintext', 'enableLinks'],
  mounted: function() {
    this.$el.innerHTML = this.formatText()
  },
  methods: {
    formatText: function () {
      var html = this.$el.innerHTML
      // validate content
      if (!this.text.text) {
        this.text.text = html
      }
      if (!this.text.text) {
        return ''
      }

      // format plaintext
      if (this.plaintext) {
        var plaintext = this.text.text.replace(/\[\/?(?:b|center|code|color|face|font|i|justify|large|left|li|noparse|ol|php|quote|right|s|size|small|sub|sup|taggeduser|table|tbody|tfoot|td|th|tr|u|url|\*)*?.*?\]/g, '').replace(/\n/g, ' ')
        plaintext = plaintext.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        // if shortening the text
        if (this.truncate && this.truncate > 0 && plaintext.length > this.truncate) {
          // truncate to length
          plaintext = plaintext.substr(0, this.truncate)
          // truncate to last word
          plaintext = plaintext.substr(0, Math.min(plaintext.length, plaintext.lastIndexOf(' '))) + '...'
        }
        return plaintext
      }

      // format bbcode
      else if (this.text.format === 'bbcode') {
        return XBBCode.process({
          text: this.text.text,
          tags: {},
          removeMisalignedTags: true,
          addInLineBreaks: !(this.truncate > 0),
          enableURLs: this.enableLinks && !(this.truncate),
          enableWagoURLs: this.enableLinks && !(this.truncate)
        }).html
      }

      // format markdown
      else if (this.text.format === 'markdown') {
        const markdown = require('markdown-it')({linkify: true, html: this.text.html})
        markdown.use(mdUnderline)
        markdown.use(prism)
        html = markdown.render(this.text.text)
        if (!this.enableLinks || this.truncate) {
          html = html.replace(/<\/?a(?:(?= )[^>]*)?>/g, '')
        }
        if (this.truncate) {
          return html
        }

        if (html.match(/<code class="language-flowchart">/)) {
          this.$nextTick(() => {
            document.querySelectorAll('#wago-description .language-flowchart').forEach(element => {
              try {
                let code = element.textContent
                if (!this.enableLinks) {
                  code = code.replace(/:>/g, '')
                }
                let chart = flowchart.parse(code)
                element.textContent = ''
                chart.drawSVG(element)
              }
              catch (e) {
                element.outerHTML = `<pre>flowchart complains: ${e}</pre>`
              }
            })
          })
        }

        return html
      }

      else if (this.text.format === 'error') {
        const regexes = [
          {re: /(\.\.\.)?[!\w@_\\.\-()]+\\/, class: 'error-filepath'},
          {re: /[^\\]+?\.lua/, class: 'error-filename'},
          {re: /^Time:.*$/, class: 'error-keyvar', replace: (s) => {return `Time: <span class="error-keyvar">${s.slice(5)}</span>`}}, // eslint-disable-line
          {re: /:(\d+)/, class: 'error-linenum', replace: (s) => {return `:<span class="error-linenum">${s.slice(1)}</span>`}}, // eslint-disable-line
          {re: /ADDON_ACTION_BLOCKED/, class: 'error-warning'},
          {re: /[\b\s[:](nil|Infinite|&lt;[a-z]+&gt;|\d+\.?\d?)[\b\s:\]]/, class: 'error-keyvar'},
          {re: /&quot;[^<>]*?&quot;/, class: 'error-quoted'},
          {re: /(`|').*?'/, class: 'error-quoted'},
          {re: /^([^\s]+) =/, class: 'error-assignment', replace: (s) => {return `<span class="error-assignment">${s.slice(0, -2)}</span> =`}}, // eslint-disable-line
        ]
        const regexString = new RegExp(regexes.map(a => a.re.source).join('|'), 'gm')
        let m
        this.text.text = this.safeHTML(this.text.text)
        html = this.text.text

        const wrapClass = (html, search, replace) => {
          const index = html.lastIndexOf('</span>') + 1
          if (html.length > index) {
            return html.slice(0, index) + html.slice(index).replace(search, replace)
          }
          return html
        }

        while ((m = regexString.exec(this.text.text)) !== null) {
          for (let i = 0; i < regexes.length; i++) {
            if (m[0].match(regexes[i].re)) {
              var replace
              if (typeof regexes[i].replace === 'function') {
                replace = regexes[i].replace(m[0])
              }
              else {
                replace = `<span class="${regexes[i].class}">${m[0]}</span>`
              }
              html = wrapClass(html, m[0], replace)
              break
            }
          }
        }
        return `<div class="error-report">${html}</div>`
      }

      else {
        return this.text.text
      }
    },

    safeHTML (str) {
      const entityMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }
      return String(str).replace(/[<>"]/g, function (s) {
        return entityMap[s]
      })
    }
  }
}

</script>

<style lang="scss">
.noFormat * {
  color: inherit!important;
  font-weight: inherit!important;
  font-size: inherit!important;
  font-style: inherit!important;
  text-decoration: inherit!important;
  margin-left: inherit!important;
  margin-right: inherit!important;
  text-align: inherit!important;
  display: inline!important;
}
.noFormat img, .noFormat table {
  display: none!important;
}
.usertext { margin-bottom: 1em}
.usertext.bbcode ol, .usertext.bbcode ul { margin: 0}
.usertext.bbcode ol, .usertext.bbcode ul, .usertext.bbcode li { white-space: normal}

.error-report { white-space: pre; }
.error-filepath { color: #25c7fe;}
.error-filename { color: #95c7fe; font-weight: bold}
.error-linenum { color: #56f442; font-weight: bold}
.error-keyvar { color: #DCBB8a}
.error-warning { color: #C1272D; font-weight: bold}
.error-quoted { color: #10A810}
.error-assignment { color: #FFA500}

#wago-description .md-tabs .md-tabs-navigation { height: auto; }
#wago-description .md-tabs .md-tabs-wrapper {transition: none}
#wago-description .md-tabs .md-tabs-navigation-scroll-container {flex-wrap: wrap}
#wago-description .md-tabs .warning {margin-left: 0; margin-bottom: 1em}
#wago-description .md-theme-default.md-tabs>.md-tabs-navigation .md-tab-indicator {display: none}
#wago-description .md-theme-default.md-tabs>.md-tabs-navigation .md-tab-header.md-active, #wago-description .md-theme-default.md-tabs>.md-tabs-navigation .md-tab-header:focus {background: #d7373d}
#wago-description .md-theme-default.md-tabs>.md-tabs-navigation .md-tab-header:hover {color: white}

#wago-description .language-flowchart { border: 1px solid #777; background: #DDD; display: inline-block;}

.markdown {
  details > summary {
    cursor: pointer;
  }
  p > code {
    padding: 4px;
    margin: 0 2px;
    background: #111111!important;
    color: #DDD!important;
  }
  pre {
    padding: 8px;
    border: 2px solid #111;
    background: #1C1C1C;
    border-radius: 4px;
    white-space: break-spaces;
    code {
      background-color: inherit!important;
      color: #9CDCFE!important;
      .token.keyword { color: #569CD6}
      .token.ident { color: #9CDCFE}
      .token.function { color: #DCDCAA}
      .token.punctuation { color: #DCDCAA}
      .token.string { color: #CE9178}
      .token.number { color: #B5C078}
      .token.comment { color: #6A8A35}
      .token.operator { color: #DDD}
      .token.selector { color: #D7B262}
      .token.property-line { color: #438CA1; font-weight: bold}
    }
  }
  table {
    border-collapse: collapse;
    th {
      text-align: left;
    }
    th, td {
      padding: 8px;
      border: 1px solid #555;
    }
    th {background-color: #111;}
    tr:nth-child(even) {background-color: #252525;}
    tr:nth-child(odd) {background-color: #333;}
  }
  hr {
    border: 0;
    border-top: 1px solid #555;
  }
  .button {
    display: inline-block;
    background: #c1272d;
    min-width: 88px;
    min-height: 36px;
    line-height: 36px;
    margin: 6px 8px;
    padding: 0 16px;
    border: 0;
    border-radius: 4px;
    color: white!important;
    font-weight: bold;
    text-transform: uppercase;
  }
  .button:hover {
    text-decoration: none!important
  }
}
</style>

