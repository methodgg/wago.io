<template>
  <picture v-if="img">
    <template v-if="typeof img === 'object'">
      <source v-if="img.webp" :srcset="img.webp" type="image/webp">
      <source v-if="img.gif" :srcset="img.gif" type="image/gif">
      <source v-if="img.png" :srcset="img.png" type="image/png">
      <source v-if="img.jpg" :srcset="img.jpg" type="image/jpeg">
      <img v-if="img.gif" :src="img.gif">
      <img v-else-if="img.png" :src="img.png">
      <img v-else-if="img.jpg" :src="img.jpg">
    </template>
    <template v-else-if="img==='battlenet'">
      <source srcset="https://media.wago.io/avatars/social/blizzard.webp" type="image/webp">
      <source srcset="https://media.wago.io/avatars/social/blizzard.png" type="image/png">
      <img src="https://media.wago.io/avatars/social/blizzard.png" />
    </template>
    <template v-else-if="img==='discord'">
      <source srcset="https://media.wago.io/avatars/social/discord.webp" type="image/webp">
      <source srcset="https://media.wago.io/avatars/social/discord.png" type="image/png">
      <img src="https://media.wago.io/avatars/social/discord.png" />
    </template>
    <template v-else-if="img==='facebook'">
      <source srcset="https://media.wago.io/avatars/social/facebook.webp" type="image/webp">
      <source srcset="https://media.wago.io/avatars/social/facebook.png" type="image/png">
      <img src="https://media.wago.io/avatars/social/facebook.png" />
    </template>
    <template v-else-if="img==='google'">
      <source srcset="https://media.wago.io/avatars/social/google.webp" type="image/webp">
      <source srcset="https://media.wago.io/avatars/social/google.png" type="image/png">
      <img src="https://media.wago.io/avatars/social/google.png" />
    </template>
    <template v-else-if="img==='patreon'">
      <source srcset="https://media.wago.io/avatars/social/patreon.webp" type="image/webp">
      <source srcset="https://media.wago.io/avatars/social/patreon.png" type="image/png">
      <img src="https://media.wago.io/avatars/social/patreon.png" />
    </template>
    <template v-else-if="img==='twitter'">
      <source srcset="https://media.wago.io/avatars/social/twitter.webp" type="image/webp">
      <source srcset="https://media.wago.io/avatars/social/twitter.png" type="image/png">
      <img src="https://media.wago.io/avatars/social/twitter.png" />
    </template>
  </picture>
</template>

<script>
export default {
  props: ['img']
}
</script>
