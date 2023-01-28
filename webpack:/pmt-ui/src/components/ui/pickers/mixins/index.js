import { mapGetters, mapMutations } from 'vuex'
import datepickerHelper from '@/libraries/datepickerHelper'
export default {
    watch: {
        'options.minDate': {
            handler (newVal, oldVal) {
                if (newVal && oldVal && newVal.apiFormat() !== oldVal.apiFormat()) {
                    this.setWatchedMinDate(newVal)
                }
            },
            deep: true,
        },
        'options.maxDate': {
            handler (newVal, oldVal) {
                if (newVal && oldVal && newVal.apiFormat() !== oldVal.apiFormat()) {
                    this.setWatchedMaxDate(newVal)
                }
            },
            deep: true,
        },
    },
    computed: {
        ...mapGetters('datepicker', [
            'DATEPICKER_BY_ID',
        ]),
        ...mapGetters({
            IS_ACTUAL_LANDSCAPE: 'IS_LANDSCAPE',
            IS_MOBILE: 'IS_MOBILE',
        }),
        /** The year displayed in the datepicker menu navigation bar */
        navigationYear () {
            return this.mode === 'week' ? this.datepicker.navigationDay.isoWeekYear() : this.datepicker.navigationDay.year()
        },
        /**
         * Checks if the datepicker should display in landscapre mode
         * @returns {Boolean}
         */
        isLandscape () {
            return !this.datepicker.portrait && (this.datepicker.landscape || this.IS_ACTUAL_LANDSCAPE)
        },
        /**
         * Returns the first selecteable date in the datepicker
         * according to provided options of min and max date
         * @returns {Object|Moment}
         */
        firstSelectableDate () {
            const today = this.$moment()
            // return the minDate if provided
            if (this.datepicker.minDate) {
                return this.datepicker.mode === 'week' ? this.datepicker.minDate.startOf('isoWeek') : this.datepicker.minDate
            }
            // return the calculated maxDate if maxDate is provided
            if (this.localMaxDate) {
                if (today.isAfter(this.localMaxDate, 'day')) {
                    return this.localMaxDate
                }
            }
            return today
        },
        /**
         * Calculates the number of selected days in the range
         * @returns {String} ex: 365 days
         */
        rangeDaysCount () {
            const daysCount = this.datepicker.selectedDateTo.diff(this.datepicker.selectedDateFrom, 'days') + 1
            const sufix = daysCount > 1 ? ` ${this.$t('components.datepicker.days')}` : ` ${this.$t('components.datepicker.day')}`
            return daysCount + sufix
        },
        /**
         * Returns the maxDate of the datepicker
         * @returns {Object|Moment}
         */
        localMaxDate () {
            if (this.datepicker.isRangePicker && this.datepicker.maxRangeDays) {
                // calculates the maximum selectable date based on the first range selection and maxRangeDays option
                return this.datepicker.firstSelected ? this.datepicker.selectedDateFrom.clone().add(this.datepicker.maxRangeDays - 1, 'days') : this.$moment('9999-12-31')
            }
            // return usual maxDate
            return this.datepicker.maxDate
        },
        /**
         * Datepicker VUEX instance
         * @returns {Object}
         */
        datepicker () {
            return this.DATEPICKER_BY_ID(this.options.id)
        },
        defaultDatepickerOptions () {
            return datepickerHelper.defaultOptions(this)
        },
        /**
         * Returns the text to display in a range selection
         * @returns {String}
         */
        rangeText () {
            return showCount => {
                return this.$moment().rangeText(this.datepicker.selectedDateFrom, this.datepicker.selectedDateTo, 'DD MMM, YYYY', showCount)
            }
        },
        /**
         * Returns the type of interval to add to a date
         * based on the mode provided in the options
         */
        stepMode () {
            return this.datepicker.mode === 'day' ? 'd' : this.datepicker.mode === 'week' ? 'w' : 'M'
        },
    },
    methods: {
        ...mapMutations('datepicker', ['UPDATE_DATEPICKER', 'INIT_DATEPICKER']),
        ...mapMutations(['SET_SNACKBAR']),
        /**
         * Checks the day to be valid for selection
         * @param {Object|Moment} day
         */
        isValidDate (day) {
            if (!day) return false
            // check if options have minDate set
            if (this.datepicker.minDate) {
                // account for week mode for minDate
                if (this.datepicker.mode === 'week' && day.isBefore(this.datepicker.minDate, 'isoWeek')) {
                    return false
                }
                // if the selected day is before the minDate then it is not valid
                if (day.isBefore(this.datepicker.minDate, 'day') && day.isBefore(this.datepicker.minDate, 'month') && day.isBefore(this.datepicker.minDate, 'year')) {
                    return false
                }
            }
            // check the maxDate
            if (this.localMaxDate) {
                // if the selected day is after the maxDate then it is not valid
                if (day.isAfter(this.localMaxDate, 'day')) {
                    return false
                }
            }
            return true
        },
        /**
         * Checks if the date is
         * - after minDate
         * - before maxDate
         * - between minDate and maxDate
         * @param {Object|Moment} date
         * @returns {Boolean}
         */
        isDateInRange (date) {
            // it is always in range if no minDate or maxDate is provided
            if (!this.datepicker.minDate && !this.localMaxDate) {
                return true
            }
            if (this.datepicker.minDate && !this.localMaxDate) {
                // check if it is after or same as minDate
                if (this.datepicker.mode === 'day') {
                    return date.isAfterOrSameDayAs(this.datepicker.minDate)
                } else if (this.datepicker.mode === 'week') {
                    return date.isAfterOrSameWeekAs(this.datepicker.minDate)
                }
            } else if (!this.datepicker.minDate && this.localMaxDate) {
                // check if it is before or same as minDate
                if (this.datepicker.mode === 'day') {
                    return date.isBeforeOrSameDayAs(this.localMaxDate)
                } else if (this.datepicker.mode === 'week') {
                    return date.isBeforeOrSameWeekAs(this.localMaxDate)
                }
            } else {
                // check if it is between minDate and maxDate
                if (this.datepicker.mode === 'day') {
                    return date.isAfterOrSameDayAs(this.datepicker.minDate) && date.isBeforeOrSameDayAs(this.localMaxDate)
                } else if (this.datepicker.mode === 'week') {
                    return date.isAfterOrSameWeekAs(this.datepicker.minDate) && date.isBeforeOrSameWeekAs(this.localMaxDate)
                }
            }
        },
        /**
         * Updates the datepicker options
         * @param {Object} options datepicker options
         */
        update (options) {
            this.UPDATE_DATEPICKER({
                id: this.options.id,
                ...options,
            })
        },
        /**
         * Opens the menu with the datepicker
         */
        open () {
            this.update({
                navigationDay: this.datepicker.isRangePicker ? this.datepicker.selectedDateFrom : this.datepicker.localSelectedDate,
                show: true,
            })
        },
        /**
         * Closes the datepicker menu
         */
        close () {
            this.update({
                navigationDay: this.datepicker.isRangePicker ? this.datepicker.selectedDateFrom : this.datepicker.localSelectedDate,
                show: false,
            })
        },
        /**
         * Updates the current selected month
         * Updates the current selection to 'week'
         * in order to select the desired week.
         * @param {Object|Moment} event
         */
        selectMonth (event) {
            this.update({
                navigationDay: event.year(this.navigationYear),
                selection: 'week',
            })
        },
        /**
         * Updates the current selected year
         * Updates the current selection to 'month'
         * in order to select the desired month.
         * @param {Number} year
         */
        selectYear (year) {
            this.update({
                navigationDay: this.datepicker.mode === 'week' ? this.$moment().isoWeekYear(year) : this.$moment().year(year),
                selection: 'month',
            })
        },
        /**
         * This will make a router navigation
         * with propper params depending
         * on the slected mode
         * @param {Object|Moment} date
         */
        async updateBrowserPath (date) {
            let sameParams = true
            let params = {
                ...this.$route.params,
            }
            if (this.datepicker.mode === 'day') {
                params = {
                    ...params,
                    day: date.date(),
                    month: date.month() + 1,
                    year: date.year(),
                }
                const sameDay = parseInt(this.$route.params.day) === parseInt(params.day)
                const sameMonth = parseInt(this.$route.params.month) === parseInt(params.month)
                const sameYear = parseInt(this.$route.params.year) === parseInt(params.year)
                sameParams = sameDay && sameMonth && sameYear
            } else if (this.datepicker.mode === 'week') {
                params = {
                    ...params,
                    week: date.isoWeek(),
                    year: date.isoWeekYear(),
                }
                const sameWeek = parseInt(this.$route.params.week) === parseInt(params.week)
                const sameYear = parseInt(this.$route.params.year) === parseInt(params.year)
                sameParams = sameWeek && sameYear
            } else if (this.datepicker.mode === 'month') {
                params = {
                    ...params,
                    month: date.month() + 1,
                    year: date.year(),
                }
                const sameMonth = parseInt(this.$route.params.month) === parseInt(params.month)
                const sameYear = parseInt(this.$route.params.year) === parseInt(params.year)
                sameParams = sameMonth && sameYear
            }
            if (!sameParams) {
                await this.$router.push({
                    name: this.$route.name,
                    params,
                    query: this.$route.query,
                }).catch((error) => { console.error(error) })
            }
        },
        /**
         * Reset the selected range to current year
         * This method is used on mounted() hook as well.
         * At the mounted time we don't want to emit an event to parent,
         * but want to make sure that we have all the defaults in place.
         * @param {Boolean} emitEvent use this to emit an event that there was a change or not
         */
        resetRange (emitEvent) {
            const from = this.datepicker.minDate || this.$moment().startOf(this.datepicker.initialRangeSelection)
            const to = this.datepicker.maxDate ? this.datepicker.maxDate : this.datepicker.minDate || this.$moment().endOf(this.datepicker.initialRangeSelection)
            this.update({
                navigationDay: from,
                selectedDateFrom: from,
                selectedDateTo: to,
                hoveredRangeDay: from,
            })
            this.emitDeselect()
            this.setDateAsSelected(this.datepicker.selectedDateTo, emitEvent)
        },
        /**
         * Updates the selected range on second range item click
         * Closes the datepicker menu
         * @param {Object} item
         */
        updateRange (item) {
            this.update({
                navigationDay: item.range.from,
                selectedDateFrom: item.range.from,
                selectedDateTo: item.range.to,
                selection: 'week',
                hoveredRangeDay: item.range.from,
                selectedPredefinedRange: item.value,
            })
            this.setDateAsSelected(this.datepicker.selectedDateTo)
            this.close()
        },
        /**
         * Helper for updating min and max dates when
         * they change in the parent
         * @param {Object|Moment} day
         */
        updateWatchedDate (day) {
            this.update({
                selectedDate: day,
                navigationDay: day.clone(),
                localSelectedDate: day.clone(),
                show: false,
            })
        },
        /**
         * When minDate changes dinamically in the parent
         * we have a watcher that runs this method,
         * to update the minDate
         * @param {Object|Moment} day
         */
        setWatchedMinDate (day) {
            this.update({
                minDate: day.clone(),
            })
            /**
             * If the new minDate is before the current selected date or if it is not valid
             * we update the current selected date to the new min date.
             */
            if (this.datepicker.localSelectedDate.isBefore(day.apiFormat(), 'day') || !this.datepicker.localSelectedDate.isValid()) {
                this.updateWatchedDate(day)
            }
        },
        /**
         * When maxDate changes dinamically in the parent
         * we have a watcher that runs this method,
         * to update the maxDate
         * @param {Object|Moment} day
         */
        setWatchedMaxDate (day) {
            this.update({
                maxDate: day.clone(),
            })
            /**
             * If the new maxDate is after the current selected date or if it is not valid
             * we update the current selected date to the new max date.
             */
            if (this.datepicker.localSelectedDate.isAfter(day.apiFormat(), 'day') || !this.datepicker.localSelectedDate.isValid()) {
                this.updateWatchedDate(day)
            }
        },
        /**
         * Central method of the datepicker.
         * This is updating all the necessary
         * dates and options on click.
         *
         * @param {Object|Moment} day
         * @param {Boolean} emitChange determines if the datepicker will emit a select event
         */
        setDateAsSelected (day, emitChange) {
            if (!this.isValidDate(day)) {
                if (process.env.development) {
                    if (day) {
                        console.warn(`Cannot select date: ${day.apiFormat()}`)
                    } else {
                        console.warn('Cannot select date, date is undefined')
                    }
                }
                this.update({
                    selectedDate: this.firstSelectableDate,
                    localSelectedDate: this.firstSelectableDate.clone(),
                    selectedDateFrom: this.firstSelectableDate.clone(),
                    selectedDateTo: this.firstSelectableDate.clone(),
                    navigationDay: this.firstSelectableDate.clone(),
                })
                if (this.datepicker.handleRoute) {
                    // change the route to first possible minDate if propvided
                    if (this.datepicker.minDate && !this.datepicker.maxDate) {
                        this.updateBrowserPath(this.datepicker.minDate)
                    }
                    // change the route to first possible maxDate if propvided
                    if (this.datepicker.maxDate && !this.datepicker.minDate) {
                        this.updateBrowserPath(this.datepicker.maxDate)
                    }
                    // change the route to first possible minDate if both min and max are propvided
                    if (this.datepicker.minDate && this.datepicker.maxDate) {
                        this.updateBrowserPath(this.datepicker.minDate)
                    }
                }
            } else {
                this.update({
                    selectedDate: this.datepicker.mode === 'week' ? day.startOf('isoWeek') : day,
                    localSelectedDate: day.clone(),
                    navigationDay: day.clone(),
                })
            }
            if (emitChange || typeof emitChange === 'undefined') {
                const rangeObject = {
                    from: this.datepicker.selectedDateFrom,
                    to: this.datepicker.selectedDateTo,
                }
                this.emitSelect(this.datepicker.isRangePicker ? rangeObject : this.datepicker.localSelectedDate)
            }
            if (!this.datepicker.isRangePicker || (this.datepicker.isRangePicker && this.datepicker.closeOnRangeSelect) || this.datepicker.closeOnReset) {
                this.close()
            }
        },
        /**
         * Activator Navigation helper to change date
         * and emit select event on route change or click
         * @param {Object|Moment} date
         * @param {String} direction
         */
        changeDate (date, direction) {
            this.update({
                direction,
                selectedDate: date,
                navigationDay: date.clone(),
                localSelectedDate: date.clone(),
                show: false,
            })
            this.emitSelect(date)
        },
        /**
         * Activator navigation click method
         * @param {Number} step possible: 1 and -1
         */
        navigate (step) {
            const newDate = this.datepicker.selectedDate.clone().add(step, this.stepMode).startOf(this.mode === 'week' ? 'isoWeek' : this.mode)
            const direction = step === -1 ? 'left' : 'right'
            this.changeDate(newDate, direction)
            if (this.datepicker.handleRoute) {
                this.updateBrowserPath(newDate)
            }
        },
        /**
         * Emits the select event to parent
         * @param {Object|Moment} date
         */
        emitSelect (date) {
            this.$emit('on-select', date)
        },
        /**
         * Emits the de-select event to parent
         */
        emitDeselect () {
            this.$emit('deselect-date')
            if (this.datepicker.closeOnReset) {
                this.close()
            }
        },
        /**
         * Emits the OK event to parent
         */
        emitOk () {
            this.$emit('ok')
            this.close()
        },
    },
}
