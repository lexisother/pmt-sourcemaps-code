<template>
    <div>
        <div
            id="daygrid"
            class="day-grid"
            :class="{'scroll-shadow': scroll > 0}"
        >
            <div
                v-for="(day, index) in calendar[0]"
                :key="index"
                class="text-normal day-grid-name"
            >
                {{ $moment(day).format(IS_MOBILE ? 'dd' : 'dddd') }}
            </div>
        </div>
        <div
            v-touch="{left: () => $emit('swipe', 'left'), right: () => $emit('swipe', 'right')}"
            class="calendar-container"
        >
            <div class="calendar">
                <template v-for="(weekdays, weekdaysIndex) in calendar">
                    <div
                        v-for="(day, index) in weekdays"
                        :key="index + weekdaysIndex + day.format('dddd') + day.format('mmmm')"
                        class="day"
                        :class="{'day--disabled': isPast(day), today: isToday(day)}
                        "
                    >
                        <div
                            v-if="canAdd(day)"
                            class="hovered-time"
                            @click="openNewAvailability(day.toDate(), $event)"
                        />
                        <span
                            v-if="differentMonth(day) && monthFormat"
                            class="different-month"
                        >
                            {{ $moment(day).format('MMM') }}
                        </span>
                        <span :class="[{'day-number-next-month': differentMonth(day), 'day-small': day.format('D') < 10}, dayFormat]">
                            {{ $moment(day).format('D') }}
                        </span>
                        <PmtTimeBlockStack
                            ref="timeblockStack"
                            :time-blocks="getTimeBlocksForDate(day)"
                            @on-click="handleTimeBlockClick($event)"
                        />
                        <p
                            v-if="getTimeBlocksForDate(day).length > 3"
                            class="show-more"
                            @click="openShowMore(getTimeBlocksForDate(day), day.format('LL'))"
                        >
                            +{{ getTimeBlocksForDate(day).length - 3 }} more
                        </p>
                    </div>
                </template>

                <PmtModal
                    ref="calendarEnabled"
                    class="month-day-modal"
                    :hide-on-overlay-click="true"
                >
                    <ul class="month-day-modal-stack">
                        <PmtTimeBlock
                            v-for="(timeBlock, index) in modalTimes"
                            :key="index"
                            :time-block="timeBlock"
                        />
                    </ul>
                </PmtModal>
            </div>
        </div>
    </div>
</template>
<script>
import baseTimeGrid from './BaseTimeGrid.js'
import browserHelper from '@/libraries/browserHelper'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'

export default {
    components: {
        PmtTimeBlockStack: () => import('./TimeBlockStack.vue'),
        PmtTimeBlock: () => import('./TimeBlock.vue'),
    },
    mixins: [baseTimeGrid],
    props: {
        scroll: {
            type: Number,
            default: 0,
        },
    },
    data: () => ({
        modalTimeBlocks: null,
        modalTimes: [],
    }),
    computed: {
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('availability', {
            timeBlocks: 'availabilityTimeBlocks',
            getTimeBlocksForDate: 'getTimeBlocksForDate',
        }),
        ...mapState('availability', {
            availabilityDate: 'availabilityDate',
        }),
        calendar () {
            return this.$moment(this.availabilityDate).toCalendarArray('month')
        },
        dayFormat () {
            return `day-number-month${this.IS_MOBILE ? '-small' : ''}`
        },
        monthFormat () {
            return !this.IS_MOBILE
        },
        isIE () {
            return browserHelper.isInternetExplorer() && browserHelper.isInternetExplorer(true) < 12
        },
    },
    mounted () {
        if (this.isIE) {
            const daygrid = document.getElementById('daygrid')
            const parentElement = document.getElementsByClassName('availability-layout')[0]
            parentElement.insertBefore(daygrid, parentElement.children[1])
        }
    },
    methods: {
        ...mapActions('availability', {
            getAvailabilityForMonth: 'getAvailabilityForMonth',
        }),
        ...mapMutations(['SET_SNACKBAR']),
        isPast (day) {
            return day.isBefore(this.$moment().startOf('day'))
        },
        isToday (day) {
            return day.isSame(this.$moment(), 'day')
        },
        canAdd (day) {
            if (this.canEditOthersAvailabilities) {
                return true
            }
            return !this.isPast(day) || this.isToday(day)
        },
        differentMonth (day) {
            return this.$moment(day).format('M') !== this.$moment(this.availabilityDate).format('M')
        },
        openShowMore (data, title) {
            this.$refs.calendarEnabled.show(title)
            this.modalTimes = data
        },
    },
}
</script>

<style lang='scss' scoped>
    @import '@/pages/planning/availability/Styling/month-calendar.scss';
</style>
