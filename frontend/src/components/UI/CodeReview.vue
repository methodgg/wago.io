<template>
  <md-layout md-row class="code-review">
    <md-card v-if="name" :class="{alerts}">
      <md-card-content>
        <div class="review-title">
          <strong v-if="canMin && minimized" @click="minimized=false" class="can-minimize">
            <i class="minimized md-icon md-list-expand-indicator md-theme-default material-icons">keyboard_arrow_down</i> {{name}}
            <span v-if="subtitle" class="subtitle"> - {{ subtitle }}</span>
          </strong>
          <strong v-else-if="canMin" @click="minimized=true" class="can-minimize">
            <i class="md-icon md-list-expand-indicator md-theme-default material-icons">keyboard_arrow_down</i> {{name}}
          </strong>
          <strong v-else>{{name}}</strong>
          <a v-if="link" href="#" @click.prevent="$emit('loadFn')">{{ $t('View Code') }}</a>
        </div>
        <template v-if="!canMin || !minimized">
          <div class="code-review-content" :style="{height: height}" :class="{para: !luacheck}">
            <pre v-if="luacheck || alerts" v-html="parsedAlerts" class="parsedAlerts"></pre>
            <pre v-if="codeInfo" v-html="parsedInfo" class="parsedInfo"></pre>
            <pre v-html="parsed"></pre>
          </div>
          <div v-if="author && !showForm && enableEveryFrameForm">
            <md-button @click="makeComment" class="md-primary">{{ $t("Submit Every Frame Report") }}</md-button>
          </div>
          <md-layout class="report-form" v-if="showForm && enableEveryFrameForm">
            <md-checkbox v-model="falsePositive">{{ $t('Check if the \'Every Frame\' alert(s) have an undetected throttle or if Every Frame processing is actually necessary to function properly') }}</md-checkbox>
            <md-button @click.once="submitComment('EveryFrame')" class="md-primary">{{ $t("Submit") }}</md-button>
          </md-layout>
        </template>
      </md-card-content>
    </md-card>
    <div v-if="highlights && (highlights.dependencies.length || highlights.highlights.size)" :class="'highlights' + (!alerts ? ' without-alerts' : '')">
      <div v-if="highlights.dependencies.length">
        <em>{{ $t('Import Dependencies') }}</em>
        <template v-for="dep of highlights.dependencies"><span><md-icon :class="{warning: dep.warn}">extension</md-icon> {{ dep }}</span></span></template>
      </div>
      <div v-if="highlights.highlights.size">
        <em>{{ $t('Highlighted Functionality') }}</em>
        <template v-if="highlights.highlights.has('keybind')"><span><md-icon>keyboard</md-icon> {{ $t('Sets keybinds') }}</span></span></template>
        <template v-if="highlights.highlights.has('tts')"><span><md-icon>volume_up</md-icon> {{ $t('Uses text-to-speech') }}</span></span></template>
        <template v-if="highlights.highlights.has('audio')"><span><md-icon>volume_up</md-icon> {{ $t('Plays audio') }}</span></span></template>
        <template v-if="highlights.highlights.has('chat')"><span><md-icon>chat</md-icon> {{ $t('Sends chat messages') }}</span></span></template>
      </div>
    </div>
  </md-layout>
</template>

<script>
import XBBCode from '../libs/xbbcode'

export default {
  props: ['name', 'link', 'luacheck', 'codeInfo', 'author', 'alerts', 'review', 'json', 'highlights', 'canMin'],
  data: function () {
    return {
      parsed: '',
      parsedAlerts: '',
      parsedInfo: '',
      height: '',
      regexAlerts: /^(.*?(\((E\d+|W111|W121|W122)\)).*?)$/gm,
      hasAlert: false,
      showForm: false,
      commentText: '',
      falsePositive: false,
      enableEveryFrameForm: false,
      comment: null,
      minimized: false,
      subtitle: '',
      incrID: 1
    }
  },
  watch: {
    minimized () {
      if (this.luacheck && this.canMin && this.minimized) {
        window.localStorage.setItem('minLuacheck', 1)
      }
      else if (this.luacheck && this.canMin) {
        window.localStorage.removeItem('minLuacheck')
      }
      if (this.codeInfo && this.canMin && this.minimized) {
        window.localStorage.setItem('minCodeInfo', 1)
      }
      else if (this.codeInfo && this.canMin) {
        window.localStorage.removeItem('minCodeInfo')
      }
    }
  },
  methods: {
    getParsed: function () {
      if (this.codeInfo) {
        return ''
      }
      let linkMap = []
      var text = ''
      if (this.review && this.review.display) {
        text = this.review.display.trim()
      }
      else if (this.$slots.default) {
        text = this.$slots.default[0].text.trim()
      }

      if (text === 'OK') {
        text = '<span class="ok">OK</span>\nNo errors or warnings detected.'
      }
      else {
        if (this.luacheck) {
          var alerts = (text.match(this.regexAlerts) || []).length
          if (alerts) {
            this.subtitle = this.$t('[-count-] alert', {count: alerts})
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

        else if (this.alerts) {
          for (const [id, item] of Object.entries(this.alerts)) {
            if (id.match(/EveryFrame/)) {
              this.enableEveryFrameForm = true
            }
            let line
            if (item.keypath) {
              line = item.display.replace(/'(.*?)'/g, `<span class="colnum linkedFn" id="fnLink${this.incrID}">\'$1\'</span>`)
              linkMap.push({id: `fnLink${this.incrID++}`, fn: item.keypath})
            }
            else {
              line = item.display.replace(/'(.*?)'/g, `<span class="colnum">\'$1\'</span>`)
            }

            if (line.match(/\(0\):/)) {
              this.hasAlert = true
            }
            if (this.$store.state.wago.codeReviewComments && this.$store.state.wago.codeReviewComments.EveryFrame) {
              this.falsePositive = !!this.$store.state.wago.codeReviewComments.EveryFrame.falsePositive
              if (this.falsePositive) {
                line = line.replace(/^(.*)\(0\):(.*)$/, '$1<p class="review-ok">$2</p>')
              }
              else {
                line = line.replace(/^(.*)\(0\):(.*)$/, '$1<p class="review-alert">$2</p>')
              }
            }
            else {
              line = line.replace(/^(.*)\(0\):(.*)$/, '$1<p class="review-alert">$2</p>')
              line = line.replace(/^0:(\w*)$/gm, '<p class="review-alert">$1</p>')
            }
            line = line.replace(/^(.*)\(1\):(.*)$/, '$1<p class="review-ok">$2</p>')
            text += line + '<br>'
          }
        }
      }
      if (this.luacheck) {
        this.height = (17 * (1 + (text.match(/\n/g) || []).length) + 8) + 'px'
      }

      if (linkMap.length) {
        this.$nextTick(() => {
          linkMap.forEach(link => {
            document.getElementById(link.id).addEventListener('click', () => {
              this.$emit('loadFn', link.fn)
            })
          })
        })
      }
      return text.trim()
    },
    getParsedAlerts: function () {
      if (this.codeInfo || !this.luacheck) {
        return ''
      }
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
    getParsedInfo: function () {
      if (!this.codeInfo || !this.json) {
        return ''
      }
      let text = ''
      text += `Lines of Code: <span class="colnum">${this.json.nloc || 'error'}</span>\n`
      text += `Total Tokens: <span class="colnum">${this.json.tokens || 'error'}</span>\n`

      if (!(typeof this.json.ccn === 'number' && isFinite(this.json.ccn))) {
        text += `Cyclomatic Complexity: <span class="colnum">error</span>\n`
      }
      else if (this.json.ccn <= 10) {
        text += `Cyclomatic Complexity: <strong class="linenum">${Math.round(this.json.ccn)}</strong><span class="define"> - ${this.$t('Values of 10 and lower indicate that the code is simple and easy to understand.')}</span>\n`
      }
      else if (this.json.ccn <= 20) {
        text += `Cyclomatic Complexity: <strong class="warn">${Math.round(this.json.ccn)}</strong><span class="define"> - ${this.$t('Values between 11 and 20 indicate that the code is moderately complex will begin to have difficulty testing.')}</span>\n`
      }
      else {
        text += `Cyclomatic Complexity: <strong class="error">${Math.round(this.json.ccn)}</strong><span class="define"> - ${this.$t('Values above 20 indicate high complexity and will be very difficult to test all situations.')}</span>\n`
      }

      if (!(typeof this.json.maintainability === 'number' && isFinite(this.json.maintainability))) {
        text += `Maintainability Index: <span class="colnum">error</span>\n`
      }
      else if (this.json.maintainability >= 20) {
        text += `Maintainability Index: <strong class="linenum">${Math.round(this.json.maintainability)}</strong><span class="define"> - ${this.$t('Values of at least 20 indicate that the code is probably well written and easily maintainable.')}</span>\n`
      }
      else if (this.json.maintainability >= 10) {
        text += `Maintainability Index: <strong class="warn">${Math.round(this.json.maintainability)}</strong><span class="define"> - ${this.$t('Values between 10 and 19 indicate that the code has moderate maintainability and may have room for improvement.')}</span>\n`
      }
      else {
        text += `Maintainability Index: <strong class="error">${Math.round(this.json.maintainability)}</strong><span class="define"> - ${this.$t('Values below 10 indicate has poor maintainability and likely run into issues in the future.')}</span>\n`
      }

      if (this.json.dependencies && this.json.dependencies.length) {
        text += `\nThis import requires 3rd party libraries:\n`
        this.json.dependencies.forEach(dep => {
          if (dep.warn) {
            text += `  <span class="global">${dep}</span>`// - <span class="warn">${this.$t('You will need to download and install this library')}</span>\n`
          }
          else {
            text += `  <span class="global">${dep}</span>`// - <span class="ok">${this.$t('This library is included with your addon')}</span>\n`
          }
        })
        text += `\n`
      }

      if (this.json.globals.length) {
        text += `\nReferenced Globals: <span class="colnum">${this.json.globals.length}</span>\n`
        this.json.globals.forEach(g => {
          g = g.replace(/([\.\[\]:])/g, '<span class="operator">$1</span>').replace(/(\w+\(.*?\))/g, '<span class="method">$1</span>')
          text += `  <span class="global">${g}</span>\n`
        })
        text += `\n`
      }

      if (this.json.highlights && this.json.highlights.indexOf) {
        text += '\n'
        if (this.json.highlights.indexOf('tts') >= 0) {
          text += `<i class="side-warning material-icons" title="Code Alert!">volume_up</i>${this.$t('This import uses text-to-speech audio')}\n`
        }
        text += `\n`
      }

      return text.trim()

    },
    makeComment: function () {
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
    submitComment: function (type) {
      this.http.post('/comments/codereview', {
        wagoID: this.$store.state.wago._id,
        text: this.commentText,
        falsePositive: this.falsePositive ? 1 : 0,
        reviewType: type
      }).then((res) => {
        this.$emit('setComment', type, this.falsePositive)
        this.showForm = false
        this.$nextTick(() => {
          this.parsed = this.getParsed()
        })
      })
    }
  },
  beforeUpdate () {
    // this.parsed = this.getParsed()
    // this.parsedAlerts = this.getParsedAlerts()
    // this.parsedInfo = this.getParsedInfo()
  },
  created () {
    this.parsed = this.getParsed()
    this.parsedAlerts = this.getParsedAlerts()
    this.parsedInfo = this.getParsedInfo()

    if (this.luacheck && this.canMin && window.localStorage.getItem('minLuacheck')) {
      this.minimized = true
    }
    else if (this.codeInfo && this.canMin && window.localStorage.getItem('minCodeInfo')) {
      this.minimized = true
    }
  }
}
</script>

<style lang="scss">
.code-review {
  margin-bottom: 8px;
  &.md-row {flex-wrap: nowrap}
  .md-card {
    margin: 0 0 8px 0;
    padding: 8px;
    width: 100%;
    .md-card-content {padding: 0}
  }

  .highlights {
    outline: 2px solid #009690;
    white-space: nowrap;
    margin-left: 16px;
    background: #333333;
    padding: 8px;
    border-radius: 4px;
    align-self: flex-start;
    &.without-alerts {
      display: flex;
      flex-direction: row;
      margin-left: 0;
      div {
        margin-right: 16px;
      }
    }
    div > em, div > span {
      display: block;
    }
    em {
      font-weight: bold;
      font-style: normal;
      padding: 4px 0;
      color: #009690;
    }
  }

  .report-form {
    justify-content: space-between;
  }

  .review-title {
		.can-minimize {
			cursor: pointer;
			user-select: none;
		}
		i {
			transition: all .4s cubic-bezier(.25,.8,.25,1);
		}
		i.minimized {
			transform: rotate(-90deg) translate3D(0,0,0);
		}
		.subtitle {
			opacity: .5;
			font-size: 90%;
		}
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	a {
		font-size: 90%;
		white-space: nowrap;
		align-self: flex-end;
	}
	.code-review-content {
		position: relative;
	}
	.alerts {
		outline: 2px solid #C1272D;
		.review-title {
			color: #C1272D;
			text-shadow: 2px 2px 2px black;
			text-transform: uppercase;
		}
	}
	pre {
		padding: 4px;
		background: rgba(0,0,0,.3);
		border-radius: 4px;
		line-height: 125%;
		margin: 0;
		z-index: 1;
		width: 100%;
		position: absolute;
		.ok {
			color: #0dcc00;
		}
		.error {
			color: #e6000a;
		}
		.warn {
			color: #cc9700;
		}
		.inline-alert {
			color: #e6000a;
			i {
				font-size: 12pt;
				font-weight: bold;
			}
		}
		.review-ok {
			.material-icons {
				font-size: 12pt;
				font-weight: bold;
				vertical-align: top;
			}
		}
		.side-ok {
			color: #0dcc00;
			margin-left: -20px;
			float: left;
			font-size: 12pt;
			font-weight: bold;
		}
		.side-warning {
			color: #cc9700;
			margin-left: -20px;
			float: left;
			font-size: 12pt;
			font-weight: bold;
		}
		.side-alert {
			color: #bb0008;
			margin-left: -32px;
      border-radius: 8px;
      background: #22222277;
			float: left;
			font-size: 12pt;
			font-weight: bold;
			&:before {
				content: ' ';
				width: 100%;
				height: 16px;
				position: absolute;
				left: 0;
				right: 0;
				background: rgba(255, 0, 0, 0.15);
			}
		}
		.luacheckcode {
			color: #555;
			font-size: 80%;
			line-height: 100%;
			vertical-align: 1px;
		}
		.location {
			display: inline-block;
			text-align: right;
			min-width: 40px;
			.linenum {
				display: inline-block;
				text-align: right;
				min-width: 24px;
			}
		}
		.linenum {
			color: #56f442;
			font-weight: bold;
		}
		.define {
			color: #777;
		}
		.colnum {
			color: #95c7fe;
			font-weight: bold;

      &.linkedFn:hover {
        cursor: pointer;
        text-decoration: underline;
      }
		}
		.string {
			color: #10a810;
		}
		.global {
			color: #25c7fe;
		}
		.operator {
			color: #e0d59d;
		}
		.method {
			color: #c688e6;
		}
		p {
			.side-alert {
				&:before {
					content: none;
					background: none;
				}
			}
		}
	}
	.comment {
		padding: 4px;
		background: rgba(0,0,0,.3);
		border-radius: 4px;
		line-height: 125%;
		margin: 0;
		z-index: 1;
		width: 100%;
		margin-top: 8px;
		.review-ok {
			color: #b5ffb7;
		}
	}
	.comment-text {
		margin: 4px 0 0 20px;
	}
	pre.parsedAlerts {
		z-index: 0;
		background: none;
	}
	.para {
		height: auto !important;
		pre {
			white-space: pre-wrap;
			position: relative;
			p {
				margin: 0 0 0 20px;
			}
			p.review-alert {
				color: #ffb5b5;
			}
			p.review-warning {
				color: #cc9700;
			}
			p.review-ok {
				color: #b5ffb7;
			}
		}
	}
	button.md-button.md-primary {
		margin-right: 0;
	}
	.md-input-container {
		margin-bottom: 8px;
	}
}

pre .location .colnum {
  display: inline-block;
  text-align: right;
  min-width: 24px;
}
@media (max-width: 560px) {
	.code-review pre {
    overflow-x: auto;
  }
}

</style>
