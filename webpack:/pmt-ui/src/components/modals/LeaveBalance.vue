<template>
    <div class="leave-balance-modal">
        <div v-if="balanceData && getBalancesize > 0">
            <!-- Initial table to render the categories -->
            <table class="table type-table leave-balance-table">
                <thead>
                    <tr>
                        <th class="no-bg display-table" />
                        <th
                            colspan="2"
                            class="center no-bg border-right padded-text"
                        >
                            <h2>&zwnj;</h2><h3>&zwnj;</h3>
                        </th>
                    </tr>
                    <tr class="border-bottom">
                        <th class="center no-bg border-right padded-text">
                            &zwnj;
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>VAK</td>
                    </tr>
                    <tr>
                        <td>ATV</td>
                    </tr>
                    <tr>
                        <td>TVT</td>
                    </tr>
                    <tr>
                        <td>Totaal</td>
                    </tr>
                </tbody>
            </table>
            <!-- V-FOR table to render the current, indicative and indicative_contract_end -->
            <table
                v-for="(balances, index) in balanceData"
                :key="index"
                class="table leave-balance-table"
                :class="getTableClass(getBalancesize)"
            >
                <thead>
                    <tr>
                        <th class="no-bg display-table" />
                        <th
                            colspan="2"
                            class="center dark-bg border-right padded-text"
                        >
                            <h2>{{ balances.title }}</h2><h3>{{ $moment(balances.date).format('DD-MM-YYYY') }}</h3>
                        </th>
                    </tr>
                    <tr class="border-bottom">
                        <th class="no-bg display-table" />
                        <th class="center border-left">
                            {{ $t( 'modals.leaveBalance.tableHeaders.hours' ) }}
                        </th>
                        <th class="center">
                            {{ $t( 'modals.leaveBalance.tableHeaders.days' ) }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="typeof balanceData === 'object'">
                        <td class="no-bg display-table">
                            VAK
                        </td>
                        <td
                            v-if="!balances.balance_time_off"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getTimeClass(balances.balance_time_off.time)"
                        >
                            <span id="balance-time-off-time">{{ balances.balance_time_off.time }}</span>
                        </td>

                        <td
                            v-if="typeof balances.balance_time_off === 'undefined'"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getDayClass(balances.balance_time_off.days)"
                        >
                            <span id="balance-time-off-days">{{ balances.balance_time_off.days }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="no-bg display-table">
                            ATV
                        </td>
                        <td
                            v-if="!balances.balance_atv"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getTimeClass(balances.balance_atv.time)"
                        >
                            <span id="balance-atv-time">{{ balances.balance_atv.time }}</span>
                        </td>
                        <td
                            v-if="!balances.balance_atv"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getDayClass(balances.balance_atv.days)"
                        >
                            <span id="balance-atv-days">{{ balances.balance_atv.days }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="no-bg display-table">
                            TVT
                        </td>
                        <td
                            v-if="!balances.balance_compensation_hours"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getTimeClass(balances.balance_compensation_hours.time)"
                        >
                            <span id="balance-compensation-hours-time">{{ balances.balance_compensation_hours.time }}</span>
                        </td>
                        <td
                            v-if="!balances.balance_compensation_hours"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getDayClass(balances.balance_compensation_hours.days)"
                        >
                            <span id="balance-compensation-hours-days">{{ balances.balance_compensation_hours.days }}</span>
                        </td>
                    </tr>
                    <tr v-if="balances.total">
                        <td class="no-bg display-table">
                            Totaal
                        </td>

                        <td
                            v-if="!balances.total"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getTimeClass(balances.total.time)"
                        >
                            <span id="balance-total-time">{{ balances.total.time }}</span>
                        </td>

                        <td
                            v-if="!balances.total"
                            class="center border-left"
                        >
                            <span>---</span>
                        </td>
                        <td
                            v-else
                            class="center border-left"
                            :class="getDayClass(balances.total.days)"
                        >
                            <span id="balance-total-days">{{ balances.total.days }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <p>{{ $t( 'modals.leaveBalance.noData' ) }}</p>
        </div>
    </div>
</template>

<script>
import timeHelper from '@/libraries/timeHelper'
import { mapGetters, mapActions, mapState } from 'vuex'
import objectHelper from '@/libraries/objectHelper'

export default {
    computed: {
        ...mapGetters('auth', {
            currentUser: 'user',
            canFetchRDOBalances: 'canFetchRDOBalances',
        }),
        ...mapState('account', {
            balanceData: 'balances',
        }),
        ...mapGetters('locale', ['getLocale']),
        ...mapGetters('stores', ['currentStore']),
        getBalancesize () {
            return objectHelper.objectSize(this.balanceData)
        },
    },
    mounted () {
        if (this.canFetchRDOBalances) {
            this.updateBalance()
        }
    },
    methods: {
        ...mapActions('account', {
            getBalances: 'getBalances',
        }),
        getTimeClass (timeObj) {
            return timeHelper.getTimeCellClass(timeObj)
        },
        getDayClass (dayObj) {
            return timeHelper.getDayCellClass(dayObj)
        },
        getTableClass (tableObj) {
            return {
                scale3: tableObj === 3,
                scale2: tableObj === 2,
                scale1: tableObj === 1,
            }
        },
        updateBalance () {
            this.getBalances({})
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '../../assets/scss/_colors.scss';

    .leave-balance-table {
        margin-top: 10px !important;
    }

    .scale3 {
        display: inline-table;
        width: 27%;
    }
    .scale2 {
        display: inline-table;
        width: 40%;
    }
    .scale1 {
        display: inline-table;
        width: 81%;
    }

    .padded-text {
        padding-top: 10px;
        h2 {
            font-size: 1.25rem !important;
            font-weight: 600;
        }
        h3 {
            font-size: 1rem;
        }
    }
    .display-table {
        display:none;
    }
    .display-table {
        display:none;
    }
    .type-table {
        display: inline-table;
        width: 15%;
    }

    .leave-balance-modal {
        .table-title {
            margin-bottom: .25em;
        }
        .positive {
            color: $success-color;
        }
        .negative {
            color: $fail-color;
        }
        .table tbody tr:last-child td {
            font-weight: 800;
        }
    }

    @media only screen and (max-width: 700px) {
        .scale3 {
            display: inline-table;
            width: 100%;
            margin-bottom: 2em;
        }
        .scale2 {
            display: inline-table;
            width: 100%;
            margin-bottom: 2em;
        }
        .scale1 {
            display: inline-table;
            width: 100%;
            margin-bottom: 2em;
        }
        .display-table {
            display: unset;
        }
        .type-table {
            display:none;
        }
    }
</style>
