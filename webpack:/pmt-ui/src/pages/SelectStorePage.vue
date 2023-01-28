<template>
    <div class="select-store-page">
        <PmtContent narrow>
            <VCard
                :max-width="400"
                :style="{overflow: 'hidden', overflowWrap: 'break-word'}"
            >
                <VCardBody>
                    <form
                        class="login-form"
                        autocomplete="off"
                    >
                        <PmtError :show="error !== ''">
                            {{ error }}
                        </PmtError>
                        <div class="form-field">
                            <PSelect
                                v-if="storeList.length"
                                ref="storesDropdown"
                                v-model="selected"
                                cy_id="storesDropdown"
                                item-value="key"
                                :placeholder="$t( 'forms.selectStoreForm.selectStoreField.label' )"
                                :items="storeList"
                                searchable
                                @input="onStoreSelect"
                            />
                        </div>
                    </form>
                </VCardBody>
            </VCard>
            <PrivacyFooter />
        </PmtContent>
    </div>
</template>

<script>
import PrivacyFooter from '@/components/PrivacyFooter.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import storeService from '@/services/StoreService'
import urlHelper from '@/libraries/urlHelper'

export default {
    components: { PrivacyFooter },
    data () {
        return {
            storeList: [],
            selected: {},
        }
    },
    computed: {
        ...mapGetters('stores', {
            actualStore: 'currentStore',
            stores: 'getAllStores',
        }),
        ...mapGetters('auth', {
            userToken: 'userToken',
            currentUser: 'user',
        }),
        error () {
            const wrongStoreSlug = this.$route.params.wrong_slug
            if (wrongStoreSlug) {
                return this.$t('generalMessages.errors.invalidSubdomainOrganisational', [wrongStoreSlug])
            }

            return ''
        },
    },
    created () {
        if (!this.userToken) {
            this.$router.push({ name: 'login' })
        }

        if (this.stores.length === 0) {
            this.initStoreList().then((stores) => {
                this.fillStoresDropdown(stores)
            })
        } else {
            this.fillStoresDropdown(this.stores)
        }
    },
    methods: {
        ...mapMutations('stores', {
            setActiveStore: 'setActiveStore',
        }),
        ...mapActions('auth', {
            internalRedirect: 'internalRedirect',
        }),
        ...mapActions('stores', { redirectToOrgUserStore: 'redirectToOrgUserStore' }),
        ...mapActions(['SET_COOKIE']),
        initStoreList () {
            return storeService.getActiveStores()
                .then(stores => {
                    return stores
                })
        },

        /**
         * Set the user token as domain cookie and redirect to new store subdomain, where the user will be logged in
         * based on the cookie.
         */
        onStoreSelect (option) {
            const redirectTo = urlHelper.getCurrentStoreUrl(option.value.slug)
            this.SET_COOKIE({ name: 'internal-pmt-redirect', value: true })
            this.SET_COOKIE({ name: 'token', value: this.userToken, expiration: 120, path: '/', domain: urlHelper.getDomainName() })
            this.internalRedirect({ url: redirectTo })
        },
        fillStoresDropdown (stores) {
            this.storeList = stores.map(item => {
                return {
                    label: item.orgName,
                    value: item,
                    key: item.id,
                }
            })
        },
    },
}
</script>

<style lang="scss">
    @import '@/assets/scss/shaddows.scss';

    .select-store-page {
        .front {
            height: 200px;
        }

        .dropdown {
            cursor: pointer;
        }
    }

</style>
