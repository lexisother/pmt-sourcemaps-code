import Vue from 'vue'
import defaultMoment from 'moment'
import language from '../config/language'
import { store } from '../store'
import timeHelper from '../libraries/timeHelper'

import de from 'moment/locale/de'
import en from 'moment/locale/en-gb'
import nl from 'moment/locale/nl'

Vue.config.productionTip = false

const LibraryModule = {
    install(Vue, options) {
        // set to custom moment instance else to defaultMoment
        const moment = (options || {}).moment || defaultMoment || window.moment

        if (moment) {
            const { unix, utc, parseZone, duration, isDuration } = moment
            moment.weekdays(true)
            // expose moment api to components and globals services such as vuex, etc
            Vue.prototype.$moment = Vue.moment = moment
            Vue.prototype.$time = Vue.time = moment // alias to moment
            Vue.prototype.$unix = Vue.unix = unix
            Vue.prototype.$utc = Vue.utc = utc
            Vue.prototype.$zone = Vue.zone = parseZone
            Vue.prototype.$duration = Vue.duration = duration
            Vue.prototype.$isDuration = Vue.isDuration = isDuration

            // filter to parse time
            const timeParse = (value, ...args) => moment(value, ...args)
            Vue.filter('moment', timeParse)
            Vue.filter('time', timeParse) // alias to moment
            // filter to parse unix timestamp
            Vue.filter('unix', (value, ...args) => unix(value, ...args))
            // filter to parse utc time
            Vue.filter('utc', (value, ...args) => utc(value, ...args))
            // filter to parse zone-kept time
            Vue.filter('zone', (value, ...args) => parseZone(value, ...args))
            // filter to parse duration
            Vue.filter('duration', (value, unit) => duration(value, unit))

                ; (function (moment) {
                    /**
                    * Usage:
                    * var m = moment('2013-04-08 17:50:00', 'YYYY-MM-DD HH:mm:ss');
                    * console.log(m.fromNow());   // -> "3 minutes ago"
                    * console.log(m.fromNowShort());  // -> "3m"
                    */
                    moment.fn.fromNowShort = function () {
                        const shortTimeStrings = {
                            s: '%ds',
                            m: '%dm',
                            h: '%dh',
                            d: '%dd',
                            y: '%dy',
                        }
                        const milliseconds = this.diff(moment())
                        const seconds = Math.round(Math.abs(milliseconds) / 1000)
                        const minutes = Math.round(seconds / 60)
                        const hours = Math.round(minutes / 60)
                        const days = Math.round(hours / 24)
                        const years = Math.round(days / 365)

                        const args = (seconds < 45 && ['s', seconds]) ||
                            (minutes < 45 && ['m', minutes]) ||
                            (hours < 22 && ['h', hours]) ||
                            (days <= 300 && ['d', days]) ||
                            ['y', years]

                        const rt = shortTimeStrings[args[0]]
                        return rt.replace(/%d/i, args[1] || 1)
                    }

                    /** CAUTION - this is a highly used and sansitive method
                    ** Gets week/month calendar array based on parameters.
                    ** Defaults to current month calendar if no parameters are specified
                    ** This is usefull for laoding the datepicker or showing month/week days in a grid.
                    Case: Week
                         When week mode is requested this method returns an array of days in the
                         requested week starting on monday and ending on sunday
                    ------------------------------------------
                    Case: Month
                    When month mode is requested this method returns an array of weeks. Each
                    week will also be an array containing an array o 7 days of that week.
                    ------------------------------------------
                        --- StartDay ---
                        We take the start of the provided moment month day and replace it
                        with the day coresponding to the moday of that isoWeek
                        (in some cases might be the same day)
                        --- EndDay -----
                        We apply the same logic as for StartDay but with the end of the IsoWeek
                    ** @param {String} mode
                    ** @returns {Array[Moment]}
                    **/
                    moment.fn.toCalendarArray = function (mode) {
                        const calendar = []
                        const currentMode = typeof mode !== 'undefined' ? mode : 'month'
                        const startDay = currentMode === 'week' ? this.clone().startOf('isoWeek') : this.clone().startOf('month').startOf('isoWeek')
                        const endDay = currentMode === 'week' ? this.clone().endOf('isoWeek') : this.clone().endOf('month').endOf('isoWeek')
                        const date = startDay.clone().subtract(1, 'day')
                        const before = currentMode === 'week' ? 'day' : ''
                        while (date.isBefore(endDay, before)) {
                            if (currentMode === 'week') {
                                calendar.push(date.add(1, 'day').clone())
                            } else {
                                calendar.push(Array(7).fill(0).map(() => date.add(1, 'day').clone()))
                            }
                        }
                        return calendar
                    }

                    /**
                    ** Gets calendar array based on fixed start and end parameters.
                    ** @param {Moment} start
                    ** @param {Moment} end
                    ** @returns {Array[Moment]}
                    **/
                    moment.fn.toCalendarArrayExact = function (start, end) {
                        const calendar = []
                        const date = start.clone().subtract(1, 'day')
                        while (date.isBefore(end, 'day')) {
                            calendar.push(date.add(1, 'day').clone())
                        }
                        return calendar
                    }

                    /**
                     * Returns the weekday that always start at 0
                     * Monday will always be 0, no matter the
                     * locale that is used
                     * @returns {Number}
                     */
                    moment.fn.appWeekday = function () {
                        return this.isoWeekday() - 1
                    }

                    moment.fn.detectDaylightSavingsSwitch = function () {
                        // Check if today is Day Light Savings change.
                        const curDst = this.isDST()
                        const prevDst = moment(this).clone().subtract(1, 'day').isDST()
                        const nextDst = moment(this).clone().add(1, 'day').isDST()
                        const isDstChangeDate = (curDst !== nextDst) === true || (curDst === prevDst) !== true
                        return isDstChangeDate
                    }

                    /**
                    ** Gets time range in form of ['00:00', '01:00', '02:00' ...] based on start and end time.
                    ** Defaults to whole day time range, based on default amount and amountType, if no parameters are passed in.
                    ** @param {String} start ex: 13:00
                    ** @param {String} end ex: 21:00
                    ** @param {String} amount ex: 1
                    ** @param {String} amountType ex: 'hours'
                    ** @returns {Array} strings
                    **/
                    moment.fn.timeRange = function (start, end, amount, amountType, format = 'HH:mm') {
                        const calendar = []
                        const currentAmount = (typeof amount !== 'undefined' && amount <= 60 && amount > 0) ? amount : 60
                        const currentAmountType = (typeof amountType !== 'undefined' && (amountType === 'minutes' || amountType === 'hours')) ? amountType : 'minutes'
                        const currentStartTime = this.clone().setTime(typeof start !== 'undefined' ? start : '00:00')
                        const currentEndTime = this.clone().setTime(typeof end !== 'undefined' ? end === '24:00' || end === '00:00' ? '23:59:59' : end : '23:59:59')
                        const time = currentStartTime.clone().subtract(currentAmount, currentAmountType)
                        while (time.isBefore(currentEndTime, currentAmountType)) {
                            const res = time.add(currentAmount, currentAmountType).clone().format(format)
                            calendar.push(res)
                            if (res === '02:00' && this.detectDaylightSavingsSwitch()) {
                                calendar.push('03:00')
                            }
                        }
                        return calendar
                    }

                    /**
                    ** Gets time range in form of [Moment, Moment, Moment] based on start and end date times.
                    ** Defaults to whole day time range, based on default amount and amountType, if no parameters are passed in.
                    ** @param {String} start
                    ** @param {String} end
                    ** @param {String} amount ex: 1
                    ** @param {String} amountType ex: 'hours'
                    ** @returns {Array} Moment
                    **/
                    moment.fn.momentTimeRange = function (start, end, amount, amountType, format, weekBusinessTimes) {
                        const calendar = []
                        const currentAmount = (typeof amount !== 'undefined' && amount <= 60 && amount > 0) ? amount : 60
                        const currentAmountType = (typeof amountType !== 'undefined' && (amountType === 'minutes' || amountType === 'hours')) ? amountType : 'minutes'
                        const currentStartTime = start.clone()
                        const currentEndTime = end.clone()
                        const time = currentStartTime.clone().subtract(currentAmount, currentAmountType)
                        while (time.isBefore(currentEndTime, currentAmountType)) {
                            let res = time.add(currentAmount, currentAmountType).clone()
                            if (weekBusinessTimes) {
                                res = timeHelper.calculateBusinessTimes(res, weekBusinessTimes)
                            }
                            calendar.push(format ? res.format(format) : res)
                        }
                        return calendar
                    }

                    /**
                    ** Gets range in form of [Moment, Moment, Moment] based on start and end date times.
                    ** @param {String} start
                    ** @param {String} end
                    ** @param {String} amount ex: 1
                    ** @param {String} type ex: 'days'
                    ** @returns {Array} Moment
                    **/
                    moment.fn.customRange = function (from, to, ammount = 60, type = 'minutes', format) {
                        const range = []
                        const currentStartTime = from.clone()
                        const currentEndTime = to.clone()
                        const time = currentStartTime.clone().subtract(ammount, type)
                        while (time.isBefore(currentEndTime, type)) {
                            const res = time.add(ammount, type).clone()
                            range.push(format ? res.format(format) : res)
                        }
                        return range
                    }

                    /**
                     * Builds an array of moment date-times for a week.
                     * Also marks each time is it is inside provide business times or not.
                     * @param {Object} object
                     * @returns {Array} objects
                     */
                    moment.fn.weekTimeRange = function ({ amount, amountType, weekBusinessTimes }) {
                        const currentAmount = (typeof amount !== 'undefined' && amount <= 60 && amount > 0) ? amount : 60
                        const currentAmountType = (typeof amountType !== 'undefined' && (amountType === 'minutes' || amountType === 'hours')) ? amountType : 'minutes'
                        const start = this.clone().startOf('isoWeek').startOf('day')
                        let times = 7 * 24 // 24 hours * 7 days in a week

                        // if you set the amount to 30 you would expect to recieve more results too, beacuse now it caps somewhere on thursday, that's why I duplicate the amount of for loops here
                        if (amount === 30) {
                            times = times * 2
                        }
                        const calendar = [start]
                        for (let i = 0; i < times - 1; i++) {
                            let newTime = calendar[i].clone().add(currentAmount, currentAmountType)
                            if (newTime.isSame(calendar[i], 'isoWeek')) {
                                const shortTime = newTime.shortTime()
                                newTime = timeHelper.calculateBusinessTimes(newTime, weekBusinessTimes)
                                newTime.isEndDay = shortTime === '23:00'
                                calendar.push(newTime)
                            }
                        }
                        return calendar
                    }

                    moment.fn.rangeText = function (start, end, format, includeDaysCount = false) {
                        const text = start.format(format) + ' - ' + end.format(format)
                        if (includeDaysCount) {
                            const daysCount = end.diff(start, 'days') + 1
                            const sufix = daysCount > 1 ? ` ${language.t('components.datepicker.days')}` : ` ${language.t('components.datepicker.day')}`
                            return `${text} (${daysCount + sufix})`
                        }
                        return text
                    }

                    moment.fn.quartelyMonths = function (year) {
                        const months = []
                        const quarters = []
                        for (let i = 0; i < 13; i++) {
                            months.push(this.month(i).format('MMMM'))
                        }
                        quarters.push(months.slice(0, 3))
                        quarters.push(months.slice(3, 6))
                        quarters.push(months.slice(6, 9))
                        quarters.push(months.slice(9, 12))
                        quarters.forEach(quarter => {
                            for (let i = 0; i < quarter.length; i++) {
                                quarter[i] = moment(quarter[i], 'MMMM').year(year)
                            }
                        })
                        return quarters
                    }

                    moment.fn.monthsArray = function () {
                        return moment.months().slice(0, 12)
                    }

                    /**
                     * The number of weeks in a given year moment arranged in rows
                     * This can be useful to display a simple week number picker
                     * Usage 1: $moment().isoWeekYear(year).weeksRange(true/false)
                     * Usage 2: $moment({year: year}).weeksRange(true/false)
                     * @returns {Array}
                     * @param {Boolean} thin
                     */
                    moment.fn.weeksRange = function (thin) {
                        let from = this.clone().startOf('year')
                        const to = this.clone().endOf('year')
                        const weeks = []
                        const result = []
                        while (from.isBeforeOrSameWeekAs(to)) {
                            weeks.push(from.clone())
                            from = from.add(1, 'week')
                        }
                        if (thin) {
                            result.push(weeks.slice(0, 7))
                            result.push(weeks.slice(7, 14))
                            result.push(weeks.slice(14, 21))
                            result.push(weeks.slice(21, 28))
                            result.push(weeks.slice(28, 35))
                            result.push(weeks.slice(35, 42))
                            result.push(weeks.slice(42, 49))
                            result.push(weeks.slice(49, 56))
                        } else {
                            result.push(weeks.slice(0, 8))
                            result.push(weeks.slice(8, 16))
                            result.push(weeks.slice(16, 24))
                            result.push(weeks.slice(24, 32))
                            result.push(weeks.slice(32, 40))
                            result.push(weeks.slice(40, 48))
                            result.push(weeks.slice(48, 56))
                        }
                        return result
                    }

                    /**
                     * Gets 100 years in the past and 100 years in the future
                     */
                    moment.fn.getYearsRange = function () {
                        const years = []
                        for (let i = this.isoWeekYear() - 100; i < this.isoWeekYear() + 100; i++) {
                            years.push(i)
                        }
                        return years.reverse()
                    }

                    moment.fn.isTimeInRange = function (timeStr, rangeStart, rangeEnd) {
                        const start = this.clone().setTime(rangeStart)
                        const end = this.clone().setTime(rangeEnd)
                        const time = this.clone().setTime(timeStr)
                        return time.isAfterOrSameTimeAs(start) && time.isBeforeOrSameTimeAs(end)
                    }

                    moment.fn.elapsedMinutes = function (timeStr) {
                        const theTime = this.clone().setTime(timeStr)
                        return theTime.diff(this, 'minutes')
                    }

                    moment.fn.dayMonthYearObject = function () {
                        return {
                            day: this.date(),
                            month: this.month() + 1,
                            year: this.year(),
                        }
                    }

                    moment.fn.weekYearObject = function () {
                        return {
                            week: this.isoWeek(),
                            month: this.month() + 1,
                            year: this.isoWeekYear(),
                        }
                    }

                    moment.fn.dayWeekYearObject = function (dayOfMonth) {
                        return {
                            day: dayOfMonth ? this.date() : this.isoWeekday(),
                            week: this.isoWeek(),
                            year: this.isoWeekYear(),
                            date: this,
                            month: this.month() + 1,
                        }
                    }

                    moment.fn.fromRouteParams = function (params, mode, unformated) {
                        if (!params || Object.keys(params).length === 0) {
                            return unformated ? moment() : moment().apiFormat()
                        }
                        let date = moment().clone()
                        if (mode === 'day') {
                            if (params.week) {
                                date = moment().isoWeekYear(parseInt(params.year)).isoWeek(parseInt(params.week)).startOf('isoWeek').date(params.day)
                            } else {
                                date = moment(`${params.year}-${params.month}-${params.day}`, 'YYYY-M-D')
                            }
                        } else if (mode === 'week') {
                            date = moment().isoWeekYear(parseInt(params.year)).isoWeek(parseInt(params.week)).startOf('isoWeek')
                        } else if (mode === 'month') {
                            date = moment(`${params.year}-${params.month}`, 'YYYY-M').startOf('month')
                        }
                        return unformated ? date : date.apiFormat()
                    }

                    moment.fn.fromWeekDayRouteParams = function (route) {
                        if (!route.params || Object.keys(route.params).length === 0) {
                            return this
                        }
                        const result = this.clone().isoWeekYear(Number(route.params.year)).isoWeek(Number(route.params.week)).startOf('isoWeek')
                        if ((route.query && route.query.day) || (route.params && route.params.day)) {
                            const day = result.clone().toCalendarArray('week').find(day => {
                                return day.date() === Number(route.query.day || route.params.day)
                            })
                            return day || result
                        }
                        return result
                    }

                    moment.fn.differentMonth = function () {
                        return !this.isSame(moment(), 'month')
                    }

                    moment.fn.isToday = function () {
                        return this.isSame(moment(), 'day') && this.isSame(moment(), 'month') && this.isSame(moment(), 'year')
                    }

                    moment.fn.sameDayAs = function (day) {
                        return this.isSame(day, 'day') && this.isSame(day, 'month') && this.isSame(day, 'year')
                    }

                    moment.fn.sameWeekAs = function (day) {
                        return this.isSame(day, 'isoWeek') && this.isSame(day, 'month') && this.isSame(day, 'year')
                    }

                    moment.fn.isBeforeOrSameDayAs = function (day) {
                        return this.isBefore(day, 'day') || this.sameDayAs(day)
                    }

                    moment.fn.isBeforeOrSameWeekAs = function (day) {
                        return this.isBefore(day, 'isoWeek') || this.sameWeekAs(day)
                    }

                    moment.fn.isBeforeOrSameTimeAs = function (day) {
                        return this.isBefore(day, 'minute') || this.isSame(day, 'minute')
                    }

                    moment.fn.isBeforeOrSameDayTimeAs = function (day) {
                        return (this.isBefore(day, 'day') && this.isBefore(day, 'minute')) || this.isSame(day, 'minute')
                    }

                    moment.fn.isAfterOrSameDayAs = function (day) {
                        return this.isAfter(day, 'day') || this.sameDayAs(day)
                    }

                    moment.fn.isAfterOrSameDayTimeAs = function (day) {
                        return (this.isAfter(day, 'day') && this.isAfter(day, 'minute')) || this.isSame(day, 'minute')
                    }

                    moment.fn.isAfterOrSameWeekAs = function (day) {
                        return this.isAfter(day, 'isoWeek') || this.sameWeekAs(day, 'isoWeek')
                    }

                    moment.fn.isBeforeOrSameWeekAs = function (day) {
                        return this.isBefore(day, 'isoWeek') || this.sameWeekAs(day, 'isoWeek')
                    }

                    moment.fn.isAfterOrSameTimeAs = function (day) {
                        return this.isAfter(day, 'minute') || this.isSame(day, 'minute')
                    }

                    moment.fn.isAfterOrSameSecondAs = function (day) {
                        return (this.isAfter(day, 'day') && this.isAfter(day, 'minute') && this.isAfter(day, 'second')) || this.isSame(day, 'second')
                    }

                    moment.fn.isBeforeTime = function (time) {
                        return this.isBefore(this.clone().setTime(time), 'minute')
                    }

                    moment.fn.isAfterTime = function (time) {
                        return this.isAfter(this.clone().setTime(time), 'minute')
                    }

                    moment.fn.fromWeekAndYear = function (week, year) {
                        return this.isoWeekYear(year).isoWeek(week)
                    }

                    moment.fn.setTime = function (time) {
                        if (time) {
                            const [hour, minute, seconds] = time.split(':')
                            return this.clone().set({ hour, minute: minute || '00', seconds: seconds || '00' })
                        } else {
                            return this.clone()
                        }
                    }

                    moment.fn.timeObject = function (value) {
                        return {
                            hours: moment(value, 'HH:mm').hours(),
                            minutes: moment(value, 'HH:mm').minutes(),
                        }
                    }

                    moment.fn.addTimeStrings = function (timeA, timeB) {
                        const start = this.clone().setTime(timeA)
                        const end = this.clone().setTime(timeB)
                        return moment.utc(end.diff(start)).format('HH:mm')
                    }

                    moment.fn.addTime = function (timeString) {
                        const hours = parseInt(timeString.split(':')[0])
                        const minutes = parseInt(timeString.split(':')[1])
                        return this.add(hours, 'hours').add(minutes, 'minutes')
                    }

                    moment.fn.subtractTime = function (timeString) {
                        const hours = parseInt(timeString.split(':')[0])
                        const minutes = parseInt(timeString.split(':')[1])
                        return this.subtract(hours, 'hours').subtract(minutes, 'minutes')
                    }

                    moment.fn.subtractTimeStrings = function (timeA, timeB) {
                        const start = this.clone().setTime(timeA)
                        const end = this.clone().setTime(timeB)
                        return start.diff(end, 'minutes').format('HH:mm')
                    }

                    moment.fn.apiFormat = function () {
                        return this.format('YYYY-MM-DD')
                    }

                    moment.fn.yearWeekApiFilter = function () {
                        return `${this.isoWeekYear()}-${this.isoWeek()}`
                    }

                    moment.fn.euFormat = function () {
                        return this.format('DD-MM-YYYY')
                    }

                    moment.fn.usFormat = function () {
                        return this.format('MM-DD-YYYY')
                    }

                    moment.fn.shortTime = function () {
                        return this.format('HH:mm')
                    }

                    moment.fn.weekYearFormat = function () {
                        return `${language.t('ui.singles.week')} ${this.isoWeek()}, ${this.year()}`
                    }

                    moment.fn.weekFormat = function () {
                        return `${language.t('ui.singles.week')} ${this.isoWeek()}`
                    }

                    moment.fn.longTime = function () {
                        return this.format('HH:mm:ss')
                    }

                    moment.fn.longApiFormat = function () {
                        return this.format('YYYY-MM-DD HH:mm')
                    }

                    moment.fn.shortDayFormat = function () {
                        return this.format('dd D, MMM YYYY')
                    }

                    moment.fn.shortDayName = function () {
                        return this.format('dd').substr(0, 2)
                    }

                    moment.fn.middleDayFormat = function () {
                        return this.format('ddd DD, MMM YYYY')
                    }

                    moment.fn.longDayFormat = function () {
                        return this.format('dddd, D MMMM YYYY')
                    }

                    moment.fn.longDayTimeFormat = function () {
                        return this.format('dddd, D MMM YYYY HH:mm')
                    }

                    moment.fn.shortReadableDateFormat = function () {
                        return this.format('ddd D MMM YYYY')
                    }

                    moment.fn.fullReadableDateFormat = function () {
                        return this.format('dddd, D MMMM YYYY HH:mm')
                    }

                    moment.fn.intervalReadableFormat = function (start, end) {
                        let result = start.format('D')
                        if (start.month() !== end.month()) {
                            result = `${result} ${start.format('MMM')}`
                        }
                        if (start.year() !== end.year()) {
                            result = `${result} ${start.isoWeekYear()} - ${end.format('D')} ${end.format('MMM')}`
                        } else {
                            result = `${result} - ${end.format('D')} ${end.format('MMM')}`
                        }
                        return `${result} ${end.year()}`
                    }

                    moment.fn.weekIntervalReadableFormat = function () {
                        return this.intervalReadableFormat(
                            this.startOf('isoWeek').clone(),
                            this.endOf('isoWeek').clone(),
                        )
                    }

                    moment.fn.weekStartEndDate = function (week, year, mode) {
                        return mode === 'start'
                            ? moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek')
                            : moment().isoWeekYear(year).isoWeek(week).endOf('isoWeek')
                    }

                    moment.fn.getDayPhase = function () {
                        const format = 'hh:mm:ss'
                        const actualTime = moment()

                        if (actualTime.isBetween(moment('05:59:59', format), moment('12:00:00', format))) { return language.t('headerMenu.variables.dayPhaseGreet.morning') }
                        if (actualTime.isBetween(moment('11:59:59', format), moment('17:00:00', format))) { return language.t('headerMenu.variables.dayPhaseGreet.afternoon') }
                        if (actualTime.isBetween(moment('16:59:59', format), moment('20:00:00', format))) { return language.t('headerMenu.variables.dayPhaseGreet.evening') }
                        if (actualTime.isBetween(moment('19:59:59', format), moment('24:00:00', format)) || actualTime.isBetween(moment('00:00:00', format), moment('06:00:00', format))) { return language.t('headerMenu.variables.dayPhaseGreet.night') }
                    }

                    moment.fn.getDuration = function (period, returnAs) {
                        let duration = Math.round(period.end.diff(period.start, 'days'))
                        const format = duration === 0 ? 'hours' : 'days'
                        if (duration === 0) {
                            duration = Math.round(period.end.diff(period.start, 'hours'))
                        }
                        return returnAs === 'string' ? moment.duration(duration, format).humanize() : moment.duration(duration, format).asMinutes()
                    }

                    // Rounds to the nearest minute based on provided interval
                    moment.fn.nearestMinutes = function (interval) {
                        const minute = this.clone().minute()
                        if (minute > 0) {
                            const roundedMinutes = Math.round(minute / interval) * interval
                            return this.clone().minute(roundedMinutes).second(0)
                        } else {
                            return this
                        }
                    }

                    // Rounds to the nearest past minute based on provided interval
                    moment.fn.nearestPastMinutes = function (interval, someMoment) {
                        const roundedMinutes = Math.floor(someMoment.minute() / interval) * interval
                        return someMoment.clone().minute(roundedMinutes).second(0)
                    }

                    // Rounds to the nearest future minute based on provided interval
                    moment.fn.nearestFutureMinutes = function (interval, someMoment) {
                        const roundedMinutes = Math.ceil(someMoment.minute() / interval) * interval
                        return someMoment.clone().minute(roundedMinutes).second(0)
                    }

                    moment.fn.changeLanguage = function () {
                        const lang = store.getters['locale/getLocale']
                        let langObject
                        if (lang === 'en') {
                            langObject = en
                        }
                        if (lang === 'de') {
                            langObject = de
                        }
                        if (lang === 'nl') {
                            langObject = nl
                        }
                        moment.updateLocale(lang, langObject)
                    }

                    moment.fn.dayCalendar = function (elseFormat) {
                        if (this.apiFormat() === moment().apiFormat()) return language.t('ui.singles.today')
                        if (this.apiFormat() === moment().subtract(1, 'days').apiFormat()) return language.t('ui.singles.yesterday')
                        if (this.apiFormat() === moment().add(1, 'days').apiFormat()) return language.t('ui.singles.tomorrow')
                        return this.format(elseFormat)
                    }

                    /**
                     * Returns a an object containing a range from a given number of days,
                     * starting on the provided start or now()
                     * @param {Number} numberOfDays number of days to calculate the range for
                     * @param {moment} start the start of the range calculation
                     * @returns Object
                     */
                    moment.fn.daysRangeObject = function (numberOfDays, start = moment()) {
                        if (!numberOfDays) return {}
                        const from = start
                        const to = from.clone().add(numberOfDays * 24, 'hours')
                        const object = {}

                        // Push remainder of current day till end of day
                        object[from.apiFormat()] = {
                            from,
                            to: from.clone().endOf('day'),
                        }

                        // Push last day and remainder of that day
                        object[to.apiFormat()] = {
                            from: to.clone().startOf('day'),
                            to,
                        }

                        // If there is more than 1 day difference, add them here
                        if (numberOfDays > 0) {
                            for (let i = 1; i < numberOfDays; i++) {
                                const newFrom = from.clone().add(i, 'days').startOf('day')
                                const newTo = from.clone().add(i, 'days').endOf('day')
                                object[newFrom.apiFormat()] = {
                                    from: newFrom,
                                    to: newTo,
                                }
                            }
                        }
                        return object
                    }

                    moment.duration.fn.format = function (input) {
                        let output = input
                        const milliseconds = this.asMilliseconds()
                        let totalMilliseconds = 0
                        const replaceRegexps = {
                            years: /Y(?!Y)/g,
                            months: /M(?!M)/g,
                            weeks: /W(?!W)/g,
                            days: /D(?!D)/g,
                            hours: /H(?!H)/g,
                            minutes: /m(?!m)/g,
                            seconds: /s(?!s)/g,
                            milliseconds: /S(?!S)/g,
                        }
                        const matchRegexps = {
                            years: /Y/g,
                            months: /M/g,
                            weeks: /W/g,
                            days: /D/g,
                            hours: /H/g,
                            minutes: /m/g,
                            seconds: /s/g,
                            milliseconds: /S/g,
                        }
                        for (const r in replaceRegexps) {
                            if (replaceRegexps[r].test(output)) {
                                const as = 'as' + r.charAt(0).toUpperCase() + r.slice(1)
                                const value = String(Math.floor(moment.duration(milliseconds - totalMilliseconds)[as]()))
                                let replacements = output.match(matchRegexps[r]).length - value.length
                                output = output.replace(replaceRegexps[r], value)
                                while (replacements > 0 && replaceRegexps[r].test(output)) {
                                    output = output.replace(replaceRegexps[r], '0')
                                    replacements--
                                }
                                output = output.replace(matchRegexps[r], '')
                                const temp = {}
                                temp[r] = value
                                totalMilliseconds += moment.duration(temp).asMilliseconds()
                            }
                        }
                        return output
                    }

                    window.moment = moment
                }(moment))
        } else {
            throw new Error('A momentJS instance was not found.')
        }
    },
}

// Automatically register library if Vue is available globally
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(LibraryModule)
}

export default LibraryModule
