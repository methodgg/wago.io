<template>
  <div v-html="formatText()" v-bind:class="{ noFormat: truncate > 0 }"></div>
</template>

<script>
import XBBCode from '../libs/xbbcode'
export default {
  props: ['text', 'truncate', 'plaintext'],
  methods: {
    formatText: function () {
      // format plaintext
      if (this.plaintext) {
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
          enableURLs: this.text.enableLinks && !(this.truncate),
          enableWagoURLs: this.text.enableLinks && !(this.truncate)
        }).html
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
</style>

