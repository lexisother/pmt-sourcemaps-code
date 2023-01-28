<template>
    <td
        ref="day"
        v-tooltip="tooltip"
        :class="classes"
        :cy_id="day.euFormat()"
        @click="click"
        @mouseover="hoverTheRange"
    >
        <slot
            name="day"
            :day="day"
        >
            <span>{{ day.format('D') }}</span>
        </slot>
    </td>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {

    name: 'DatepickerWeekDay',

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
        day: Object,
    },

    computed: {
        /**
         * The class list of each week day cell
         * @returns {Object}
         */
        classes () {
            return {
                'day-cell': true,
                'other-month': this.day.differentMonth() && (this.datepicker.localSelectedDate.month() !== this.day.month()),
                selected: this.isDaySelected,
                'is-range': this.isInsideRange,
                'is-range-start': this.isRangeStart,
                'is-range-end': this.isRangeEnd,
                'is-today': this.day.isToday(),
                'is-today-small': this.day.isToday() && (parseInt(this.day.format('D')) < 10),
                disabled: !this.isDateInRange(this.day),
            }
        },
        /**
         * Check if the provided day should appear as selected
         * @param {Object|Moment} day
         * @returns {Boolean}
         */
        isDaySelected () {
            const isDateSelected = this.datepicker.isSelected
            const sameLocalDay = this.datepicker.localSelectedDate.isSame(this.day, 'day')
            const sameFromToDay = this.day.isSame(this.datepicker.selectedDateFrom, 'day') || this.day.isSame(this.datepicker.selectedDateTo, 'day')
            const corectMode = this.datepicker.mode === 'day'
            const isRange = this.datepicker.isRangePicker
            return (isDateSelected && sameLocalDay && corectMode && !isRange) || (isRange && sameFromToDay)
        },
        /**
         * Check if the provided day is inside the selected range or hovered range
         * @param {Object|Moment} day
         * @returns {Boolean}
         */
        isInsideRange () {
            const isRange = this.datepicker.isRangePicker
            const afterOrSameAsFrom = this.day.isAfterOrSameDayAs(this.datepicker.selectedDateFrom)
            const beforeOrSameAsTo = this.day.isBeforeOrSameDayAs(this.datepicker.selectedDateTo)
            const dayIsHoveredInRange = this.datepicker.hoveredRangeDay && this.datepicker.firstSelected && this.day.isBeforeOrSameDayAs(this.datepicker.hoveredRangeDay, 'day')
            return isRange && afterOrSameAsFrom && (beforeOrSameAsTo || dayIsHoveredInRange)
        },
        /**
         * Check if the day is the start of the range
         * @returns Boolean
         */
        isRangeStart () {
            const isSame = this.day.isSame(this.datepicker.selectedDateFrom, 'day')
            const isBefore = this.day.isBefore(this.datepicker.selectedDateTo, 'day')
            return this.datepicker.isRangePicker && isSame && isBefore
        },
        /**
         * Check if the day is the end of the range
         * @returns Boolean
         */
        isRangeEnd () {
            const isSame = this.day.isSame(this.datepicker.selectedDateTo, 'day')
            const isAfter = this.day.isAfter(this.datepicker.selectedDateFrom, 'day')
            return this.datepicker.isRangePicker && isSame && isAfter
        },
        /**
         * If the first range item is selected a hover is displayed for each hovered day.
         * The count of the days is calculated in here.
         * @param {Object|Moment} day
         * @returns {String}
         */
        tooltip () {
            if (this.day.isAfter(this.datepicker.selectedDateFrom, 'day') && this.datepicker.firstSelected) {
                const daysCount = this.day.diff(this.datepicker.selectedDateFrom, 'days') + 1
                const sufix = daysCount > 1 ? ` ${this.$t('components.datepicker.days')}` : ` ${this.$t('components.datepicker.day')}`
                return daysCount + sufix
            }
            return ''
        },
    },

    methods: {
        /**
         * Sets a day as hovered.
         * Logic is the next day after this will know that it will be the next day in a range
         */
        hoverTheRange () {
            if (this.day.isAfter(this.datepicker.selectedDateFrom, 'day') && this.datepicker.firstSelected) {
                this.update({
                    hoveredRangeDay: this.day,
                })
            }
        },
        /**
         * Action taken when a day cell is clicked
         */
        click () {
            if (this.options.mode !== 'day') {
                return
            }
            if (!this.isDateInRange(this.day)) {
                return
            }
            if (this.datepicker.isRangePicker) {
                this.rangeDayClick()
                return
            }
            this.update({
                localSelectedDate: this.day,
                selectedDate: this.day.clone(),
                navigationDay: this.day.clone(),
                show: false,
            })
            this.emitSelect(this.day)
            // change the route if needed
            if (this.datepicker.handleRoute) {
                this.updateBrowserPath(this.day)
            }
        },
        /**
         * Handles logic for the day range selection
         * @param {Object|Moment}
         */
        rangeDayClick () {
            this.update({
                selectedPredefinedRange: '', // reset any selected predefined range
            })
            if (!this.datepicker.firstSelected) {
                // we set the first date from range as selected
                this.update({
                    selectedDateFrom: this.day,
                    selectedDateTo: this.day,
                    firstSelected: true,
                })
            } else {
                // second date from range is selected
                const isBefore = this.day.isBefore(this.datepicker.selectedDateFrom, 'day') || this.day.isBefore(this.datepicker.selectedDateFrom, 'isoWeek')
                if (isBefore) {
                    // reset the range if the second date clicked is before the first selected date
                    // this is basically forcing this method to the previous step on the next day click
                    this.update({
                        selectedDateFrom: this.day,
                        selectedDateTo: this.day.clone(),
                        selectedDate: this.day.clone(),
                        localSelectedDate: this.day.clone(),
                        navigationDay: this.day.clone(),
                    })
                } else {
                    // select the second date in range
                    this.update({
                        firstSelected: false,
                        selectedDateTo: this.day,
                        navigationDay: this.day.clone(),
                        selectedDate: this.day.clone(),
                        show: !this.options.closeOnRangeSelect, // hides the menu on second range click when this option is provided
                    })
                    this.emitSelect({
                        from: this.datepicker.selectedDateFrom,
                        to: this.datepicker.selectedDateTo,
                    })
                }
            }
        },
    },
}
</script>
