<template>
    <div class="page">
        <TopBar
            v-if="!IS_MOBILE"
            ref="topbar"
            show-find-substitutes
            show-request-time-off
            show-print
            class="d-print-none"
        />
        <PmtLayout fixed-height>
            <Tabs
                :tabs="tabs"
                :action-items="actionItems"
                @request-rdo="requestDayOff"
                @find-replacement="findSubstitutes"
                @print="print"
            >
                <template slot="tabs-content">
                    <div v-if="canFindSubstitutes && (!$route.query.path || $route.query.path === 'substitute_requests_tab')">
                        <SubstituteRequests @find-substitutes="findSubstitutes()" />
                    </div>
                    <template v-if="hasRdoAccess">
                        <div
                            v-if="showRdoTabWithBalances"
                            class="rdos-tabs"
                        >
                            <LeaveSplit
                                v-if="showLeaveSplitBalances"
                                ref="leaveSplit"
                                :current-balances="currentBalances"
                                :end-of-year-balances="endOfYearBalances"
                            />
                            <BalanceCards v-else />
                            <Tabs
                                :tabs="rdoTabs"
                                :active-tab="rdoActiveTab"
                                child
                                @on-click="rdoActiveTab = $event"
                            >
                                <template slot="tabs-content">
                                    <div v-show="rdoActiveTab === 'rdo_request_sub'">
                                        <MyRdoOverview
                                            ref="rdos"
                                            @requestDayOff="requestDayOff()"
                                        />
                                    </div>
                                    <div v-show="rdoActiveTab === 'balance_history_sub'">
                                        <BalanceHistory
                                            ref="balanceHistory"
                                            @hide-balances-tab="hideBalancesTab = $event"
                                        />
                                    </div>
                                </template>
                            </Tabs>
                        </div>
                        <div v-else-if="$route.query.path === 'rdo_requests_tab' ">
                            <LeaveSplit
                                v-if="showLeaveSplitBalances"
                                ref="leaveSplit"
                                :current-balances="currentBalances"
                                :end-of-year-balances="endOfYearBalances"
                            />
                            <BalanceCards v-else />
                            <MyRdoOverview
                                ref="rdos"
                                @requestDayOff="requestDayOff()"
                            />
                        </div>
                    </template>
                </template>
            </Tabs>
            <SubstituteRequestModal ref="substituteRequestModal" />
            <RdoRequestModal ref="rdoRequestModal" />
        </PmtLayout>
    </div>
</template>

<script>
import TopBar from '@/components/ui/top-bar/TopBar.vue'
import SubstituteRequestModal from '@/components/modals/substitute-request/SubstituteRequestModal.vue'
import RdoRequestModal from '@/components/modals/RdoRequestModal.vue'
import SubstituteRequests from '@/pages/planning/requests/MySubstituteRequests.vue'
import MyRdoOverview from '@/pages/planning/requests/MyRdoOverview.vue'
import BalanceHistory from '@/pages/planning/requests/balances/BalanceHistory'
import LeaveSplit from '@/pages/planning/requests/balances/LeaveSplit'
import BalanceCards from '@/pages/planning/requests/balances/BalanceCards'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
    name: 'MyRequests',
    components: {
        TopBar,
        SubstituteRequests,
        MyRdoOverview,
        SubstituteRequestModal,
        RdoRequestModal,
        BalanceHistory,
        LeaveSplit,
        BalanceCards,
    },
    data () {
        return {
            rdoActiveTab: 'rdo_request_sub',
            hideBalancesTab: false,
        }
    },
    computed: {
        ...mapGetters('auth', {
            canFindSubstitutes: 'canFindSubstitutes',
            canRequestTimeOff: 'canRequestTimeOff',
            hasTimeOffAccess: 'hasTimeOffAccess',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('auth', {
            hasBalances: 'hasBalances',
            hasBalancesHistory: 'hasBalancesHistory',
            hasVak: 'hasVak',
            hasTvt: 'hasTvt',
            hasAtv: 'hasAtv',
            permissions: 'permissions',
            user: 'user',
        }),
        ...mapGetters('schedules', ['ACCOUNT_BALANCES', 'END_OF_YEAR_ACCOUNT_BALANCE']),
        showLeaveSplitBalances () {
            // hidden for now as there is still work to be done in the api.
            // see https://retail-solutions.atlassian.net/browse/PMT3-9710
            return false
        },
        hasRdoAccess () {
            return this.hasTimeOffAccess && this.canRequestTimeOff
        },

        currentBalances () {
            return this.ACCOUNT_BALANCES
        },

        endOfYearBalances () {
            return this.END_OF_YEAR_ACCOUNT_BALANCE
        },

        hasBalanceAccess () {
            console.log(this.hasBalances, this.hasBalancesHistory, (this.hasVak || this.hasAtv || this.hasTvt), !this.hideBalancesTab)
            return this.hasBalances && this.hasBalancesHistory && (this.hasVak || this.hasAtv || this.hasTvt) && !this.hideBalancesTab
        },

        showRdoTabWithBalances () {
            return this.hasBalanceAccess && this.$route.query.path === 'rdo_requests_tab'
        },

        /**
         * Create main tabs available for current user.
         *
         * @returns {Array}
         */
        tabs () {
            const tabs = []
            if (this.canFindSubstitutes) {
                tabs.push({ name: this.$t('pages.requests.tabs.substitute.label'), id: 'substitute_requests_tab' })
            }
            if (this.hasRdoAccess) {
                tabs.push({ name: this.$t('pages.requests.tabs.rdo.label'), id: 'rdo_requests_tab' })
            }

            return tabs
        },

        /**
         * Create sub-tabs for rdo main tab
         *
         * @returns {Array}
         */
        rdoTabs () {
            return [
                { name: this.$t('pages.requests.tabs.rdo.label'), id: 'rdo_request_sub' },
                { name: this.$t('pages.requests.tabs.balanceHistory.label'), id: 'balance_history_sub' },
            ]
        },
        actionItems () {
            return [
                {
                    action: 'find-replacement',
                    label: this.$t('pages.mySchedule.topbar.substituteRequestBtn.label'),
                    simple: true,
                    icon: 'account-switch',
                },
                {
                    action: 'request-rdo',
                    label: this.$t('pages.mySchedule.topbar.rdoBtn.label'),
                    simple: true,
                    icon: 'timer-sand',
                },
                {
                    action: 'print',
                    label: this.$t('pages.mySchedule.topbar.print.label'),
                    simple: true,
                    icon: 'printer',
                },
            ]
        },
    },
    mounted () {
        if (this.hasBalanceAccess) {
            this.loadCurrentBalances()
            this.loadEndOfYearBalance()
        }
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('schedules', ['getAccountBalancesForDay', 'getEndOfYearBalance']),
        findSubstitutes () {
            this.$refs.substituteRequestModal.open()
        },
        requestDayOff () {
            this.$refs.rdoRequestModal.open()
        },
        print () {
            setTimeout(() => {
                window.print()
            }, 100)
        },
        loadCurrentBalances () {
            this.getAccountBalancesForDay({
                day: this.$moment(),
                accountId: this.user.accountId,
            }).catch(err => {
                this.SET_SNACKBAR({ error: true, message: err.message })
            })
        },
        loadEndOfYearBalance () {
            this.getEndOfYearBalance({
                day: this.$moment().endOf('year'),
                accountId: this.user.accountId,
            }).catch(err => {
                this.SET_SNACKBAR({ error: true, message: err.message })
            })
        },
    },
}
</script>
