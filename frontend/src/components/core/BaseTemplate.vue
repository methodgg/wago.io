<template>
  <div>
    HELLO
  </div>
</template>

<script>
import ViewComments from '../UI/ViewComments.vue'
export default {
  components: {
    'view-comments': ViewComments
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

