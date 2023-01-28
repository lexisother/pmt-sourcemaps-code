<template>
    <div>
        <pmt-modal
            ref="whatsNewStepper"
            :title="$t( 'modals.whatsNew.title' )"
            no-padding
            :hide-on-overlay-click="false"
            @manual-close="readWhatsNew()"
        >
            <v-stepper
                v-if="articles.length"
                v-model="e1"
                class="article"
            >
                <v-stepper-header>
                    <v-stepper-step
                        v-for="n in articles.length"
                        :key="n"
                        :step="n"
                        :complete="n <= completedStep"
                    />
                </v-stepper-header>

                <v-stepper-items>
                    <v-stepper-content
                        v-for="(article, contentIndex) in articles"
                        :key="contentIndex"
                        v-touch="{left: () => navigateLeft(contentIndex, article), right: () => navigateRight(contentIndex)}"
                        :step="contentIndex"
                        class="article-content"
                    >
                        <p class="article-title">
                            {{ article.title }}
                        </p>
                        <div
                            class="article-body"
                            v-html="article.body"
                        />

                        <div class="prevnext">
                            <!-- Displaying previous on every slide but the first -->
                            <pmt-button
                                v-if="contentIndex > 0"
                                id="prev"
                                class="prev"
                                @click="navigateRight(contentIndex)"
                            >
                                {{ $t( 'modals.whatsNew.prev' ) }}
                            </pmt-button>

                            <!-- Displaying next on every slide but the last, last slide has a button with 'I understand' to close the modal -->
                            <pmt-button
                                v-if="!article.lastItem"
                                id="next"
                                class="next"
                                primary
                                @click="navigateLeft(contentIndex, article)"
                            >
                                {{ $t( 'modals.whatsNew.next' ) }}
                            </pmt-button>
                            <pmt-button
                                v-if="article.lastItem"
                                id="finish"
                                class="finish"
                                primary
                                @click="$refs.whatsNewStepper.hide(), readWhatsNew()"
                            >
                                {{ $t( 'modals.whatsNew.finish' ) }}
                            </pmt-button>

                            <!-- Show skip only on first slide, if they click next they are obviously NOT interested in skipping -->
                            <pmt-button
                                v-if="contentIndex === 0"
                                id="skip"
                                class="skip"
                                small
                                @click="$refs.whatsNewStepper.hide(), readWhatsNew()"
                            >
                                {{ $t( 'modals.whatsNew.skip' ) }}
                            </pmt-button>
                            <pmt-button
                                v-if="contentIndex === 0"
                                id="read-later"
                                class="read-later"
                                small
                                @click="readLaterAction()"
                            >
                                {{ $t( 'modals.whatsNew.readLater' ) }}
                            </pmt-button>
                        </div>
                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper>
        </pmt-modal>
    </div>
</template>

<script>
import whatsNewService from '@/services/WhatsNewService'
import urlHelper from '@/libraries/urlHelper'
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
    data () {
        return {
            articles: [],
            e1: 0,
            cookieCheck: {
                closedManually: false,
                pmtVersion: null,
            },
            completedStep: 1,
        }
    },
    computed: {
        ...mapState('menu', {
            redirect: 'redirect',
        }),

        /**
             * Use a VueX check to see if the employee is a user or not, return suffix based on it
             * @returns {String}
             */
        checkUser () {
            return this.isUserEmployee ? '_EMPLOYEE' : '_MANAGER'
        },
    },
    mounted () {
        if (!whatsNewService.shouldOpenModal()) {
            return
        }

        if (this.$cookies.isKey('whatsNew') && this.$cookies.get('whatsNew').pmtVersion !== whatsNewService.version()) {
            this.cookieCheck.closedManually = false
        }

        this.cookieCheck.pmtVersion = whatsNewService.version()
        this.setWhatsNewCookie()
        this.getWhatsNew().then((response) => {
            if (response.length > 0) {
                this.articles = response
                this.articles[this.articles.length - 1].lastItem = true

                this.$refs.whatsNewStepper.show()
            } else {
                this.checkRedirectAfterDismissingModal()
            }
        }).catch((error) => {
            this.checkRedirectAfterDismissingModal()
            this.SET_SNACKBAR({ message: this.$t('modals.whatsNew.noArticles'), error: true })
            throw error
        })
    },
    methods: {
        ...mapActions('menu', {
            getWhatsNew: 'getWhatsNew',
        }),
        ...mapMutations('menu', {
            setRedirect: 'setRedirect',
        }),
        ...mapActions(['SET_COOKIE']),
        ...mapMutations(['SET_SNACKBAR']),
        /**
             * Checks if the user needs to be redirected after dismissing the modal.
             **/
        checkRedirectAfterDismissingModal () {
            const redirectTo = this.redirect
            if (redirectTo !== '') {
                this.setRedirect('')
                window.location = redirectTo
            }
        },

        /**
             * Actions performed on "read later" click.
             */
        readLaterAction () {
            whatsNewService.setDismissedForLater(true)
            this.$refs.whatsNewStepper.hide()
            this.checkRedirectAfterDismissingModal()
        },

        /**
             * Sets the closedManual status to true so the modal is not opened each time, then pushes a new cookie
             */
        readWhatsNew () {
            this.cookieCheck.closedManually = true
            this.setWhatsNewCookie()
            this.checkRedirectAfterDismissingModal()
            this.$router.push({ name: 'last-visited-page' }).catch(err => { console.warn(err) })
        },

        /**
             * Navigates slide to left
             *
             * @param {Number} index
             * @param {Object} article
             */
        navigateLeft (index, article) {
            if (!article.lastItem) {
                this.e1 = index + 1
            }
            this.completedStep += 1
        },

        /**
             * Navigates slide to right
             *
             * @param {Number} index
             */
        navigateRight (index) {
            if (index > 0) {
                this.e1 = index - 1
            }
            this.completedStep -= 1
        },
        setWhatsNewCookie () {
            this.SET_COOKIE({ name: 'whatsNew', value: this.cookieCheck, expiration: Infinity, path: '/', domain: urlHelper.getDomainName() })
        },
    },
}
</script>

<style lang="scss" scoped>
    .article{
        .article-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }
        .prevnext {
            margin-top: 15px;
            text-align: right;
        }
        .article-body {
            :deep() ul {
                list-style: disc;
                margin-left: 25px;
            }
            :deep() img {
                width: 50%;
                transition: width 0.2s;
            }
            :deep() img:hover {
                width: 100%;
            }
            :deep() p {
                margin-bottom: 0;
            }
        }
    }
</style>
