<template>
    <!--
        Default datepicker activator that will open the datepicker.
        Can be replaced with custom activaors like div or input.
        If overwriten and intend is to use also navigation buttons,
        those will have to be manually put in the parent as well
    -->
    <div
        v-tooltip="options.tooltip"
        :class="{'bar-menu-button bar-item': datepicker.showNavigation}"
    >
        <template v-if="datepicker.showNavigation">
            <DatepickerNavigationButton
                ref="previous"
                :datepicker="datepicker"
                nav-type="previous"
                :disabled="disabledNavigation('previous') || options.disabled"
                @click="navigate($event)"
            />
            <DatepickerNavigationButton
                v-if="datepicker.inlineNavigationButtons"
                ref="next"
                :datepicker="datepicker"
                nav-type="next"
                :disabled="disabledNavigation('next') || options.disabled"
                @click="navigate($event)"
            />
        </template>
        <PmtButton
            ref="dateBtn"
            v-ripple
            :icon="activatorIcon"
            :primary="datepicker.activator.primary || datepicker.showNavigation"
            :inverted="datepicker.activator.inverted || datepicker.showNavigation"
            :secondary="datepicker.activator.secondary"
            :success="datepicker.activator.success"
            :warning="datepicker.activator.warning"
            :danger="datepicker.activator.danger"
            :default="datepicker.activator.default"
            :outline="datepicker.activator.outline"
            :block="datepicker.activator.block"
            :disabled="options.disabled"
            :disabled-simple="datepicker.activator.disabledSimple || datepicker.showNavigation"
            :no-margin="datepicker.activator.noMargin"
            :medium="datepicker.activator.medium"
            :active="value"
            cy_id="open-datepicker"
            v-on="on"
        >
            <div class="datepicker-activator-content">
                <slot
                    name="selected-date-text"
                    :date="datepicker.selectedDate"
                    :range="{
                        from: datepicker.selectedDateFrom,
                        to: datepicker.selectedDateTo
                    }"
                    :placeholder="$t('components.datepicker.selectDate')"
                >
                    <div
                        :key="activatorTextKey"
                        :class="pickerTextClasses"
                    >
                        <span>{{ datepicker.isRangePicker && datepicker.isSelected ? rangeText(!IS_MOBILE) : currentDateStr }}</span>
                    </div>
                </slot>
                <component
                    :is="value ? 'chevron-up' : 'chevron-down'"
                    :class="{'arrow-icon': true, open: value}"
                    :size="18"
                />
            </div>
        </PmtButton>
        <template v-if="datepicker.showNavigation && !datepicker.inlineNavigationButtons">
            <DatepickerNavigationButton
                ref="next"
                :datepicker="datepicker"
                nav-type="next"
                :disabled="disabledNavigation('next') || options.disabled"
                @click="navigate($event)"
            />
        </template>
    </div>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {

    name: 'DatepickerActivator',

    components: {
        DatepickerNavigationButton: () => import(/* webpackChunkName: "datepicker" */'@/components/ui/pickers/components/DatepickerNavigationButton'),
    },

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
        on: {
            type: Object,
            default: () => ({}),
        },
        value: Boolean,
    },

    computed: {
        activatorTextKey () {
            if (this.datepicker.mode === 'day') {
                return this.datepicker.localSelectedDate.format('D')
            }
            if (this.datepicker.mode === 'week') {
                return this.datepicker.localSelectedDate.isoWeek()
            }
            if (this.datepicker.mode === 'month') {
                return this.datepicker.localSelectedDate.year()
            }
            return ''
        },
        /**
             * Returns the datepicker icon
             * based on the selected mode
             */
        activatorIcon () {
            if (this.datepicker.activator.showIcon || (!this.IS_MOBILE && this.datepicker.showNavigation)) {
                if (this.datepicker.mode === 'day') {
                    return 'calendar-today'
                }
                if (this.datepicker.mode === 'week') {
                    return 'calendar-range'
                }
                if (this.datepicker.mode === 'month') {
                    return 'calendar-month'
                }
                return 'calendar-range'
            }
            return ''
        },
        currentDateStr () {
            if (!this.datepicker.isSelected) {
                // Show the placeholder if no date is selected.
                return this.datepicker.placeholder !== '' ? this.datepicker.placeholder : this.$t('components.datepicker.selectDate')
            }
            const date = this.datepicker.selectedDate
            if (this.datepicker.mode === 'day') {
                return date.format(this.datepicker.dateFormat.day)
            } else if (this.datepicker.mode === 'week') {
                return this.datepicker.showNavigation ? `${this.$t('ui.singles.week')} ${date.isoWeek()} ${date.isoWeekYear()}` : `${date.format(this.datepicker.cutsomDateFormat)} (week ${date.isoWeek()})`
            } else if (this.datepicker.mode === 'month') {
                return date.format(this.datepicker.dateFormat.month)
            }
            return ''
        },
        pickerTextClasses () {
            return {
                slideInLeft: this.datepicker.direction === 'left',
                slideInRight: this.datepicker.direction === 'right',
                animated: true,
                'd-inline-block': true,
            }
        },

        /**
         * Gets if the navigation buttons should be disabled
         * Enters in play only if the minDate and/or maxDate props are given
         * Returns false otherwise.
         * @returns {Boolean}
         * @param {String} direction
         */
        disabledNavigation () {
            return direction => {
                // check maxDate for next button
                if (direction === 'next' && this.datepicker.maxDate) {
                    if (this.datepicker.mode === 'day') {
                        return this.datepicker.selectedDate.isBeforeOrSameDayAs(this.datepicker.maxDate)
                    }
                    if (this.datepicker.mode === 'week') {
                        if (this.datepicker.selectedDate.year() < this.datepicker.maxDate.year()) {
                            return false
                        }
                        const maxWeek = this.datepicker.maxDate.isoWeek()
                        const currentWeek = this.datepicker.selectedDate.isoWeek()
                        return (maxWeek - currentWeek === 0)
                    }
                    if (this.datepicker.mode === 'month') {
                        if (this.datepicker.maxDate.year() < this.$moment().year()) {
                            return true
                        }
                        const maxMonth = this.datepicker.maxDate.month() + this.datepicker.maxDate.year()
                        const currentMonth = this.datepicker.selectedDate.month() + this.datepicker.selectedDate.year()
                        return (maxMonth - currentMonth) === 0
                    }
                // check minDate for previous button
                } else if (direction === 'previous' && this.datepicker.minDate) {
                    if (this.datepicker.mode === 'day') {
                        return this.datepicker.selectedDate.isAfterOrSameDayAs(this.datepicker.minDate)
                    }
                    if (this.datepicker.mode === 'week') {
                        if (this.datepicker.selectedDate.year() > this.datepicker.minDate.year()) {
                            return false
                        }
                        const minWeek = this.datepicker.minDate.isoWeek()
                        const currentWeek = this.datepicker.selectedDate.isoWeek()
                        return (currentWeek - minWeek === 0)
                    }
                    if (this.datepicker.mode === 'month') {
                        if (this.datepicker.minDate.year() > this.$moment().year()) {
                            return true
                        }
                        const minMonth = this.datepicker.minDate.month() + this.datepicker.minDate.year()
                        const currentMonth = this.datepicker.selectedDate.month() + this.datepicker.selectedDate.year()
                        return (currentMonth - minMonth) === 0
                    }
                }
                return false
            }
        },
    },

    watch: {
        $route (to, from) {
            if (this.datepicker.handleRoute) {
                const date = this.$moment().fromRouteParams(this.$route.params, this.datepicker.mode, true)
                if (date.apiFormat() !== this.datepicker.selectedDate.apiFormat()) {
                    const direction = date.isBefore(this.datepicker.selectedDate, this.datepicker.mode) ? 'left' : 'right'
                    this.changeDate(date, direction)
                }
            }
        },
    },
}
</script>
