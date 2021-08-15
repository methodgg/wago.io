<template>
  <md-card>
    <h4 class="collapse-header" @click="toggleContent">
      {{ title }}
    </h4>
    <div class="collapse-content" :class="{opened}" :style="{'max-height': height}">
      <div ref="content">
        <slot></slot>
      </div>
    </div>
  </md-card>
</template>

<script>

export default {
  props: ['title'],
  data: function () {
    return {
      opening: false,
      opened: false,
      timer: null,
      height: '0px'
    }
  },
  methods: {
    toggleContent: function () {
      this.opened = !this.opened
      if (this.opened) {
        this.height = (28 + this.$refs.content.clientHeight) + 'px'
      }
      else {
        this.height = '0px'
      }
    },
  }
}
</script>

<style>
.collapse-header {
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  margin: 8px 0;
}
.collapse-content {
  overflow-y: hidden;
  -webkit-transition: max-height 0.5s ease-in-out;
  -moz-transition: max-height 0.5s ease-in-out;
  -o-transition: max-height 0.5s ease-in-out;
  transition: max-height 0.5s ease-in-out;
}
</style>
