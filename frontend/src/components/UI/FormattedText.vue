<template>
  <div v-html="formatText()" v-bind:class="{ noFormat: truncate && truncate > 0 }" :class="'usertext ' + (text.format || 'bbcode') "></div>
</template>

<script>
import XBBCode from '../libs/xbbcode'
const markdown = require('markdown').markdown

export default {
  props: ['text', 'truncate', 'plaintext', 'enableLinks'],
  methods: {
    formatText: function () {
      var html
      // validate content
      if (!this.text.text) {
        return ''
      }
      // format plaintext
      else if (this.plaintext) {
        var plaintext = this.text.text.replace(/\[\/?(?:b|center|code|color|face|font|i|justify|large|left|li|noparse|ol|php|quote|right|s|size|small|sub|sup|taggeduser|table|tbody|tfoot|td|th|tr|u|url|\*)*?.*?\]/g, '').replace(/\n/g, ' ')

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
        html = markdown.toHTML(this.text.text)
        if (!this.enableLinks || this.truncate) {
          html = html.replace(/<\/?a(?:(?= )[^>]*)?>/g, '')
        }
        return html.replace(/\n/, '<br>')
      }

      else if (this.text.format === 'error') {
        const regexes = [
          {re: /(\.\.\.)?[\w@_\\.\-()]+\\/, class: 'error-filepath'},
          {re: /[\w@_\\.\-()]+\.lua/, class: 'error-filename'},
          {re: /^Time:(.*?\d+ \d{4})$/, class: 'error-keyvar', replace: (s) => {return `Time: <span class="error-keyvar">${s.slice(5)}</span>`}}, // eslint-disable-line
          {re: /:(\d+)/, class: 'error-linenum', replace: (s) => {return `:<span class="error-linenum">${s.slice(1)}</span>`}}, // eslint-disable-line
          {re: /[\b\s[:](nil|Infinite|&lt;([a-z]+)&gt;|\d+\.?\d?)[\b\s:\]]/, class: 'error-keyvar'},
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
        return html
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

<style>
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
.usertext.bbcode ol, .usertext.bbcode ul { margin: 0}
.usertext.bbcode ol, .usertext.bbcode ul, .usertext.bbcode li { white-space: normal}

#errorReport { white-space: pre; }
.error-filepath { color: #25c7fe;}
.error-filename { color: #95c7fe; font-weight: bold}
.error-linenum { color: #56f442; font-weight: bold}
.error-keyvar { color: #DCBB8a}
.error-quoted { color: #10A810}
.error-assignment { color: #FFA500}
</style>

