<template>
    <div v-if="cards.length" class="page">
        <PmtTopBar ref="topbar" :right-style="'margin-top: 0px!important'" :loading="loading" show-fly-out-filters
            show-print>
            <div class="bar-menu-button bar-item">
                <DatePicker ref="datePicker" :options="datepickerOptions" @on-select="dateChange($event)" />
            </div>
        </PmtTopBar>

        <PmtLayout :loading="loading || loadingDepartments.departments" hide-loading-content fixed-height>
            <PmtContent narrow-wide>
                <div :key="$route.params.month" :class="{
                    'birthday-page animated': true,
                    'slideInLeft': datepicker.direction === 'left',
                    'slideInRight': datepicker.direction === 'right'
                }" :style="{ margin: IS_MOBILE ? '20px' : '40px' }">
                    <BirthdayInfoCards v-if="filters.displayInfoCards" />

                    <h2 v-if="!filters.displayFullYear">
                        {{ $t('pages.birthdayPage.view.month') }}
                    </h2>
                    <VRow v-if="!filters.displayFullYear">
                        <VCol v-for="(card, index) in cards" :key="index" cols="12" lg="6" md="12">
                            <Card>
                                <template #header>
                                    <b>{{ card.header }}</b>
                                </template>
                                <template #body>
                                    <BirthdayCard :month="card.month" :year="card.year" :birthdays="card.birthdays" />
                                </template>
                            </Card>
                        </VCol>
                    </VRow>
                    <BirthdayYearView v-if="filters.displayFullYear" :key="reloadKey" :birthdays="yearBirthdays"
                        :year="currentMonth.year ? currentMonth.year.toString() : ''" />
                </div>
            </PmtContent>
        </PmtLayout>
    </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
export default {
    components: {
        PmtTopBar: () => import('../../components/ui/top-bar/TopBar.vue'),
        DatePicker: () => import('../../components/ui/pickers/DatePicker.vue'),
        BirthdayCard: () => import('../../pages/communication/BirthdayCard.vue'),
        BirthdayInfoCards: () => import('../../pages/communication/BirthdayPageInfoCards.vue'),
        BirthdayYearView: () => import('../../pages/communication/BirthdayPageYearView.vue'),
    },
    data: () => ({
        currentMonth: {},
        nextMonth: {},
        loading: false,
        reloadKey: false,
    }),
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapState({
            filters: 'pageFilters',
        }),
        ...mapGetters('departments', {
            allDepartments: 'all',
        }),
        ...mapState('departments', {
            loadingDepartments: 'loading',
        }),
        ...mapState('communication', {
            yearBirthdays: 'yearBirthdays',
            birthdays: 'birthdays',
        }),
        ...mapGetters('datepicker', ['DATEPICKER_BY_ID']),
        datepicker() {
            return this.DATEPICKER_BY_ID('birthdays-datepicker') || {}
        },
        datepickerOptions() {
            return {
                id: 'birthdays-datepicker',
                selectedDate: this.$moment(this.getDateFromRoute),
                mode: 'month',
                selection: 'month',
                monthPicker: true,
                handleRoute: true,
                showNavigation: true,
                showYearNavigation: true,
                showMonthNavigation: false,
            }
        },
        cards() {
            return [
                {
                    header: this.currentMonth.label,
                    year: this.currentMonth.year,
                    month: this.currentMonth,
                    birthdays: this.birthdays,
                },
                {
                    header: this.nextMonth.label,
                    year: this.nextMonth.year,
                    month: this.nextMonth,
                    birthdays: this.birthdays,
                },
            ]
        },
        getDateFromRoute() {
            return this.$moment().fromRouteParams(this.$route.params, 'month')
        },
    },
    watch: {
        'filters.displayFullYear'(newValue) {
            this.UPDATE_ENABLED_FILTERS({
                displayFullYear: true,
                displayInfoCards: true,
                departments: true,
                months: newValue,
            })
            this.dateChange(this.$moment().startOf('month'))
        },
    },
    created() {
        this.UPDATE_ENABLED_FILTERS({
            displayFullYear: true,
            displayInfoCards: true,
            departments: true,
        })
    },
    async mounted() {
        await this.getDepartments({ date: this.$moment(), allDepartments: true })
    },
    methods: {
        ...mapMutations(['UPDATE_ENABLED_FILTERS']),
        ...mapActions('communication', {
            getBirthdays: 'getBirthdays',
            getFullYearBirthdays: 'getFullYearBirthdays',
        }),
        ...mapActions('departments', {
            getDepartments: 'get',
        }),
        /**
         * Fetches the birthdays for current month and next month
         * If the array item is already known it is not fetched again
         */
        async getBirthdaysForTwoMonths() {
            // Fetch current month
            const currentMonthPayload = {
                start: this.$moment(`${this.currentMonth.year}-${this.currentMonth.month}`).startOf('month').apiFormat(),
                end: this.$moment(`${this.currentMonth.year}-${this.currentMonth.month}`).endOf('month').apiFormat(),
                month: this.currentMonth.month,
                yearMonth: `${this.currentMonth.year}-${this.currentMonth.month}`,
            }
            if (typeof this.birthdays[currentMonthPayload.yearMonth] === 'undefined') {
                this.loading = true
                await this.getBirthdays(currentMonthPayload)
                    .then((response) => {
                        this.loading = false
                    })
            }

            // Fetch next month
            const nextMonthPayload = {
                start: this.$moment(`${this.nextMonth.year}-${this.nextMonth.month}`).startOf('month').apiFormat(),
                end: this.$moment(`${this.nextMonth.year}-${this.nextMonth.month}`).endOf('month').apiFormat(),
                month: this.nextMonth.month,
                yearMonth: `${this.nextMonth.year}-${this.nextMonth.month}`,
            }
            if (typeof this.birthdays[nextMonthPayload.yearMonth] === 'undefined') {
                this.loading = true
                await this.getBirthdays(nextMonthPayload)
                    .then((response) => {
                        this.loading = false
                    })
            }
        },
        async dateChange(selectedDate) {
            this.$emit('on-toggle-grid', false)
            if (selectedDate) {
                this.currentMonth = {
                    label: selectedDate.format('MMMM').toString(),
                    month: selectedDate.format('MM').toString(),
                    year: selectedDate.format('YYYY').toString(),
                    yearMonth: `${selectedDate.format('YYYY').toString()}-${selectedDate.format('MM').toString()}`,
                }
                const nextMonth = this.$moment(selectedDate).add('1', 'M')
                this.nextMonth = {
                    label: nextMonth.format('MMMM').toString(),
                    month: nextMonth.format('MM').toString(),
                    year: nextMonth.format('YYYY').toString(),
                    yearMonth: `${nextMonth.format('YYYY').toString()}-${nextMonth.format('MM').toString()}`,
                }
                this.getBirthdaysForTwoMonths()
                if (this.filters.displayFullYear && typeof this.yearBirthdays[this.currentMonth.yearMonth] === 'undefined') {
                    const payload = {
                        start: `${this.currentMonth.year}-01-01`,
                        end: `${this.currentMonth.year}-12-31`,
                        year: this.currentMonth.year,
                    }
                    await this.getFullYearBirthdays(payload)
                    this.reloadKey = !this.reloadKey
                }
            }
        },
        checkFilter(payload) {
            if (payload.filter === 'displayFullYear') {
                this.dateChange(this.$moment().startOf('month'))
            }
            return true
        },
    },
}
</script>

<style lang="scss" scoped>
// @import '../../assets/scss/_colors.scss';

.birthday-page {
    .date-title {
        margin-right: 20px;
        text-align: right;
    }
}

// Override default card styles here with a deep selector, should only effect this file because of the scoped
:deep() .card-body {
    padding: 5px 10px;
}

:deep() .v-list-item {
    align-items: start !important
}

:deep() .v-list-item__content {
    padding: 8px 0px !important;
    align-self: start;

    ul {
        border: 0.5px solid $hit-gray;
        border-radius: 5px;
        padding: 1px 5px 5px 5px;
    }
}

@media print {
    .birthday-page {
        margin-left: 200px !important;

        .date-title {
            margin-right: 0px;
            text-align: right;
        }
    }
}
</style>
