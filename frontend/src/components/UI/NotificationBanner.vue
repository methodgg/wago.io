<template>
  <div id="notification-banner" v-if="enabled">
    <div id="notification-msg"><slot /></div>
    <md-button class="md-icon-button md-flat" @click="closeNotification">
      <md-icon>close</md-icon>
    </md-button> 
  </div>
</template>

<script>
export default {
  props: ['id'],
  data: function () {
    return {
      enabled: false
    }
  },
  methods: {
    closeNotification () {
      this.enabled = false
      window.localStorage.setItem('notification-'+this.id, 'closed')
    }
  },
  created: function () {
    var closed = window.localStorage.getItem('notification-'+this.id)
    if (!closed) {
      this.enabled = true
      this.$nextTick(() => {
        const height = document.getElementById('notification-banner').clientHeight
        const css = `#notification-banner + #topbar {margin-top: ${height}px;} #notification-banner ~ #full-sidebar .md-sidenav-content {top: ${height+64}px;}`
        const head = document.head || document.getElementsByTagName('head')[0]
        const style = document.createElement('style')
        head.appendChild(style)
        style.type = 'text/css'
        style.appendChild(document.createTextNode(css))
      })
    }
  }
}
</script>

<style>
#notification-banner { position: absolute; top: 0; left: 0; background-color: #c1272d; width: 100%; min-height: 40px; display: flex; justify-content: space-between }
#notification-banner .md-button.md-icon-button .md-icon, .md-button.md-fab .md-icon { color: black }
#notification-msg {flex: 1; text-align: center; font-weight: bold; color: #FFF; line-height: 40px; font-size: 18px; padding-left: 22px}
#notification-msg a {color: inherit; text-decoration:none; display: block}
</style>