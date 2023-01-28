<template>
    <ul class="mobile-navigation">
        <input
            v-if="showFilter"
            id="storeFilter"
            v-model="searchText"
            :placeholder="$t( 'headerMenu.filterBy.placeholder' )"
        >
        <li
            v-for="(menuItem, index) in filteredItems"
            :key="menuItem.label + index"
            :ref="getMenuItemRef( menuItem )"
            :class="getClassList( menuItem )"
        >
            <router-link
                :style="{backgroundColor: !menuItem.subMenu ? activeMenuItemBackgroundColor(menuItem) : 'white',
                         color: !menuItem.subMenu ? '#252525' : '#252525'}"
                :cy_id="getCypressId(menuItem.url)"
                :to="getRoute( menuItem )"
                :href="getRoute( menuItem )"
                @click.native="onClick( menuItem )"
            >
                <component
                    :is="menuItem.icon"
                    :size="18"
                    :fill-color="theme.secondaryBackgroundColor"
                    class="menu-item-icon"
                />
                <span
                    :style="{'color': menuItem.icon ? theme.secondaryBackgroundColor : isActive( menuItem ) ? theme.secondaryBackgroundColor : '#252525', 'font-weight': menuItem.icon ? '500' : '400'}"
                >
                    {{ menuItem.label }}
                </span>
                <span
                    v-if="menuItem.counter"
                    class="badge"
                    :data-badge="menuItem.counter"
                />
                <ChevronDown
                    v-if="menuItem.subMenu"
                    class="menu-arrow"
                />
            </router-link>

            <pmt-mobile-navigation
                v-if="menuItem.subMenu"
                :menu-items="menuItem.subMenu"
                :level="level + 1"
                :theme="theme"
                :show-filter="'stores'===menuItem.type && menuItem.subMenu.length > 0"
                @on-click="( menuItem ) => $emit( 'on-click', menuItem )"
            />
        </li>
    </ul>
</template>

<script>
import menuItemHelper from '../../../libraries/menuItemHelper'

export default {
    name: 'PmtMobileNavigation',
    props: {
        menuItems: {
            type: Array,
            required: true,
        },
        level: {
            type: Number,
            default: 0,
        },
        showFilter: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            items: [],
            searchText: '',
        }
    },
    computed: {
        className () {
            let prefix = ''

            for (let i = 0; i < this.level; i++) {
                if (prefix !== '') {
                    prefix += '-'
                }

                prefix += 'sub'
            }

            if (prefix !== '') {
                prefix += '-'
            }

            return prefix + 'menu-item'
        },
        filteredItems () {
            return this.items.filter(item => item.label.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1)
        },
    },
    watch: {
        menuItems () {
            this.initItems()
        },
    },
    created () {
        this.initItems()
    },
    methods: {
        activeMenuItemBackgroundColor (menuItem) {
            return !menuItem.subMenu ? menuItem.route === this.$route.name ? 'white' : 'white' : false
        },
        getClassList (menuItem) {
            return [
                this.className,
                {
                    active: this.isActive(menuItem),
                    open: this.hasActiveSubMenuItem(menuItem),
                    'has-active-child': this.hasActiveSubMenuItem(menuItem),
                },
            ]
        },
        getCypressId (string) {
            if (string) {
                return string.substr(1).replace('/', '_')
            }

            return ''
        },
        getMenuItemRef (menuItem) {
            return 'menuItem-' + menuItem.label.camelCase()
        },
        getRoute (menuItem) {
            if (menuItem.route) {
                return {
                    name: menuItem.route,
                }
            }
            return menuItem.url !== '' ? menuItem.url : this.$route.fullPath
        },
        onClick (menuItem) {
            if (menuItem.label === this.$t('headerMenu.aboutPmt.label')) {
                this.$emit('about')

                return
            }

            if (typeof menuItem.action === 'function') {
                menuItem.action(menuItem)

                return
            }
            if (typeof this.getRoute(menuItem) === 'string') {
                window.location = this.getRoute(menuItem)

                return true
            }
            if (!menuItem.subMenu) {
                this.$emit('on-click', menuItem)
            }
        },
        toggleSubMenu (menuItem) {
            const $el = this.$refs[this.getMenuItemRef(menuItem)][0]

            if (~$el.className.indexOf('open')) {
                $el.className = $el.className.replace(/\s?open/, '')
            } else {
                $el.className += ' open'
            }
        },
        isActive (menuItem) {
            return menuItemHelper.matchesRoute(this.$route, menuItem)
        },
        hasActiveSubMenuItem (menuItem) {
            if (menuItem.subMenu) {
                for (const key in Object.keys(menuItem.subMenu)) {
                    const subItem = menuItem.subMenu[key]

                    if (typeof subItem !== 'undefined') {
                        if (subItem.subMenu && this.hasActiveSubMenuItem(subItem)) {
                            return true
                        } else if (!subItem.subMenu && menuItemHelper.matchesRoute(this.$route, subItem)) {
                            return true
                        }
                    }
                }
            }

            return false
        },
        initItems () {
            this.items = this.menuItems.map(item => {
                if (item.subMenu) {
                    item.action = this.toggleSubMenu
                }

                return item
            })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '../../../assets/scss/_colors.scss';
    @import '../../../assets/scss/shaddows.scss';

    $bg-color: #252E3C;
    $border-color: darken( $bg-color, 5% );

    .mobile-navigation [class~="menu-item"] {

        line-height: 1em;

        a,
        a:hover,
        a:visited,
        a:active {
            display: block;

            padding: 15px 20px;

            color: darken( #FFF, 20% );
            text-decoration: none;
        }

        .menu-item-icon {
            margin-right: .6em;
            width: 17px;
        }

        .menu-arrow {
            float: right;

            transform: rotate( -90deg );
            transition: all .1s ease-out;
        }

        &.active > a,
        &.has-active-child > a {
            //border-left: 3px solid $primary-color;
            color: purple;
        }

        .badge {
            position:relative;
            display: initial;
        }
        .badge[data-badge]:after {
            content: attr(data-badge);
            position: absolute;
            top: 0px;
            left: 10px;
            font-size: .7em;
            background: $fail-color;
            color:white;
            width: 18px;
            height: 18px;
            text-align: center;
            line-height: 18px;
            border-radius: 50%;
            box-shadow: $shaddow-3p;
        }
    }

    .mobile-navigation [class~="sub-menu-item"] {
        padding-left: 40px;

        a,
        a:hover,
        a:visited,
        a:active {
            color: darken( #FFF, 35% );
        }

        &.active a {
            color: #FFF;
        }
    }

    .mobile-navigation .menu-item {
        .sub-menu-item, #storeFilter {
            display: none;
        }

        ul.mobile-navigation {
            overflow-y: auto;
            max-height: 500px;
        }

        &.open {
            > a .menu-arrow {
                transform: rotate( 0deg );
            }

            .sub-menu-item {
                display: block;
            }

            #storeFilter {
                display: block;
                margin: 10px 20px;
                font-size: 14px;
                border-radius: 3px;
                width: 140px;
                padding: 5px;
            }
        }
    }
</style>
