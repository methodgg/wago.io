<template>
  <div>
    <md-whiteframe>
      <strong>{{ $t("Related categories") }}</strong>
      <md-list>
        <md-list-item :class="categories.cls">
          <img :src="categories.image">
          <div class="md-list-text-container">
            <router-link :to="cat.slug">{{ $t(cat.text) }}</router-link>
            <span>
              <router-link v-for="item in categories.items" :to="item.slug" v-bind:key="item.id">{{ item.text }}</router-link>
            </span>
          </div>
        </md-list-item>
      </md-list>
    </md-whiteframe>
  </div>
</template>

<style>
</style>