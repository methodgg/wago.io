<template>
  <ui-loading/>
</template>

<script>
export default {
  name: 'logout',
  created: function () {
    // clear local user variable
    this.$store.commit('setUser', {})
    // post logout to server to delete session
    this.http.post('/auth/logout')
    // remove cookie and header tokens
    window.clearCookie('token')
    // show login form
    window.eventHub.$emit('showSnackBar', this.$t('Logout successful'))
    this.$router.replace('/login')
  }
}
</script>
