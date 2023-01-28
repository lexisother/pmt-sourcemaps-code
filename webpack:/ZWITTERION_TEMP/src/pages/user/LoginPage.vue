<template>
    <div class="login-page">
        <PmtContent narrow-side>
            <card
                :card-style="{maxWidth: !IS_MOBILE ? '800px' : '400px', margin: '10vh auto 2vh'}"
                :body-style="{padding: '0px !important'}"
            >
                <div
                    id="login-body"
                    slot="body"
                    class="login-card"
                >
                    <div
                        v-if="!IS_MOBILE"
                        id="login-left"
                        class="login-flex-item-left"
                        :style="leftStyle"
                    >
                        <object
                            v-if="!isTheJollySeason"
                            id="logo"
                            :data="logo"
                            style="max-width: 100%"
                            :style="getStyleIE"
                            type="image/png"
                        >
                            <!-- Fallback image in case the customer logo is not found or user does not have access to the internet -->
                            <img
                                id="logo"
                                :data="logo"
                                style="max-width: 100%"
                                :style="getStyleIE"
                                src="https://www.retailsolutions.nl/wp-content/uploads/2020/09/Retail-Solutions-logo-white.svg"
                                alt="Retail Solutions Logo"
                            >
                        </object>
                        <p v-if="!isTheJollySeason" />
                        <p
                            v-if="!isTheJollySeason && store.banner_heading1"
                            id="banner"
                            class="store-info"
                            :style="{color: theme.primaryColor}"
                        >
                            {{ store.banner_heading1 }} | {{ store.banner_heading2 }}
                        </p>
                        <img
                            v-if="isTheJollySeason"
                            class="christmas-greet"
                            width="100%"
                            height="100%"
                            :src="require('@/assets/images/christmas-greet.png')"
                        >
                    </div>
                    <div
                        id="login-right"
                        class="login-flex-item-right"
                        :style="{width: IS_MOBILE ? '100%' : '70%'}"
                    >
                        <h1>{{ $t('pages.login.login') }}</h1>
                        <h3 id="welcome-greet">
                            {{ welcomeGreet }}
                        </h3>
                        <PmtLoginForm
                            id="loginForm"
                            ref="loginForm"
                        />
                        <VMenu
                            v-model="openForgotPassword"
                            :min-width="300"
                            origin="top left"
                            transition="scale-transition"
                            :close-on-content-click="false"
                            :close-on-click="true"
                            offset-y
                            :nudge-bottom="5"
                        >
                            <template #activator="{ on, value }">
                                <PmtButton
                                    id="forgot-password"
                                    primary
                                    inverted
                                    :active="value"
                                    @v-on="on"
                                    @click="openForgotPassword = !openForgotPassword"
                                >
                                    {{ $t('pages.login.forgotPasswordLink') }}
                                </PmtButton>
                            </template>
                            <div
                                v-if="openForgotPassword"
                                class="pa-3"
                            >
                                <ForgotPasswordForm
                                    id="forgotPasswordForm"
                                    ref="forgotPasswordForm"
                                    @after-send="openForgotPassword = false"
                                />
                            </div>
                        </VMenu>
                        <VMenu
                            v-model="openForgotUsername"
                            :min-width="300"
                            origin="top left"
                            transition="scale-transition"
                            :close-on-content-click="false"
                            :close-on-click="true"
                            offset-y
                            :nudge-bottom="5"
                        >
                            <template #activator="{ on, value }">
                                <PmtButton
                                    id="forgot-username"
                                    primary
                                    inverted
                                    :active="value"
                                    @v-on="on"
                                    @click="openForgotUsername = !openForgotUsername"
                                >
                                    {{ $t('pages.login.forgotUsernameLink') }}
                                </PmtButton>
                            </template>
                            <div
                                v-if="openForgotUsername"
                                class="pa-3"
                            >
                                <ForgotUsernameForm
                                    id="forgotUsernameForm"
                                    ref="forgotUsernameForm"
                                    @after-send="openForgotUsername = false"
                                />
                            </div>
                        </VMenu>
                    </div>
                </div>
            </card>
            <PrivacyFooter id="privacyFooter" />
        </PmtContent>
    </div>
</template>

<script>
import browserHelper from '@/libraries/browserHelper'
import urlHelper from '@/libraries/urlHelper'
import PrivacyFooter from '@/components/PrivacyFooter.vue'
import PmtLoginForm from '@/components/forms/LoginForm.vue'
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm'
import ForgotUsernameForm from '@/components/forms/ForgotUsernameForm'
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
    components: { PmtLoginForm, PrivacyFooter, ForgotPasswordForm, ForgotUsernameForm },
    data () {
        return {
            openForgotPassword: false,
            openForgotUsername: false,
            currentYear: this.$moment().isoWeekYear(),
        }
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('stores', {
            currentStore: 'currentStore',
        }),
        ...mapState('stores', {
            defaultTheme: 'defaultTheme',
        }),
        logo () {
            return urlHelper.getHost() + this.theme.logo
        },
        theme () {
            return this.currentStore ? this.currentStore.theme : this.defaultTheme
        },
        store () {
            return this.currentStore || {}
        },
        welcomeGreet () {
            return this.$cookies.get('loginCookie') === null ? this.$t('pages.login.welcome') : this.$t('pages.login.welcomeBack')
        },
        getStyleIE () {
            if (browserHelper.isInternetExplorer()) {
                return {
                    maxHeight: '50%',
                }
            }
            return null
        },
        isTheJollySeason () {
            const christmas = this.$moment().isBetween(`${this.currentYear}-12-15`, `${this.currentYear}-12-26`)
            return christmas
        },
        leftStyle () {
            const style = {}

            style.backgroundColor = this.theme.primaryBackgroundColor

            if (this.isTheJollySeason) {
                style.padding = '0px'
                style.borderRight = '1px solid var(--grey-40)'
            }
            return style
        },
    },
    mounted () {
        this.changeFavicon(this.currentStore)
    },
    methods: {
        ...mapMutations('stores', {
            changeFavicon: 'changeFavicon',
        }),
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/shaddows.scss';
    .login-page {
        .login-box {
            &.panel {
                display: block;
                margin: 10vh auto;
                width: 100%;
                max-width: 400px;
                background-color: #fff;
                box-sizing: border-box;
                box-shadow: $shaddow-2p;
            }
            &.panel:not(:last-child) {
                margin-bottom: 1rem;
            }
            .link-list {
                margin-top: 15px;
            }
        }
        a.small {
            text-decoration: none;
        }
        .privacy-footer {
            margin: 0 auto;
            max-width: 400px;
            text-align: center;
        }
        .login-card {
            display: flex;
            align-items: stretch;
            justify-content: center;
        }
        .login-flex-item-left {
            width: 30%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .login-flex-item-left, .login-flex-item-right {
            padding: 30px;
        }
        .store-info {
            width: 100%;
            text-align: center;
        }
    }
</style>
