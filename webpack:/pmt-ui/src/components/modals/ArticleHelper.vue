<template>
    <div>
        <VDialog
            v-model="dialog"
            persistent
            max-width="1200"
            @change="$emit('change', $event)"
        >
            <VCard ref="articleCard">
                <VCardTitle>
                    <h4>
                        {{ $t(`pages.${page}.articleHelperTitle`) }}
                    </h4>
                </VCardTitle>
                <VCardText>
                    <RoundSpinner
                        v-if="loading"
                        :block="true"
                        :loading="true"
                        default-loading-text
                    />
                    <VStepper
                        v-else
                        v-model="stepper"
                    >
                        <VStepperItems>
                            <VStepperContent
                                v-for="(article, index) in articles"
                                :key="`${index}_content`"
                                :complete="stepper > (index + 1)"
                                :step="(index + 1)"
                            >
                                <h3>{{ article.title }}</h3>
                                <div
                                    class="article"
                                    v-html="article.body"
                                />
                                <div class="actions">
                                    <div class="left">
                                        <PmtButton
                                            primary
                                            inverted
                                            :class="'close-btn'"
                                            @click="finish()"
                                        >
                                            {{ $t('ui.singles.skip') }}
                                        </PmtButton>
                                    </div>
                                    <div class="right">
                                        <PmtButton
                                            primary
                                            :class="'close-btn'"
                                            @click="next((index + 1))"
                                        >
                                            {{ nextStepText }}
                                        </PmtButton>

                                        <PmtButton
                                            primary
                                            inverted
                                            :class="'close-btn'"
                                            @click="previous((index))"
                                        >
                                            {{ $t('ui.singles.previous') }}
                                        </PmtButton>
                                    </div>
                                </div>
                            </VStepperContent>
                        </VStepperItems>
                    </VStepper>
                </VCardText>
            </VCard>
        </VDialog>
    </div>
</template>

<script>
import newsService from '@/services/NewsService'
import { mapActions, mapMutations, mapState } from 'vuex'
export default {

    props: {
        label: {
            type: String,
            default: '',
        },
        route: {
            type: String,
            default: '',
        },
        page: {
            type: String,
            default: '',
        },
    },

    data () {
        return {
            dialog: false,
            loading: false,
            articles: [],
            stepper: 1,
        }
    },

    computed: {
        ...mapState('account', ['userSettings']),
        nextStepText () {
            return `${this.stepper !== this.articles.length ? this.$t('ui.singles.next') : this.$t('ui.singles.complete')} (${this.stepper}/${this.articles.length})`
        },
    },

    async created () {
        await this.UPDATE_USER_SETTINGS(this.route)
        if (this.userSettings.find(s => s.screen === this.route) && !this.userSettings.find(s => s.screen === this.route).settings.introCheck) {
            this.dialog = true
            this.loading = true
            newsService.getHelperArticles(this.label)
                .then((response) => {
                    if (response.length > 0) {
                        this.articles = response
                    } else {
                        this.dialog = false
                    }
                })
                .finally(() => { this.loading = false })
        }
    },

    methods: {
        ...mapActions('account', ['setUserSettings']),
        ...mapMutations('account', ['SET_USER_SETTINGS_PAGE_INTRO_CHECK', 'UPDATE_USER_SETTINGS']),
        next (n) {
            if (n === this.articles.length) {
                this.finish()
                return
            }
            this.stepper = n + 1
            this.scrollToTop()
        },
        previous (n) {
            if (this.stepper > 1) {
                this.stepper = n
            }
            this.scrollToTop()
        },
        finish () {
            this.dialog = false
            this.SET_USER_SETTINGS_PAGE_INTRO_CHECK(this.route)
            this.setUserSettings()
        },
        scrollToTop () {
            this.$refs.articleCard.$el.scrollIntoView({ behavior: 'smooth' })
        },
    },
}

</script>

<style lang="scss" scoped>
    :deep() {
        .v-stepper__content {
            padding: 0;
        }
        .article {
            p {
                font-size: 14px;
            }
        }
    }

    .v-card__title {
        margin-bottom: 8px;
    }

    .actions {
        display: flex;
        justify-content: space-between;
        .right {
            float: right;
        }
    }
</style>
