<template>
  <div>
    <wago-app />  
    <advert ad="wago_mobile_anchor" :forMobile="true" />
    <div></div>
  </div>
</template>

<script>
import App from './App.vue'
export default {
  name: 'wagomain',
  components: {
    'wago-app': App
  }
}
</script>
