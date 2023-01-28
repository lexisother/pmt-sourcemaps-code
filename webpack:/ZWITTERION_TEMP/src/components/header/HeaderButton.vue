<template>
    <div
        class="header-button"
        :style="headerButtonStyle"
        :class="{
            active: isActive( $route.path ) || activeMainItem,
            'open-child': isStoreSwitchMenuOpen(),
            'header-button-hover': true
        }"
        @mouseover="onHover(true)"
        @mouseout="onHover(false)"
    >
        <router-link
            :to="getRoute()"
            :style="getPadding"
            @click.native="onClick($event)"
        >
            <avatar
                v-if="subMenu && isUserMenuItem"
                cy_id="avatar"
                :fullname="user.fullname"
                :theme="theme"
                :active="isActive( $route.path ) || activeMainItem"
                :hovered="hovered"
            />
            <component
                :is="icon"
                :size="18"
                :fill-color="getRouteLinkColor"
                class="icon"
            />
            <span
                v-if="label"
                :style="routeLinkStyle"
                class="label"
            >
                {{ label }}
            </span>
            <wifi-off
                v-if="offline"
                :fill-color="theme.primaryColor"
            />
        </router-link>

        <pmt-sub-menu
            v-if="subMenu"
            ref="submenu"
            :items="subMenu"
            :title="title"
            :align-right="alignRight"
            :clicked="clicked"
            :theme="theme"
            @about="openAbout"
            @change-state="updateActiveState"
        />
        <pmt-about-modal ref="aboutPmt" />
    </div>
</template>

<script>
import SubMenu from './SubMenu.vue'
import menuItemHelper from '../../libraries/menuItemHelper'
import stringHelper from '@/libraries/stringHelper'
import { mapGetters } from 'vuex'
import PmtAboutModal from '@/components/modals/PmtAboutModal.vue'

import Avatar from '@/components/header/Avatar.vue'

export default {
    components: {
        'pmt-sub-menu': SubMenu,
        PmtAboutModal,
        Avatar,
    },
    props: {
        label: {
            type: String,
            default: '',
        },
        title: {
            type: String,
        },
        url: {
            type: String,
            default: '',
        },
        route: {
            type: String,
        },
        path: {
            type: String,
            default: '',
        },
        icon: {
            type: String,
        },
        subMenu: {
            type: Array,
        },
        noActiveSubMenu: {
            type: Boolean,
            default: false,
        },
        alignRight: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: Object,
        },
        noHover: {
            type: Boolean,
            default: false,
        },
        isMobileMenuButton: {
            type: Boolean,
            default: false,
        },
        offline: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        // Flag to indicate if current route is from this main menu.
        isActiveSubmenu: false,

        // Flag to indicate if current menu is acive (should be only for switch store menu).
        activeSwitchStoreMenu: false,
        hovered: false,
        activeMainItem: false,
        clicked: false,
    }),
    computed: {
        ...mapGetters('auth', [
            'user',
        ]),
        ...mapGetters('menu', {
            lightBackgrounds: 'getLightBackgrounds',
        }),
        headerButtonStyle () {
            return {
                backgroundColor: this.isActive(this.$route.path) || this.activeMainItem || this.hovered ? (this.hovered ? stringHelper.lightenDarkenColor(this.theme.primaryBackgroundColor, 20) : this.theme.secondaryBackgroundColor) : '',
            }
        },
        routeLinkStyle () {
            return { color: this.getRouteLinkColor }
        },
        getRouteLinkColor () {
            if ((this.isActive(this.$route.path) || this.activeMainItem) && !this.hovered) {
                return this.theme.secondaryColor
            }

            return this.isActive(this.$route.path) || (this.hovered && (!this.noHover || this.clicked)) ? this.getSecondaryColor : this.theme.primaryColor
        },
        /**
         * When background is white, just lighten a bit the primary color instead of using secondary color - since
         *  most of the times secondary color is white (or very light).
         **/
        getSecondaryColor () {
            if (this.lightBackgrounds.indexOf(this.theme.primaryBackgroundColor.toLowerCase()) === -1) {
                return this.theme.secondaryColor
            }

            return stringHelper.lightenDarkenColor(this.theme.primaryColor, 20)
        },
        isUserMenuItem () {
            if (this.subMenu && this.subMenu.length) {
                for (let i = 0; i < this.subMenu.length; i++) {
                    if (this.subMenu[i].route === 'logout') {
                        return true
                    }
                }
                return false
            }
            return false
        },
        getChevron () {
            return this.activeMainItem ? 'chevron-up' : 'chevron-down'
        },
        getPadding () {
            if (this.isUserMenuItem) {
                return 'padding: 0 10px'
            }
            return ''
        },
    },
    methods: {
        getRoute () {
            if (this.route) {
                return {
                    name: this.route,
                }
            }

            if (this.url !== '') {
                return this.url
            } else {
                return this.$route.fullPath
            }
        },
        openAbout () {
            this.$refs.aboutPmt.open()
        },
        onHover (value) {
            this.hovered = value
        },
        isActive (current_url) {
            if (menuItemHelper.matchesRoute(this.$route, this)) {
                return true
            }

            // we need to store the found flag variable because the ForEach doesn't
            // break when calling return.
            let found_path = false

            if (this.subMenu) {
                Object.keys(this.subMenu).forEach((key) => {
                    const subItem = this.subMenu[key]
                    if (menuItemHelper.matchesRoute(this.$route, subItem)) {
                        found_path = true
                    }
                })
            }

            const oldActiveState = this.isActiveSubmenu
            this.isActiveSubmenu = !!(!this.noActiveSubMenu && this.subMenu && found_path)

            if (oldActiveState !== this.isActiveSubmenu) {
                this.$emit('on-active-submenu-changed')
            }

            return found_path
        },
        isStoreSwitchMenuOpen () {
            return this.activeSwitchStoreMenu
        },

        /**
             * Updates active state of switch store menu based on values send from SubMenu component.
             * @param value
             */
        updateActiveState (value) {
            this.activeSwitchStoreMenu = value
            this.$refs.submenu.activeSubmenu = value
            this.activeMainItem = value
        },

        /**
             * Actions performed when clicking on a sub menu item.
             *
             * @param $event
             */
        onClick ($event) {
            if (this.isMobileMenuButton) {
                this.$emit('on-opened-submenu-changed')
                // Update active state of submenu.
                if (this.$refs.submenu) {
                    this.updateActiveState(!this.$refs.submenu.activeSubmenu)
                }

                this.$emit('on-click', $event)
            }

            const route = this.getRoute($event)
            // Custom event for main header menu items to navigate to pmt1.
            if (route === '/application/add' || route === '/dashboard') {
                window.location = route
            } else {
                this.$emit('on-click', $event)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/shaddows.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .header-button-hover {
        &:hover .sub-menu,
        &:hover .flex-sub-menu {
            visibility: visible;
            opacity: 1;
        }
    }

    .header-button-clicked {
        &.open-child .sub-menu {
            visibility: visible;
            opacity: 1;
        }
    }

    .header-button {
        height: var(--menu-header-height);
        overflow: hidden;

        @include bp-sm {
            height: var(--menu-header-height-sm);
        }

        a {
            display: inline-block;
            height: 100%;
            padding: 0 20px;
            font-size: 11px;
            font-weight: 400;
            line-height: var(--menu-header-height);
            color: $header-button-color;
            text-decoration: none;
            vertical-align: middle;

            @include bp-sm {
                line-height: var(--menu-header-height-sm);
            }
        }
        &:hover a {
            filter: brightness(120%);
            cursor: pointer;
        }

        .icon {
            font-size: 14px;

            & + span {
                margin-left: 10px;
            }

            @media only screen and (max-width: 1325px) {
                 & + span {
                    margin-left: 2px;
                }
            }

            svg {
                margin-bottom: 4px;
            }
        }

        .menu-arrow {
            margin-left: 5px;
        }
    }
</style>
