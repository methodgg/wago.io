<template>
  <div class="placeholder-svg">
    <svg width="436" height="180"
      xmlns="http://www.w3.org/2000/svg">
      <text x="25%" y="25%" textLength="50%" fill="#777777" font-size="10px" v-if="text.match(/CLASSIC-/)">CLASSIC</text>
      <text x="30%" y="60%" textLength="40%" fill="#777777" v-if="text.length < 5">{{ text.replace(/CLASSIC-/, '') }}</text>
      <text x="10%" y="60%" textLength="80%" textHeight="70%" fill="#777777" v-else>{{ text.replace(/CLASSIC-/, '') }}</text>
    </svg>
  </div>
</template>

<script>
export default {
  props: ['text']
}
</script>

<style>
.placeholder-svg svg {border: 1px solid #777}
</style>

