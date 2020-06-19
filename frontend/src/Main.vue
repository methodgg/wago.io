<template>
  <div>
    <wago-app />  
    <advert ad="wago320x50" :forMobile="true" fixed="bottom" />
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
