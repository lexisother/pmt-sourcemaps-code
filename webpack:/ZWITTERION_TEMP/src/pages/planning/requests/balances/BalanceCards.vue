<template>
    <div
        v-if="getBalancesize && canMakeApiCall"
        class="balance-cards"
    >
        <div
            v-for="(balances, index) in balanceData"
            :key="index"
            :cols="getBalanceAmount"
            class="balance-card"
        >
            <div
                ref="balanceCard"
                v-tooltip="{
                    content: $moment(balances.date).longDayFormat(),
                    hideOnTargetClick: true,
                    placement: 'top',
                    trigger: 'focus hover click'
                }"
                class="balance-card-ref"
                :class="[getTimeClass(balances.balance_time_off.time), index, 'card', 'rounded']"
                @click="clicked = !clicked"
            >
                <span class="balances-title">{{ balances.title }} (VAK)</span>
                <div>
                    <span class="big time-value">{{ !clicked ? balances.balance_time_off.time : balances.balance_time_off.days }}</span>
                    <span class="time-type">{{ !clicked ? $t('pages.rdoOverview.hours') : $t('pages.rdoOverview.days') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import timeHelper from '@/libraries/timeHelper'
import { mapGetters, mapActions, mapState } from 'vuex'
import objectHelper from '@/libraries/objectHelper'
export default {
    name: 'BalanceCards',
    data () {
        return {
            clicked: false,
        }
    },
    computed: {
        ...mapState('account', {
            balanceData: 'balances',
        }),
        ...mapGetters('stores', ['currentStore']),
        ...mapGetters('auth', {
            canYou: 'canYou',
            hasVak: 'hasVak',
            hasTvt: 'hasTvt',
            hasAtv: 'hasAtv',
            hasBalances: 'hasBalances',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        /**
         * Returns true if user can make the api call:
         * - current store has balances module on
         * - current user has "show_VAK" user right on
         *
         * API call can be made if user has one of these rights: show_atv, show_tvt, show_vak, but on this card we only
         * show VAK, so check only that one.
         *
         * @returns {*|boolean}
         */
        canMakeApiCall () {
            return this.hasBalances && this.hasVak
        },
        showIndicative () {
            return this.canYou('planning', 'show_indicative_balances_on_page_verlof_aanvragen')
        },
        getBalancesize () {
            return objectHelper.objectSize(this.balanceData)
        },
        getBalanceAmount () {
            const check = this.getBalancesize
            switch (check) {
                case 3:
                    return '4'
                case 2:
                    return '6'
                case 1:
                    return '12'
            }
            return '12'
        },
    },
    mounted () {
        this.updateBalance()
    },
    methods: {
        ...mapActions('account', {
            getBalances: 'getBalances',
        }),
        updateBalance () {
            if (!Object.keys(this.balanceData).length && this.canMakeApiCall) {
                const payload = {
                    showIndicative: this.showIndicative,
                }
                this.getBalances(payload)
            }
        },
        getTimeClass (time) {
            return timeHelper.getTimeCellClass(time)
        },
    },
}
</script>

<style scoped lang="scss">
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/shaddows.scss';
    .balance-cards {
        display: flex;
        align-content: center;
        justify-content: flex-start;
        gap: 15px;
        padding: 15px;
        .balance-card {
            width: 150px;
        }
    }
    .card {
        padding: 1px;
        text-align: center;
        line-height: 25px;
        cursor: pointer;
        &.positive {
            border: 1px solid $success-color;
            color: $success-color;
            &:active {
                background-color: lighten($success-color, 65%);
                box-shadow: $shaddow-inset-2p;
            }
        }
        &.negative {
            border: 1px solid $fail-color;
            color: $fail-color;
            &:active {
                background-color: lighten($fail-color, 35%);
                box-shadow: $shaddow-inset-2p;
            }
        }
        span{
            font-size: 0.8em;
        }
        .big {
            font-size: 1.35em;
            font-weight: 700;
            display: block;
        }
    }
</style>
