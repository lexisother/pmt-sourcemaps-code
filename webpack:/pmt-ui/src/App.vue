<template>
    <VApp :class="{ 'browser-ie': isInternetExplorer }">
        <div
            v-if="currentStore"
            :store-id="currentStore.id.toString()"
        />
        <div
            v-if="zendeskLabel"
            :zendesk-label="zendeskLabel"
        />

        <template v-if="showContent">
            <MaintenanceMode
                v-if="isMaintenanceMode && online"
                :modal="true"
            />
            <div>
                <PmtHeader
                    v-if="!hideHeader"
                    @switch-store="switchingStore=true"
                />
                <EndOfSupportMessage v-if="isInternetExplorer" />
                <AppMessages
                    v-if="isAuthenticated && messages.length"
                    :messages="messages"
                />
                <div
                    v-if="!switchingStore"
                    id="app-body"
                >
                    <transition
                        name="page"
                        mode="out-in"
                    >
                        <router-view id="page-container" />
                    </transition>
                </div>
            </div>
        </template>
        <MaintenanceMode v-else-if="isMaintenanceMode && online" />
        <RoundSpinner
            v-else-if="online"
            :full-screen="true"
            :loading="true"
            default-loading-text
        />
        <portal-target name="app-root" />
        <WhatsNew
            v-if="isAuthenticated && !isCypress() && !$cfg.hiddenMenuRoutes.includes($route.name)"
            id="whats-new"
            ref="whatsNew"
        />
        <PmtSnackbar />
        <iframe
            id="export-excel-ie-helper"
            style="display:none"
        />
    </VApp>
</template>

<script>
import browserHelper from '@/libraries/browserHelper'
import stringHelper from '@/libraries/stringHelper'
import CompanyService from '@/services/CompanyService'
import { mapGetters, mapMutations, mapState, mapActions } from 'vuex'

export default {
    components: {
        MaintenanceMode: () => import('@/components/ui/MaintenanceMode'),
        PmtHeader: () => import('@/components/header/Header.vue'),
        PmtSnackbar: () => import('@/components/Snackbar.vue'),
        AppMessages: () => import('@/components/AppMessages.vue'),
        WhatsNew: () => import('@/components/modals/WhatsNew.vue'),
        EndOfSupportMessage: () => import('@/components/EndOfSupportMessage'),
    },

    data: () => ({
        unsupported: false,
        switchingStore: false,
        timer: undefined,
    }),

    computed: {
        ...mapGetters('auth', [
            'isAuthenticated',
            'userToken',
            'canYou',
            'user',
        ]),
        ...mapState(['online', 'pageFilters', 'enabledFilters', 'zendeskLabel']),
        ...mapState('account', {
            messages: 'pmt_messages',
        }),
        ...mapState('menu', ['sitemapFetched']),
        ...mapGetters(['IS_MOBILE', 'isMaintenanceMode']),
        ...mapGetters('stores', {
            currentStore: 'currentStore',
        }),
        ...mapState('scheduling', {
            resourceColumns: 'resourceColumns',
            schedulingSettings: 'settings',
        }),
        hideHeader () {
            return (this.IS_MOBILE && this.$cfg.specialAvailabilityRoutes.includes(this.$route.name)) || this.$cfg.hiddenMenuRoutes.includes(this.$route.name) || this.$route.params.activation
        },
        isInternetExplorer () {
            return browserHelper.isInternetExplorer()
        },
        isIE9OrLower () {
            return browserHelper.isIE9OrLower()
        },
        iOS9OrLower () {
            return browserHelper.iOS9OrLower()
        },
        /**
         * Returns true if the body must be displayed: when sitemap is fetched or when current page is the select store page
         * @returns {string|boolean}
         */
        showContent () {
            return this.sitemapFetched || (!this.sitemapFetched && (this.$route.name === 'select-store' || this.$route.name === 'logout')) || this.$route.name === 'info-page'
        },
    },

    watch: {
        pageFilters: {
            handler () {
                if (Object.keys(this.enabledFilters).length) {
                    this.UPDATE_USER_SETTINGS(this.$route.meta.settingsRoute)
                    this.filtersCounter()
                }
            },
            deep: true,
            immediate: false,
        },
        resourceColumns: {
            handler () {
                if (Object.keys(this.enabledFilters).length) {
                    this.UPDATE_USER_SETTINGS(this.$route.meta.settingsRoute)
                    this.filtersCounter()
                }
            },
            deep: true,
            immediate: false,
        },
        schedulingSettings: {
            handler () {
                if (Object.keys(this.enabledFilters).length) {
                    this.UPDATE_USER_SETTINGS(this.$route.meta.settingsRoute)
                    this.filtersCounter()
                }
            },
            deep: true,
            immediate: false,
        },
        user (newValue) {
            if (this.$hj && window.location.hostname !== 'localhost' && newValue.accountId) {
                this.setHotjar(newValue.accountId)
            }
        },
    },

    created () {
        this.setProfileClass()
        /**
         * Check if the current browser is <= IE9 and show the unsupported componets
         * TODO: use window.location.replace to redirect to custom route on server (ex: /unsupported.html ot php).
         */
        // if (this.isIE9OrLower || this.iOS9OrLower) {
        //     this.unsupported = true
        // }
        window.addEventListener('resize', this.UPDATE_PAGE_WIDTH)
        window.addEventListener('beforeprint', this.beforePrint)
        window.addEventListener('afterprint', this.afterPrint)
    },

    mounted () {
        const self = this
        /**
         * Check if the current user's token is still intact. If not, then the
         * user is logged out or logged in as another user. Page refresh will load
         * the correct user data from local storage.
         */
        window.onfocus = () => {
            if (self.isAuthenticated && self.userToken !== localStorage.getItem('token') && this.$route.name !== 'select-store') {
                location.reload()
            }
        }
        // whenever the user loses the internet connection
        // we update the state online flag to false
        window.addEventListener('offline', () => {
            this.SET_APP_ONLINE(false)
        })
        // whenever the user internet connection comes back up
        // we reload the page to start over on login page,
        // else we set the online flag to true
        window.addEventListener('online', () => {
            this.SET_APP_ONLINE(true)
            if (this.$route.name === 'login') {
                window.location.reload()
            }
        })
    },
    destroyed () {
        window.removeEventListener('resize', this.UPDATE_PAGE_WIDTH)
        window.removeEventListener('beforeprint', this.beforePrint)
        window.removeEventListener('afterprint', this.afterPrint)
    },

    methods: {
        ...mapMutations(['SET_APP_ONLINE', 'UPDATE_PAGE_WIDTH', 'SET_APP_PRINTING']),
        ...mapActions('account', ['setUserSettings']),
        ...mapMutations('account', ['UPDATE_USER_SETTINGS']),

        setProfileClass () {
            document.querySelector('body').className += ` ${CompanyService.getCompanySlug()}`
        },
        isCypress () {
            return !!window.Cypress
        },
        filtersCounter () {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                this.setUserSettings()
            }, 1500)
        },
        setHotjar (accountId) {
            const parts = window.location.hostname.split('.')
            const subdomain = parts[0]
            const domain = parts[1]
            if (subdomain && domain) {
                const userId = stringHelper.stringToBase64(`${subdomain}.${domain}.${accountId}`)
                this.$hj('identify', userId, {})
            }
        },

        async beforePrint () {
            await this.SET_APP_PRINTING(true)
        },

        async afterPrint () {
            await this.SET_APP_PRINTING(false)
        },
    },
}
</script>

<style lang="scss">
@import './assets/scss/print.scss';
@import './assets/scss/main.scss';
@import './assets/scss/reset.scss';
@import './assets/scss/typography.scss';
@import './assets/scss/form.scss';
@import './assets/scss/table.scss';
@import './assets/scss/themes.scss';
html,
body {
    height: 100%;
    min-width: 360px;
}
</style>

<style lang="scss" scoped>
.page-enter {
    opacity: 0;
}
.page-enter-active {
    transition: opacity .1s;
    transition-timing-function: ease;
}
.page-leave-active {
    transition: opacity .1s;
    transition-timing-function: ease;
    opacity: 0;
}
</style>
