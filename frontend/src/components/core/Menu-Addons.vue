<template>
  <div id="addon-list">
    <h2 id="addons-supported">Core Addons</h2>
    <md-layout v-if="addons.core">
      <md-card v-for="addon of addons.core" class="addon">
        <router-link :to="'/addons/' + addon.slug">
          <md-avatar class='square'>
            <category-image v-if="addon.icon" :group="addon.icon"></category-image>
            <category-image v-else group="new-addon"></category-image>
          </md-avatar>
          <div>
            <div>{{ addon.name }}</div>
            <div class="submenu" v-if="addon.submenu">
              <router-link v-for="item of addon.submenu" :to="'/addons/' + item.slug">{{ item.name }}</router-link>
            </div>
          </div>
        </router-link>
      </md-card>
    </md-layout>
    <template v-if="addons.supported">
      <h2 id="addons-more">Supported Addons</h2>
      <md-layout>
        <md-card v-for="addon of addons.supported" class="addon">
          <router-link :to="'/addons/' + addon.slug">
            <md-avatar class='square'>
              <category-image v-if="addon.icon" :group="addon.icon"></category-image>
              <category-image v-else group="new-addon"></category-image>
            </md-avatar>
            <div class="label">{{ addon.name }}</div>
          </router-link>
        </md-card>
      </md-layout>
    </template>
    <h2 id="your-addons">Developers: add your addon to Wago</h2>
    <md-button v-if="!showAddonInfo" @click="showAddonInfo = true">View Information</md-button>
    <md-card v-else>
      <formatted-text :enableLinks="true" :text="{format: 'markdown', text: doc, html: true}"></formatted-text>
    </md-card>
  </div>
</template>

<script>
import CategoryImage from '../UI/CategoryImage.vue'
import FormattedText from '../UI/FormattedText.vue'
import doc from '../docs/AddToWago.md'

export default {
  components: {
    'category-image': CategoryImage,
    'formatted-text': FormattedText
  },
  data: function () {
    return {
      addons: {},
      showAddonInfo: false,
      doc: doc
    }
  },
  mounted: async function () {
    this.addons = await this.http.get('/lookup/addons')
  }
}
</script>

<style scoped>
h2 {margin: 16px 0 0 16px;}

div.addon {min-width: 230px; max-width: 190px; width:190px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative}
div.addon .md-avatar + div {width: 168px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; align-self: center }
div.addon div.submenu {font-size: 80%;  bottom: 10px;}
div.addon div.submenu a {display: inline; margin-right: 4px; opacity: .5}
div.addon div.submenu a:hover {opacity: .8}
.md-avatar.square {border-radius: 0; margin-right: 8px}
.md-card.addon:hover {background: #444}
.md-card.addon a {color: white!important; display: flex; flex-direction: row}
.md-card.addon a:hover {text-decoration: none}

ol {margin: 0}
ol li {margin: 0 0 32px}
ol li::marker {font-weight: bold; font-size: 16px}
pre code.toc.comment { color: #438CA1; padding: 8px; background: #222; border-radius: 4px}
</style>
