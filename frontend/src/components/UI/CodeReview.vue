<template>
  <md-card class="code-review">
    <md-card-content>
      <div class="review-title">
        <strong>{{name}}</strong>
        <a v-if="link" href="#" @click.prevent="$emit('loadFn')">{{ $t('View Code') }}</a>
      </div>
      <div class="code-review-content" :style="{height: height}" :class="{para: !luacheck}">
        <pre v-if="luacheck" v-html="parsedAlerts" class="parsedAlerts"></pre>
        <pre v-html="parsed"></pre>
      </div>
      <div v-if="comment && comment.falsePositive && hasAlert && enableForm" class="comment">
        <div class="review-ok">{{ $t('[-author-] has marked this as a false positive', {author: comment.author.name}) }}</div>
        <div class="md-subhead">{{ comment.date | moment('LLL') }}</div>
        <div class="comment-text" v-if="comment.text" v-html="parseCommentText(comment)"></div>
        <div v-if="author && !showForm && enableForm" style="margin: 0 0 0 16px">
          <md-button @click="makeComment" class="md-primary">{{ $t("Edit False Positive") }}</md-button>
        </div>
      </div>
      <div v-else-if="comment && comment.text && hasAlert && enableForm" class="comment">
        <div>{{ $t('[-author-] has replied with a comment', {author: comment.author.name}) }}</div>
        <div class="md-subhead">{{ comment.date | moment('LLL') }}</div>
        <div class="comment-text" v-html="parseCommentText(comment)"></div>
        <div v-if="author && !showForm && enableForm" style="margin: 0 0 0 16px">
          <md-button @click="makeComment" class="md-primary">{{ $t("Edit Comment") }}</md-button>
        </div>
      </div>
      <div v-else-if="author && hasAlert && !showForm && enableForm">
        <md-button @click="makeComment" class="md-primary">{{ $t("Comment or Flag as a false positive") }}</md-button>
      </div>
      <template v-if="showForm && enableForm">
        <md-input-container>
          <label>{{ $t('Comment') }}</label>
          <md-textarea v-model="commentText"></md-textarea>
        </md-input-container>
        <md-checkbox v-model="falsePositive">{{ $t('Flag as false positive and remove alert') }}</md-checkbox>
        <md-button @click.once="submitComment()" :disabled="commentText.length<5" class="md-primary">{{ $t("Submit") }}</md-button>
      </template>
    </md-card-content>
  </md-card>
</template>

<script>
import XBBCode from '../libs/xbbcode'

export default {
  props: ['name', 'link', 'luacheck', 'author', 'review'],
  data: function () {
    return {
      parsed: '',
      parsedAlerts: '',
      height: '',
      regexAlerts: /^(.*?(\((E\d+|W111|W121)\)).*?)$/gm,
      hasAlert: false,
      showForm: false,
      commentText: '',
      falsePositive: false,
      enableForm: false,
      comment: null
    }
  },
  methods: {
    getParsed: function () {
      var text
      if (this.review && this.review.display) {
        text = this.review.display.trim()
      }
      else {
        text = this.$slots.default[0].text.trim()
      }
      if (this.review && this.review.id && this.review.id.match(/textEveryFrameDisplay|textEveryFrameTrigger/)) {
        this.enableForm = true
      }

      if (text === 'OK') {
        text = '<span class="ok">OK</span>\nNo errors or warnings detected.'
      }
      else {
        if (this.luacheck) {
          var alerts = (text.match(this.regexAlerts) || []).length
          if (alerts) {
            alerts = `: <span class="inline-alert">${this.$t('[-count-] alert', {count: alerts})}</span>`
          }
          else {
            alerts = ''
          }

          text = text.replace(/^(\d+ errors?)/, '<span class="error">$1</span>')
          text = text.replace(/^(\d+ warnings?)/, '<span class="warn">$1</span>' + alerts)
          text = text.replace(/^(.*?)(\([EW]\d+\))(.*?)$/gm, '$1 $3 <span class="luacheckcode">$2</span>')

          text = text.replace(/(\d+):(\d+):\s*/g, '<span class="location" title="Line $1, Column $2"><span class="linenum">$1</span>:<span class="colnum">$2</span></span>: ')

          text = text.replace(/'(.*?)'/g, '<span class="string">\'$1\'</span>')
          text = text.replace(/ line (\d+) /g, ' line <span class="linenum">$1</span> ')
          text = text.replace(/ global /g, ' <span class="global">global</span> ')
          text = text.replace(/Total: \d+ warning.*$/, '')
        }

        else {
          if (text.match(/\(0\):/)) {
            this.hasAlert = true
            if (this.$store.state.wago.codeReviewComments) {
              this.comment = this.$store.state.wago.codeReviewComments[this.review.id + ':' + this.review.name]
            }
          }
          text = text.replace(/'(.*?)'/g, '<span class="colnum">$1</span>')
          if (this.comment && this.comment.falsePositive) {
            text = text.replace(/^(.*)\(0\):(.*)$/, '$1<p class="review-warning"><i class="side-warning material-icons" title="Code Alert!">warning</i>$2</p>')
          }
          else {
            text = text.replace(/^(.*)\(0\):(.*)$/, '$1<p class="review-alert"><i class="side-alert material-icons" title="Code Alert!">error_outline</i>$2</p>')
            text = text.replace(/^0:(\w*)$/gm, '<p class="review-alert"><i class="side-alert material-icons" title="Code Alert!">error_outline</i>$1</p>')
          }
          text = text.replace(/^(.*)\(1\):(.*)$/, '$1<p class="review-ok"><i class="side-ok material-icons">done</i>$2</p>')
        }
      }
      if (this.luacheck) {
        this.height = (17 * (1 + (text.match(/\n/g) || []).length) + 8) + 'px'
      }
      return text.trim()
    },
    getParsedAlerts: function () {
      var text
      if (this.review && this.review.display) {
        text = this.review.display.trim()
      }
      else {
        text = this.$slots.default[0].text.trim()
      }
      if (!this.luacheck || text === 'OK') {
        return ''
      }

      text = text.replace(this.regexAlerts, '<i class="side-alert material-icons" title="Code Alert!">error_outline</i>')

      text = text.replace(/^\d.*$/gm, '')
      text = text.replace(/Total: \d+ warning.*$/, '')
      return text
    },
    makeComment: function () {
      if (this.comment) {
        this.falsePositive = this.comment.falsePositive
        this.commentText = this.comment.text
      }
      this.showForm = true
    },
    parseCommentText: function (comment) {
      if (!comment) {
        return ''
      }
      else if (comment.format === 'bbcode') {
        return XBBCode.process({
          text: comment.text,
          removeMisalignedTags: true,
          addInLineBreaks: true,
          enableURLs: comment.author.enableLinks
        }).html
      }
    },
    submitComment: function () {
      this.http.post('/comments/codereview', {
        wagoID: this.$store.state.wago._id,
        text: this.commentText,
        falsePositive: this.falsePositive ? 1 : 0,
        block: this.review.id + ':' + this.review.name
      }).then((res) => {
        this.$emit('setComment', this.review.id + ':' + this.review.name, this.commentText, this.falsePositive ? 1 : 0)
        this.showForm = false
      })
    }
  },
  beforeUpdate () {
    this.parsed = this.getParsed()
    this.parsedAlerts = this.getParsedAlerts()
  },
  created () {
    this.parsed = this.getParsed()
    this.parsedAlerts = this.getParsedAlerts()
  }
}
</script>

<style>
.md-card.code-review {margin: 0 0 8px 0}
.md-card.code-review .md-card-content {padding: 0}
.code-review a {font-size: 90%; white-space: nowrap; align-self: flex-end}
.code-review .code-review-content {position: relative;}
.code-review .review-title {display: flex; flex-direction: row; justify-content: space-between}
@media (max-width: 560px) {
  .code-review pre {overflow-x: auto}
}
.code-review pre, .code-review .comment {padding: 4px; background: rgba(0,0,0,.3); border-radius: 4px; line-height: 125%; margin: 0; z-index:1; width: 100%;}
.code-review pre { position: absolute; }
.code-review .comment { margin-top: 8px }
.code-review .comment-text { margin: 4px 0 0 20px }
.code-review pre.parsedAlerts {z-index:0; background: none}
.code-review pre .ok {color: #0dcc00 }
.code-review pre .error {color: #e6000a }
.code-review pre .warn {color: #cc9700 }
.code-review pre .inline-alert {color: #e6000a;}
.code-review pre .inline-alert i {font-size: 12pt; font-weight: bold}
.code-review pre .review-ok .material-icons {font-size: 12pt; font-weight: bold; vertical-align: top;}
.code-review pre .side-ok {color: #0dcc00; margin-left: -20px; float: left; font-size: 12pt; font-weight: bold}
.code-review pre .side-warning {color: #cc9700; margin-left: -20px; float: left; font-size: 12pt; font-weight: bold}
.code-review pre .side-alert {color: #bb0008; margin-left: -20px; float: left; font-size: 12pt; font-weight: bold}
.code-review pre .side-alert:before {content:' '; width: 100%; height: 16px; position: absolute; left:0; right: 0; background: rgba(255, 0, 0, 0.15);}
.code-review pre .luacheckcode {color: #555; font-size:80%; line-height: 100%; vertical-align: 1px;}
.code-review pre .location {display: inline-block; text-align: right; min-width: 40px}
.code-review pre .linenum {color: #56f442; font-weight: bold}
.code-review pre .colnum {color: #95c7fe; font-weight: bold}
.code-review pre .location .linenum, pre .location .colnum {display: inline-block; text-align: right; min-width: 24px}
.code-review pre .string {color: #10a810 }
.code-review pre .global {color: #25c7fe }

.code-review .para {height: auto!important}
.code-review .para pre {white-space: pre-wrap; position: relative;}
.code-review .para pre p {margin: 0 0 0 20px}
.code-review .para pre p.review-alert {color: #ffb5b5}
.code-review .para pre p.review-warning {color: #cc9700}
.code-review .para pre p.review-ok, .code-review .comment .review-ok {color: #b5ffb7}
.code-review pre p .side-alert, .code-review pre p .side-ok, .code-review pre p .side-warning {margin-left: -40px;}
.code-review pre p .side-alert:before {content:none; background: none;}

.code-review button.md-button.md-primary {float: right; margin-right: 0}
.code-review .md-input-container {margin-bottom: 8px;}
</style>
