<template>
    <div ref="newsTrack" class="page">
        <TopBar ref="topbar" :right-style="'margin-top: 0px!important'" show-search :search="search"
            show-fly-out-filters @search="search = $event">
            <div class="bar-item">
                <DatePicker :options="datepickerOptions" cy_id="filterByDate" class="news-track-date-picker"
                    @on-select="updateCreateDateFilter($event, true)"
                    @deselect-date="updateCreateDateFilter(null, false)">
                    <template #selected-date-text="{ date }">
                        {{
                            createDateFilterSet? date.shortDayFormat() :
                            $t('pages.newsTrack.actions.filterByDatePosted.label')
                        }}
                    </template>
                </DatePicker>
            </div>
        </TopBar>

        <PmtLayout fixed-height>
            <PmtContent v-if="news.length || !isLoading" id="news-log-page" class="elevation-2">
                <VDataTable :headers="headers" :items="rows" :items-per-page="10" :sort-by="['date']"
                    :sort-desc="[false]" mobile-breakpoint="700" calculate-widths :dense="false" :fixed-header="true"
                    :search="search" class="news-track-table">
                    <template #[`item.title`]="{ item }">
                        <router-link :key="item.id" v-tooltip="item.title" tag="span"
                            :to="{ name: 'news-item-view', params: { id: item.id } }" :text="item.title"
                            class="news-item-title" :cy_id="'title_' + item.id">
                            {{
                                IS_MOBILE? stringHelper.textToElipsis(item.title, 25) :
                                stringHelper.textToElipsis(item.title, 30)
                            }}
                        </router-link>
                        <span v-if="item.edited" class="edited-item"> {{ $t('pages.newsTrack.headers.edited') }}</span>
                    </template>
                    <template #[`item.create_date_for_compare`]="{ item }">
                        <span> {{ item.create_date }} </span>
                    </template>
                    <template #[`item.last_edited_for_compare`]="{ item }">
                        <span> {{ item.last_edited }} </span>
                    </template>
                    <template #[`item.appear_date_for_compare`]="{ item }">
                        <span> {{ item.appear_date }} </span>
                    </template>
                    <template #[`item.available_until_for_compare`]="{ item }">
                        <span> {{ item.available_until }} </span>
                    </template>
                    <template #[`item.newsletter_sent`]="{ item }">
                        <span v-if="item.newsletter_sent" class="newsletter-icon">
                            <component :is="'check-circle-outline'" :size="18" class="sticky-icon" />
                        </span>
                    </template>
                    <template #[`item.department_ids`]="{ item }">
                        <NewsDepartments :news-item="item" />
                    </template>
                    <template #[`item.sticky`]="{ item }">
                        <span v-if="item.sticky" class="text-center text-normal">
                            <component :is="'check-circle-outline'" :size="18" class="sticky-icon" />
                        </span>
                    </template>
                    <template #[`item.action`]="{ item }">
                        <PmtButton v-if="item.show_details_button" outline primary :icon="'eye-outline'"
                            :cy_id="'detailsBtn_' + item.id" @click="openNewsTrack(item.id)">
                            {{ $t('pages.newsTrack.actions.details.label') }}
                        </PmtButton>
                    </template>
                </VDataTable>
            </PmtContent>
            <RoundSpinner v-if="isLoading" loading block default-loading-text />
        </PmtLayout>
        <NewsTrackModal ref="newsTrackModal" />
    </div>
</template>

<script>

import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import stringHelper from '../../libraries/stringHelper.js'
import departmentHelper from '../../libraries/departmentHelper.js'
import Mixins from '../../pages/communication/mixins'

export default {
    name: 'NewsTrack',
    components: {
        TopBar: () => import('../../components/ui/top-bar/TopBar.vue'),
        NewsTrackModal: () => import('../../components/modals/NewsTrackModal.vue'),
        DatePicker: () => import('../../components/ui/pickers/DatePicker.vue'),
        NewsDepartments: () => import('../../pages/communication/NewsDepartments.vue'),
    },

    mixins: [Mixins],

    data() {
        return {
            search: '',
            createDateFilterSet: false,
            createDateFilter: this.$moment(),
            datepickerId: 'news-track-datepicker',
        }
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapState('news', {
            fullNews: 'news',
            isLoading: 'isLoading',
            departments: 'departments',
        }),
        ...mapGetters('auth', {
            canYou: 'canYou',
            isAuthenticated: 'isAuthenticated',
            hasNewsLetterAccess: 'hasNewsLetterAccess',
            hasNewsModule: 'hasNewsModule',
        }),

        datepickerOptions() {
            return {
                id: this.datepickerId,
                selectedDate: this.createDateFilter,
                emitSelectOnMounted: false,
                showResetFilter: true,
                overrideReset: true,
                mode: 'day',
                isSelected: false,
            }
        },

        /**
         * Headers for the news track table
         */
        headers() {
            return [
                { text: this.$t('pages.newsTrack.headers.newsTitle'), value: 'title', class: 'title-column' },
                { text: this.$t('pages.newsTrack.headers.postedDate'), value: 'create_date_for_compare', class: 'date-column' },
                { text: this.$t('pages.newsTrack.headers.availableFrom'), value: 'appear_date_for_compare', class: 'date-column' },
                { text: this.$t('pages.newsTrack.headers.availableUntil'), value: 'available_until_for_compare', class: 'date-column' },
                { text: this.$t('pages.newsTrack.headers.lastEditedDate'), value: 'last_edited_for_compare', class: 'date-column' },
                { text: this.$t('pages.newsTrack.headers.lastEditedBy'), value: 'last_edited_by' },
                { text: this.$t('pages.newsTrack.headers.sentAsNewsletter'), value: 'newsletter_sent' },
                { text: this.$t('pages.newsTrack.headers.departments'), value: 'department_ids', class: 'departments-column' },
                { text: this.$t('pages.newsTrack.headers.lastSeenBy'), value: 'last_seen_by' },
                { text: this.$t('pages.newsTrack.headers.totalSeenBy'), value: 'total_seen_by' },
                { text: this.$t('pages.newsTrack.headers.sticky'), value: 'sticky' },
                { text: '', value: 'action', sortable: false, class: 'details-column' },
            ]
        },

        news() {
            return this.filterNews(this.fullNews)
        },

        /**
         * Create rows for news track table
         */
        rows() {
            let filteredRows = this.news
            // Filter by create date if date is selected.
            if (this.createDateFilterSet && this.createDateFilter) {
                filteredRows = this.news.filter(item => {
                    return this.createDateFilter.format('DD-MM-YYYY') === this.$moment(item.create_date).format('DD-MM-YYYY')
                })
            }

            const departmentIds = this.departments ? this.departments.map(item => { return item.department_id }) : []

            return filteredRows.map(item => {
                return {
                    title: item.news_title,
                    id: item.news_id,
                    edited: !!item.last_modified,
                    last_edited_by: item.last_modified ? item.last_modified.full_name : '-',
                    newsletter_sent: item.news_track && item.news_track.total_sent_to,
                    last_seen_by: this.getSeenByCounter(item, 'last_change'),
                    total_seen_by: this.getSeenByCounter(item, 'total'),
                    sticky: item.sticky,
                    department_ids: item.department_ids ? item.department_ids : departmentIds,
                    show_details_button: item.news_track && (item.news_track.total_seen_by || item.news_track.total_read_by),

                    // Properties used for display.
                    create_date: this.$moment(item.create_date).format('DD-MM-YYYY'),
                    last_edited: item.last_modified ? this.$moment(item.last_modified.datetime).format('DD-MM-YYYY') : '-',
                    appear_date: item.appear_date ? this.$moment(item.appear_date).format('DD-MM-YYYY') : '-',
                    available_until: item.available_until ? this.$moment(item.available_until).format('DD-MM-YYYY') : '-',

                    // Properties added for sorting columns properly.
                    last_edited_for_compare: item.last_modified ? this.$moment(item.last_modified.datetime).apiFormat() : '',
                    create_date_for_compare: this.$moment(item.create_date).apiFormat(),
                    appear_date_for_compare: item.appear_date ? this.$moment(item.appear_date).apiFormat() : '',
                    available_until_for_compare: item.available_until ? this.$moment(item.available_until).apiFormat() : '',
                }
            })
        },
    },

    async created() {
        this.departmentHelper = departmentHelper
        this.stringHelper = stringHelper

        if (this.isAuthenticated) {
            await this.getDepartments({ date: this.$moment(), allDepartments: true })
        }

        await this.getNewsData()
    },

    async mounted() {
        if (this.isAuthenticated && ((!this.hasNewsModule || !(this.canYou('communication', 'news_read'))) && this.hasNewsLetterAccess)) {
            this.SET_SNACKBAR({ message: this.$t('generalMessages.errors.pageNotFound'), error: true })
            return this.$router.push({ name: 'my-schedule-init' })
        }
        this.getNews()
    },

    methods: {
        ...mapActions('news', {
            getNewsAction: 'getNewsAction',
        }),
        ...mapMutations('news', {
            resetNews: 'reset',
        }),
        ...mapMutations(['SET_SNACKBAR']),
        ...mapMutations('datepicker', ['UPDATE_DATEPICKER']),
        ...mapActions('departments', {
            getDepartments: 'get',
        }),

        /**
         * Gets news items based on on selected filters
         */
        getNews() {
            this.getNewsAction({ limit: 500 })
                .catch((error) => {
                    throw error
                })
        },

        /**
         * Returns the string as "read/sent" to be displayed for the last edited/total counters.
         * If the newsletter was not sent, it only shows the "read" counter.
         */
        getSeenByCounter(item, counterType) {
            if (!item.news_track || (item.news_track && !item.news_track[counterType + '_read_by'] && !item.news_track[counterType + '_sent_by'])) {
                return '-'
            }

            if (!item.news_track[counterType + '_sent_to'] && item.news_track[counterType + '_read_by']) {
                return item.news_track[counterType + '_read_by']
            }

            return `${item.news_track[counterType + '_read_by']}/${item.news_track[counterType + '_sent_to']}`
        },

        /**
         * Opens the news track modal for a new item.
         *
         * @param id
         */
        openNewsTrack(id) {
            this.$refs.newsTrackModal.open(id)
        },

        /**
         * Sets the create date filter.
         *
         * @param event
         * @param filterEnabled
         */
        updateCreateDateFilter(event, filterEnabled) {
            this.createDateFilter = event
            this.createDateFilterSet = filterEnabled
            this.UPDATE_DATEPICKER({
                id: this.datepickerId,
                isSelected: filterEnabled,
            })
        },
    },
}
</script>

<style lang="scss" scoped>
// @import '@/assets/scss/_colors.scss';
// @import './resources/news.scss';

@media screen and (max-width: 768px) {
    .news-topbar-right {
        margin-top: 5px;
    }
}

.no-result {
    text-align: center;
}

#news-log-page.content {
    width: auto;
    margin: 15px !important;

    .news-item-title {
        cursor: pointer;
    }

    .edited-item {
        font-style: italic;
        color: $secondary-color;
        font-size: 11px;
        float: right;
    }

    .single-department>span {
        margin-bottom: 2px;
    }

    .departments-column {
        max-width: 350px;
    }

    .title-column {
        width: 310px;
    }

    .date-column {
        width: 100px;
    }

    .details-column {
        width: 120px;
    }

    .v-data-table__mobile-row__cell .news-item-title {
        margin-right: 5px;
    }

    .v-data-table__mobile-row:last-of-type div.v-data-table__mobile-row__cell {
        width: 100%;
        text-align: center;
    }

    .all-departments-label {
        margin-left: 0;
    }

    .department-tags {
        padding: 7px 0;
    }
}
</style>
