<template>
    <div
        v-touch="{left: () => $emit('swipe', 'left'), right: () => $emit('swipe', 'right')}"
        class="week-time-grid"
    >
        <table
            id="daygrid"
            class="time-table sticky-header-table"
            :class="{'scroll-shadow': scroll > 0}"
            @mouseleave="hoveredDay = 0"
        >
            <thead>
                <tr class="time-grid-header">
                    <th
                        v-tooltip="{content: weekTooltip, placement: 'top', trigger: 'focus hover click'}"
                        class="weekNr"
                    >
                        <chip
                            :text="`${weekNameFormat} ${week}`"
                            default
                            outline
                        />
                    </th>
                    <td
                        v-for="(day, index) in currentWeekDays"
                        :key="day + index"
                        colspan="1"
                        class="schedule-header-cells"
                        :class="{hovered: hoveredDay === day.format('D')}"
                    >
                        <div class="schedule-header-cells-day">
                            {{ $moment(day).format(dayNameFormat) }}
                        </div>
                        <div class="schedule-header-cells-date">
                            <span
                                v-if="!isSpecialRoute"
                                class="day-number"
                                :class="{today: $moment(day).isToday(), 'small-day': $moment(day).format('D') < 10}"
                            >{{ $moment(day).format('D') }}</span>
                        </div>
                    </td>
                </tr>
            </thead>
        </table>
        <table class="time-table">
            <!-- TODO make this whole table a div with CSS Grid display or refactor using CSS.
                 The <thead> below is just a hack. Had to keep the header to keep the ratio with the top sticky table.
             -->
            <thead style="opacity: 0; display: table-footer-group; height:0;">
                <tr class="time-grid-header">
                    <th class="weekNr">
                        <chip
                            :text="`${weekNameFormat} ${week}`"
                            default
                            outline
                        />
                    </th>
                    <td
                        v-for="(day, index) in currentWeekDays"
                        :key="day + index"
                        colspan="1"
                        class="schedule-header-cells"
                    >
                        <div class="schedule-header-cells-day">
                            {{ $moment(day).format(dayNameFormat) }}
                        </div>
                        <div class="schedule-header-cells-date">
                            <span
                                class="day-number"
                                :class="{
                                    today: $moment(day).isToday(),
                                    'small-day': $moment(day).format('D') < 10
                                }"
                            >{{ $moment(day).format('D') }}</span>
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(time, rowIndex) in getTimeRange()"
                    :key="time + rowIndex"
                    class="time-grid-row"
                >
                    <th :style="{ height: rowHeight + 'px', lineHeight: rowHeight + 'px' }">
                        <time
                            class="hovered-time-row"
                            :class="{
                                'hovered-time-row-from': hoveredTimeStart === time || ((hoveredTimeEnd < time && hoveredTimeEnd < '00:00') && hoveredTimeStart > time),
                                'hovered-time-row-to': hoveredTimeEnd === time,
                                'hovered-time-row-between': hoveredTimeEnd > time && hoveredTimeStart < time
                            }"
                        >
                            {{ time }}
                        </time>
                    </th>
                    <td
                        v-for="(day, index) in currentWeekDays"
                        :key="index"
                        colspan="1"
                        :style="{ height: rowHeight + 'px', lineHeight: rowHeight + 'px' }"
                        :class="timeCellClass(day, time, rowIndex)"
                        :cy_id="`${time}-${index}`"
                        @click.prevent="addNew(day, time, $event, rowIndex)"
                        @mouseover.self="showAdd(day, time, rowIndex)"
                        @mouseleave.self="hoveredIndex = null; hoveredTimeStart = null; hoveredTimeEnd = null"
                    >
                        <div
                            v-if="hoveredIndex === day.format() + time && showPlaceholder"
                            class="hovered-time-parent"
                        >
                            <div :class="isInsideBusinessTimes(day, time, rowIndex) ? 'hovered-time' : 'hovered-time-disabled text-error'">
                                <component
                                    :is="isInsideBusinessTimes(day, time, rowIndex) ? 'plus' : 'cancel'"
                                    :size="18"
                                />
                            </div>
                        </div>

                        <div
                            v-if="rowIndex === 0"
                            class="time-blocks"
                            @mouseover="hoveredIndex = null"
                        >
                            <pmt-time-blocks
                                v-if="!loading"
                                ref="timeBlocks"
                                :time-blocks="timeBlocksForDate(day)"
                                :start-time="gridHours.from"
                                :end-time="gridHours.to"
                                :step="step"
                                :row-height="rowHeight"
                                :is-new-weekset="newWeekset"
                                @on-click="handleTimeBlockClick($event)"
                                @block-hover="hoveredTimeStart = $event.startTime, hoveredTimeEnd = $event.endTime, hoveredDay = $event.date.format('D')"
                            />

                            <div
                                v-show="isCurrentTimeLineVisible(index + 1) && !newWeekset"
                                ref="currentHourLine"
                                class="current-hour"
                            >
                                <div class="left" />
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import timeBlockHelper from '@/libraries/timeBlockHelper'
import baseTimeGrid from './BaseTimeGrid'
import PmtTimeBlocks from './TimeBlocks.vue'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'

export default {
    components: {
        PmtTimeBlocks,
    },
    mixins: [baseTimeGrid],
    props: {
        startTime: {
            type: String,
            default: '7:30',
        },
        endTime: {
            type: String,
            default: '22:00',
        },
        step: {
            type: Number,
            default: 60, // in minutes
        },
        newWeekset: {
            type: Boolean,
            default: false,
        },
        customWeek: {
            type: [Number, String],
            default: undefined,
        },
        customYear: {
            type: [Number, String],
            default: undefined,
        },
        loading: Boolean,
    },
    data: () => ({
        currentTimeLineTimer: null,
        rowHeight: 50.4, // change this if CSS for time grid changes
        hoveredIndex: null,
        hoveredTimeStart: null,
        hoveredTimeEnd: null,
        hoveredDay: 0,
        showPlaceholder: false,
    }),
    computed: {
        ...mapGetters('locale', { locale: 'getLocale' }),
        ...mapGetters('auth', ['canYou', 'canAddAvailability', 'user']),
        ...mapState('availability', [
            'availabilityEmployeeId',
        ]),
        ...mapGetters('availability', {
            timeBlocksForDate: 'getTimeBlocksForDate',
        }),
        ...mapGetters('stores', {
            storeDayBusinessTimes: 'storeDayBusinessTimes',
        }),
        ...mapGetters({
            isMobile: 'IS_MOBILE',
            pageWidth: 'PAGE_WIDTH',
            scroll: 'GET_SCROLL_POSITION',
        }),
        gridHours () {
            if (!this.isSpecialRoute) {
                return {
                    from: this.gridHoursFromBlocks.start < this.startTime ? this.gridHoursFromBlocks.start : this.startTime,
                    to: this.gridHoursFromBlocks.end > this.endTime ? this.gridHoursFromBlocks.end : this.endTime,
                }
            }
            return {
                from: '00:00',
                to: '24:00',
            }
        },

        /**
         * Gets start and end time from blocks to be displayed in the grid.
         * It ignores the full-day blocks, it takes into account only the blocks that are totally out of business times,
         * in order to extend the grid to also show those blocks.
         */
        gridHoursFromBlocks () {
            let lowestStartTime = '23:59'
            let highestEndTime = '00:00'

            this.availabilityTimeBlocks.forEach((timeBlock, index) => {
                if (timeBlockHelper.isBlockFullDay(timeBlock) || !this.blockIsOutsideBusinessTimes(timeBlock, index)) {
                    return
                }
                if (timeBlock.timeFrom < lowestStartTime) {
                    lowestStartTime = timeBlock.timeFrom
                }
                if (timeBlock.timeTo > highestEndTime) {
                    highestEndTime = timeBlock.timeTo
                }
            })

            return {
                start: lowestStartTime,
                end: highestEndTime,
            }
        },

        week () {
            return parseInt(this.customWeek || this.$route.params.week)
        },
        year () {
            return parseInt(this.customYear || this.$route.params.year)
        },
        weekTooltip () {
            const start = this.weekStartEndDate('start')
            const end = this.weekStartEndDate('end')
            return this.$moment().intervalReadableFormat(start, end)
        },
        dayNameFormat () {
            return this.pageWidth < 420 ? 'dd' : this.isMobile ? 'ddd' : 'dddd'
        },
        weekNameFormat () {
            return this.isMobile ? 'W' : this.$t('ui.singles.week')
        },
        currentWeekDays () {
            let calendar = []
            const startDay = this.weekStartEndDate('start')
            const endDay = this.weekStartEndDate('end')
            const date = startDay.clone().subtract(1, 'day')
            while (date.isBefore(endDay, 'day')) {
                calendar = Array(7).fill(0).map(() => date.add(1, 'day').clone())
            }

            return calendar
        },
        isSpecialRoute () {
            return this.$cfg.specialAvailabilityRoutes.includes(this.$route.name)
        },
    },
    updated () {
        this.initCurrentHourLine()
    },
    mounted () {
        this.initCurrentHourLine()
        this.resetPopovers()
        this.UPDATE_SCROLL_POSITION()
    },
    beforeDestroy () {
        this.stopCurrentHourLine()
    },
    methods: {
        ...mapMutations('availability', ['resetPopovers']),
        ...mapMutations({
            UPDATE_SCROLL_POSITION: 'UPDATE_SCROLL_POSITION',
        }),
        ...mapMutations(['SET_SNACKBAR']),
        /**
         * Returns the main store business times on a given day
         * @param {Moment} day
         */
        dayBusinessTimes (day) {
            return this.storeDayBusinessTimes(day, this.isSpecialRoute)
        },
        /**
         * Returns whether the time is inside business hours
         * @param {Moment} day
         * @param {String} time
         * @param {String} index
         */
        isInsideBusinessTimes (day, time, index) {
            if (this.isSpecialRoute) {
                return true
            }
            const businessFrom = day.clone().setTime(this.dayBusinessTimes(day).from).add(1, 'hours')
            const businessTo = day.clone().setTime(this.dayBusinessTimes(day).to)
            const current = day.clone().setTime(index > 1 && time === '00:00' ? '23:59' : time)
            return (current.isAfter(businessFrom, 'hour') || current.isSame(businessFrom, 'hour')) && (current.isBefore(businessTo, 'minute') || current.isSame(businessTo, 'minute'))
        },

        /**
         * Returns true if block is totally outside the business times of the store.
         *
         * @param {Object} block
         * @param {Integer|String} index
         * @returns {boolean}
         */
        blockIsOutsideBusinessTimes (block, index) {
            const day = this.$moment(block.date)
            return !this.isInsideBusinessTimes(day, block.timeFrom, index) && !this.isInsideBusinessTimes(day, block.timeTo, index)
        },

        weekStartEndDate (mode) {
            return mode === 'start'
                ? this.$moment().isoWeekYear(this.year).isoWeek(this.week).startOf('isoWeek')
                : this.$moment().isoWeekYear(this.year).isoWeek(this.week).endOf('isoWeek')
        },
        addNew (day, time, event, rowIndex) {
            if (this.hoveredIndex === day.format() + time && this.showPlaceholder && this.isInsideBusinessTimes(day, time, rowIndex)) {
                this.createNewAvailability(day, event, time)
            }
            // display message when clicked time is not within business times for this day
            // message will not display when clicking past times (from now)
            if (this.hoveredIndex === day.format() + time && this.showPlaceholder && !this.isInsideBusinessTimes(day, time, rowIndex)) {
                this.SET_SNACKBAR({ message: this.$t('forms.availabilityEntry.validationMsg.outsideBusinessTimes'), error: true })
            }
        },
        showAdd (day, time, rowIndex) {
            const allowedTimes = this.getTimeRange()
            const isHoverAllowed = allowedTimes.includes(time)
            if ((this.$route.name === 'view-weekset' || this.$route.name === 'manager-view-weekset') || (this.isSpecialRoute && this.hasTimeBlocks(day, time))) {
                /**
                 * Do not show the add button
                 * - when viewing a weekset
                 * - when editing a weekset,
                 * and there is already a timeblock
                 * on the provided method day and time
                 */
                return false
            } else if (this.hasSingleTimeBlocks(day, time)) {
                /**
                 * Do not show the add button when adding overlapping on a single availability
                 */
                return false
            }

            if (
                (
                    (!this.isPastWeekday(day) || (this.isPastWeekday(day) && this.canEditOthersAvailabilities)) &&
                    !!isHoverAllowed &&
                    !(rowIndex === 0) &&
                    this.canAddAvailability
                ) ||
                (
                    isHoverAllowed &&
                    !(rowIndex === 0) &&
                    this.canAddAvailability &&
                    this.isSpecialRoute
                )
            ) {
                this.hoveredDay = day.format('D')
                this.showPlaceholder = true
                this.hoveredTimeStart = this.$moment(time, 'HH:mm').subtract(this.step, 'minutes').format('HH:mm')
                this.hoveredTimeEnd = time
                this.hoveredIndex = day.format() + time
            }
        },
        createNewAvailability (date, event, time) {
            this.showPlaceholder = false
            this.hoveredIndex = null
            this.openNewAvailability(date, event, time, this.isSpecialRoute)
        },
        hasTimeBlocks (day, time, kind) {
            const timeblockItems = this.timeBlocksForDate(day)
            if (timeblockItems.length) {
                const referrenceTime = this.$moment(time, 'HH')
                for (let i = 0; i < timeblockItems.length; i++) {
                    const startTime = this.$moment(timeblockItems[i].timeFrom, 'HH:mm').add(1, 'hour')
                    const endTime = this.$moment(timeblockItems[i].timeTo, 'HH:mm')
                    if (referrenceTime.isBetween(startTime, endTime) || referrenceTime.isSame(startTime) || referrenceTime.isSame(endTime)) {
                        return true
                    }
                    if ((referrenceTime.isBetween(startTime, endTime) || referrenceTime.isSame(startTime) || referrenceTime.isSame(endTime)) && !timeblockItems[i].repeat) {
                        return true
                    }
                }
            }
            return false
        },
        hasSingleTimeBlocks (day, time, kind) {
            const timeblockItems = this.timeBlocksForDate(day)
            if (timeblockItems.length) {
                const referrenceTime = this.$moment(time, 'HH')
                for (let i = 0; i < timeblockItems.length; i++) {
                    const startTime = this.$moment(timeblockItems[i].timeFrom, 'HH:mm').add(1, 'hour')
                    const endTime = this.$moment(timeblockItems[i].timeTo, 'HH:mm')
                    if ((referrenceTime.isBetween(startTime, endTime) || referrenceTime.isSame(startTime) || referrenceTime.isSame(endTime)) && !timeblockItems[i].repeat) {
                        return true
                    }
                }
            }
            return false
        },
        isBeforeNow (day, time) {
            const now = this.$moment().setTime(time)
            return !!day.isBefore(now.apiFormat(), 'minute')
        },
        ...mapActions('availability', {
            getWeekAvailability: 'getWeekAvailability',
        }),
        ...mapState('availability', {
            weekAvailability: 'weekAvailability',
            weekset: 'weekSet',
        }),
        getTimeRange () {
            return this.$moment().clone().timeRange(this.gridHours.from, this.gridHours.to, this.step, 'minutes')
        },
        isCurrentTimeLineVisible (weekDay) {
            if (!this.isCurrentHourInRange()) {
                return false
            }
            const date = this.$moment(weekDay, 'd').isoWeek(this.week).isoWeekYear(this.year).startOf('day')
            return date.isSame(this.$moment().startOf('day'), 'day')
        },
        isATimeLineVisible () {
            for (let i = 0; i < 7; i++) {
                if (this.isCurrentTimeLineVisible(i)) {
                    return true
                }
            }
            return false
        },
        isPastWeekday (day) {
            return day.isBefore(this.$moment(), 'day')
        },
        isCurrentHourInRange () {
            return this.$moment().isBeforeTime(this.endTime)
        },
        updateCurrentTimeLine () {
            if (!this.newWeekset) {
                const currentTime = this.$moment().shortTime()
                const line = this.$refs.currentHourLine[this.$moment().appWeekday()]
                if (typeof line === 'undefined') {
                    return
                }
                if (!this.isCurrentHourInRange()) {
                    this.stopCurrentHourLine()
                    return
                }
                line.style.display = 'block'
                line.style.top = timeBlockHelper.getTimeBlockCssTopPosition(currentTime, this.gridHours.from, this.rowHeight, this.step)
            }
        },
        stopCurrentHourLine () {
            clearInterval(this.currentTimeLineTimer)
        },
        initCurrentHourLine () {
            if (!this.isATimeLineVisible()) {
                return
            }
            this.$nextTick(() => {
                this.updateCurrentTimeLine()

                this.currentTimeLineTimer = setInterval(() => {
                    this.updateCurrentTimeLine()
                }, 30000)
            })
        },
        timeCellClass (day, time, rowIndex) {
            const isPast = this.isPastWeekday(day) && this.isBeforeNow(day, time)
            const isFirstRow = rowIndex === 0 && time === '00:00'
            return {
                highlight: (isPast && !this.isSpecialRoute) || isFirstRow || (!this.isSpecialRoute && !this.isInsideBusinessTimes(day, time, rowIndex)),
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/pages/planning/availability/Styling/week-calendar.scss';
    @media print { td { -webkit-print-color-adjust: exact; } }
</style>
