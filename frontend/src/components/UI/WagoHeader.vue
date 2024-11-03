<script>
import SearchBar from './SearchBarv2.vue'
import SelectLocale from './SelectLocale.vue'

export default {
    components: {
        SearchBar,
        SelectLocale
    },
    data: function () {
        return {
            userMenuOpen: false,
            mobileLangMenuOpen: false,
            mobileMenuOpen: false,
            isGSENew: new Date() < new Date('2024-09-20'),
        }
    },
    methods: {
        closeMenus() {
            this.userMenuOpen = false
            this.mobileLangMenuOpen = false
            this.mobileMenuOpen = false
        },
        setLocale: function (loc) {
            if (this.$store.state.locale !== loc) {
                this.$store.commit('setLocale', loc)
            }
        },
        openURL: function (url) {
            // can't find why the link isn't working normally so using this hack
            window.open(url, '_top')
        }
    },
    computed: {
        locale () {
            return this.$store.state.lang
        },
        supportedLocales () {
            return window.locales
        },
    },
    watch: {
        $route (to, from) {
            this.userMenuOpen = false
            this.mobileLangMenuOpen = false
            this.mobileMenuOpen = false
        }
    }
}
</script>
<template>
    <div :class="{'mobile-open': mobileMenuOpen}">
        <div id="header-top-wrap">
            <div id="menu-underlay" @click="closeMenus()" v-if="userMenuOpen || mobileLangMenuOpen"></div>
            <div id="header-common">                
                <div id="mobile-menu-btn" @click="mobileMenuOpen=!mobileMenuOpen">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>  
                <router-link to="/" id="logo">
                    <img src="../../assets/wagoio-logo.png" alt="Wago Logo" />
                </router-link>
                <div id="header-common-links">
                    <router-link to="/" class="selected">{{ $t("Imports") }}</router-link>
                    <a href="https://addons.wago.io">Addons</a>
                    <a href="https://uipacks.wago.io">UI Packs</a>
                    <a href="https://addons.wago.io/app" class="red-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.59L7.3 9.24a.75.75 0 0 0-1.1 1.02l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75Z" clip-rule="evenodd" />
                        </svg>
                        <span>{{ $t("Download App") }}</span>
                    </a>
                
                    <template v-if="(this.$store.state.user.UID || this.$store.state.user.guest) && !this.$store.state.user.hideAds">
                        <a id="steelseries-btn" href='https://bit.ly/steelseries20' target="_blank" >
                            <img src="../../assets/steelseries-logo.svg" /> WOW 20TH ANNIVERSARY
                        </a>        
                        <a id="patreon-btn" href="https://www.patreon.com/wagoio" target="_blank">
                            <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z"></path></svg>
                            {{ $t('Support Wago.io') }}
                        </a>
                    </template>
                </div>
                <!-- <div class="flex-spacer"></div> -->
                <div id="header-user">
                    <div class="language-selector mobile-only" id="mobile-lang-menu" @click="mobileLangMenuOpen=!mobileLangMenuOpen">
                        {{ $store.getters.i18nLanguage.toLocaleUpperCase() }}
                        <div v-if="mobileLangMenuOpen" class="dropdown-menu">        
                            <template v-for="item in supportedLocales">
                                <a v-on:click.prevent="setLocale(item.code.split('-')[0])">{{ item.lang }}</a>
                            </template>
                        </div>
                    </div>
                    <div v-if="$store.state.user?.name" id="user-menu" @click.prevent="userMenuOpen=!userMenuOpen">
                        <div
                            tabindex="0"
                            style="font-family: inherit; font-size: 100%; font-weight: inherit; line-height: inherit; color: inherit; margin: 0px; padding: 0px; text-transform: none; display: flex; align-items: center; border-radius: 9999px;">
                            <span
                                class="user-name"
                                :class="$store.state.user.css"
                                style="font-weight: 600; line-height: 1;  color:#f7f7f7; text-shadow: 1px 1px 1px #000; ">
                                {{$store.state.user.name}}
                            </span>
                            <span
                                class="sr-only"
                                style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px;">
                                {{ $t("Open user menu") }}
                            </span>
                            <img
                                :src="$store.state.user.avatar.webp ?? $store.state.user.avatar.gif ?? $store.state.user.avatar.png ?? $store.state.user.avatar.jpg"
                                :alt="$store.state.user.name"
                                style="display: block; max-width: 100%; height: 2rem; margin-left: 0.5rem; width: 2rem; border-radius: 9999px; border-width: 2px; " />
                        </div>
                        <div
                            id="userdropdown" :class="{'user-menu-open': userMenuOpen}">
                            <div class="dropdown-menu">
                                <div class="menu-group">
                                    <router-link
                                        to="/settings"
                                        style="color:#f7f7f7; text-decoration: inherit; display: block; padding: 8px; font-size: 0.875rem; line-height: 1.25rem; ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                                            <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                                            <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                                          </svg>
                                        {{ $t("Wago.io Settings") }}
                                    </router-link>
                                    <router-link v-if="$store.state.user.access?.admin?.access"
                                        to="/admin"
                                        style="color:#f7f7f7; text-decoration: inherit; display: block; padding: 8px; font-size: 0.875rem; line-height: 1.25rem; ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                                            <path fill-rule="evenodd" d="M7.605 2.112a.75.75 0 0 1 .79 0l5.25 3.25A.75.75 0 0 1 13 6.707V12.5h.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H3V6.707a.75.75 0 0 1-.645-1.345l5.25-3.25ZM4.5 8.75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 8a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 8Zm2 .75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
                                        </svg>
                                        {{ $t("Wago.io Admin") }}
                                    </router-link>
                                    <a
                                        @click="openURL('https://accounts.wago.io/account')"
                                        href="https://accounts.wago.io/account"
                                        style="color:#f7f7f7; text-decoration: inherit; display: block; padding: 8px; font-size: 0.875rem; line-height: 1.25rem; ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clip-rule="evenodd" />
                                          </svg>
                                                                                
                                        {{ $t("Account Settings") }}
                                    </a>
                                    <router-link
                                        to="/logout"
                                        style="color:#f7f7f7; text-decoration: inherit; display: block; padding: 8px; font-size: 0.875rem; line-height: 1.25rem; ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                        </svg>                                                                                                                  
                                        {{ $t("Logout") }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else id="header-login">
                        <a :href="$env === 'development' ? 'http://localhost:3030/auth/redirect' : 'https://wago.io/login'" class="desktop-only">{{ $t("Sign in") }}</a>
                        <a :href="$env === 'development' ? 'http://localhost:3030/auth/redirect' : 'https://wago.io/login'" class="desktop-only red-btn">{{ $t("Sign up") }}</a>
                        <a :href="$env === 'development' ? 'http://localhost:3030/auth/redirect' : 'https://wago.io/login'" class="mobile-only red-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                            </svg>
                          </a>
                    </div>  
                </div>  
            </div>
        </div>
        <div id="header-main-wrap">   
            <div id="header-main">
                <router-link to="/" class="new-import">{{ $t("New Import") }}</router-link>            
                <div id="header-search"><search-bar ref="searchField"></search-bar></div>
                <div class="menu-section">
                    <span>
                        {{ $t("Browse")}} 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>                          
                    </span>
                    <div class="sub-nav">
                        <div class="dropdown-menu">
                            <div class="menu-group">
                                <router-link to='/the-war-within-weakauras'>
                                    <div class="md-list-text-container">
                                    <span class="sub-nav-heading"><span class="menu-icon"><img src="../../assets/weakauras.png"></span> WeakAuras</span>
                                    <span class="game-select">
                                        <router-link to='/the-war-within-weakauras'>The War Within</router-link>
                                        <router-link to='/cataclysm-weakauras'>Cataclysm</router-link>
                                        <router-link to='/classic-weakauras'>Classic</router-link>
                                    </span>
                                    </div>
                                </router-link>
                                <router-link to='/elvui'><span class="menu-icon"><img src="../../assets/tukui.png"></span> ElvUI</router-link>
                                <router-link to='/the-war-within-mdt'><span class="menu-icon"><img src="../../assets/mdt.png"></span> Mythic Dungeon Tools</router-link>
                                <router-link to='/plater'><span class="menu-icon"><img src="../../assets/menu-plater.png"></span> Plater Nameplates</router-link>
                            </div>
                            <div class="menu-group">
                                <router-link v-if="isGSENew" to='/gse'><span class="menu-icon"><img src="../../assets/menu-gse.png"></span> GSE: Advanced Macro Compiler <div class="newAlert"><span>{{ $t('New') }}</span></div></router-link>
                                <router-link to='/collections'><span class="menu-icon"><img src="../../assets/menu-collection.png"></span> {{$t('Collections')}}</router-link>
                                <router-link to='/addons'><span class="menu-icon"><img src="/static/image/menu/mechanics.png"></span> {{$t('More Imports...')}}</router-link>
                            </div>
                        </div>
                    </div>
                </div>
                
                <template v-if="$store.state.user?.name">
                    <div class="menu-section">
                        <span>
                            {{ $t("My Data") }}                          
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>    
                        </span>
                        <div class="sub-nav">
                            <div class="dropdown-menu">
                                <div class="menu-group">
                                    <router-link :to="'/p/'+encodeURIComponent($store.state.user.name)">                                        
                                        <span class="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                                                <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                                            </svg>                                              
                                        </span>
                                        {{ $t("My Profile") }}
                                    </router-link>
                                    <router-link to="/my/mentions">
                                        <span class="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                                                <path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clip-rule="evenodd" />
                                            </svg>                                
                                        </span>
                                        {{ $t("My Mentions") }}
                                        <span v-if="$store.state.user.unreadMentions.length" class="mobile-only" style="position:relative; width: 30px">
                                            <span class="badge-count" style="top:-0.7rem">{{$store.state.user.unreadMentions.length}}</span>
                                        </span>
                                    </router-link>
                                    <router-link to="/my/stars">
                                        <span class="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                                                <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clip-rule="evenodd" />
                                            </svg>                                              
                                        </span>
                                        {{ $t("My Favorites") }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <router-link to="/my/mentions" class="unread-mentions desktop-only" v-if="$store.state.user?.unreadMentions?.length">                            
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                            <path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
                        </svg>
                        <span class="badge-count">{{$store.state.user.unreadMentions.length}}</span>
                    </router-link>
                </template>

                
                <div class="flex-spacer"></div>
                
                <div class="menu-section">
                    <span class="language-selector desktop-only">
                        {{ $store.getters.i18nLanguage.toLocaleUpperCase() }}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                        </svg>
                    </span>
                    <div class="sub-nav desktop-only">
                        <div class="dropdown-menu">
                            <div class="menu-group">                                
                                <template v-for="item in supportedLocales">
                                    <a v-on:click.prevent="setLocale(item.code.split('-')[0])">{{ item.lang }}</a>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
        </div>
    </div>
</template>

<style scoped>
.dropdown-menu {
    border: 1px solid #444444;
    box-shadow: 2px 2px 25px 0px #00000059;
    border-radius: 8px;
    background: #242424;
    gap: 10px;
    opacity: 0px;
    padding: 8px;
    a {
        padding: 8px;
        border-radius: 4px;
        color: #E3E3E3;
        &:hover {
            background-color: #2C2C2C;
        }
    }
    .game-select {
        display: flex;
        gap: 5px;
        margin-top: 4px;
    }
    .game-select a {
        padding: 0;
        color: #999!important; font-size: 14px;
        &:hover {
            color: #BBB!important
        }
        & + a {
            border-left: 1px solid #333333;
            padding-left: 5px;
            border-radius: 0;
        }
    }
}
#menu-underlay {
    position: fixed;
    left:0; right:0; top:0; bottom:0;
    z-index:998
}

#header-top-wrap {
    background: #1E1E1E;
    & > div {
        width: 1250px;
        max-width: 100%;
        margin: 0 auto;
    }

    #header-common {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 54px;
        top: 100px;
        left: 100px;
        gap: 0px;
        border: 0px 0px 1px 0px;
        opacity: 0px;
        font-size: 16px;
        font-weight: 400;
        line-height: 16px;
        text-align: left;
        
        #logo {
            border-right: 1px solid #292929;
            padding: 0 18px 0 0;
            margin-right: 18px;
            display: flex;
            align-items: center;
            height: 100%;
            img {                
                max-height: 2em;
            }
        }
    }
}
#header-common-links, #header-login, #header-user {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    a {
        color: #B3B3B3;
        padding: 12px;
        border-radius: 4px;
        display: inline-flex;
        flex-wrap: nowrap;
        white-space: nowrap;    
        align-items: center;
        max-height: 40px;
        &.selected {
            color: #F3F3F3;
        }
        &.red-btn {
            background: #C1272D;
            color: #E3E3E3;
            svg {
                height: 20px;
                & + span {
                    margin-left: 4px;
                }
            }
            &:hover {
                background: #9F1F26;
                color: white;
            }
        }
        &:hover {
            color: #F3F3F3;
            text-decoration: none;
            background: #2b2b2b;
        }
    }
}

#patreon-btn, #steelseries-btn {
    background: none;
    color: #E3E3E3;
    padding: 12px!important;
    font-weight: normal;
    margin: 0!important;
    img, svg {
        height: 16px;
        margin-right: 4px;
    }
}
#steelseries-btn {
    color: #F3F3F3!important;
    background: #2b2b2b;
}
#header-user {
    flex-grow: 1;
    justify-content: flex-end;
    gap: 16px;
    div {
        position: relative; 
    }
    #user-menu, #mobile-lang-menu {
        cursor: pointer;  
        position: relative; 
        z-index: 999;
        .user-name {
            max-width: 215px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .dropdown-menu {    
            z-index: 999; 
            display: flex;
            flex-direction: column;
            position: absolute; 
            right: 0px; 
            margin-top: 0.5rem; 
            width: 12rem; 
            transform-origin: right top 0px; 
        }
    }
    #user-menu #userdropdown {
        display: none;
        flex-direction: column;
        min-width: 170px;
        z-index: 99!important;
        .menu-group {
            flex-direction: column;
            h4 {
                margin: 0;
                font-size: 12px;
                padding: 0 10px;
                color: #edd;
                pointer-events: none;
            }            
            & > * {
                cursor: pointer;
                display: flex;
                align-items: center;
            }
        }      
        svg {
            height: 16px;
        }  
    }
    #user-menu #userdropdown.user-menu-open, #user-menu:hover #userdropdown {
        display: flex!important;
        position: absolute;
        padding-top: 18px;
        top: 6px;
        right: 0;
    }
}

#header-main-wrap {
    background: #2C2C2C;
    border-top: 1px solid #3E3E3E;
    border-bottom: 1px solid #3E3E3E;
    #header-main {
        width: 1250px;
        max-width: 100%;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        font-size: 16px;
        line-height: 16px;

        a {
            color: white;
            &:hover {
                text-decoration: none;
            }
        }
        #header-search {
            width: 400px;
            max-width: 80%;
            max-height: 40px;
            margin: 0 auto;
            display: flex;
            align-items: center;
        }

        .menu-section {
            display: flex;
            flex-wrap: nowrap;
            white-space: nowrap;    
            align-items: center;
            max-height: 40px;
            color: white;
            position: relative;
            cursor: default;
            & > span {
                padding: 12px;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                gap: 5px;
                svg {
                    height: 16px;
                }
            }
            &:hover > span {
                background: #242424;
            }
            &.red-btn {
                padding: 12px;
                border-radius: 8px;
                background: #C1272D;
                color: #E3E3E3;
                line-height: 18px;
                svg {
                    height: 18px;
                    margin-right: 4px;
                }
                &:hover {
                    background: #9F1F26;
                    color: white;
                }
            }
            .sub-nav {
                display: none;
                flex-direction: column;
                min-width: 170px;
                z-index: 99!important;
                .menu-group {
                    flex-direction: column;
                    h4 {
                        margin: 0;
                        font-size: 12px;
                        padding: 0 10px;
                        color: #edd;
                        pointer-events: none;
                    }            
                    & > * {
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                    }
                }        
                .sub-nav-heading {
                    font-size: inherit;
                    display: flex;
                    align-items: center;
                }
            }
            &:hover .sub-nav {
                display: flex;
                position: absolute;
                padding-top: 18px;
                top: 30px;
                left: 0;
            }
            .language-selector + .sub-nav {
                left: auto;
                right: 0;
            }
            &.drop-left:hover .sub-nav {
                left: auto;
                right: 0;
            }
            
            .menu-icon {
                width: 20px;
                margin-right: 8px;
                margin-left: -4px;
                display: inline-flex;
                align-items: center;
                justify-content: flex-end;
                img, svg {
                    max-width: 100%;
                    max-height: 16px;
                }          
            }
        }
    }
    .new-import, .unread-mentions {
        display: flex;
        align-items: center;
        background: #444444;
        border: 1px solid #767676;
        color: white;
        max-height: 40px;
        text-transform: uppercase;
        border-radius: 8px;
        padding: 12px;
        position: relative;
        &:hover {
            background-color: #555555;
        }
        svg {
            height: 20px;
        }
    }
    
    .unread-alert {
        background: #C1272D;
        color: white;
        text-transform: uppercase;
        border-radius: 8px;
        padding: 4px 8px;
        margin: 12px 0;
        &:hover {
            background-color: #9F1F26;
        }
    }
}

.flex-spacer {
    flex-grow: 1;
}

#mobile-menu-btn {
    display: none;
}
.badge-count {
    position: absolute; 
    top: -0.5rem; 
    right: -0.5rem; 
    display: inline-flex; 
    height: 1.5rem; 
    width: 1.5rem; 
    align-items: center; 
    justify-content: center; 
    border-radius: 9999px; 
    border-width: 2px; 
    background-color: #C1272D; 
    font-size: 0.75rem; 
    line-height: 1rem; 
    font-weight: 700; 
}

.language-selector {
    font-size: 12px;
    padding: 1px;
    border-radius: 4px;
}

.mobile-only {
    display: none!important;
}

@media (max-width: 1200px) {
    #user-menu .user-name {
        display: none;
    }
}

@media (min-width: 1150px) and (max-width: 1270px) {
    #header-top-wrap, #header-main-wrap {
        padding: 0 8px;
    }
}

@media (max-width: 1150px) {
    
    #user-menu .user-name {
        display: block;
    }

    .desktop-only {
        display: none!important;
    }
    .mobile-only {
        display: inherit!important;
    }
    .mobile-open #header-common {
        height: auto!important;
        #logo {
            min-height: 46px;            
        }
    }
    
    #header-common-links {
        display: none;
        z-index: 99;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        order: 99;
        width: 100%;
        background: #1e1e1e;
        gap: 8px;
        padding: 4px;
        flex-wrap: wrap;
        margin-top: 0;
        margin-left: -8px;
        .red-btn {
            display: none
        }
    }
    .mobile-open #header-common-links {
        display: flex;
    }

    #header-main-wrap {
        display: none;
        #header-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
            padding: 8px;
            & > * {
                order: 2;
            }
            #header-search {
                order: 1;
                margin: 0 0 8px 0;
                max-width: 100%;
                width: 100%;
            }
            .new-import {
                margin: 0;
                order: 99;
            }
            .menu-section {
                width: 100%;
                padding: 0;
                max-height: fit-content;
                flex-direction: column;
                & > span {
                    display: none;
                }
                .sub-nav {
                    width: 100%;
                    display: block;
                    box-shadow: none;
                    .dropdown-menu {
                        margin-bottom: 8px;
                        .game-select {
                            gap: 10px;
                            flex-wrap: wrap;
                            a {
                                width: auto;
                                &+a {
                                    padding-left: 10px;
                                }
                            }
                        }
                    }
                    a {
                        width: 100%;
                        background: none;
                        padding-left: 4px;
                    }                
                }
                &:hover .sub-nav {
                    top: 0;
                    padding-top: 0;
                }
            }
            .red-btn {
                display: none
            }
            #header-locale {
                display: none;
            }
        }
    }
    .mobile-open #header-main-wrap {
        display: flex;
    }

    .sub-nav {
        position: relative!important;
    }
    #header-top-wrap {
        #header-common {
            padding: 4px 8px;
            flex-wrap: wrap;
            #logo {
                margin-left: 16px;
            }
        }
    }
    #header-main-wrap {
        display: none;
        &.mobile-open {
            display: block;
            
        }
    }

    #wago-header {    
        margin: 4px 4px;
        padding: 2px 8px;
        border-radius: 8px;
        border: 2px solid #363636;
        #header-common {
            gap: 12px;
            #header-login {
                display: inline;
            }
            #header-common-links {
                display: none;
                &.mobile-open {
                    display: flex;
                    position: absolute;
                    z-index: 999;
                    background: #1e1e1e;
                    gap: 8px;
                    padding: 8px;
                    flex-wrap: wrap;
                    .red-btn {
                        display: none
                    }
                }
            }
        }
        
    }
    #mobile-menu-btn {
        display: block;
        svg {
            height: 20px;
        }
    }
    #index {
        margin:0!important;
    }
}
  
</style>
