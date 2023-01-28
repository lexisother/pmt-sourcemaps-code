<template>
    <div
        :class="{'sub-menu': checkSubMenu,
                 'align-right': alignRight,
                 'flex-sub-menu': Boolean(items.categories),
                 'four-column-submenu': checkSubcategories}"
        :style="{display: hasSubcategoriesSubmenu ? 'flex' : 'block'}"
        @mouseleave="closeSubMenu"
    >
        <template v-if="filteredItems.length">
            <span
                v-if="title"
                class="sub-menu-title"
                style="color: #252525;"
            >{{ title }}</span>
            <div
                v-for="(menuItem, index) in filteredItems"
                :key="menuItem.label + index"
                @mouseover="hovered = index"
                @mouseout="hovered = false"
            >
                <router-link
                    v-if="!menuItem.items"
                    :to="getRoute( menuItem )"
                    class="sub-router-link"
                    :cy_id="getCypressId(menuItem.url)"
                    :class="{ active: isActive( menuItem ), hovered: hovered === index }"
                    @mouseover="hovered = index"
                    @mouseout="hovered = false"
                    @click.native="onClick( menuItem || null )"
                >
                    <component
                        :is="menuItem.icon"
                        v-if="menuItem.icon"
                        :size="18"
                        class="icon active-menu-item"
                    />
                    <span
                        :style="{fontWeight: isActive( menuItem ) ? '800' : '500'}"
                        class="active-menu-item"
                        v-html="htmlDecode(menuItem.label)"
                    />
                    <span
                        v-if="menuItem.counter && unreadNewsCounter > 0"
                        class="badge"
                        :data-badge="unreadNewsCounter > 9 ? '9+' : unreadNewsCounter"
                    />
                </router-link>
                <div>
                    <tree-menu
                        v-if="menuItem.items"
                        :items="menuItem.items"
                        :align-right="alignRight"
                        :show-filter="true"
                        :theme="theme"
                    />
                </div>
            </div>
        </template>
        <template
            v-for="(categoryItems, categoryIndex) in items.categories"
            v-else
        >
            <div
                :key="categoryIndex"
                class="flex-sub-menu-category"
                :style="4 === Object.keys(items.categories).length ? 'flex-basis: 200px;' : ''"
            >
                <span
                    v-if="Object.keys(items.categories).length > 1"
                    class="category-title"
                    :style="{color: theme.secondaryBackgroundColor}"
                >
                    <span style="top: -3px; position: relative;">
                        <component
                            :is="getCategoryIcon(categoryItems)"
                            :size="18"
                            :fill-color="theme.secondaryBackgroundColor"
                            class="icon-style"
                        />
                    </span>
                    {{ categoryIndex }}
                </span>
                <tree-menu
                    v-if="categoryItems"
                    :items="categoryItems"
                    :align-right="alignRight"
                    :show-filter="true"
                    :theme="theme"
                />
            </div>
        </template>
    </div>
</template>

<script>
import menuItemHelper from '../../libraries/menuItemHelper'
import { mapGetters, mapState } from 'vuex'

export default {
    name: 'TreeMenu',
    props: {
        items: {
            type: Array,
        },
        alignRight: {
            type: Boolean,
            default: false,
        },
        subMenu: {
            type: Array,
        },
        showFilter: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
        },
        theme: {
            type: Object,
        },
        clicked: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        activeSubmenu: false,
        searchText: '',
        hovered: false,
    }),
    computed: {
        ...mapGetters('stores', { actualStore: 'currentStore' }),
        ...mapGetters('menu', {
            getCategoryIcon: 'getCategoryIcon',
        }),
        ...mapState('news', {
            unreadNewsCounter: 'unreadNewsCounter',
        }),
        headerButtonStyle () {
            return this.isActive(this.$route.path) || this.hovered ? { backgroundColor: this.theme.primaryBackgroundColor } : false
        },
        currentStore () {
            if (!this.actualStore) {
                return this.defaultStore
            }
            return this.actualStore
        },
        secondaryBackgroundColor () {
            return this.currentStore.theme.secondaryBgColor
        },
        filteredItems () {
            if (typeof this.items.categories === 'undefined') {
                return this.items
            }
            return []
        },
        checkSubMenu () {
            return !this.items.find(item => item.category_name)
        },
        checkSubcategories () {
            return typeof this.items.categories !== 'undefined' && Object.keys(this.items.categories).length > 6
        },
        hasSubcategoriesSubmenu () {
            return typeof this.items.categories !== 'undefined' && Object.keys(this.items.categories).length > 1
        },
    },
    methods: {
        getRoute (menuItem) {
            if (menuItem.label === this.$t('headerMenu.aboutPmt.label')) {
                menuItem.icon = 'information-outline'
                return '#'
            }
            if (menuItem.route) {
                return {
                    name: menuItem.route,
                }
            }
            if (menuItem.action) {
                return ''
            }
            if (menuItem.url) {
                return menuItem.url
            }
            return ''
        },
        getCypressId (string) {
            const substr = string.substr(1)
            return substr.replace('/', '_')
        },
        /**
         * Actions performed when clicking on a sub menu item.
         *
         * @param menuItem
         */
        async onClick (menuItem) {
            // TODO: remove the about from sitemap
            if (menuItem.label === this.$t('headerMenu.aboutPmt.label')) {
                this.$emit('about')
            }
            this.$emit('change-state', false)
            if (typeof menuItem.action === 'function') {
                menuItem.action()
            } else {
                const route = this.getRoute(menuItem)
                if (typeof route.name === 'undefined') {
                    window.location = this.getRoute(menuItem)
                }
            }
            // add mutation to update close on click LI
        },
        isActive (item) {
            return menuItemHelper.matchesRoute(this.$route, item)
        },
        closeSubMenu () {
            if (!!this.$refs.selectStoreDropdown && !this.$refs.selectStoreDropdown[0].showMenu) {
                this.$emit('change-state', false)
            }
        },
        htmlDecode (str) {
            const textArea = document.createElement('textarea')
            textArea.innerHTML = str
            return textArea.value
        },
    },
}
</script>

<style lang="scss">
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/shaddows.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';

    $menu-height: 15px;
    .icon-style {
        font-size: 14px;
        width: 15px;
        height: 15px;
        position: relative;
        margin-right: 2px;
    }
    .flex-sub-menu {
        flex-flow: row wrap;
    }
    .flex-sub-menu-category {
        flex: 1 0 calc(33.333% - 20px);
        flex-grow: 1;
        flex-shrink: 0;
    }
    .sub-menu,
    .flex-sub-menu {
        padding: 10px 0px;
        min-width: 186px;
        max-width: 525px;
        margin-right: 20px;
        background-color: white;
        box-shadow: $shaddow-6p;
        z-index: 99;
        position: absolute;
        top: 40px;
        visibility: hidden;
        opacity: 0;
        transition: all .2s ease-in-out;
        transition-delay: 0.1s;

        @include bp-sm {
            top: 48px;
        }

        &.four-column-submenu {
            width: 864px;
            left: 100px;
            height: 645px;
            overflow: scroll;
            flex-wrap: initial;
            flex-flow: column wrap;
            max-width: none;

            @include bp-lg {
                left: 200px;
            }

            @include bp-xl {
                left: auto;
            }
        }
        .icon {
            font-size: 14px;
            width: 15px;
            height: 15px;
            position: relative;
            margin-right: 2px;
            & + span {
                margin-left: 5px;
            }
        }
        &.align-right {
            flex-flow: row-reverse wrap;
            // padding-right: 196px;
        }
        .active-menu-item {
            color: rgb(37, 37, 37);
        }
        .category-title,
        .sub-menu-title {
            white-space: nowrap;
            display: inline-block;
            padding: 0 20px;
            font-size: 0.9rem;
            font-weight: 600;
            line-height: 30px;
            text-decoration: none;
            vertical-align: middle;
        }
        a {
            display: inline-block;
            height: 100%;
            width: 100%;
            padding: 10px 20px;
            font-size: .8rem;
            font-weight: 400;
            line-height: $menu-height;
            color: $header-button-color;
            text-decoration: none;
            vertical-align: middle;
            &:hover {
                cursor: pointer;
            }
            &.active {
                font-weight: 700;
                color: #FFF;
                filter: brightness(1.2);
                background: hsla(180,0%,50%,0.25);
            }
            &.hovered {
                filter: brightness(1.2);
                background: hsla(180,0%,50%,0.25);
            }
        }
        .menu-arrow {
            margin-left: 5px;
        }
        .open {
            color: #fff;
            position: relative;
        }
        .open .menu-arrow {
            -webkit-transform: rotate(-180deg);
            transform: rotate(-180deg);
            -webkit-transition: all .1s ease-out;
            transition: all .1s ease-out;
        }
        .open ul {
            display: block !important;
            visibility: visible !important;
            position: absolute;
            height: 500px;
            overflow-y: scroll;
            overflow-x: hidden;
            padding-right: 0;
            width: 189px;
        }
        :not(.open) ul {
            display: none;
            visibility: hidden;
        }
        .store-menu li {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
        #storeFilter {
            margin-left: 17px;
            margin-top: 5px;
            margin-bottom: 5px;
            width: 132px;
            border-radius: 3px;
            padding: 4px 6px;
        }
    }
    .badge {
        position:relative;
        display: initial;
    }
    .badge[data-badge]:after {
        content: attr(data-badge);
        position: absolute;
        left: 10px;
        font-size:.76em;
        filter: brightness(0.8) !important;
        background: $fail-color;
        color: white;
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        border-radius: 50%;
        box-shadow: $shaddow-3p;
    }
    @media only screen and (max-width: 835px) {
        #pmt-header .flex-sub-menu.four-column-submenu {
            width: 250px;
            flex-flow: row wrap;
        }
    }
</style>
