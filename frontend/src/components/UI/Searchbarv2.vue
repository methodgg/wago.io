<template>
    <div id="searchWrapper">
        <ul id="inputWrapper">
            <li v-for="(tag, index) in tags" :key="index" class='search-tag category' :class="tag.id">{{ $t(tag.i18n) }}<span class="x-button" @click="deleteTag(index)">×</span></li>
            <li id="searchInputWrapper"><input v-model="searchString" @blur="checkTags(true)" v-on:keyup.enter="submitSearch" id="searchInput" type="text" :placeholder="tags.length > 0 ? '' : $t('Search')" /></li>
        </ul>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
    </div>
</template>

<script>  
export default {
    components: {
        
    },
    data: function () {
      return {
        tags: [],
        searchString: '',
        Categories: []
      }
    },
    computed: {
      User () {
        return this.$store.state.user
      },
    },
    watch: {
        searchString (str) {
            this.checkTags(false)
        },
        $route (to, from) {
            this.$nextTick(() => {
                try {
                    this.searchString = to.matched[0]?.props?.default(this.$route).context.query.trim().replace(/[+\s]+/g, ' ')
                } catch (e) {
                    this.searchString = (to.query?.q || '').trim().replace(/[+\s]+/g, ' ')
                }
                this.tags = []
                this.checkTags(true)
            })
        }
    },
    methods: {
        submitSearch () {
            this.checkTags(true)
            console.log('submit search', `/search?q=${(this.tags.map(tag => encodeURIComponent(tag.query)).join('+') + '+' + encodeURIComponent(this.searchString.trim().replace(/\s+/g, '+')))}`.replace(/(\+)+/g, '+'))
            this.$router.push(`/search?q=${(this.tags.map(tag => encodeURIComponent(tag.query)).join('+') + '+' + encodeURIComponent(this.searchString.trim().replace(/\s+/g, '+')))}`.replace(/(\+)+/g, '+'))
        },
        checkTags(onBlur) {
            if (onBlur) {
                this.searchString = this.searchString.trim()
            }
            const reCategory = new RegExp(`(?:category|tag): ?([a-z0-9-]+)(${onBlur?'':' '})`, 'gi')
            const categoryMatch = reCategory.exec(this.searchString)
            if (categoryMatch) {
                const found = categoryMatch[1]
                if (window.Categories.categories[found]) {
                    this.tags.push({query: categoryMatch[0].replace(/\s/g, ''), ...window.Categories.categories[found]})
                    this.searchString = this.searchString.replace(categoryMatch[0], "")
                    this.checkTags(onBlur)
                }
            }
        },
        deleteTag(index) {
            this.tags.splice(index, 1)
        }
    },
    mounted: function () {
    },
    destroyed: function () {
    },
}
</script>

  
<style lang="scss" scoped>
#searchWrapper {
	position: relative;
	overflow: hidden;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 1px solid #444444;
    color: #555555;
    background: #1E1E1E;
    width: 100%;

    svg {
        pointer-events: none;
        width: 20px;
        height: 20px;
        margin: 0 8px 0 4px;
        cursor: pointer;
    }
    #inputWrapper {
        display: flex;
        list-style: none;
        gap: 4px;
        align-items: center;
        background: #1E1E1E;
        color: #b6b6b6;
        width: 100%;
        margin: 0;
        padding: 0;

        li {
            margin-top: 0;
        }

        #searchInput {
            background: none;
            border: 0;
            color: #e2e2e2;
            font-size: 16px;
            flex-grow: 1;
            overflow-x: scroll;
            overflow-y: hidden;
            width: 100%;
            padding: 11px 12px 10px 12px;

            &::-webkit-scrollbar {
                display: none;
                width: 0; 
                height: 0; 
            }
        }
    }

    button[type=submit] {
        color: #f7f7f7;
        padding: 4px 16px;
        margin-left: 8px;
        background: #c1272d;
        border: 0;
        border-radius: 4px;
        height: 2.5em;
        cursor: pointer;
        font-weight: bold;
    }
}



#searchInput:focus, .tagEditor:focus {
	outline: none;
}

#searchInputWrapper {
    width: 100%;
}

#inputWrapper .search-tag {
    margin: 0.25rem 0.15rem 0 .25rem;
    padding: 0 0.3rem 0 20px;
    background-position: 3px 3px;
    background-size: 16px 16px;
    background-repeat: no-repeat;
    display: inline-flex;
    align-items: center;
    width: max-content;
    border-radius: 5px;
    background-color: #17181a;
    color: white;
    border: 1px solid;
    height: 1.5rem;
    white-space: nowrap;
    .tagText {
        padding: 0;
        background-color: inherit;
        border: 0;
        color: inherit;
    }
    .x-button {
        padding: 0 0 0 0.2rem;
        color: inherit;
        cursor: pointer;
        background-color: transparent;
        border: none;
        font-weight: bold;
    }
}

/* Optional */
.searchPlaceholder {
	color: #777777;
}

</style>