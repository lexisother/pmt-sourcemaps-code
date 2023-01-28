import timeHelper from './timeHelper'
import moment from 'moment'

const locale = localStorage.getItem('language')
moment.locale(locale != null ? locale : 'nl')

/**
 * All functions are based on week start of Monday.
 */
const dateHelper = {

    /**
     * @returns {int}
     */
    getNumberOfWeeksInMonth (date) {
        return Math.ceil(moment(date).daysInMonth() / 7) // TODO: why november 2029 should return 6 weeks => see test Should return the correct number of weeks
    },

    /**
     * Returns the week data of the requested date.
     *
     * @returns {object}
     */
    getWeekNumber (date) { // TO DEPRECATE => only used in old availability (new availability should not use this)
        return {
            year: moment.utc(date).year(),
            month: moment(date).month(),
            weekNr: moment(date).isoWeek(),
        }
    },
    /**
     * Returns the date object of the first day of the given week.
     *
     * @param {int} weekNr
     * @param {int} year
     * @returns {Date}
     */
    getDateOfWeek (weekNr, year) { // TO DEPRECATE
        const date = new Date(year, 0, 1 + (weekNr - 1) * 7)
        const dayOfWeek = date.getDay()

        if (dayOfWeek <= 4) {
            date.setDate(date.getDate() - date.getDay() + 1)
        } else {
            date.setDate(date.getDate() + 8 - date.getDay())
        }

        return date
    },
    /**
     * Returns dates of all full weeks of the requested month.
     *
     * @param {int} month
     * @param {int} year
     * @returns {object}
     */
    getDaysOfMonthPerWeek (month, year) { // TO DEPRECATE
        const weeks = []
        const startDate = new Date(year, month, 1)
        const totalWeeks = this.getNumberOfWeeksInMonth(startDate)

        for (let i = 0; i < totalWeeks; i++) {
            const weekData = this.getWeekNumber(startDate)

            weeks.push({
                nr: weekData.weekNr,
                year: weekData.year,
                days: this.getDaysOfWeek(startDate),
            })

            startDate.setDate(startDate.getDate() + 7)
        }

        return weeks
    },
    /**
     * Returns all the dates in the week of the requested date.
     *
     * @param {Date} date
     * @returns {Array}
     */
    getDaysOfWeek (date) { // TO DEPRECATE
        const startDate = new Date(date)
        const week = []

        // starting on monday
        startDate.setDate((startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1)))

        for (let i = 0; i < 7; i++) {
            week.push(new Date(startDate.getTime()))

            startDate.setDate(startDate.getDate() + 1)
        }

        return week
    },
    /**
     * Returns the day of the week based on a monday starting week.
     *
     * @param {Date} date
     * @returns {int} Week day 1-7
     */
    getEuropeWeekDay (date) { // TO DEPRECATE
        const day = date.getDay() - 1

        return day < 0 ? 7 : day + 1
    },
    /**
     * Returns the start date and end date from the requested month.
     *
     * @param {int} month
     * @param {int} year
     * @param {Boolean} trail Include trailing months in start/end.
     * @returns {object}
     */
    getDateRangeOfMonth (month, year, trail) { // TO DEPRECATE
        const range = {
            from: new Date(year, month, 1),
            to: new Date(year, month + 1, 0),
        }

        if (trail) {
            const fromWeek = this.getWeekNumber(range.from)
            const startDate = this.getDateOfWeek(fromWeek.weekNr, fromWeek.year)

            const toWeek = this.getWeekNumber(range.to)
            const endDate = this.getDateOfWeek(toWeek.weekNr, toWeek.year)

            range.from = startDate
            range.to = endDate.addDays(6)
        }

        return range
    },

    /**
     * @param {string} dateStr
     * @returns {Boolean}
     */
    isValidUsDateString (dateStr) { // TO DEPRECATE
        return !!/^\d{4}-\d{1,2}-\d{1,2}( \d{1,2}:\d{1,2}(:\d{1,2})?)?$/.exec(dateStr)
    },
    /**
     * @param {string} dateStr
     * @returns {Boolean}
     */
    isValidEuDateString (dateStr) { // TO DEPRECATE
        return !!/^\d{1,2}-\d{1,2}-\d{4}( \d{1,2}:\d{1,2}(:\d{1,2})?)?$/.exec(dateStr)
    },
    /**
     * @param {string} weekStr
     * @returns {Boolean}
     */
    isValidWeekString (weekStr) { // TO DEPRECATE
        return !!/^\d{1,2}-\d{4}$/.exec(weekStr)
    },
    /**
     * @param {Date} date
     * @returns {Boolean}
     */
    isValidDate (date) { // TO DEPRECATE
        return date instanceof Date && !isNaN(date)
    },
    /**
     * Returns true if given string is a valid timestamp.
     *
     * @param {int} timestamp
     * @returns {boolean}
     */
    isValidTimeStamp (timestamp) { // TO DEPRECATE
        return /^[0-9]+$/.test(timestamp)
    },
    formatDate (dateStr, locale) { // TO DEPRECATE => use config global format
        return moment(dateStr).format('DD MMMM YYYY')
    },
    /**
     * Returns the date object based on the provided date string (YYYY-M(M)-D(D)( HH(:MM)(:SS))
     *
     * @param {String} dateStr
     * @returns {Date}
     */
    getDateFromString (dateStr) { // TO DEPRECATE => only one format should be used (database/server format), the display is a different matter
        if (this.isValidEuDateString(dateStr)) {
            return this.getEuDateFromString(dateStr)
        } else if (this.isValidUsDateString(dateStr)) {
            return this.getUsDateFromString(dateStr)
        }

        throw new Error('Given date format "' + dateStr + '" is not recognized.')
    },
    /**
     * Returns date object based on given US date format string (YYYY-MM-DD (H:M(:S))))
     *
     * @param {String} dateStr
     * @returns {Date}
     */
    getUsDateFromString (dateStr) { // TO DEPRECATE
        const regex = /^(\d{4})-(\d{1,2})-(\d{1,2})( (\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/
        const found = dateStr.match(regex)

        const year = found[1]
        const month = parseInt(found[2]) - 1
        const day = found[3]

        const hours = found[5] || 0
        const minutes = found[6] || 0
        const seconds = found[8] || 0

        return new Date(year, month, day, hours, minutes, seconds)
    },
    /**
     * Returns date object based on given EU date format string (DD-MM-YYYY (H:M(:S))))
     *
     * @param {String} dateStr
     * @returns {Date}
     */
    getEuDateFromString (dateStr) { // TO DEPRECATE
        const regex = /^(\d{1,2})-(\d{1,2})-(\d{4})( (\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/
        const found = dateStr.match(regex)
        const year = found[3]
        const month = parseInt(found[2]) - 1
        const day = found[1]

        const hours = found[5] || 0
        const minutes = found[6] || 0
        const seconds = found[8] || 0

        return new Date(year, month, day, hours, minutes, seconds)
    },
    /**
     * Returns the month name from the requested month index.
     *
     * @param {int} month
     * @param {string} locale
     * @returns {string}
     */
    getMonthAsString (month, locale) { // TO DEPRECATE
        const date = new Date()

        date.setDate(1)
        date.setMonth(month)
        return date.toDateString('{full-month}', locale)
    },
    /**
     * Returns the short month name from the requested month index.
     *
     * @param {int} month
     * @param {string} locale
     * @returns {string}
     */
    getMonthShortName (month, locale) { // TO DEPRECATE
        const date = new Date()

        date.setDate(1)
        date.setMonth(month)

        return date.toDateString('{short-month}', locale)
    },
}

// TO DEPRECATE ALL PROTOTYPES AND USE BUILT IN MOMENT METHODS
/*
 * DATE PROTOTYPE HELPER FUNCTIONS
 ======================================================== */
/**
 * Add given months to the date.
 *
 * @param {int} months
 * @returns {Date}
 */
Date.prototype.addMonths = function (months) {
    const date = new Date(this.valueOf())

    date.setMonth(date.getMonth() + months)

    return date
}

/**
 * Subtract given months from the date.
 *
 * @param {int} months
 * @returns {Date}
 */
Date.prototype.subMonths = function (months) {
    const date = new Date(this.valueOf())

    date.setMonth(date.getMonth() - months)

    return date
}

/**
 * Add given years to the date.
 *
 * @param {int} years
 * @returns {Date}
 */
Date.prototype.addYears = function (years) {
    const date = new Date(this.valueOf())

    date.setFullYear(date.getFullYear() + years)

    return date
}

/**
 * Subtract given years from the date.
 *
 * @param {int} years
 * @returns {Date}
 */
Date.prototype.subYears = function (years) {
    const date = new Date(this.valueOf())

    date.setFullYear(date.getFullYear() - years)

    return date
}

/**
* Add given days to the date.
*
* @param {int} days
* @returns {Date}
*/
Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf())

    date.setDate(date.getDate() + days)

    return date
}

/**
* Subtract given days from the date.
*
* @param {int} days
* @returns {Date}
*/
Date.prototype.subDays = function (days) {
    const date = new Date(this.valueOf())

    date.setDate(date.getDate() - days)

    return date
}

/**
 * Add given minutes to the date.
 *
 * @param {int} minutes
 * @returns {Date}
 */
Date.prototype.addMinutes = function (minutes) {
    const date = new Date(this.valueOf())

    return new Date(date.getTime() + minutes * 60000)
}

/**
 * Subtract given minutes of the date.
 *
 * @param {int} minutes
 * @returns {Date}
 */
Date.prototype.subMinutes = function (minutes) {
    const date = new Date(this.valueOf())

    return new Date(date.getTime() - minutes * 60000)
}

/**
 * Subtract given hours of the date.
 *
 * @param {int} hours
 * @returns {Date}
 */
Date.prototype.subHours = function (hours) {
    const date = new Date(this.valueOf())

    return new Date(date.getTime() - (hours * 60) * 60000)
}

/**
 * Add given hours to the date.
 *
 * @param {int} hours
 * @returns {Date}
 */
Date.prototype.addHours = function (hours) {
    const date = new Date(this.valueOf())

    return new Date(date.getTime() + (hours * 60) * 60000)
}

/**
 * Returns the date time as a string (HH:MM).
 *
 * @returns {string}
 */
Date.prototype.getTimeAsString = function () {
    const date = new Date(this.valueOf())
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes
}

/**
 * Sets the date time from a string (HH:MM(:SS)).
 *
 * @param {string} timeStr
 * @returns {string}
 */
Date.prototype.setTimeFromString = function (timeStr) {
    const date = new Date(this.valueOf())
    const time = timeStr.split(':')

    date.setHours(time[0])
    date.setMinutes(time[1])
    date.setSeconds(time[2] || 0)
    date.setMilliseconds(0)

    return date
}

/**
 * Round the time to the closest posibility.
 *
 * @param {int} minutes Round time per x minutes.
 * @returns {Date}
 */
Date.prototype.roundTime = function (minutes) {
    const time = timeHelper.getRoundedTimeString(this.getTimeAsString(), minutes)

    return new Date(this.valueOf()).setTimeFromString(time)
}

/**
 * Returns the API date format.
 *
 * @returns {string}
 */
Date.prototype.toApiFormat = function () {
    const date = new Date(this.valueOf())
    let day = date.getDate()
    let month = date.getMonth() + 1

    if (day < 10) {
        day = '0' + day
    }

    if (month < 10) {
        month = '0' + month
    }

    return date.getFullYear() + '-' + month + '-' + day
}

/**
 * Format date to string.
 *
 * @param {object} options
 * @returns {string}
 */
Date.prototype.toDateString = function (format, locale) {
    if (!locale) {
        locale = 'nl'
    }

    if (!format) {
        format = '{day}/{month}/{year}'
    }

    const date = new Date(this.valueOf())

    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    const hour = (date.getHours() < 10 ? '0' : '') + date.getHours()
    const minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
    const second = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()

    const fullMonth = date.toLocaleString(locale, { month: 'long' }).replace('.', '')
    const shortMonth = date.toLocaleString(locale, { month: 'short' }).replace('.', '')

    const weekday = date.toLocaleString(locale, { weekday: 'long' }).replace('.', '')
    const shortWeekday = date.toLocaleString(locale, { weekday: 'short' }).replace('.', '')

    const monthLeadZero = ((month + 1) < 10 ? '0' : '') + (month + 1)
    const dayLeadZero = (day < 10 ? '0' : '') + day

    return format.replaceArray([
        '{day}',
        '{month}',
        '{year}',
        '{full-month}',
        '{short-month}',
        '{day-lead-zero}',
        '{month-lead-zero}',
        '{weekday}',
        '{short-weekday}',
        '{short-year}',
        '{hour}',
        '{minute}',
        '{second}',
    ], [
        day,
        month + 1,
        year,
        fullMonth,
        shortMonth,
        dayLeadZero,
        monthLeadZero,
        weekday,
        shortWeekday,
        year.toString().substr(2),
        hour,
        minute,
        second,
    ]).replace(/[^ -~]/g, '')
}

/**
 * @returns {float}
 */
Date.prototype.diffInDays = function (otherDate) {
    return (this.diffInHours(otherDate) / 24)
}

/**
 * @returns {float}
 */
Date.prototype.diffInHours = function (otherDate) {
    return (this.diffInMinutes(otherDate) / 60)
}

/**
 * @returns {float}
 */
Date.prototype.diffInMinutes = function (otherDate) {
    const date = new Date(this.valueOf())
    const diffMs = Math.abs(otherDate - date)

    return (diffMs / 1000) / 60
}

/**
 * @returns {Boolean}
 */
Date.prototype.sameDateAs = function (otherDate) {
    const date = new Date(this.valueOf())

    if (!otherDate) {
        return false
    }

    return date.getFullYear() === otherDate.getFullYear() &&
           date.getMonth() === otherDate.getMonth() &&
            date.getDate() === otherDate.getDate()
}

export default dateHelper
