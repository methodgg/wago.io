<script>
import addons from '../libs/addons'
import eventbus from '../libs/eventbus'
import expansionDB from '../libs/expansions'

let expansionCooldown = 0

export default {
    name: 'browse',
    data: function () {
        return {
            browseExpansion: localStorage.getItem('browseExpansion') || 'forever',
            expansionDB
        }
    },
    computed: {
        addonDB: function() {
            return addons(this.$t).filter(x => x.slug || x.url)
        }
    },
    watch: {
        browseExpansion: (val) => {
            localStorage.setItem('browseExpansion', val)
            if (expansionCooldown < Date.now()) {
                eventbus.$emit('setExpansion', val)
                expansionCooldown = Date.now() + 100
            }
        },
    },
    mounted: function() {
        eventbus.$on('setExpansion', (val) => this.browseExpansion = val)
    }
}
    
</script>

<template>
    <div id="browse">
        <h2>{{ $t('Search Imports by Addon') }}</h2>
        <md-layout>
            <md-button-toggle md-single class="md-accent md-warn select-browse-mode">
                <md-button v-for="expansion in expansionDB" :class="{ 'md-toggle': browseExpansion === expansion.id }" @click="browseExpansion=expansion.id" :key="expansion.id">
                    <img :src="expansion.icon"> {{ expansion.name }}
                </md-button>
            </md-button-toggle>
        </md-layout>
        <div style="border-top:1px solid #333">
            <template v-if="browseExpansion === 'midnight' || browseExpansion === 'all'">
                <h3>{{ $t('Housing') }}</h3>
                <div class="browse-addon-group">
                    <template v-for="addon in addonDB" v-if="addon.group === 'housing' && (addon.expansions.includes(browseExpansion) || addon.expansions.includes('ALL') || browseExpansion === 'all')">
                        <router-link :to="addon.url ? addon.url : `/browse/${addon.slug}`" :class="addon.image && 'addon-list-category'" :style="`outline-color: #${addon.color}77; color:#${addon.color}; background-color:#${addon.color}0A; ${addon.image && `background-image:url('/static/image/menu/${addon.image}')`}`">
                            <span>{{ addon.name}}</span>
                        </router-link>
                    </template>
                </div>
            </template>
            <h3>{{ $t('Customize Your Interface') }}</h3>
            <div class="browse-addon-group">
                <template v-for="addon in addonDB" v-if="addon.group === 'ui' && (addon.expansions.includes(browseExpansion) || addon.expansions.includes('ALL') || browseExpansion === 'all')">
                    <router-link :to="addon.url ? addon.url : `/browse/${addon.slug}`" :class="addon.image && 'addon-list-category'" :style="`outline-color: #${addon.color}77; color:#${addon.color}; background-color:#${addon.color}0A; ${addon.image && `background-image:url('/static/image/menu/${addon.image}')`}`">
                        <span>{{ addon.name}}</span>
                    </router-link>
                </template>
            </div>
            <h3>{{ $t('Enhanced Tools') }}</h3>
            <div class="browse-addon-group">
                <template v-for="addon in addonDB" v-if="addon.group === 'tools' && (addon.expansions.includes(browseExpansion) || addon.expansions.includes('ALL') || browseExpansion === 'all')">
                    <router-link :to="addon.url ? addon.url : `/browse/${addon.slug}`" :class="addon.image && 'addon-list-category'" :style="`outline-color: #${addon.color}77; color:#${addon.color}; background-color:#${addon.color}0A; ${addon.image && `background-image:url('/static/image/menu/${addon.image}')`}`">
                        <span>{{ addon.name}}</span>
                    </router-link>
                </template>
            </div>
            <h3>{{ $t('Combat Utility') }}</h3>
            <div class="browse-addon-group">
                <template v-for="addon in addonDB" v-if="addon.group === 'combat' && (addon.expansions.includes(browseExpansion) || addon.expansions.includes('ALL') || browseExpansion === 'all')">
                    <router-link :to="addon.url ? addon.url : `/browse/${addon.slug}`" :class="addon.image && 'addon-list-category'" :style="`outline-color: #${addon.color}77; color:#${addon.color}; background-color:#${addon.color}0A; ${addon.image && `background-image:url('/static/image/menu/${addon.image}')`}`">
                        <span>{{ addon.name}}</span>
                    </router-link>
                </template>
            </div>
            <h3>{{ $t('Blizzard Settings') }}</h3>
            <div class="browse-addon-group">
                <template v-for="addon in addonDB" v-if="addon.group === 'blizzard' && (addon.expansions.includes(browseExpansion) || addon.expansions.includes('ALL') || browseExpansion === 'all')">
                    <router-link :to="addon.url ? addon.url : `/browse/${addon.slug}`" :class="addon.image && 'addon-list-category'" :style="`outline-color: #${addon.color}77; color:#${addon.color}; background-color:#${addon.color}0A; ${addon.image && `background-image:url('/static/image/menu/${addon.image}')`}`">
                        <span>{{ addon.name}}</span>
                    </router-link>
                </template>
            </div>
            <h3>{{ $t('Miscellaneous') }}</h3>
            <div class="browse-addon-group">
                <template v-for="addon in addonDB" v-if="!addon.group && (addon.expansions.includes(browseExpansion) || addon.expansions.includes('ALL') || browseExpansion === 'all')">
                    <router-link :to="addon.url ? addon.url : `/browse/${addon.slug}`" :class="addon.image && 'addon-list-category'" :style="`outline-color: #${addon.color}77; color:#${addon.color}; background-color:#${addon.color}0A; ${addon.image && `background-image:url('/static/image/menu/${addon.image}')`}`">
                        <span>{{ addon.name}}</span>
                    </router-link>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.select-browse-mode {
  flex-wrap: wrap!important;
  margin: 4px 0;
  padding: 0!important;
  .md-toggle:hover:not([disabled]) { background-color: #9F1F26!important}
  img { height: 24px; margin-right: 8px; vertical-align: middle}
}
#browse {
  margin: 16px 0 0; width:100%;
  & > .md-layout {    
    justify-content: space-between;
    div {
      flex: 1
    }
  }
  #browse-addon-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 8px;
    a {
      min-width: 33%;
      min-height: 54px;
      display: flex;
      align-items: center;
      padding: 8px 8px 8px 8px;
      font-size: 18px;
      vertical-align: middle;
      border-radius: 4px;
      border-width: 2px;
      border-style: solid;
      margin-bottom: 8px;
      transition: transform .3s;
      z-index: 5;
      .md-avatar {
        margin-right: 8px;
        border-radius: 4px;
      }
      &.addon-list-category {
        padding-left: 64px;
        background-repeat: no-repeat;
        background-size: 30px;
        background-position: 16px 50%;
      }
      &:hover {
        text-decoration: none;
        transform: scale(1.05);
        z-index: 100;
      }
    }
  }
  .browse-addon-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 8px;
    row-gap: 4px;
    a {
      min-width: 33%;
      min-height: 54px;
      display: flex;
      align-items: center;
      padding: 8px 8px 8px 8px;
      font-size: 18px;
      vertical-align: middle;
      border-radius: 4px;
      margin-bottom: 8px;
      transition: transform .3s;
      z-index: 5;
      filter: brightness(1.2);
      .md-avatar {
        margin-right: 8px;
        border-radius: 4px;
      }
      &.addon-list-category {
        padding-left: 64px;
        background-repeat: no-repeat;
        background-size: 30px;
        background-position: 16px 50%;
      }
      &:hover {
        text-decoration: none;
        // transform: scale(1.05);
        z-index: 100;
        outline-width: 2px;
        outline-style: solid;
      }
    }
  }
  .wago-ad-container {
    margin: 0 0 8px 16px;
    padding: 0 8px 10px;
    & + #browse-addon-list {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
}
</style>