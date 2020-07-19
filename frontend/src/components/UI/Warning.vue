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
.md-card .warning { margin: 10px 0 }
.warning { border-color: #afb42b; color: #afb42b; }
.warning.alert { border-color: #c1272d; color: #c1272d; } 
.warning.good, .warning.ok { border-color: #388e3c; color: #388e3c; } 
.warning.info { border-color: #0288d1; color: #0288d1; }
.warning.alert .md-button {color: #afb42b; min-height: 0; line-height: initial; margin: 0; padding: 3px 12px; text-transform: none}
.warning.alert p {color: rgba(0, 0, 0, .87);}
.theme-dark .warning.alert p {color: #DDD; font-weight: normal}
</style>
