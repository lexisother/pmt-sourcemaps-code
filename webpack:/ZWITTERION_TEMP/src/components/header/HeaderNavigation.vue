<template>
    <nav class="pmt-header">
        <slot />
        <ul class="header-navigation">
            <li
                v-for="(menuItem, index) in menuItems"
                :key="menuItem.label"
            >
                <PmtHeaderButton
                    :ref="'item' + index"
                    :label="menuItem.label"
                    :route="menuItem.route"
                    :path="menuItem.path"
                    :url="menuItem.url"
                    :icon="menuItem.icon"
                    :sub-menu="menuItem.subMenu"
                    :theme="theme"
                    @on-active-submenu-changed="updateActiveSubMenu"
                    @on-opened-submenu-changed="hideSubmenus"
                />
            </li>
        </ul>
    </nav>
</template>

<script>
import HeaderButton from './HeaderButton.vue'
import { mapActions } from 'vuex'

export default {
    components: {
        PmtHeaderButton: HeaderButton,
    },
    props: {
        menuItems: {
            type: Array,
            required: true,
        },
        theme: {
            type: Object,
            default: () => {},
        },
    },
    updated () {
        this.$nextTick(function () {
            this.updateActiveSubMenu()
        })
    },
    methods: {
        ...mapActions('menu', {
            setActiveSubMenu: 'setActiveSubMenu',
        }),
        updateActiveSubMenu () {
            let activeSubMenu = []

            for (const n in this.menuItems) {
                const menuItemRef = this.$refs['item' + n]

                if (menuItemRef && menuItemRef[0] && menuItemRef[0].isActiveSubmenu === true) {
                    activeSubMenu = menuItemRef[0].subMenu
                }
            }

            this.setActiveSubMenu(activeSubMenu)
        },

        /**
             * Hide all submenus previously opened on click.
             */
        hideSubmenus () {
            for (const n in this.menuItems) {
                const menuItemRef = this.$refs['item' + n]

                if (menuItemRef && menuItemRef[0] && !!menuItemRef[0].subMenu) {
                    menuItemRef[0].updateActiveState(false)
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '../../assets/scss/_colors.scss';
    .pmt-header {
        display: inherit;
    }
    .header-navigation {
        display: flex;
        align-items: center;

        padding: 0 !important;
        margin: 0;
        height: 100%;

        list-style: none;
    }
</style>

<style lang="scss">
    @media only screen and (max-width: 1260px) {
        .header-navigation {
            .header-button > a > span:not(.icon) {
                display: none;
            }

            .header-button > a > .icon {
                margin: 0;
            }
        }
    }

    @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
        @media only screen and (max-width: 1300px) {
            .header-navigation .header-button > a > span:not(.icon) {
                display: none;
            }
        }
    }
</style>
