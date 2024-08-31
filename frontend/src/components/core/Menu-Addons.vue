<template>
    <div id="addon-list">
      <md-layout md-row class="addon-name nowrap">
        <div class="grow">
          <md-layout md-row>
            <h2 id="addon-name">{{ $t("Addons With Supported Import Strings") }}</h2>
          </md-layout>
        </div>
      </md-layout>
      <md-layout>
        <md-layout class="nowrap">
          <md-list class="md-double-line md-dense">
            <md-subheader style="font-size:18px">WeakAuras</md-subheader>
            <md-list-item class="md-inset">
              <div class="menu-image"><img src="../../assets/weakauras.png" alt="Icon" /></div>
              <div class="md-list-text-container weakauras-list">
                <router-link to='/the-war-within-weakauras'>{{ $t("The War Within") }}</router-link>
                <router-link to='/cataclysm-weakauras'>{{ $t("Cataclysm") }}</router-link>
                <router-link to='/classic-weakauras'>{{ $t("Classic") }}</router-link>
              </div>
            </md-list-item>
          </md-list>
            
          <md-subheader>{{ $t('Interface Customization') }}</md-subheader>

          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset">
              <div class="menu-image"><img src="../../assets/menu-blizzhud.png" alt="Icon" /></div>
              <div class="md-list-text-container">
                <router-link to="/blizzhud">BlizzHud</router-link>
              </div>
            </md-list-item>
          </md-list>

          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset">
              <div class="menu-image"><img src="../../assets/menu-cell.png" alt="Icon" /></div>
              <div class="md-list-text-container">
                <router-link to="/cell">Cell</router-link>
              </div>
            </md-list-item>
          </md-list>

          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset">
              <div class="menu-image"><img src="../../assets/tukui.png" alt="Icon" /></div>
              <div class="md-list-text-container">
                <router-link to="/elvui">ElvUI</router-link>
              </div>
            </md-list-item>
          </md-list>

          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset">
              <div class="menu-image"><img src="../../assets/menu-plater.png" alt="Icon" /></div>
              <div class="md-list-text-container">
                <router-link to="/plater">Plater Nameplates</router-link>
              </div>
            </md-list-item>
          </md-list>

          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset">
              <div class="menu-image"><img src="../../assets/menu-vuhdo.png" alt="Icon" /></div>
              <div class="md-list-text-container">
                <router-link to="/vuhdo">VuhDo</router-link>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>

        <md-layout class="nowrap">
            <md-subheader>{{ $t('Tools & Macros') }}</md-subheader>

            <md-list class="md-double-line md-dense">
              <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/menu-baginator.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                  <router-link to="/search/imports/wow/baganator ">Baganator </router-link>
                </div>
              </md-list-item>
            </md-list>

            <md-list class="md-double-line md-dense">
                <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/menu-gse.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                    <router-link to="/gse">GSE: Advanced Macro Compiler</router-link>
                </div>
                </md-list-item>
            </md-list>

            <md-list class="md-double-line md-dense">
              <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/menu-macro.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                  <router-link to="/macros">Macros</router-link>
                </div>
              </md-list-item>
            </md-list>

            <md-list class="md-double-line md-dense">
              <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/mdt.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                  <router-link to="/mdt">Mythic Dungeon Tools</router-link>
                </div>
              </md-list-item>
            </md-list>

            <md-list class="md-double-line md-dense">
              <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/menu-opie.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                  <router-link to="/opie">OPie</router-link>
                </div>
              </md-list-item>
            </md-list>

            <md-subheader>{{ $t('Boss Mods') }}</md-subheader>
            <md-list class="md-double-line md-dense">
              <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/menu-bigwigs.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                  <router-link to="/search/imports/wow/bigwigs">BigWigs</router-link>
                </div>
              </md-list-item>
            </md-list>

            <md-list class="md-double-line md-dense">
              <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/menu-dbm.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                  <router-link to="/search/imports/wow/dbm">Deadly Boss Mods</router-link>
                </div>
              </md-list-item>
            </md-list>

            <md-subheader>{{ $t('Immersion') }}</md-subheader>
            <md-list class="md-double-line md-dense">
              <md-list-item class="md-inset">
                <div class="menu-image"><img src="../../assets/menu-trpcamp.png" alt="Icon" /></div>
                <div class="md-list-text-container">
                  <router-link to="/totalrp">Total RP</router-link>
                </div>
              </md-list-item>
            </md-list>
        </md-layout>
        
      </md-layout>
    </div>
  </template>
  
  <script>
  import CategoryImage from '../UI/CategoryImage.vue'
  import AddonInfoBox from '../UI/AddonInfoBox.vue'
  export default {
    components: {
      'category-image': CategoryImage,
      'addon-info': AddonInfoBox
    },
    methods: {
      runSearch: function () {
        this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
      },
      searchRoute: function (item) {
        if (typeof item === 'string') {
          item = window.Categories.match(item)
        }
        this.$store.commit('setSearchText', `category:${item.id}`)
        this.$router.push('/addons/' + item.slug)
      }
    },
    data: function () {
      return {
        searchString: 'Type: addons '
      }
    },
    computed: {
      aClasses: function () {
        const cats = window.Categories.classCategories()
        const n = cats.length / 3
        return [[...cats.splice(0, Math.ceil(n))], [...cats.splice(0, Math.round(n))], [...cats]]
      },
      professions: function () {
        var cats = window.Categories.professionCategories()
        cats.splice(1, 1)
        return cats
      },
      content: function () {
        return window.Categories.getCategories(['addons1', 'addons2', 'addons3', 'addons4', 'addons5'])
      }
    },
    mounted: function () {
      this.$store.commit('setPageInfo', {
        title: 'Browse Addons',
        description: this.$t('Browse addons')
      })
      this.http.get('/search/menu', { view: 'addons' })
    }
  }
  </script>
  
  <style lang="scss">
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
  
  #addon-list .md-list-item img {
    height: 48px;
    vertical-align: top
  }
  
  #addon-list a {
    margin-right: 12px
  }
  #addon-list .weakauras-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    a{font-size: 14px!important; font-weight: normal!important; color: #bbb!important}
  }
  

  
  #addon-list .md-list-text-container {
    align-self: center;
    margin-bottom: 8px;
  }
  #addon-list .md-list-text-container a {
    white-space: nowrap;
    display: inline-block
  }
  .nowrap {
    white-space: nowrap;
  }
  
  #addon-list .md-list-text-container>a,
  #addon-list .md-list-text-container>.parent-category {
    font-size: 18px;
    font-weight: bold;
    line-height: 19px;
  }
  
  #addon-list .md-list-text-container span {
    white-space: normal;
    line-height: 22px
  }
  #addon-list .md-list-text-container a {
    color: #ddd;
  }
  
  #addon-list .md-layout {
    align-items: flex-start
  }
  
  #addon-list .md-subheader, #addon-list ul {
    width: 100%
  }
  
  #addon-list .md-subheader+.md-list {
    width: 100%
  }
  
  .md-list:after {
    background-color: transparent !important
  }
  
  #addon-list .wago-ad-container {
    max-width: 260px;
    background: none;
    box-shadow: none;
    min-height: 160px;
    #video-sidebar {
      min-height: auto
    }
  }
</style>
  