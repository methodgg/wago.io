<template>
  <div class="placeholder-img">
    <strong>{{ text.split('').join(' ') }}<span></span></strong>
    <category-image :group="'t-' + text.toLowerCase()" :class="'c-' + text.toLowerCase()"></category-image>
  </div>
</template>

<script>
import CategoryImage from '../UI/CategoryImage.vue'
export default {
  props: ['text', 'width', 'height'],
  components: {
    CategoryImage
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
  .category-image {
    height: calc(100% - 40px);
    text-align: center;
    margin-top: -16px;
    img {
      margin: 16px 0;
      max-width: 100%;
      max-height: 70%;
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

