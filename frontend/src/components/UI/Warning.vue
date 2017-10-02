<template>
  <div class="warning-container">
    <div :class="'warning ' + (mode ? mode : '')">
      <div v-if="html" v-html="html"></div>
      <slot v-else></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['mode', 'html']
}
</script>

<style>
.warning-container { padding-right: 32px }
.warning { border-top: 15px solid; font-weight: 500; margin: 10px 16px 0 16px; padding: 10px 0 0 0; width: 100%; }
.warning { border-color: #afb42b; color: #afb42b; }
.warning.alert { border-color: #c1272d; color: #c1272d; } 
.warning.good { border-color: #388e3c; color: #388e3c; } 
.warning.info { border-color: #0288d1; color: #0288d1; } 
</style>
