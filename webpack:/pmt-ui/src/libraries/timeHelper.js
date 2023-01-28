import moment from 'moment'

const timeHelper = {
    /**
     * Adds time string B to time string A and trurns the outcome as time string hh:mm.
     *
     * @param {String} timeStrA
     * @param {String} timeStrB
     * @returns {String}
     */
    addTimeStrings (timeStrA, timeStrB) {
        const timeA = this.getTimeAsObject(this.getTimeFromString(timeStrA))
        const timeB = this.getTimeAsObject(this.getTimeFromString(timeStrB))

        let hours = timeA.hours + timeB.hours
        let minutes = timeA.minutes + timeB.minutes

        if (minutes > 59) {
            hours += Math.floor(minutes / 60)
            minutes = minutes % 60
        }

        if (hours > 23) {
            hours -= 24
        }

        return this.getTimeFromString(hours + ':' + minutes)
    },
    /**
     * Subtract time string B to time string A and trurns the outcome as time string hh:mm.
     *
     * @param {String} timeStrA
     * @param {String} timeStrB
     * @returns {String}
     */
    subtractTimeStrings (timeStrA, timeStrB) {
        const timeA = this.getTimeAsObject(this.getTimeFromString(timeStrA))
        const timeB = this.getTimeAsObject(this.getTimeFromString(timeStrB))

        let hours = timeA.hours - timeB.hours
        let minutes = timeA.minutes - timeB.minutes

        if (minutes < 0) {
            hours--
            minutes = 60 + minutes
        }

        if (hours < 0) {
            hours = 24 + hours
        }

        return this.getTimeFromString(hours + ':' + minutes)
    },
    /**
     * Returns the HH:MM from a object (float), based on moment.duration
     *
     * @param {Object} payload Moment object
     * @returns {String}
     */
    floatToHoursAndMinutes (payload) {
        const hours = Math.floor(payload.asHours())
        const minutes = Math.floor(payload.asMinutes()) - hours * 60
        const hoursAndMinutes = this.getLeadingZeroNumber(hours) + ':' + this.getLeadingZeroNumber(minutes)
        return hoursAndMinutes
    },
    /**
     *
     * @param {String} timeStrA
     * @param {String} timeStrB
     * @returns {String}
     */
    subtractTimes (timeStrA, timeStrB) {
        const varA = moment.duration(timeStrA).asMinutes()
        const varB = moment.duration(timeStrB).asMinutes()
        const total = varA - varB
        return this.returnFormattedTimeFromNumber(total)
    },

    /**
     *
     * @param {Array} payload
     * @returns {String}
     */
    addTimes (payload) {
        let totalMinutes = 0
        payload.forEach(item => {
            totalMinutes += moment.duration(item).asMinutes()
        })
        return this.returnFormattedTimeFromNumber(totalMinutes)
    },

    /**
     *
     * @param {Number} totalCurrentHoursMinutes
     * @returns {String}
     */
    returnFormattedTimeFromNumber (totalCurrentHoursMinutes) {
        const isNegative = (totalCurrentHoursMinutes < 0)
        totalCurrentHoursMinutes = Math.abs(totalCurrentHoursMinutes)

        const hours = Math.floor(totalCurrentHoursMinutes / 60)
        const minutes = totalCurrentHoursMinutes % 60

        const total = (isNegative ? '-' : '') + hours + ':' + timeHelper.getLeadingZeroNumber(minutes)

        return total
    },

    /**
     *
     * @param {String} num
     * @returns {Number}
     */
    getLeadingZeroNumber (num) {
        if (num < 10) {
            return '0' + num
        }

        return num
    },

    /**
     * Returs the given time string as an object with hours and minutes.
     *
     * @param {String} timeStr
     * @returns {Object}
     */
    getTimeAsObject (timeStr) {
        return {
            hours: parseInt(moment(timeStr, 'HH:mm').format('HH')),
            minutes: parseInt(moment(timeStr, 'HH:mm').format('mm')),
        }
    },

    /**
     * Returns the total number of minutes of the given time string.
     *
     * @param {String} timeStr
     * @returns {Integer}
     */
    convertTimeToMinutes (timeStr) {
        const timeArr = this.getTimeAsObject(timeStr)

        return (timeArr.hours * 60) + timeArr.minutes
    },
    /**
     * Returns time as string hh:mm from the given input string.
     *
     * Example:
     *   1     => 01:00
     *   01    => 01:00
     *   105   => 01:05
     *   26    => 23:00
     *   123   => 01:23
     *   905   => 23:05
     *   2322  => 23:22
     *   0123  => 01:23
     *   1:1   => 01:01
     *   12:1  => 12:01
     *   12:12 => 12:12
     *   12:88 => 12:59
     *   sds2e => 00:00
     *
     * @param {String} timeStr Input string
     * @returns {String} hh:mm
     */
    getTimeFromString (timeStr) {
        const cleanTimeStr = timeStr.replace(/(?!:|\d)./, '') // remove all the unwanted characters
        const timeArr = cleanTimeStr.match(/^(\d{1,2}):?(\d{0,2})$/)
        const hasColon = cleanTimeStr.indexOf(':') > -1

        if (timeArr === null) {
            return '00:00'
        }

        let hours = parseInt(timeArr[1])
        let minutes = parseInt(timeArr[2])

        if (timeArr[2].length === 0) {
            minutes = 0
        }

        if (!hasColon && timeArr[1].length === 2 && timeArr[2].length === 1) {
            hours = parseInt(timeArr[1][0])
            minutes += parseInt(timeArr[1][1] * 10)
        }

        if (hours >= 24) {
            hours = 23
        }

        if (hours === 24) {
            hours = 0
        }

        if (hours < 10) {
            hours = '0' + hours
        }

        if (minutes < 10) {
            minutes = '0' + minutes
        } else if (minutes > 59) {
            minutes = '59'
        }

        return hours + ':' + minutes
    },

    /**
     * This is similar to getTimeFromString() method except that it accepts any amount of hours,
     * not only datetime accepted (in interval 00:00 -> 24:00)
     * Formats a string to time string. For example:
     *   1     => 01:00
     *   105   => 01:05
     *   26    => 26:00
     *   105   => 01:23
     *   12000 => 120:00
     *   1:1   => 01:01
     *   12:1  => 12:01
     *   12:12 => 12:12
     *   12:88 => 12:59
     *   sds2e => 00:00
     *
     * @param timeStr
     */
    formatStringToHoursAndMinutes (timeStr) {
        // remove all the unwanted characters
        timeStr = timeStr.replace(/(?!:|\d)./, '')
        const hasColon = timeStr.indexOf(':') > -1
        // Add color in order to match the hours properly using regex.
        if (!hasColon && timeStr.length > 2) {
            timeStr = [timeStr.slice(0, -2), ':', timeStr.slice(-2)].join('')
        }
        const timeArr = timeStr.match(/^(\d{1,10}):?(\d{0,2})$/)

        if (timeArr === null) {
            return '00:00'
        }

        let hours = parseInt(timeArr[1])
        let minutes = parseInt(timeArr[2])

        if (timeArr[2].length === 0) {
            minutes = 0
        }

        if (!hasColon && timeArr[1].length === 2 && timeArr[2].length === 1) {
            hours = parseInt(timeArr[1][0])
            minutes += parseInt(timeArr[1][1] * 10)
        }

        if (hours < 10) {
            hours = '0' + hours
        }

        if (minutes < 10) {
            minutes = '0' + minutes
        } else if (minutes > 59) {
            minutes = '59'
        }

        return hours + ':' + minutes
    },

    /**
     * Returns true if the given time is in the given range.
     *
     * @param {string} timeStr
     * @param {string} rangeStart
     * @param {string} rangeEnd
     * @returns {boolean}
     */
    isTimeInRange (timeStr, rangeStart, rangeEnd) {
        const start = new Date().setTimeFromString(rangeStart)
        const end = new Date().setTimeFromString(rangeEnd)
        const time = new Date().setTimeFromString(timeStr)

        return time >= start && time <= end
    },
    /**
     * Returns the time string (hh:mm) based on the given total minutes.
     *
     * @param {int} minutes
     * @returns {string}
     */
    minutesToTimeString (minutes) {
        return this.getTimeFromString(parseInt(minutes / 60) + ':' + parseInt(minutes % 60))
    },
    /**
     * Returns the duration in minutes of the two given string times.
     *
     * @param {string} timeA
     * @param {string} timeB
     * @returns {int}
     */
    getDuration (timeA, timeB) {
        const duration = this.subtractTimeStrings(timeB, timeA)

        return this.convertTimeToMinutes(duration)
    },
    /**
     * Returns true if time A is greater then time B.
     *
     * @param {string} timeA
     * @param {string} timeB
     * @returns {bool}
     */
    isGreaterThen (timeA, timeB) {
        const timeAInMin = this.convertTimeToMinutes(timeA)
        const timeBInMin = this.convertTimeToMinutes(timeB)

        return timeAInMin > timeBInMin
    },
    /**
     * Returns true if time A is less then time B.
     *
     * @param {string} timeA
     * @param {string} timeB
     * @returns {bool}
     */
    isLessThen (timeA, timeB) {
        return this.isGreaterThen(timeB, timeA)
    },
    /**
     * Returns true if time A is equal to time B.
     *
     * @param {string} timeA
     * @param {string} timeB
     * @returns {bool}
     */
    areTheSame (timeA, timeB) {
        const timeAInMin = this.convertTimeToMinutes(timeA)
        const timeBInMin = this.convertTimeToMinutes(timeB)

        return timeAInMin === timeBInMin
    },
    /**
     * Returns the given time string rounded on the given minutes.
     *
     * @param {string} timeStr hh:mm
     * @param {int} roundOnMinutes
     * @returns {string} hh:mm
     */
    getRoundedTimeString (timeStr, roundOnMinutes, roundingMethod) {
        const timeInMinutes = this.convertTimeToMinutes(timeStr)

        if (!roundOnMinutes || !~['floor', 'ceil'].indexOf(roundingMethod)) {
            roundingMethod = 'round'
        }

        return timeHelper.minutesToTimeString(roundOnMinutes * Math[roundingMethod](timeInMinutes / roundOnMinutes))
    },

    getTimeCellClass (timeObj) {
        if (timeObj) {
            const timeArr = timeObj.match(/^([-+])?(\d{1,3}):(\d{1,3})$/)
            const isNegative = (timeArr[1] === '-')

            return {
                positive: !isNegative && timeArr[0] !== '00:00',
                negative: isNegative,
            }
        }
    },

    getDayCellClass (dayObj) {
        const isNegative = (dayObj < 0)

        return {
            positive: !isNegative && dayObj !== '0.00',
            negative: isNegative,
        }
    },

    /**
     * Returns the duration between two hours in HH:mm format.
     *
     * @param {string} start HH:mm
     * @param {string} end HH:mm
     * @returns {string} HH:mm
     */
    duration (start, end) {
        return moment.utc(moment.duration(moment(end).diff(moment(start))).asMilliseconds()).format('HH:mm')
    },

    formatTimeFromString (val, allowAllHours) {
        // replace all characters with empty string, except numbers and colon (:)
        val ? val = val.toString().replace(/[^0-9\s.:]+|\.(?!\d)/g, '') : val = '00:00'
        // add colon after the first two characters if it's not there
        if (val.length > 2 && !val.includes(':')) {
            val = val.slice(0, 2) + ':' + val.slice(2)
        }
        const times = { hour: parseInt(val.substring(0, 2)), minute: parseInt(val.substring(3, 5)) }
        // do not allow hours greater than 23
        if (!allowAllHours) {
            if (times.hour > 23) {
                val = val.replace(val.substring(0, 2), '23')
            }
            // do not allow minutes greater than 59
            if (times.minute > 59) {
                val = this.from.replace(val.substring(3, 5), '59')
            }
        }
        // do not allow string length greater than 5
        if (val.length > 5 && !allowAllHours) {
            val = val.slice(0, 5)
        }
        return val
    },

    calculateBusinessTimes (newTime, weekBusinessTimes) {
        if (weekBusinessTimes) {
            const dayBusinessTimes = weekBusinessTimes.store_availability ? weekBusinessTimes.store_availability[newTime.isoWeekday() - 1] : { business_from_time: '00:00', business_to_time: '23:59' }
            if (dayBusinessTimes.closed) {
                newTime.isBeforeBusinessTimes = true
                newTime.isAfterBusinessTimes = true
                newTime.insideBusinessTimes = false
                return newTime
            }
            newTime.isBeforeBusinessTimes = newTime.shortTime() < dayBusinessTimes.business_from_time && dayBusinessTimes.business_from_time !== '00:00'
            newTime.isAfterBusinessTimes = newTime.shortTime() >= dayBusinessTimes.business_to_time && dayBusinessTimes.business_to_time !== '00:00'
            newTime.insideBusinessTimes = !newTime.isBeforeBusinessTimes && !newTime.isAfterBusinessTimes
            return newTime
        }
        return newTime
    },

    validateTime (value) {
        let result = ''
        // replace all characters with empty string, except numbers and colon (:)
        const initial = value.replace(/[^0-9\s.:]+|\.(?!\d)/g, '').substring(0, 5)
        const hasColon = initial.includes(':')
        if (hasColon) {
            result = this.validateTimeString(initial)
        } else {
            result = this.validateTimeNumbers(initial)
        }
        return result
    },

    validateTimeString (value) {
        let result = ''
        const timeArray = value.split(':')
        const hour = timeArray[0]
        const minutes = timeArray[1]
        if (Number(hour) < 10) {
            result = `0${Number(hour)}:`
        } else if (hour > 23) {
            result = '23:'
        } else {
            result = `${Number(hour)}:`
        }
        if (Number(minutes) < 10) {
            result = `${result}0${Number(minutes)}`
        } else if (Number(minutes) > 59) {
            result = `${result}00`
        } else {
            result = `${result}${Number(minutes)}`
        }
        return result
    },

    validateTimeNumbers (value) {
        let result = ''
        let firstHourDigit = 0
        let secondHourDigit = 0
        let firstMinutesDigit = 0
        let secondMinutesDigit = 0
        const timeArray = value.split('').map(n => Number(n))
        if (timeArray.length === 1) {
            result = `0${timeArray[0]}:00`
        } else if (timeArray.length === 2) {
            const hour = Number(`${timeArray[0]}${timeArray[1]}`)
            if (hour < 9) {
                result = `0${hour}:00`
            } else if (hour > 23) {
                let first = timeArray[0]
                let second = timeArray[1]
                if (second > 5) {
                    first += 1
                    second = 0
                }
                result = `0${first}:${second}0`
            } else {
                result = `${hour}:00`
            }
        } else if (timeArray.length === 3) {
            if (timeArray[0] === 0) {
                firstHourDigit = 0
                secondHourDigit = timeArray[1]
                firstMinutesDigit = (timeArray[2] || 0) > 5 ? 5 : timeArray[2] || 0
                secondMinutesDigit = timeArray[3] || 0
            } else if (timeArray[0] === 1) {
                firstHourDigit = 0
                secondHourDigit = 1
                firstMinutesDigit = (timeArray[2] || 0) > 5 ? 5 : timeArray[2] || 0
                secondMinutesDigit = timeArray[3] || 0
            } else if (timeArray[0] > 1 && timeArray[0] < 10) {
                firstHourDigit = 0
                secondHourDigit = timeArray[0] || 0
                firstMinutesDigit = (timeArray[1] || 0) > 5 ? 5 : timeArray[1] || 0
                secondMinutesDigit = timeArray[2] || 0
            }
            result = `${firstHourDigit}${secondHourDigit}:${firstMinutesDigit}${secondMinutesDigit}`
        } else if (timeArray.length === 4) {
            if (timeArray[0] <= 1) {
                firstHourDigit = timeArray[0]
                secondHourDigit = timeArray[1]
                firstMinutesDigit = timeArray[2] > 5 ? 5 : timeArray[2]
                secondMinutesDigit = timeArray[3]
            } else if (timeArray[0] === 2) {
                firstHourDigit = timeArray[0]
                secondHourDigit = timeArray[1] > 3 ? 3 : timeArray[1]
                firstMinutesDigit = timeArray[2] > 5 ? 5 : timeArray[2]
                secondMinutesDigit = timeArray[3]
            } else if (timeArray[0] > 2) {
                firstHourDigit = 0
                secondHourDigit = timeArray[0]
                firstMinutesDigit = timeArray[2] > 5 ? 5 : timeArray[2]
                secondMinutesDigit = timeArray[3]
            }
            result = `${firstHourDigit}${secondHourDigit}:${firstMinutesDigit}${secondMinutesDigit}`
        }
        return result
    },

}

export default timeHelper
