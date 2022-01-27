<template>
  <div class="menu-section">
    <span>{{buttonText.toUpperCase()}} <md-icon>translate</md-icon></span>
    <div class="sub-nav">
      <template v-for="item in supportedLocales">
        <div v-on:click="setLocale(item.code.split('-')[0])">{{ item.lang }}</div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'core-select-locale',
  props: ['display'],
  methods: {
    setLocale: function (loc) {
      if (this.$store.state.locale !== loc) {
        this.$store.commit('setLocale', loc)
      }
    }
  },
  computed: {
    locale () {
      return this.$store.state.lang
    },
    lang () {
      return this.$store.getters.i18nLanguage
    },
    buttonText () {
      if (this.display === 'code') {
        return this.lang
      }
      else {
        return this.$t('Language')
      }
    },
    supportedLocales () {
      var uniqueLang = []
      var supported = []
      window.locales.forEach((item) => {
        if (uniqueLang.indexOf(item.lang) < 0) {
          uniqueLang.push(item.lang)
          supported.push(item)
        }
      })
      return supported
    }
  }
}
</script>

<style>
.submenu > .md-button { padding: 0 }
.submenu .md-menu { width: 100%}
.submenu .md-menu .md-button { padding: 0 16px; margin: 0; width:100%; text-align: left; text-transform: initial; font-size: inherit; font-weight: inherit; }
.submenu .md-menu .md-button:hover { background-color: inherit }
</style>

