<template>
    <div :key="$route.params.id" class="page">
        <PmtTopBar v-if="!homePage" ref="topbar" :loading="isLoading" :right-style="'margin-top: 0px!important'"
            show-fly-out-filters>
            <template #right>
                <BarButton v-if="canYou('communication', 'news_write')" ref="createNews"
                    v-tooltip="{ content: $t('pages.newsOverview.general.create'), hideOnTargetClick: true, placement: 'bottom', trigger: 'focus hover click' }"
                    :text="$t('pages.newsOverview.general.create')" :disabled="showCreateNews || editingNewsItem"
                    icon="plus" icon-size="20" @show-create-news-section="showCreateNews = true"
                    @click="showCreateNews = true" />
            </template>
        </PmtTopBar>

        <PmtLayout fixed-height>
            <transition name="slide-fade">
                <CreateEditNews v-if="showCreateNews" :key="showCreateNews"
                    @show-news-form="showCreateNewsBlock($event)" />
            </transition>
            <PmtContent v-if="!newsListEmpty && !showCreateNews" class="container news-overview">
                <PmtButton v-if="newsItemId && hasNewsLetterAccess" primary style="margin-bottom: 25px"
                    icon="arrow-left" @click="$router.push({ name: 'news-track' })">
                    {{ $t('pages.newsOverview.newsTrack.info') }}
                </PmtButton>
                <PmtButton v-if="newsItemId && hasNewsLetterAccess" primary style="margin-bottom: 25px"
                    @click="$router.push({ name: 'news-letter-send' })">
                    {{ $t('pages.newsOverview.newsTrack.toNewsletter') }}
                </PmtButton>

                <VBadge v-if="!homePage && !showCreateNews && !newsItemId" color="warning" overlap
                    :value="unreadNewsCounter > 0"
                    :content="$t('pages.newsOverview.general.unreadMessages', [unreadNewsCounter])">
                    <h1 class="page-title">
                        {{ $t('pages.newsOverview.general.title') }}
                    </h1>
                </VBadge>

                <transition name="slide-fade">
                    <PmtNewsCards v-if="news.length" :home-page="homePage" :news="groupedNews"
                        :create-active="!showCreateNews" />
                    <NewsCard v-else-if="newsItemId" :news-item="newsItem" :home-page="false" :single-item="true" />
                </transition>
            </PmtContent>
            <p v-if="!newsListEmpty && noMoreResults && !isLoading && !showCreateNews" class="no-result">
                {{ $t( 'pages.newsOverview.noNews.afterScroll') }}
            </p>
            <div v-if="isLoading && !showCreateNews" class="no-result">
                <RoundSpinner block :loading="true" :loading-text="$t('pages.newsOverview.newsBody.isLoading')" />
            </div>
            <EmptyState :title="$t('pages.newsOverview.noNews.title')" :sub-title="emptyStateSubTitle"
                component="no-news" :show="!isLoading && newsListEmpty && !showCreateNews" :size="IS_MOBILE ? 250 : 400"
                no-padding />
        </PmtLayout>
    </div>
</template>

<script>
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import newsHelper from '../../libraries/newsHelper'
import Mixins from '../../pages/communication/mixins'

export default {
    name: 'NewsOverview',
    components: {
        PmtNewsCards: () => import('../../pages/communication/NewsOverviewCards.vue'),
        NewsCard: () => import('../../pages/communication/NewsOverviewCard.vue'),
        PmtTopBar: () => import('../../components/ui/top-bar/TopBar.vue'),
        BarButton: () => import('../../components/ui/top-bar/BarButton.vue'),
        CreateEditNews: () => import('../../pages/communication/CreateEditNews.vue'),
    },
    mixins: [Mixins],
    props: {
        homePage: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            startRender: false,
            fetchingNews: false,
            noMoreResults: false,
            showCreateNews: false,
            newsItemId: null,
            newsItem: null,
        }
    },
    computed: {
        ...mapGetters('auth', {
            canYou: 'canYou',
            isAuthenticated: 'isAuthenticated',
            hasNewsLetterAccess: 'hasNewsLetterAccess',
            hasNewsModule: 'hasNewsModule',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapState('news', {
            fullNews: 'news',
            categories: 'categories',
            departments: 'departments',
            isLoading: 'isLoading',
            editingNewsItem: 'editingNewsItem',
            unreadNewsCounter: 'unreadNewsCounter',
            PAGE_NUMBER: 'PAGE_NUMBER',
        }),

        news() {
            return this.fullNews?.length ? this.filterNews(this.fullNews) : []
        },

        groupedNews() {
            return this.news?.length ? newsHelper.groupNews(this.news) : []
        },

        /**
         * Returns true if there are no news to show.
         */
        newsListEmpty() {
            return !(this.news?.length || this.newsItem)
        },
        /**
         * No news items are displayed because of filters being set
         */
        newsListLimitedByFilters() {
            return this.newsListEmpty && Boolean(this.fullNews?.length)
        },

        emptyStateSubTitle() {
            const subTitleProp = this.newsListLimitedByFilters ? 'textFilters' : 'text'
            return this.$t(`pages.newsOverview.noNews.${subTitleProp}`)
        },
    },

    watch: {
        fullNews(newValue) {
            if (newValue.length && !this.noMoreResults && !this.newsItemId && !this.showCreateNews) {
                this.fetchingNews = true
                this.incrementPage()
                this.getNews({ page: this.PAGE_NUMBER })
            }
        },
    },

    async created() {
        // Display confirmation message if any action was performed for a news item in pmt1.
        const newsAction = this.$route.query.action
        const translationKey = 'pages.newsOverview.actions.' + newsAction
        if (newsAction) {
            if (translationKey !== this.$t(translationKey)) {
                this.SET_SNACKBAR({ message: this.$t(translationKey) })
            }
            this.$router.replace(this.$route.path)
        }

        this.newsItemId = this.$route.params.id || null
        await this.getNewsData().catch(err => {
            this.SET_SNACKBAR({ message: err.message, error: true })
        })
    },

    async mounted() {
        if (this.isAuthenticated && (!this.hasNewsModule || !this.canYou('communication', 'news_read'))) {
            this.SET_SNACKBAR({ message: this.$t('generalMessages.errors.pageNotFound'), error: true })
            return this.$router.push({ name: 'my-schedule-init' })
        }

        this.renderNews()
        if (this.isAuthenticated) {
            await this.GET_STORE_ROLES()
            this.getDepartments({ date: this.$moment(), allDepartments: true })
        }
    },

    methods: {
        ...mapActions('news', {
            getNewsAction: 'getNewsAction',
            getNewsItem: 'getNewsItem',
        }),
        ...mapActions('stores', {
            GET_STORE_ROLES: 'GET_STORE_ROLES',
        }),
        ...mapMutations('news', {
            resetNews: 'reset',
            incrementPage: 'incrementPage',
        }),
        ...mapActions('departments', {
            getDepartments: 'get',
        }),
        ...mapMutations(['SET_SNACKBAR']),

        /**
         * Renders the news item(s) on overview page
         */
        renderNews($event) {
            if ($event) {
                this.noMoreResults = false
            }
            this.resetNews()
            if (!this.newsItemId) {
                // 'news-overview' route which shows all news.
                this.getNews()
            } else {
                // 'news-item-view' route which shows only a news item
                this.getNewsItem(this.newsItemId).then(newsItem => {
                    this.newsItem = newsItem
                }).catch(() => {
                    this.newsItem = null
                })
            }
        },

        /**
         * Gets news items based on on selected filters
         */
        getNews(payload) {
            this.getNewsAction(payload).then((newsData) => {
                if (this.homePage && !this.isAuthenticated && newsData.length === 0 && this.news.length === 0) {
                    this.$router.push({ name: 'login' })
                }
                this.fetchingNews = false
                if (!newsData.length) {
                    this.noMoreResults = true
                } else {
                    this.startRender = true
                    this.noMoreResults = false
                }
            }).catch(err => {
                this.SET_SNACKBAR({ message: err.message, error: true })
            })
        },

        showCreateNewsBlock(value) {
            this.showCreateNews = value
            this.noMoreResults = false
        },
    },
}
</script>

<style lang="scss" scoped>
// @import '../../pages/communication/resources/newsoverview.scss';
</style>
