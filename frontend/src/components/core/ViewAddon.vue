<template>
    <div id="browse-addon">
        <md-layout md-row class="addon-name">
            <div class="grow">
                <md-layout md-row>
                    <md-avatar class='square'>
                        <category-image v-if="addon?.icon" :group="addon.icon"></category-image>
                        <img v-if="addon?.image" :src="`/static/image/menu/${addon.image}`" />
                    </md-avatar>
                    <h2 id="addon-name">{{ addon?.name }}</h2>
                </md-layout>
                <addon-meta game="wow" :addon="addon"></addon-meta>
            </div>
        </md-layout>
        <template v-if="classCategories?.length">
            <md-subheader>{{ $t("Browse by Class") }}</md-subheader>
            <md-layout id="classes-layout">
                <md-layout v-for="(classes, index) in classCategories" v-bind:key="index">
                    <md-list class="md-double-line md-dense">
                        <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
                            <div class="menu-image"></div>
                            <div class="md-list-text-container">
                                <router-link :to="`/browse/${addon.slug}/${cls.slug}`">{{ cls.text }}</router-link>
                                <span>
                                    <router-link v-for="spec in cls.specs" v-bind:key="spec.id" :to="`/browse/${addon.slug}/${cls.slug}`">
                                        {{ spec.text.replace(cls.text, '').trim() }}
                                    </router-link>
                                </span>
                            </div>
                        </md-list-item>
                    </md-list>
                </md-layout>
            </md-layout>
        </template>

        <template v-if="otherCategories?.length">
            <md-layout id="categories-layout">
                <md-layout v-for="(categoryRoot, index) in otherCategories" v-bind:key="index">
                     <md-list class="md-double-line md-dense">
                        <md-list-item v-for="category in categoryRoot" v-bind:key="category.id" :class="category.id + ' md-inset'">
                            <div class="menu-image"></div>
                            <div class="md-list-text-container">
                                <router-link :to="`/browse/${addon.slug}/${category.slug}`">{{ category.text }}</router-link>
                                <span>
                                    <router-link v-for="option in category.children" v-bind:key="option.id" :to="`/browse/${addon.slug}/${option.slug}`">
                                        {{ option.text.trim() }}
                                    </router-link>
                                </span>
                            </div>
                        </md-list-item>
                    </md-list>
                </md-layout>
            </md-layout>
        </template>
    </div>
</template>

<script>
import addons from '../libs/addons'
import CategoryImage from '../UI/CategoryImage.vue'
import AddonMeta from '../UI/ViewAddonMeta.vue'
export default {
  components: {
    'category-image': CategoryImage,
    'addon-meta': AddonMeta
  },
  methods: {
    runSearch: function () {
    //   this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
    },
  },
  data: function () {
    return {
    }
  },
  computed: {
    addonDB: function() {
        return addons(this.$t)
    },
    addon: function () {
        const addon = this.addonDB.find(a => a.slug === this.$route.params.addon)
        if (!addon) this.$router.replace('/')
        if (!addon.categories) this.$router.replace('/search/imports/wow/' + addon.slug)
        return addon
    },
    classCategories: function () {
        if (this.addon.categories?.includes('%CLASSES%')) {
            const cats = window.Categories.classCategories()
            const n = cats.length / 2
            return [[...cats.splice(0, Math.ceil(n))], [...cats]]
        }
        return []      
    },
    otherCategories: function () {
        const cats = this.addon.categories
            ?.filter(x => !x.includes('%'))
            .map(x => ({...window.Categories.match(x), children: window.Categories.matchChildren(x)}))
            .filter(x => !x.games || this.addon.expansions.includes('ALL') || x.games.find(g => this.addon.expansions.includes(g)))
            const n = cats.length / 2
            return [[...cats.splice(0, Math.ceil(n))], [...cats]]
    },
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: this.addon.name,
      description: this.$t('Browse [-addon-] imports', {addon: this.addon.name})
    })
    this.http.get('/search/menu', { view: 'ElvUI' })
  }
}
</script>

<style lang="scss">
#browse-addon {
    .addon-name {
    .md-avatar {
        margin: 16px;
        border-radius: 4px;
    }

    h2 {
        margin: 16px 0 0 0;
        line-height: 40px
    }
    }

    h2 .faded {
    opacity: .3
    }

    h2 span {
    font-size: 80%;
    cursor: pointer
    }

    #searchForm {
    padding: 16px;
    flex: 1
    }

    #searchForm button {
    margin-top: -3px
    }

    #addon-name .md-theme-default.md-switch {
    margin: 0 8px;
    zoom: 0.8
    }

    #addon-name .md-theme-default.md-switch.md-checked .md-switch-container {
    background-color: rgba(0, 0, 0, 0.38);
    }

    #addon-name .md-theme-default.md-switch.md-checked .md-switch-thumb {
    background-color: #fafafa;
    }

    .md-list-item img {
    height: 48px;
    padding-right: 16px;
    vertical-align: top
    }

    a {
    margin-right: 12px
    }

    .md-layout > .md-layout {
        width: 50%;
    }
    li.md-list-item.md-inset {
        padding-left: 24px;
        flex-wrap: wrap;
        padding-bottom: 16px;
    }
    .md-list.md-dense .md-list-item.md-inset .md-list-item-container {
        padding-left: 0;
    }
    #classes-layout + #categories-layout {
        border-top: 1px solid #333;
        padding-top: 1.5rem;
    }

    .md-list-text-container a {
    white-space: nowrap;
    display: inline-block
    }

    .md-list-text-container>a,
    .md-list-text-container>.parent-category {
    font-size: 18px;
    font-weight: bold;
    line-height: 19px;
    }

    .md-list-text-container span {
    white-space: normal;
    line-height: 22px
    }

    .md-layout {
    align-items: flex-start
    }

    .md-subheader {
    width: 100%
    }

    .md-subheader+.md-list {
    width: 100%
    }

    .md-list:after {
    background-color: transparent !important
    }

    .wago-ad-container {
    max-width: 260px;
    background: none;
    box-shadow: none;
    min-height: 160px;
        #video-sidebar {
            min-height: auto
        }
    }
}
</style>
