<template>
    <div class="balance-history-tab">
        <MyRequestsTopBar
            ref="topbar"
            :loading="loading"
        >
            <div>
                <DatePicker
                    ref="fromWeek"
                    :options="datepickerOptions.from"
                    @on-select="weekFilters.from = $event"
                >
                    <template #selected-date-text="{ date }">
                        <span> {{ $t('ui.singles.week') }} {{ date.isoWeek() }}, {{ date.isoWeekYear() }}</span>
                    </template>
                </DatePicker>
            </div>
            <PmtButton
                round
                icon="arrow-right"
                icon-size="19"
                disabled-simple
                disabled
                no-margin
            />
            <div>
                <DatePicker
                    ref="toWeek"
                    :options="datepickerOptions.to"
                    @on-select="weekFilters.to = $event"
                >
                    <template #selected-date-text="{ date }">
                        <span> {{ $t('ui.singles.week') }} {{ date.isoWeek() }}, {{ date.isoWeekYear() }}</span>
                    </template>
                </DatePicker>
            </div>
            <PmtButton
                primary
                inverted
                icon="refresh"
                class="float-left get-balances"
                :disabled="!canMakeApiCall"
                @click="getBalances(weekFilters)"
            >
                {{ $t(`pages.requests.tabs.balanceHistory.${IS_MOBILE ? 'getShort' : 'get'}`) }}
            </PmtButton>
        </MyRequestsTopBar>
        <div class="balance-table">
            <VDataTable
                v-if="PAGE_WIDTH > 900"
                ref="desktopTable"
                :headers="tableHeaders"
                :items="rowItems"
                :items-per-page="53"
                :fixed-header="true"
                :hide-default-footer="true"
            >
                <template #header="{ props: {} }">
                    <thead>
                        <tr>
                            <th />
                            <th
                                v-if="hasVak"
                                colspan="4"
                                :class="'text-center'"
                            >
                                {{ $t('pages.requests.tabs.balanceHistory.timeOffTitle') }}
                            </th>
                            <th
                                v-if="hasAtv"
                                colspan="4"
                                :class="'text-center'"
                            >
                                {{ $t('pages.requests.tabs.balanceHistory.atvTitle') }}
                            </th>
                            <th
                                v-if="hasTvt"
                                colspan="4"
                                :class="'text-center'"
                            >
                                {{ $t('pages.requests.tabs.balanceHistory.compensationHoursTitle') }}
                            </th>
                        </tr>
                    </thead>
                </template>
                <template #item="{ item }">
                    <tr>
                        <td class="text-center right-border">
                            <span
                                v-tooltip="{
                                    content: $moment({year: item.year}).isoWeek(item.week).startOf('isoweek').longDayFormat(),
                                    hideOnTargetClick: true,
                                    placement: 'top',
                                    trigger: 'focus hover click'
                                }"
                            >
                                {{ IS_MOBILE ? `Week ${item.week}` : `Week ${item.week}, ${item.year}` }}
                            </span>
                        </td>
                        <td
                            v-if="hasVak && item.time_off"
                            class="text-center"
                            :class="{'text-error': item.time_off.start_value.indexOf('-') > -1}"
                        >
                            {{ item.time_off.start_value }}
                        </td>
                        <td
                            v-if="hasVak && item.time_off"
                            class="text-center"
                            :class="{'text-error': item.time_off.build_up.indexOf('-') > -1}"
                        >
                            {{ item.time_off.build_up }}
                        </td>
                        <td
                            v-if="hasVak && item.time_off"
                            class="text-center"
                            :class="{'text-error': item.time_off.build_down.indexOf('-') > -1}"
                        >
                            {{ item.time_off.build_down }}
                        </td>
                        <td
                            v-if="hasVak && item.time_off"
                            class="text-center"
                            :class="{'text-error': item.time_off.end_value.indexOf('-') > -1, 'right-border': true}"
                        >
                            {{ item.time_off.end_value }}
                        </td>
                        <td
                            v-if="hasAtv && item.atv"
                            class="text-center"
                            :class="{'text-error': item.atv.start_value.indexOf('-') > -1}"
                        >
                            {{ item.atv.start_value }}
                        </td>
                        <td
                            v-if="hasAtv && item.atv"
                            class="text-center"
                            :class="{'text-error': item.atv.build_up.indexOf('-') > -1}"
                        >
                            {{ item.atv.build_up }}
                        </td>
                        <td
                            v-if="hasAtv && item.atv"
                            class="text-center"
                            :class="{'text-error': item.atv.build_down.indexOf('-') > -1}"
                        >
                            {{ item.atv.build_down }}
                        </td>
                        <td
                            v-if="hasAtv && item.atv"
                            class="text-center"
                            :class="{'text-error': item.atv.end_value.indexOf('-') > -1, 'right-border': true}"
                        >
                            {{ item.atv.end_value }}
                        </td>
                        <td
                            v-if="hasTvt && item.compensation_hours"
                            class="text-center"
                            :class="{'text-error': item.compensation_hours.start_value.indexOf('-') > -1}"
                        >
                            {{ item.compensation_hours.start_value }}
                        </td>
                        <td
                            v-if="hasTvt && item.compensation_hours"
                            class="text-center"
                            :class="{'text-error': item.compensation_hours.build_up.indexOf('-') > -1}"
                        >
                            {{ item.compensation_hours.build_up }}
                        </td>
                        <td
                            v-if="hasTvt && item.compensation_hours"
                            class="text-center"
                            :class="{'text-error': item.compensation_hours.build_down.indexOf('-') > -1}"
                        >
                            {{ item.compensation_hours.build_down }}
                        </td>
                        <td
                            v-if="hasTvt && item.compensation_hours"
                            class="text-center"
                            :class="{'text-error': item.compensation_hours.end_value.indexOf('-') > -1}"
                        >
                            {{ item.compensation_hours.end_value }}
                        </td>
                    </tr>
                </template>
            </VDataTable>
            <VDataTable
                v-for="(table, index) in mobileTables"
                v-else
                ref="mobileTable"
                :key="index"
                :headers="headersMobile"
                :items="rowItems"
                :items-per-page="53"
                :fixed-header="true"
                :hide-default-footer="true"
                :mobile-breakpoint="0"
            >
                <template #header="{ props: { headers } }">
                    <thead>
                        <tr>
                            <th :colspan="headers.length">
                                <h3>{{ table.header }}</h3>
                            </th>
                        </tr>
                    </thead>
                </template>
                <template #item="{ item }">
                    <tr>
                        <td class="text-center">
                            <span v-tooltip="{content: $moment({year: item.year}).isoWeek(item.week).startOf('isoweek').longDayFormat(),hideOnTargetClick: true, placement: 'top', trigger: 'focus hover click'}">
                                {{ IS_MOBILE ? `Week ${item.week}` : `Week ${item.week}, ${item.year}` }}
                            </span>
                        </td>
                        <td
                            class="text-center"
                            :class="{'text-error': item[table.name].start_value.indexOf('-') > -1}"
                        >
                            {{ item[table.name].start_value }}
                        </td>
                        <td
                            class="text-center"
                            :class="{'text-error': item[table.name].build_up.indexOf('-') > -1}"
                        >
                            {{ item[table.name].build_up }}
                        </td>
                        <td
                            class="text-center"
                            :class="{'text-error': item[table.name].build_down.indexOf('-') > -1}"
                        >
                            {{ item[table.name].build_down }}
                        </td>
                        <td
                            class="text-center"
                            :class="{'text-error': item[table.name].end_value.indexOf('-') > -1}"
                        >
                            {{ item[table.name].end_value }}
                        </td>
                    </tr>
                </template>
            </VDataTable>
        </div>
    </div>
</template>

<script>
import MyRequestsTopBar from '@/pages/planning/requests/MyRequestsTopBar'
import { mapActions, mapState, mapGetters } from 'vuex'
export default {
    name: 'BalanceHistory',
    components: { MyRequestsTopBar },
    data () {
        return {
            weekFilters: {
                from: this.$moment().add(-3, 'weeks'),
                to: this.$moment(),
            },
            loading: false,
            zeroRowItem: {
                start_value: '00:00',
                build_up: '00:00',
                build_down: '00:00',
                end_value: '00:00',
            },
        }
    },
    computed: {
        ...mapState('schedules', {
            balanceHistory: 'balanceHistory',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
            PAGE_WIDTH: 'PAGE_WIDTH',
        }),
        ...mapGetters('auth', {
            hasVak: 'hasVak',
            hasTvt: 'hasTvt',
            hasAtv: 'hasAtv',
            hasBalances: 'hasBalances',
            SHOW_INDICATIVE_BALANCES: 'SHOW_INDICATIVE_BALANCES',
            SHOW_INDICATIVE_TVT_BALANCES: 'SHOW_INDICATIVE_TVT_BALANCES',
        }),
        datepickerOptions () {
            const noMaxDate = this.SHOW_INDICATIVE_BALANCES || this.SHOW_INDICATIVE_TVT_BALANCES
            return {
                from: {
                    id: 'balance-history-from-datepicker',
                    selectedDate: this.weekFilters.from,
                    minDate: this.weekFilters.to.clone().add(-1, 'years'),
                    maxDate: this.weekFilters.to,
                    showSidebar: false,
                    mode: 'week',
                },
                to: {
                    id: 'balance-history-to-datepicker',
                    selectedDate: this.weekFilters.to,
                    minDate: this.weekFilters.from,
                    maxDate: noMaxDate ? null : this.$moment(),
                    showSidebar: false,
                    mode: 'week',
                },
            }
        },
        canMakeApiCall () {
            return this.hasTvt || this.hasAtv || this.hasVak
        },
        tableHeaders () {
            let headers = [{ text: 'Week', value: 'week', sortable: true, align: 'center' }]
            if (this.hasVak) {
                headers = [...headers, ...this.generateSubHeaders('time_off')]
            }
            if (this.hasAtv) {
                headers = [...headers, ...this.generateSubHeaders('atv_off')]
            }
            if (this.hasTvt) {
                headers = [...headers, ...this.generateSubHeaders('compensation_hours')]
            }

            return headers
        },
        headersMobile () {
            return [
                ...[{ text: 'Week', value: 'week', sortable: true, align: 'center' }],
                ...this.generateSubHeaders('time_off'),
            ]
        },
        mobileTables () {
            const tables = []
            if (this.hasVak) {
                tables.push({
                    name: 'time_off',
                    header: this.$t('pages.requests.tabs.balanceHistory.timeOffTitle'),
                })
            }
            if (this.hasAtv) {
                tables.push({
                    name: 'atv',
                    header: this.$t('pages.requests.tabs.balanceHistory.atvTitle'),
                })
            }
            if (this.hasTvt) {
                tables.push({
                    name: 'compensation_hours',
                    header: this.$t('pages.requests.tabs.balanceHistory.compensationHoursTitle'),
                })
            }
            return tables
        },
        rowItems () {
            return this.balanceHistory.map(item => {
                const result = {
                    fullObject: item,
                    week: item.week,
                    year: item.year,
                }
                if (this.hasVak && item.time_off) {
                    result.time_off = {
                        start_value: item.time_off.start_value,
                        build_up: item.time_off.build_up,
                        build_down: item.time_off.build_down,
                        end_value: item.time_off.end_value,
                    }
                } else {
                    result.time_off = this.zeroRowItem
                }

                if (this.hasAtv && item.atv) {
                    result.atv = {
                        start_value: item.atv.start_value,
                        build_up: item.atv.build_up,
                        build_down: item.atv.build_down,
                        end_value: item.atv.end_value,
                    }
                } else {
                    result.atv = this.zeroRowItem
                }

                if (this.hasTvt && item.compensation_hours) {
                    result.compensation_hours = {
                        start_value: item.compensation_hours.start_value,
                        build_up: item.compensation_hours.build_up,
                        build_down: item.compensation_hours.build_down,
                        end_value: item.compensation_hours.end_value,
                    }
                } else {
                    result.compensation_hours = this.zeroRowItem
                }
                return result
            })
        },
    },
    async mounted () {
        if (!this.balanceHistory.length && this.canMakeApiCall) {
            this.getBalances(this.weekFilters)
        }
    },
    methods: {
        ...mapActions('schedules', {
            getBalanceHistory: 'getBalanceHistory',
        }),
        getBalances (period) {
            this.loading = true
            this.getBalanceHistory({
                from: period.from.startOf('isoWeek').format('YYYY-WW'),
                to: period.to.startOf('isoWeek').format('YYYY-WW'),
            }).then((result) => {
                this.loading = false
                if (result.length === 0) {
                    this.$emit('hide-balances-tab', true)
                } else {
                    this.$emit('hide-balances-tab', false)
                }
            })
        },
        generateSubHeaders (balanceType) {
            return [
                { text: this.$t('pages.requests.tabs.balanceHistory.old'), value: balanceType + '_old', sortable: false, align: 'center' },
                { text: this.$t('pages.requests.tabs.balanceHistory.plus'), value: balanceType + '_plus', sortable: false, align: 'center' },
                { text: this.$t('pages.requests.tabs.balanceHistory.minus'), value: balanceType + '_minus', sortable: false, align: 'center' },
                { text: this.$t('pages.requests.tabs.balanceHistory.balance'), value: balanceType + '_saldo', sortable: false, align: 'center ' },
            ]
        },
    },
}
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .balance-table {
        .v-data-table .v-data-table__wrapper table th {
            text-align: center !important;
        }
    }
    .right-border {
        border-right: 1px solid $border-color
    }
</style>
