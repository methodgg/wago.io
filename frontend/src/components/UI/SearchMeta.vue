<template>
  <div>
    <md-whiteframe id="queryInfo">
      <strong>{{ $t("Options") }}</strong>
      <div class="field-group">
        <md-input-container>
          <label for="sort">{{ $t("Sort") }}</label>
          <md-select name="sort" id="sort" v-model="sortVal">
            <md-option value="stars">{{ $t("Stars") }}</md-option>
            <md-option value="views">{{ $t("Views") }}</md-option>
            <md-option value="date">{{ $t("Date") }}</md-option>
          </md-select>
        </md-input-container>
      </div>

      <strong>{{ $t("Query information") }}</strong>
      <md-list>
        <template v-for="(context, index) in meta">
          <md-list-item v-if="context.type === 'type'" v-bind:key="index">
            <md-avatar class='square'><category-image :group="'t-' + context.wagoType.toLowerCase()"></category-image></md-avatar>
            <div class="md-list-text-container">
              <span>{{ context.wagoType }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>
          
          <md-list-item v-if="context.type === 'tag'" v-bind:key="index">
            <md-avatar class='square'><category-image :group="getCategory(context.tag).cls"></category-image></md-avatar>
            <div class="md-list-text-container">
              <strong :class="getCategory(context.tag).cls">{{ getCategory(context.tag).text }}</strong>
              <md-subheader>{{ tagMap[context.tag] }}</md-subheader>
            </div>
          </md-list-item>
          
          <md-list-item v-if="context.type === 'user'" v-bind:key="index">
            <md-avatar><ui-image :img="context.image"></ui-image></md-avatar>
            <div class="md-list-text-container">
              <router-link v-if="context.user.url" :class="context.user.roleClass" :to="context.user.url">{{ context.user.name }}</router-link>
              <span v-else :class="context.user.roleClass">{{ context.user.name }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>
          
          <md-list-item v-else-if="context.type === 'option' && context.option.name==='anon'" v-bind:key="index">
            <md-avatar class="md-avatar-icon"><md-icon>person</md-icon></md-avatar>
            <div class="md-list-text-container">
              <span v-if="context.option.enabled">{{ $t("Anonymous imports enabled") }}</span>
              <span v-else-if="context.option.force">{{ $t("Anonymous imports only") }}</span>
              <span v-else>{{ $t("Anonymous imports disabled") }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>
          
          <md-list-item v-else-if="context.type === 'option' && context.option.name==='starred'" v-bind:key="index">
            <md-avatar class="md-avatar-icon"><md-icon>star</md-icon></md-avatar>
            <div class="md-list-text-container">
              <span v-if="context.option.enabled">{{ $t("My favorites") }}</span>
              <span v-else>{{ $t("Not my favorites") }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>
          
          <md-list-item v-else-if="context.type === 'option' && context.option.name==='alert'" v-bind:key="index">
            <md-avatar class="md-avatar-icon"><md-icon>chat</md-icon></md-avatar>
            <div class="md-list-text-container">
              <span v-if="context.option.enabled">{{ $t("My unread mentions") }}</span>
              <span v-else>{{ $t("Not my unread mentions") }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>
        </template>

        <md-list-item v-if="textSearch"> 
          <md-avatar class="md-avatar-icon"><md-icon>search</md-icon></md-avatar>
          <div class="md-list-text-container">
            <span>{{ textSearch }}</span>
            <md-subheader>{{ $t("Text search") }}</md-subheader>
          </div>
        </md-list-item>
      </md-list>
    </md-whiteframe>
  </div>
</template>

<style>
#queryInfo .md-avatar.square {border-radius:0}
#queryInfo .md-subheader { min-height: 0; padding: 0}
</style>

<script>
import Categories from '../libs/categories'
export default {
  components: {
    'category-image': require('../UI/CategoryImage.vue')
  },
  props: ['meta', 'textSearch', 'tagMap', 'sort'],
  computed: {
    sortVal: {
      get: function () {
        return this.sort
      },
      set: function (v) {
        this.$emit('setSearch', v)
      }
    }
  },
  methods: {
    getCategory: function (catID) {
      return Categories.match(catID, this.$t)
    }
  }
}
</script>
