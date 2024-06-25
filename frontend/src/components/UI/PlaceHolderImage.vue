<template>
  <div class="placeholder-img">
    <strong v-if="!defaultImage">{{ text.split('').join(' ') }}<span></span></strong>
    <div v-if="icon" class="rounded category-image"><img :src="icon"></div>
    <div v-if="defaultImage" class="default-image"><img :src="defaultImage"></div>
    <category-image v-else :group="'t-' + text.toLowerCase()" :class="'c-' + text.toLowerCase()"></category-image>
  </div>
</template>

<script>
import BigWigs from '../../assets/placeholder-bigwigs.png'
import CategoryImage from '../UI/CategoryImage.vue'
export default {
  props: ['text', 'width', 'height', 'icon'],
  components: {
    CategoryImage
  },
  computed: {
    defaultImage () {
        if (this.text.toLowerCase() === 'bigwigs') {
            return BigWigs
        }
        return false
    }
  }
}
</script>

<style lang="scss">
.placeholder-img {
  border-radius: 4px;
  strong {
    display: block;
    text-align: justify;
    width: 70%;
    margin: 0 auto;
    padding-top: 16px;
    color: #AAA;
    span {
      width: 100%;
      display: inline-block;
    }
  }
  .default-image {
    height: 100%;
    text-align: center;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .category-image {
    height: calc(100% - 40px);
    text-align: center;
    margin-top: -16px;
    img {
      margin: 16px 0;
      max-width: 100%;
      max-height: 70%;
    }
    &.rounded img {
      border-radius: 32px;
    }

    &.c-weakaura {
      img {
        mix-blend-mode: screen;
        margin-top: 0;
        max-height: 90%;
      }
    }
  }
}
</style>

