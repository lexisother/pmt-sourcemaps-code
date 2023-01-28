<template>
    <div
        v-if="currentStore && checkLoginPageMobile"
        class="brand"
        :style="getBrandStyle()"
    >
        <div
            class="logo"
            :style="getLogoStyle()"
        />
        <div class="store-info">
            <div class="name">
                {{ currentStore.banner_heading1 || currentStore.name }}
            </div>
            <div class="meta">
                <VMenu
                    v-if="storeList.length > 0"
                    :key="storeList.length"
                    offset-y
                    nudge-bottom="10"
                    :value="showDropDown"
                    max-height="300"
                    :close-on-content-click="false"
                    close-on-click
                    @click="showDropDown = !showDropDown"
                >
                    <template #activator="{ on, value }">
                        <span
                            class="secondary-name"
                            v-on="on"
                        >
                            <component
                                :is="value ? 'chevron-up' : 'chevron-down'"
                                :size="18"
                                :title="$t('forms.selectStoreForm.selectStoreField.label')"
                                v-on="on"
                            />
                            {{ currentStore.banner_heading2 || `${currentStore.city} | ${currentStore.storeNumber}` }}
                        </span>
                    </template>
                    <ContextMenu
                        ref="contextMenu"
                        :items="storeList"
                        searchable
                        :search-icon="'domain'"
                        :filter-by="['name', 'orgName']"
                        max-height="300"
                        :search-placeholder="$t('forms.selectStoreForm.selectStoreField.placeholder')"
                        @on-hide="show = false"
                        @item-clicked="onStoreSelect"
                    />
                </VMenu>
                <span
                    v-else
                    class="secondary-name"
                >
                    {{ currentStore.banner_heading2 || `${currentStore.city} | ${currentStore.storeNumber}` }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import urlHelper from '@/libraries/urlHelper'
import { mapGetters, mapActions } from 'vuex'

export default {
    name: 'Brand',
    components: {
        ContextMenu: () => import('@/components/ui/pickers/ContextMenu'),
    },
    props: {
        isMobile: Boolean,
    },
    data () {
        return {
            showDropDown: false,
        }
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('stores', {
            actualStore: 'currentStore',
            defaultTheme: 'getDefaultTheme',
        }),
        ...mapGetters('menu', {
            storeList: 'getStoreSwitchMenu',
        }),
        ...mapGetters('auth', {
            userToken: 'userToken',
        }),
        checkLoginPageMobile () {
            if (!this.IS_MOBILE) {
                return this.$route.name !== 'login'
            } else {
                return true
            }
        },
        defaultStore () {
            return {
                name: 'Retail Solutions',
                city: 'Leusden',
                storeNumber: '3831',
                theme: this.defaultTheme,
            }
        },
        currentStore () {
            if (!this.actualStore) {
                return this.defaultStore
            }
            return this.actualStore
        },
        theme () {
            if (this.actualStore) {
                return this.actualStore.theme.primaryBackgroundColor ? this.actualStore.theme : this.defaultStore.theme
            }
            return this.defaultStore.theme
        },
        logo () {
            return urlHelper.getHost() + this.currentStore.theme.logo
        },
    },
    methods: {
        ...mapActions('auth', {
            internalRedirect: 'internalRedirect',
        }),
        ...mapActions(['SET_COOKIE']),
        getBrandStyle () {
            return {
                backgroundColor: this.theme.primaryBackgroundColor,
                color: this.theme.primaryColor,
                width: this.isMobile ? '' : '235px',
            }
        },
        getLogoStyle () {
            if (!this.currentStore.theme.logo) {
                return
            }

            return {
                backgroundImage: 'url(' + this.logo + ')',
            }
        },

        /**
         * Set the user token as domain cookie and redirect to new store subdomain, where the user will be logged in
         * based on the cookie.
         */
        onStoreSelect (option) {
            this.$emit('switch-store')
            this.SET_COOKIE({ name: 'internal-pmt-redirect', value: true })
            this.SET_COOKIE({ name: 'token', value: this.userToken, expiration: 120, path: '/', domain: urlHelper.getDomainName() })
            this.internalRedirect({ url: option.value.url + this.$route.path })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: 10px;
        height: 40px;
        background-color: $primary-color;
        color: #FFF;

        @include bp-sm {
            height: 48px;
        }

        .name {
            margin-bottom: 5px;
            font-size: 12px;
            line-height: 1.2em;
            font-weight: 600;
        }

        .name, .meta {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .meta {
            font-size: 10px;
            line-height: 10px;
            cursor: pointer;
        }

        .logo {
            margin-right: 15px;
            width: 73px;
            height: 40px;
            cursor: pointer;

            background-position: center center;
            background-size: contain;
            background-repeat: no-repeat;
            background-image: url('../../assets/images/rs-logo.png');
        }
    }

    #context-menu {
        left: 1730px;
        top: 94px;
        width: 185px;
    }
</style>

<style lang="scss">
    @import '@/assets/scss/shaddows.scss';

    .store-select-dropdown {
        right: 10px;
    }

    .store-select-dropdown .text-input input[name="dropdown-search"] {
        position: absolute;
        top: 48px;
        z-index: 8;
        width: 181px;
        padding: 5px;
        background-color: white;
        box-shadow: $shaddow-2p;
        transition: all .2s ease-in-out;
        transition-delay: 0.1s;
        height: 42px;
        font-size: 14px;
    }

    .store-select-dropdown .text-input .fa-chevron-down {
        position: absolute;
        top: 61px;
        z-index: 5;
        left: 166px;
    }

    .toggle-store-menu {
        cursor: pointer;
        font-size: 14px;
        margin-right: 5px;
        vertical-align: -4px;
    }
</style>
