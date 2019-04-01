<template>
  <ui-loading />
</template>

<script>
export default {
  name: 'edit-notes',
  created: function () {
    this.http.get('/lookup/random').then((res) => {
      this.$router.replace('/' + res.slug)
    })
  }
}
</script>

<style>
</style>
