<template>
  <div>
    HELLO
  </div>
</template>

<script>
export default {
  components: {
    'view-comments': require('../UI/ViewComments.vue')
  }
  methods: {
    myFunc: function () {
      return true
    }
  },
  data: function () {
    return {
      item: false
    }
  },
  watch: {
    '$route': 'myFunc'
  },
  created: function () {
    this.myFunc()
  },
  computed: {
    aData () {
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: '',
      description: '',
      image: ''
    })
  }
}
</script>

<style>

</style>

