<template>
    <div class="leave-split-container">
        <VDataTable
            ref="leaveSplitTable"
            :headers="headers"
            :items="rows"
            hide-default-footer
            :fixed-header="true"
            mobile-breakpoint="700"
            calculate-widths
        >
            <template #top>
                <div class="table-title">
                    {{ baseTranslate('leaveBalance') }}
                    <LeaveSplitHoursButtonGroup
                        v-if="PAGE_WIDTH < 700"
                        :value="hoursDisplay"
                        @switch="hoursDisplay = $event"
                    />
                </div>
            </template>
            <template #[`header.rowType`]>
                <LeaveSplitHoursButtonGroup
                    :value="hoursDisplay"
                    @switch="hoursDisplay = $event"
                />
            </template>
            <template #[`header.buildupThisYear`]="{ header }">
                <div class="first-header">
                    {{ header.text }}
                </div>
                <div class="sub-header">
                    <div class="flexed-item sub-item">
                        {{ baseTranslate('buildupThisYear.buildupYearEnd') }}
                    </div>
                    <div class="flexed-item sub-item">
                        {{ baseTranslate('buildupThisYear.withdrawalToday') }}
                    </div>
                    <div class="flexed-item half sub-item ">
                        {{ baseTranslate('buildupThisYear.total') }}
                    </div>
                </div>
            </template>
            <template
                v-if="BALANCES_EXPIRATION && SHOW_INDICATIVE_BALANCES && SHOW_INDICATIVE_TVT_BALANCES"
                #[`header.expiringLeave`]="{ header }"
            >
                <div class="first-header">
                    {{ header.text }}
                </div>
                <div class="sub-header">
                    <div class="flexed-item sub-item">
                        {{ expiringLabel(true) }}
                    </div>
                    <div class="flexed-item sub-item">
                        {{ expiringLabel(false) }}
                    </div>
                </div>
            </template>
            <template #item="{ item }">
                <LeaveSplitRow
                    v-if="PAGE_WIDTH >= 700"
                    ref="leaveSpliRow"
                    :item="item"
                    :headers="headers"
                    :base-translate="baseTranslate"
                    :positive-classes="positiveClasses"
                />
                <template v-else>
                    <LeaveSplitRowMobile
                        ref="leaveSpliRowMobile"
                        :item="item"
                        :headers="headers"
                        :expiring-labels="{statutory: expiringLabel(true), nonStatutory: expiringLabel(false)}"
                        :base-translate="baseTranslate"
                        :positive-classes="positiveClasses"
                    />
                </template>
            </template>
        </VDataTable>
    </div>
</template>

<script>
import LeaveSplitRow from '@/pages/planning/requests/balances/LeaveSplitRow'
import LeaveSplitRowMobile from '@/pages/planning/requests/balances/LeaveSplitRowMobile'
import LeaveSplitHoursButtonGroup from '@/pages/planning/requests/balances/LeaveSplitHoursButtonGroup'
import { mapGetters } from 'vuex'
export default {
    name: 'LeaveSplit',
    components: {
        LeaveSplitRow,
        LeaveSplitRowMobile,
        LeaveSplitHoursButtonGroup,
    },
    props: {
        currentBalances: {
            type: [Object, Array],
            default: () => (undefined),
        },
        endOfYearBalances: {
            type: Object,
            default: () => (undefined),
        },
    },
    data () {
        return {
            expanded: [],
            searchPermissions: '',
            hoursDisplay: true,
        }
    },
    computed: {
        ...mapGetters('auth', {
            hasBalances: 'hasBalances',
            hasBalancesHistory: 'hasBalancesHistory',
            hasVak: 'hasVak',
            hasTvt: 'hasTvt',
            hasAtv: 'hasAtv',
            permissions: 'permissions',
            user: 'user',
            BALANCES_EXPIRATION: 'BALANCES_EXPIRATION',
            SHOW_INDICATIVE_BALANCES: 'SHOW_INDICATIVE_BALANCES',
            SHOW_INDICATIVE_TVT_BALANCES: 'SHOW_INDICATIVE_TVT_BALANCES',
        }),
        ...mapGetters(['PAGE_WIDTH']),
        expiringLabelFormat () {
            if (this.$moment.locale() === 'en') {
                return 'MMMM Do YYYY'
            }
            return 'D MMMM YYYY'
        },
        headers () {
            const headers = [
                {
                    text: '',
                    value: 'rowType',
                    sortable: false,
                },
                {
                    text: this.baseTranslate('remainderLastYear'),
                    value: 'remainderLastYear',
                    sortable: false,
                },
                {
                    text: this.baseTranslate('buildupThisYear.name'),
                    value: 'buildupThisYear',
                    sortable: false,
                    class: 'main-header',
                },
            ]
            if (this.BALANCES_EXPIRATION) {
                headers.push({
                    text: this.baseTranslate('expiringLeave'),
                    value: 'expiringLeave',
                    sortable: false,
                    class: 'main-header',
                })
            }

            if (this.BALANCES_EXPIRATION || this.SHOW_INDICATIVE_BALANCES || this.SHOW_INDICATIVE_TVT_BALANCES) {
                headers.push({
                    text: this.baseTranslate('balanceEndWeekYear', { year: this.$moment().year(), week: this.$moment().endOf('year').isoWeek() }),
                    value: 'balanceEndWeekYear',
                    sortable: false,
                })
            }

            return headers
        },
        rows () {
            const rows = []
            const hasType = (type) => {
                return Boolean(Object.keys(this.balance(type)).length)
            }
            if (this.hasVak && hasType('time_off')) {
                rows.push(this.calculatedRow('time_off'))
            }
            if (this.hasAtv && hasType('atv')) {
                rows.push(this.calculatedRow('atv'))
            }
            if (this.hasTvt && hasType('compensation_hours')) {
                rows.push(this.calculatedRow('compensation_hours'))
            }
            return rows
        },
        showTvtEndYearBalance () {
            if (this.SHOW_INDICATIVE_BALANCES && !this.SHOW_INDICATIVE_TVT_BALANCES) return false
            return this.SHOW_INDICATIVE_BALANCES
        },
    },
    methods: {
        expiringLabel (statutory) {
            if (!this.balance('time_off').time_off_splits) return ''
            const statutoryLabel = statutory ? 'statutory_leave' : 'non_statutory_leave'
            const statutoryDate = this.balance('time_off').time_off_splits[statutoryLabel].expiration_date
            if (!statutoryDate) return ''
            return this.$moment(statutoryDate).format(this.expiringLabelFormat)
        },
        balance (detail) {
            if (!this.currentBalances) return {}
            if (!this.currentBalances[detail]) return {}
            return this.currentBalances[detail]
        },
        endOfYearBalance (detail) {
            if (!this.endOfYearBalances) return {}
            if (!this.endOfYearBalances[detail]) return {}
            return this.endOfYearBalances[detail]
        },
        baseTranslate (query, params) {
            return this.$t(`pages.mySchedule.leaveSplit.${query}`, params)
        },
        hoursDuration (hours) {
            if (!hours) return hours
            const duration = this.$moment.duration(hours)
            if (this.hoursDisplay) return duration.format('HH:mm')
            return (duration.asHours() / 8).toFixed(2)
        },
        calculatedRow (type) {
            const balanceType = this.balance(type)
            const result = {
                rowType: {
                    label: this.baseTranslate(type),
                    type: type,
                },
                remainderLastYear: this.hoursDuration(balanceType?.start_value || ''),
                buildupYearEnd: this.hoursDuration(balanceType?.build_up || ''),
                withdrawalToday: this.hoursDuration(balanceType?.build_down || ''),
                totalBuildupThisYear: this.hoursDuration(balanceType?.end_value || ''),
            }
            if (type === 'time_off') {
                if (this.BALANCES_EXPIRATION && balanceType.time_off_splits) {
                    result.expiresJuly = this.hoursDuration(balanceType.time_off_splits.statutory_leave.balance_time_off)
                    result.expiresJanuary = this.hoursDuration(balanceType.time_off_splits.non_statutory_leave.balance_time_off)
                }
                if (this.SHOW_INDICATIVE_BALANCES) {
                    result.balanceEndWeekYear = this.hoursDuration(this.endOfYearBalance(type)?.end_value || '')
                }
            }
            if (type === 'atv' && this.SHOW_INDICATIVE_BALANCES) {
                result.balanceEndWeekYear = this.hoursDuration(this.endOfYearBalance(type)?.end_value || '')
            }
            if (type === 'compensation_hours' && this.showTvtEndYearBalance) {
                result.balanceEndWeekYear = this.hoursDuration(this.endOfYearBalance(type)?.end_value || '')
            }
            return result
        },
        positiveClasses (item) {
            if (!item) return
            return {
                negative: item.indexOf('-') > -1,
                positive: item.indexOf('-') === -1 && item !== '0:00',
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import './LeaveSplit.scss';
</style>
