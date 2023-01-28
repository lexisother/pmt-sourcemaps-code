<template>
    <div
        v-if="showHeader && !switchingStore"
        id="header-container"
    >
        <PmtMobileMenu
            ref="mobileMenu"
            :show="showMobileMenu"
            :menu-items="mobileMenuItems"
            :user-menu-items="userMenuItems"
            :theme="theme"
            :user="user"
        />
        <div
            id="pmt-header"
            v-click-outside="onOverlayclick"
        >
            <div
                v-if="currentStore"
                class="top"
                :style="{backgroundColor: theme.primaryBackgroundColor}"
            >
                <PmtHeaderNavigation
                    ref="navigationMenu"
                    :theme="theme"
                    :menu-items="menuItems"
                />
                <div class="right">
                    <PmtHeaderButton
                        v-if="!online"
                        ref="offlineIcon"
                        v-tooltip="$t('apiErrors.general.networkError')"
                        offline
                        :theme="theme"
                    />
                    <PmtHeaderButton
                        v-if="showReloadApp"
                        v-tooltip="$t('generalMessages.info.reloadAppMessage')"
                        icon="alert-decagram"
                        class="reload-button"
                        :label="$t('generalMessages.info.reloadAppLabel')"
                        :theme="theme"
                        @on-click="refresh"
                    />
                    <PmtUserMenu
                        ref="userMenu"
                        :menu-items-length="menuItems.length"
                        :user="user"
                        :user-menu-items="userMenuItems"
                        :theme="theme"
                    />
                    <PmtBrand
                        ref="brand"
                        @switch-store="performSwitchStore()"
                    />

                    <PmtHeaderButton
                        class="mobile-menu-btn"
                        icon="menu-button"
                        :theme="theme"
                        is-mobile-menu-button
                        @on-click="$refs.mobileMenu.show()"
                    />
                </div>
            </div>

            <PmtPageTitle
                :theme="theme"
            />
        </div>
    </div>
    <round-spinner
        v-else-if="online"
        :show="true"
        :full-screen="true"
        :loading-text="$t('headerMenu.loadingApp')"
    />
</template>

<script>
import HeaderButton from './HeaderButton.vue'
import HeaderNavigation from './HeaderNavigation.vue'
import UserMenu from './UserMenu.vue'
import Brand from './Brand.vue'
import MobileMenu from './mobile-menu/MobileMenu.vue'
import PageTitle from './PageTitle.vue'
import { mapGetters, mapState } from 'vuex'

export default {
    name: 'Header',
    components: {
        PmtHeaderNavigation: HeaderNavigation,
        PmtUserMenu: UserMenu,
        PmtBrand: Brand,
        PmtMobileMenu: MobileMenu,
        PmtHeaderButton: HeaderButton,
        PmtPageTitle: PageTitle,
    },

    data () {
        return {
            showMobileMenu: false,
            switchingStore: false,
        }
    },

    computed: {
        ...mapState([
            'online',
            'showReloadApp',
        ]),
        ...mapGetters('auth', [
            'user',
            'isAuthenticated',
        ]),
        ...mapGetters('stores', {
            currentStore: 'currentStore',
            defaultTheme: 'getDefaultTheme',
            actualStore: 'currentStore',
        }),
        ...mapGetters('menu', {
            menuItems: 'headerMenuItems',
            activeSubmenu: 'activeSubmenu',
            userMenuItems: 'headerUserMenuItems',
        }),
        showHeader () {
            return this.menuItems.length > 0 || this.userMenuItems.length > 0 || this.$route.name === 'select-store'
        },
        theme () {
            if (this.currentStore) {
                return this.currentStore.theme.primaryBackgroundColor ? this.currentStore.theme : this.defaultTheme
            }
            return this.defaultTheme
        },
        currentStore () {
            return this.actualStore
        },
        backgroundColor () {
            return 'background-color: ' + this.currentStore.theme.bgColor
        },
        mobileMenuItems () {
            if (this.user) {
                return this.menuItems
            }

            return [
                ...this.menuItems,
                {
                    label: this.$t('headerMenu.login.label'),
                    route: 'login',
                    icon: 'account',
                },
            ]
        },
    },

    methods: {
        onOverlayclick () {
            if (this.$refs.navigationMenu) {
                this.$refs.navigationMenu.hideSubmenus()
            }
            if (this.$refs.userMenu) {
                this.$refs.userMenu.hideSwitchStoreMenu()
            }
        },
        performSwitchStore () {
            this.switchingStore = true
            this.$emit('switch-store')
        },

        /**
         * Reloads current page.
         */
        refresh () {
            window.location.reload()
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';

    #pmt-header {
        .top {
            position: relative;
            display: flex;
            justify-content: space-between;
            height: var(--menu-header-height);
            background-color: $primary-color;

            @include bp-sm {
                height: var(--menu-header-height-sm);
            }
        }
        .right {
            display: flex;
        }
        .mobile-menu-btn {
            position: absolute;
            right: 0;

            display: none;
        }
        &.submenu-active {
            margin-bottom: var(--menu-header-height);

            @include bp-sm {
                margin-bottom: var(--menu-header-height-sm);
            }
        }
    }
</style>

<style lang="scss">
    #pmt-header {
        .store-info {
            width: 56%;
        }

        .reload-button {
            position: relative;
            right: 100px;

            a {
                font-weight: 800;
                font-size: 13px;
            }
        }
    }
    /*
     * custom breakpoint needed to fit all buttons that can appear.
     */
    @media only screen and (max-width: 1552px) {
        .reload-button .label {
            display: none;
        }
    }
    /*
     * custom breakpoint needed to fit all buttons that can appear.
     */
    @media only screen and (max-width: 850px) {
        .reload-button {
            right: -15px !important;
        }
    }

    @media only screen and (max-width: 700px) {
        #pmt-header {
            .header-navigation,
            .user-menu {
                display: none;
            }
            .top {
                flex-flow: row-reverse;
            }
            .sub-menu {
                display: none;
            }
            .mobile-menu-btn {
                display: block !important;
            }
        }

        .reload-button {
            position: static !important;
        }
    }

    @media print {
        #pmt-header {
            display: none;
        }
    }
</style>
