<template>
  <div v-html="formatText()" v-bind:class="{ noFormat: truncate > 0 }" :class="'usertext ' + (text.format || 'bbcode') "></div>
</template>

<script>
import XBBCode from '../libs/xbbcode'
const markdown = require('markdown').markdown

export default {
  props: ['text', 'truncate', 'plaintext', 'enableLinks'],
  methods: {
    formatText: function () {
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
        var html = markdown.toHTML(this.text.text)
        if (!this.enableLinks || this.truncate) {
          html = html.replace(/<\/?a(?:(?= )[^>]*)?>/g, '')
        }
        return html
      }

      else {
        return this.text.text
      }
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
</style>

