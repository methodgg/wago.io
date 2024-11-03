<template>
  <div class="menu-section drop-left">
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

<style scoped>
.menu-section {
    .sub-nav {    
        display: none;
        flex-direction: column;
        box-shadow: 5px 5px 30px #00000066;
        border-radius: 0 0 2px 2px;
        min-width: 170px;
        z-index: 99!important;
        div {
            padding: 8px 16px;
              color: white;
              background: #3A3A3A;
              cursor: pointer;
              display: flex;
              align-items: center;
              &:hover {
                background: #444444;
                text-decoration: none;
              }
        }
    }
    
    &:hover {
        background: #3A3A3A;
        .sub-nav {
          display: flex;
          position: absolute;
          top: 40px;
          left: 0;
        }
      }
}
</style>

