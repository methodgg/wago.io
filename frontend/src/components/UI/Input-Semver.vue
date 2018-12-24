<template>  
  <md-dialog-content>
    <md-input-container :class="{ 'md-input-invalid': hasError, 'md-input-status': hasError }" class="md-has-value semver-input">
      <label>{{ $t("New version number") }}</label>
      <input ref="Semver-major" name='major' type="text" class="md-input" v-model="value.major" @keydown="validateNewVersion" @focus="$event.target.select()" maxlength="4" v-bind:style="{width: (Math.max(('' + value.major).length, 1) * 10) + 'px'}"/> <span>.</span>
      <input ref="Semver-minor" name='minor' type="text" class="md-input" v-model="value.minor" @keydown="validateNewVersion" @focus="$event.target.select()" maxlength="4" v-bind:style="{width: (Math.max(('' + value.minor).length, 1) * 10) + 'px'}"/> <span>.</span>
      <input ref="Semver-patch" name='patch' type="text" class="md-input" v-model="value.patch" @keydown="validateNewVersion" @focus="$event.target.select()" maxlength="4" v-bind:style="{width: (Math.max(('' + value.patch).length, 1) * 10) + 'px'}"/>
      <div id="newVersionFlexArea" @click="$refs['Semver-major'].focus()"></div>
      <span class="md-error" v-if="hasError">{{ $t('Version number must be greater than [-version-]', {version: latestVersion.semver}) }}</span>
    </md-input-container>
  </md-dialog-content>
</template>

<script>
const semver = require('semver')

export default {
  props: ['value', 'latestVersion', 'focus'],
  data: function () {
    return {
      hasError: false
    }
  },
  watch: {
    'value.major': function (val) {
      if (parseInt(val) !== val) {
        this.value.major = parseInt(val) || 0
        this.value.semver = semver.valid(`${this.value.major}.${this.value.minor}.${this.value.patch}`)
        this.$emit('input', this.value)
      }
    },
    'value.minor': function (val) {
      if (parseInt(val) !== val) {
        this.value.minor = parseInt(val) || 0
        this.value.semver = semver.valid(`${this.value.major}.${this.value.minor}.${this.value.patch}`)
        this.$emit('input', this.value)
      }
    },
    'value.patch': function (val) {
      if (parseInt(val) !== val) {
        this.value.patch = parseInt(val) || 0
        this.value.semver = semver.valid(`${this.value.major}.${this.value.minor}.${this.value.patch}`)
        this.$emit('input', this.value)
      }
    }
  },
  methods: {
    validateNewVersion (evt) {
      const keyCode = evt.which || evt.keyCode
      const fields = ['Semver-major', 'Semver-minor', 'Semver-patch']
      if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)) { // numbers 0-9 and keypad numbers
        // allowed
      }
      else if (keyCode === 190 || keyCode === 110 || keyCode === 39) { // decimal, keypad decimal or right arrow simulates tab forward
        if (evt.target.selectionEnd && evt.target.selectionEnd === evt.target.value.length) {
          evt.preventDefault()
          let pos = fields.indexOf('Semver-' + evt.target.name)
          if (pos >= 0 && fields[pos + 1]) {
            this.$refs[fields[pos + 1]].select()
          }
        }
      }
      else if (keyCode === 37) { // left arrow simulates tab backward
        if (!evt.target.selectionEnd && !evt.target.selectionStart) {
          evt.preventDefault()
          let pos = fields.indexOf('Semver-' + evt.target.name)
          if (pos >= 0 && fields[pos - 1]) {
            this.$refs[fields[pos - 1]].select()
          }
        }
      }
      else if (keyCode === 38) { // up arrow
        evt.preventDefault()
        let val = parseInt(evt.target.value) + 1
        this.value[evt.target.name] = '' + val
        this.$refs['Semver-' + evt.target.name].select()
      }
      else if (keyCode === 40) { // down arrow
        evt.preventDefault()
        let val = Math.max(0, parseInt(evt.target.value) - 1)
        this.value[evt.target.name] = '' + val
        this.$refs['Semver-' + evt.target.name].select()
      }
      else if (keyCode === 9 || keyCode === 8 || keyCode === 46) { // allow tab, delete and backspace
        // allowed
      }
      else { // anything else do not allow
        evt.preventDefault()
      }

      this.$nextTick(() => {
        const nextVersion = semver.valid(`${this.value.major}.${this.value.minor}.${this.value.patch}`)
        if (this.latestVersion) {
          const latestVersion = semver.valid(this.latestVersion.semver)
          try {
            if (semver.gt(nextVersion, latestVersion)) {
              this.hasError = false
              this.value.semver = nextVersion
              this.$emit('input', this.value)
            }
            else {
              this.hasError = true
            }
          }
          catch (e) {
            this.hasError = true
          }
        }
        else {
          this.value.semver = nextVersion
          this.$emit('input', this.value)
        }
      })
    }
  }
}
</script>

<style scoped>
.semver-input input { flex: inherit; text-align: right }
.semver-input span { line-height: 32px; font-size: 24px; padding: 0 2px; margin: -3px 0 3px; }
.semver-input .md-error { font-size: 12px }
</style>
