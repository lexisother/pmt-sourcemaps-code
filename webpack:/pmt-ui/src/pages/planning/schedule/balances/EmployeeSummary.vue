<template>
    <ul class="summary pa-3">
        <li :class="{'bold line': contract.use_min_max === false, 'total-contract-hours': true}">
            <span
                v-if="contract.use_min_max"
                class="label"
            >{{ $t( 'pages.mySchedule.balances.totals.minContractHours' ) }}</span>
            <span
                v-else
                class="label"
            >{{ $t( 'pages.mySchedule.balances.totals.contractHours' ) }}</span>
            <span class="value">{{ contract.calculated_contract_hours }}</span>
        </li>
        <li
            v-if="contract.use_min_max"
            class="line max-contract-hours"
        >
            <span class="label">{{ $t( 'pages.mySchedule.balances.totals.maxContractHours' ) }}</span>
            <span class="value">{{ contract.calculated_max_contract_hours }}</span>
        </li>
        <li class="period-productive">
            <span class="label">{{ $t( 'pages.mySchedule.balances.totals.productive' ) }}</span>
            <span class="value">{{ payroll.period.productive }}</span>
        </li>
        <li
            v-if="!showOnlyWorkHoursWeekschedule"
            class="period-non-productive"
        >
            <span class="label">{{ $t( 'pages.mySchedule.balances.totals.nonProductive' ) }}</span>
            <span class="value">{{ payroll.period.non_productive }}</span>
        </li>
        <li class="bold line total-booked">
            <span class="label">{{ $t( 'pages.mySchedule.balances.totals.total' ) }}</span>
            <span
                :class="{'dashed-line':(payrollLoaded === false)}"
                class="value"
                :title="$t( 'pages.mySchedule.titles.total' )"
            >{{ payroll.period.totalBooked }}</span>
        </li>
        <li class="bold line difference">
            <span class="label">{{ $t( 'pages.mySchedule.balances.totals.difference' ) }}</span>
            <span
                class="value"
                :title="$t( 'pages.mySchedule.titles.difference' )"
            >{{ payroll.period.difference }}</span>
        </li>
        <div
            v-if="!showOnlyWorkHoursWeekschedule && payroll.period.surcharge"
            class="surcharge"
        >
            <li class="bold total">
                <span class="label">{{ $t( 'pages.mySchedule.balances.totals.surcharges' ) }}</span>
            </li>
            <li class="time">
                <span class="label">{{ $t( 'pages.mySchedule.balances.totals.time' ) }}</span>
                <span class="value">{{ payroll.period.surcharge.categories.time }}</span>
            </li>
            <li class="money">
                <span class="label">{{ $t( 'pages.mySchedule.balances.totals.money' ) }}</span>
                <span class="value">{{ payroll.period.surcharge.categories.money }}</span>
            </li>
        </div>
    </ul>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: {
        selectedDate: {
            type: Object,
            required: true,
        },
        accountId: {
            type: Number,
            required: true,
        },
        payrollLoaded: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapGetters('auth', {
            showOnlyWorkHoursWeekschedule: 'showOnlyWorkHoursWeekschedule',
        }),
        ...mapGetters('schedules', {
            accountPayrollDetailsTotals: 'accountPayrollDetailsTotals',
        }),
        ...mapGetters('contracts', {
            CONTRACT_ON_DATE: 'CONTRACT_ON_DATE',
        }),
        payroll () {
            return this.accountPayrollDetailsTotals({
                accountId: this.accountId,
                week: this.selectedDate.isoWeek(),
                year: this.selectedDate.isoWeekYear(),
            }) || { days: [], period: {} }
        },
        contract () {
            return this.CONTRACT_ON_DATE({
                accountId: this.accountId,
                date: this.$moment(this.selectedDate).startOf('isoWeek').apiFormat(),
            })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .summary {
        min-width: 150px;
        .bold {
            font-weight: 600;
            font-size: 100% !important;
        }
        .line {
            margin-bottom: .2rem;
            padding-bottom: .2rem;

            border-bottom: 1px solid $border-color;
        }
        .dashed-line {
            margin-bottom: .2rem;
            padding-bottom: .2rem;
            border-top: 1px dashed $border-color
        }
        .value {
            float: right;
        }
        .no-overflow {
            overflow: hidden;
        }
    }
</style>
