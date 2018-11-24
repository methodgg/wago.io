<template>
  <div class="md-avatar enemyPortrait" v-bind:style="{width: (size || 36) + 'px', height: (size || 36) + 'px'}">
    <picture>
      <source srcset="https://media.wago.io/avatars/56ef7fd27251b4eb17a6c2ea/discord-1506749979849.png" type="image/png">
      <img src="https://media.wago.io/avatars/56ef7fd27251b4eb17a6c2ea/discord-1506749979849.png">
    </picture>
  </div>
</template>

<script>
export default {
  props: ['mapID', 'creatureID', 'size']
}
</script>
