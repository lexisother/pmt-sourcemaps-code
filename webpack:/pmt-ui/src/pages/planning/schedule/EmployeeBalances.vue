<template>
    <PmtContent
        v-if="(contract && Object.keys(contract).length) || canSeeBalanceCards"
        ref="balancesContent"
        class="container-fluid"
    >
        <h2
            ref="weekTotalsTitle"
            class="m-0"
        >
            {{ $t('pages.mySchedule.weekTotalsTitle') }}
        </h2>
        <Chip
            ref="totalsMessage"
            primary
            outline
            :text="closedWeek ? $t('pages.mySchedule.finalTotals') : $t('pages.mySchedule.estimatedTotals')"
        />
        <VRow>
            <VCol
                v-if="contract && Object.keys(contract).length > 0"
                cols="6"
                xs="6"
                sm="6"
                md="3"
                lg="2"
            >
                <Card
                    ref="contractCard"
                    :header-class="{bold: true}"
                    :front-style="{minHeight: '180px'}"
                >
                    <h4
                        slot="header"
                        class="text-center card-title"
                    >
                        {{ hoursCard.title }}
                    </h4>
                    <template slot="body">
                        <div class="big-time text-center animated">
                            <span class="hours">{{ hoursCard.body }}</span>
                            <br>
                            <small class="times-text">{{ $t('pages.mySchedule.hours') }}</small>
                        </div>
                    </template>
                    <template slot="actions">
                        <v-popover
                            trigger="manual"
                            :open="popoverOpen === 'contract'"
                            offset="10"
                            :auto-hide="true"
                            @apply-hide="popoverOpen = false"
                        >
                            <PmtButton
                                default
                                class="tooltip-target"
                                @click="popoverOpen = 'contract'"
                            >
                                {{ $t('pages.mySchedule.seeMore') }}
                            </PmtButton>
                            <template slot="popover">
                                <EmployeeSummary
                                    ref="employeeSummary"
                                    :selected-date="selectedDate"
                                    :account-id="accountId"
                                    :payroll-loaded="payrollLoaded"
                                />
                            </template>
                        </v-popover>
                    </template>
                </Card>
            </VCol>
            <VCol
                v-for="(card, index) in balanceCards"
                :key="index"
                cols="6"
                xs="6"
                sm="6"
                md="3"
                lg="2"
            >
                <Card
                    :ref="card.ref"
                    :header-class="{bold: true}"
                    :front-style="{minHeight: '180px'}"
                >
                    <h4
                        slot="header"
                        class="text-center card-title"
                    >
                        {{ card.title }}
                    </h4>
                    <template slot="body">
                        <div
                            :key="showHours"
                            class="big-time text-center animated"
                            :class="{'slideInLeft': showHours, 'slideInRight': !showHours}"
                            style="animation-duration: 0.2s;"
                            @click="contract && Object.keys(contract).length > 0 ? showHours = !showHours : ''"
                        >
                            <span class="hours">{{ card.body }}</span>
                            <br>
                            <small class="times-text">{{ showHours ? $t('pages.mySchedule.hours') : $t('pages.mySchedule.days') }}</small>
                        </div>
                    </template>
                    <template slot="actions">
                        <v-popover
                            trigger="manual"
                            :popover-inner-class="['popover-inner', IS_MOBILE ? 'popover-inner-mobile' : '']"
                            :open="popoverOpen === index"
                            offset="10"
                            :auto-hide="true"
                            @apply-hide="popoverOpen = false"
                        >
                            <PmtButton
                                :id="card.ref + '_activator'"
                                default
                                @click="popoverOpen = index"
                            >
                                {{ $t('pages.mySchedule.seeMore') }}
                            </PmtButton>
                            <template slot="popover">
                                <EmployeeBalanceTable
                                    :data="balances"
                                    :highlight="index"
                                />
                            </template>
                        </v-popover>
                    </template>
                </Card>
            </VCol>
        </VRow>
    </PmtContent>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
    name: 'EmployeeBalances',

    components: {
        EmployeeSummary: () => import(
            /* webpackChunkName: "week-schedule" */
            './balances/EmployeeSummary.vue'
        ),
        EmployeeBalanceTable: () => import(
            /* webpackChunkName: "week-schedule" */
            './balances/EmployeeBalanceTable.vue'
        ),
    },

    props: {
        accountId: {
            type: Number,
            required: true,
        },
        selectedDate: {
            type: Object,
            required: true,
        },
    },

    data () {
        return {
            payrollLoaded: false,
            showHours: true,
            popoverOpen: '',
        }
    },

    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('contracts', {
            CONTRACT_ON_DATE: 'CONTRACT_ON_DATE',
            canCallContractApiForAccount: 'canCallContractApiForAccount',
        }),
        ...mapGetters('auth', {
            canSeeVak: 'hasVak',
            canSeeTvt: 'hasTvt',
            canSeeAtv: 'hasAtv',
            canSeeBalances: 'hasBalances',
            showOnlyWorkHoursWeekschedule: 'showOnlyWorkHoursWeekschedule',
        }),
        ...mapGetters('schedules', {
            accountPayrollDetailsTotals: 'accountPayrollDetailsTotals',
            weekBalances: 'weekBalances',
        }),
        ...mapGetters('stores', {
            weekStatus: 'weekStatus',
        }),
        balances () {
            return this.weekBalances({
                accountId: this.accountId,
                week: this.selectedDate.isoWeek(),
                year: this.selectedDate.isoWeekYear(),
            })
        },
        payroll () {
            return this.accountPayrollDetailsTotals({
                accountId: this.accountId,
                week: this.selectedDate.isoWeek(),
                year: this.selectedDate.isoWeekYear(),
            }) || { days: [], period: {} }
        },
        /**
         * Returns true if selected week is closed.
         */
        closedWeek () {
            const weekStatus = this.weekStatus(this.selectedDate.yearWeekApiFilter())
            return weekStatus ? weekStatus.status === 'closed' : false
        },

        contractHoursPerDay () {
            return this.contract ? parseInt(this.contract.calculated_contract_hours) / 5 : 0
        },

        /**
         * Calculates the hours to be shown in Contract hours card for Week totals.
         *
         * @returns {string}
         */
        weekEmployeeData () {
            if (this.contractHoursPerDay === 0 || this.contract.use_min_max) {
                return this.payroll.period.totalBooked
            }
            return `${this.payroll.period.totalBooked || '00:00'} / ${this.contract.calculated_contract_hours}`
        },
        hoursCard () {
            return {
                title: this.contractHoursPerDay === 0 || this.contract.use_min_max ? this.$t('pages.mySchedule.balances.totals.worked') : this.$t('pages.mySchedule.balances.totals.contractHours'),
                body: this.weekEmployeeData,
            }
        },
        canSeeBalanceCards () {
            return this.canSeeBalances && Object.keys(this.balanceCards).length && (this.canSeeTvt || this.canSeeVak || this.canSeeAtv)
        },
        balanceCards () {
            const data = {}
            if (this.canSeeVak && this.balances && this.balances.time_off) {
                data.time_off = {
                    ref: 'timeOff',
                    title: this.$t('pages.mySchedule.balances.timeOffTitle'),
                    body: `${this.showHours ? this.balances.time_off.end_value : (this.contractHoursPerDay === 0 ? 0 : (this.$moment.duration(this.balances.time_off.end_value).asHours() / this.contractHoursPerDay)).toFixed(2)}`,
                }
            }
            if (this.canSeeTvt && this.balances && this.balances.compensation_hours) {
                data.time_for_time = {
                    ref: 'tvt',
                    title: this.$t('pages.mySchedule.balances.timeForTimeTitle'),
                    body: `${this.showHours ? this.balances.compensation_hours.end_value : (this.contractHoursPerDay === 0 ? 0 : (this.$moment.duration(this.balances.compensation_hours.end_value).asHours() / this.contractHoursPerDay)).toFixed(2)}`,
                }
            }
            if (this.canSeeAtv && this.balances && this.balances.atv) {
                data.atv = {
                    ref: 'atv',
                    title: this.$t('pages.mySchedule.balances.atvTitle'),
                    body: `${this.showHours ? this.balances.atv.end_value : (this.contractHoursPerDay === 0 ? 0 : (this.$moment.duration(this.balances.atv.end_value).asHours() / this.contractHoursPerDay)).toFixed(2)}`,
                }
            }
            return data
        },
        contract () {
            return this.CONTRACT_ON_DATE({
                accountId: this.accountId,
                date: this.$moment(this.selectedDate).startOf('isoWeek').apiFormat(),
            })
        },
    },

    mounted () {
        this.getEmployeeData()
    },

    methods: {
        ...mapActions('schedules', {
            getWeekPayrollDetailsForEmployee: 'getWeekPayrollDetailsForEmployee',
            getWeekBalances: 'getWeekBalances',
        }),

        ...mapActions('contracts', ['getEmployeeContractInfoOnDate']),

        /**
         * Fetches contract information, payroll details and balances information for current/selected employee for selected date.
         */
        async getEmployeeData () {
            const payrolDetailsPayload = {
                accountId: this.accountId,
                from: this.selectedDate.startOf('isoWeek').apiFormat(),
                to: this.selectedDate.endOf('isoWeek').apiFormat(),
                showOnlyWorkHoursWeekschedule: this.showOnlyWorkHoursWeekschedule,
            }
            if (this.contract) {
                payrolDetailsPayload.minMax = this.contract.use_min_max
                payrolDetailsPayload.contractHours = this.contract.calculated_contract_hours
                payrolDetailsPayload.maxContractHours = this.contract.calculated_max_contract_hours
            } else {
                // wait for contracts call to update get payroll payoad information
                await this.getEmployeeContractInfoOnDate({ date: this.selectedDate.startOf('isoWeek').apiFormat(), account_id: this.accountId }).then((response) => {
                    // update payrolDetailsPayload with new contract information
                    if (response) {
                        payrolDetailsPayload.minMax = response.use_min_max
                        payrolDetailsPayload.contractHours = response.calculated_contract_hours
                        payrolDetailsPayload.maxContractHours = response.calculated_max_contract_hours
                    }
                })
            }
            // we only make the following api call if the user can call the contracts api
            // if not the folowing call is redundant as contract card will not be shown
            if (this.canCallContractApiForAccount(this.accountId)) {
                this.getWeekPayrollDetailsForEmployee(payrolDetailsPayload).then(() => {
                    this.payrollLoaded = true
                })
            }
            this.getWeekBalances({
                ...this.selectedDate.weekYearObject(),
                accountId: this.accountId,
            })
        },
    },
}
</script>

<style lang="scss">
    @import '@/assets/scss/_colors.scss';
    .big-time {
        font-size: 25px;
        line-height: normal;
        padding: 19px 0;
        cursor: pointer;
        &:hover {
            background-color: darken($white, 5%);
        }
    }
</style>
