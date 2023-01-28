import Vue from 'vue'
import language from '../config/language'
import * as moment from '../config/moment'
Vue.use(moment)
class SchedulingHelper {
    shiftOverlapsNonPlannableMoments(shift, { shifts = [], rdos = [], availabilities = [], substituteRequests = [], storeAvailability = {} }) {
        const blockOne = {
            from: shift.start_datetime,
            to: shift.end_datetime,
        }
        const overlaps = this.newOverlapScenario()
        if (shift.nonProductive) return overlaps
        // RDOs
        rdos.filter(r => ['approved', 'pending'].includes(r.status)).forEach(rdo => {
            const blockTwo = {
                from: `${rdo.start_date} ${rdo.start_time}`,
                to: `${rdo.end_date} ${rdo.end_time}`,
            }
            if (!overlaps.rdo[rdo.status]) {
                overlaps.rdo[rdo.status] = this.overlapingBlockTimes(blockOne, blockTwo)
            }
        })

        if (overlaps.rdo.pending || overlaps.rdo.approved) {
            overlaps.distinctOverlapsCount++
        }

        // AVAILABILITY
        const nonAvailabilities = availabilities.filter(a => ['school', 'sport', 'other'].includes(a.type))
        nonAvailabilities.forEach(a => {
            const times = this.availabilityTimes(a)
            const blockTwo = {
                from: times.from.longApiFormat(),
                to: times.to.longApiFormat(),
            }
            if (!overlaps.availability[a.type]) {
                overlaps.availability[a.type] = this.overlapingBlockTimes(blockOne, blockTwo)
            }
        })
        const { school, other, sport } = overlaps.availability
        if (school || other || sport) {
            overlaps.availability.some = true
            overlaps.distinctOverlapsCount++
        }

        // SUBSTITUTE REQUESTS
        substituteRequests.filter(ssr => ssr.status === 'approved').forEach(ssr => {
            const blockTwo = {
                from: ssr.schedule_time_from,
                to: ssr.schedule_time_to,
            }
            if (!overlaps.substituteRequests.approved) {
                overlaps.substituteRequests.approved = this.overlapingBlockTimes(blockOne, blockTwo)
            }
        })

        if (overlaps.substituteRequests.approved) {
            overlaps.distinctOverlapsCount++
        }

        if (shift.pending_substitute_request && Object.keys(shift.pending_substitute_request).length) {
            overlaps.distinctOverlapsCount++
        }

        storeAvailability.filter(bd => bd.date === Vue.moment(shift.start_datetime).apiFormat()).forEach(businessDay => {
            const blockTwo = {
                from: `${businessDay.date} ${businessDay.business_from_time}`,
                to: `${businessDay.date} ${businessDay.business_to_time}`,
            }
            const overlapsFrom = blockOne.from < blockTwo.from
            const overlapsTo = blockOne.to > blockTwo.to
            overlaps.businessTimes.some = overlapsFrom || overlapsTo
            overlaps.businessTimes.from = overlapsFrom
            overlaps.businessTimes.to = overlapsTo
        })
        if (overlaps.businessTimes.some) {
            overlaps.distinctOverlapsCount++
        }
        return overlaps
    }

    /**
     * Default object for a shift overlap scenarios
     * @returns Object
     */
    newOverlapScenario() {
        return {
            businessTimes: {
                from: false,
                to: false,
                closed: false,
                some: false,
            },
            rdo: {
                approved: false,
                pending: false,
            },
            availability: {
                some: false, // if it overlaps with at least one availability
                school: false,
                sport: false,
                other: false,
            },
            substituteRequests: {
                approved: false,
                pending: false,
            },
            shift: false,
            distinctOverlapsCount: 0,
        }
    }

    shiftOverlapBusinessTimesInfo(businessTimesOverlap, dayBusinessTimes) {
        let overlapDirection = ''
        if (businessTimesOverlap.from) {
            overlapDirection = language.t('pages.scheduling.overlap.starts')
        }
        if (businessTimesOverlap.to) {
            overlapDirection = language.t('pages.scheduling.overlap.ends')
        }
        if (businessTimesOverlap.from && businessTimesOverlap.to) {
            overlapDirection = language.t('pages.scheduling.overlap.startsEnds')
        }
        if (dayBusinessTimes?.closed) {
            overlapDirection = language.t('ui.singles.is')
        }
        const title = language.t('pages.scheduling.overlap.startEndsBusinessTimes', { payload: overlapDirection })
        let subTitle = `${language.t('pages.scheduling.overlap.businessTimes')}: ${dayBusinessTimes?.business_from_time} - ${dayBusinessTimes?.business_to_time}`
        if (dayBusinessTimes?.closed) {
            subTitle = language.t('pages.scheduling.overlap.dayIsClosed')
        }
        return { title, subTitle }
    }

    availabilityTimes(availability, referenceDate) {
        let from = Vue.moment(availability.date).setTime(availability.time_from)
        let to = Vue.moment(availability.date).setTime(availability.time_to)
        if (availability.travel_before) {
            from = from.clone().subtractTime(availability.travel_before)
        }
        if (availability.travel_after) {
            to = to.clone().addTime(availability.travel_after)
        }
        if (referenceDate) {
            if (from.isoWeek() < referenceDate.isoWeek()) {
                from = referenceDate
            }
            if (to.isoWeek() > referenceDate.isoWeek()) {
                to = referenceDate.endOf('isoWeek').endOf('day')
            }
        }
        const duration = Vue.moment.duration(to.diff(from))
        return { from, to, duration }
    }

    availabilityTimeRange(availability) {
        const availabilityTimes = this.availabilityTimes(availability)
        return Vue.moment().momentTimeRange(availabilityTimes.from, availabilityTimes.to, 15, 'minutes', 'YYYY-MM-DD HH:mm')
    }

    departmentsCsvWithDefaultHighlight(departments) {
        if (!departments.length) return ''
        const tagify = (d) => {
            const checked = '<span style="font-size: 12px;">&#10003;</span>'
            return `<span class="tag">${d.department_name} ${checked}</span>`
        }
        let result = tagify(departments.find(d => d.is_default))
        if (departments.length > 1) {
            result += ', ' + departments.filter(d => !d.is_default).map(d => d.department_name).join(', ')
        }
        return result
    }

    updateShiftBreaksAndDuration(shift, suggestedBreaks) {
        const from = Vue.moment(shift.start_datetime)
        const to = Vue.moment(shift.end_datetime)
        const breaks = suggestedBreaks
        let breaksDuration = 0
        breaks.forEach(br => {
            breaksDuration += Vue.moment.duration(br.duration).asMinutes()
        })
        const duration = Vue.moment.duration(to.diff(from)).subtract(breaksDuration, 'minutes').format('HH:mm')
        return { breaks, duration }
    }

    DOMElementsByQuery(query) {
        const desiredElements = document.querySelectorAll(query)
        const elements = []
        if (desiredElements.length) {
            // eslint-disable-next-line no-unused-vars
            for (const el of desiredElements) {
                elements.push(el)
            }
        }
        return elements
    }

    areElementsColliding(firstElement, secondElement) {
        const d1Offset = firstElement.getBoundingClientRect()
        const d1Height = firstElement.offsetHeight
        const d1Width = firstElement.offsetWidth
        const d1Top = d1Offset.top + d1Height
        const d1Left = d1Offset.left + d1Width

        const d2Offset = secondElement.getBoundingClientRect()
        const d2Height = secondElement.offsetHeight
        const d2Width = secondElement.offsetWidth
        const d2Top = d2Offset.top + d2Height
        const d2Left = d2Offset.left + d2Width

        return !(d1Top <= d2Offset.top || d1Offset.top >= d2Top || d1Left <= d2Offset.left || d1Offset.left >= d2Left)
    }

    shiftHasOverlap(shiftHTMLElement, excludeId = 'shadow') {
        const elementId = shiftHTMLElement ? shiftHTMLElement.id : 0
        const otherShifts = this.DOMElementsByQuery('.shift:not(.non-productive-simple)').filter(e => e.id !== elementId && !e.id.includes(excludeId))
        for (let i = 0; i < otherShifts.length; i++) {
            if (this.areElementsColliding(shiftHTMLElement, otherShifts[i])) {
                return true
            }
        }
        return false
    }

    isUnEmployedInSelectedWeek(employee, date) {
        const employedFrom = employee.details.date_of_employment ? Vue.moment(employee.details.date_of_employment) : false
        const employedUntil = employee.details.date_of_unemployment ? Vue.moment(employee.details.date_of_unemployment) : false
        if (employedFrom && date.isBefore(employedFrom, 'week')) {
            return true
        }
        if (employedUntil && date.isAfter(employedUntil, 'week')) {
            return true
        }
        return false
    }

    isOverlapingOtherShifts(shift, shifts, onlyTimes = false) {
        const overlap = {
            before: false,
            during: false,
            after: false,
        }
        const blockOne = {
            from: onlyTimes ? Vue.moment(shift.start_datetime).shortTime() : shift.start_datetime,
            to: onlyTimes ? Vue.moment(shift.end_datetime).shortTime() : shift.end_datetime,
        }
        for (const otherShift of shifts) {
            const blockTwo = {
                from: onlyTimes ? Vue.moment(otherShift.start_datetime).shortTime() : otherShift.start_datetime,
                to: onlyTimes ? Vue.moment(otherShift.end_datetime).shortTime() : otherShift.end_datetime,
            }
            if (this.overlapingBlockTimes(blockOne, blockTwo)) {
                overlap.before = true
                overlap.during = true
                overlap.after = true
                break
            }
        }
        return overlap
    }

    shiftOnDateFilter(shift, date, dayView = false) {
        const checkDate = date.clone()
        const from = Vue.moment(shift.start_datetime)
        const to = Vue.moment(shift.end_datetime)
        const sameFrom = from.apiFormat() === checkDate.apiFormat()
        const sameTo = to.apiFormat() === checkDate.apiFormat()
        const startsPreviousWeek = date.isoWeekday() === 1 && from.isoWeek() < date.isoWeek()
        const endsNextWeek = date.isoWeekday() === 7 && to.isoWeek() > date.isoWeek()
        const startsPreviousDay = from.isSame(checkDate.clone().subtract(1, 'days'), 'day')
        const endsNextDay = to.isSame(checkDate.clone().add(1, 'days'), 'day')
        return startsPreviousWeek || endsNextWeek || (dayView && (startsPreviousDay || endsNextDay)) || sameFrom || sameTo
    }

    /**
     * Return an overlap object.
     * @param {Object} shifts
     * @param {Array} shift
     * @returns Object
     */
    checkStandardShiftsFrequencyOverlap(shifts, shift) {
        const referenceShiftTimes = []
        const currentTimes = []
        const shiftTime = Vue.moment(shift.start_datetime)
        const otherShifts = shifts.map(s => {
            const from = Vue.moment(s.start_datetime)
            const to = Vue.moment(s.end_datetime)
            let diff = Vue.moment.duration(shiftTime.diff(from))
            // because we check only 52 weeks of possible overlaps,
            // we need to bring the existing shifts that are being checked,
            // which might have a start date as far as 5-10 years back,
            // to a more recent date, so we add (frequency) weeks until we are
            // close enough to the checked shift
            while (diff.asWeeks() > 8) {
                from.add(s.frequency, 'weeks')
                to.add(s.frequency, 'weeks')
                diff = Vue.moment.duration(shiftTime.diff(from))
            }
            return {
                shift: s,
                frequency: Number(s.frequency),
                from,
                to,
            }
        })
        const referenceShift = {
            shift,
            frequency: Number(shift.frequency),
            from: Vue.moment(shift.start_datetime),
            to: Vue.moment(shift.end_datetime),
            last_occurrence: shift.last_occurrence,
        }
        let overlap = {
            before: false,
            during: false,
            after: false,
        }
        for (let i = 0; i < otherShifts.length; i++) {
            const currentShift = otherShifts[i]
            const isOverlapping = (shiftOne, shiftTwo) => {
                const overlapScenario = this.isOverlapingOtherShifts(shiftOne, [shiftTwo], true)
                if (overlapScenario.before || overlapScenario.after || overlapScenario.during) {
                    return overlapScenario
                }
                return false
            }
            const isSameWeekDay = currentShift.from.isoWeekday() === referenceShift.from.isoWeekday()
            if (!isSameWeekDay) continue // skip check if another weekday day
            const neverEnding = !currentShift.last_occurrence
            const hasSameFrequency = currentShift.frequency === referenceShift.frequency
            const sameWeekStart = currentShift.from.isoWeek() === referenceShift.from.isoWeek()
            const simpleOverlap = isOverlapping(referenceShift.shift, currentShift.shift)
            if (neverEnding && hasSameFrequency && simpleOverlap && sameWeekStart) {
                overlap = simpleOverlap
                break
            } else {
                this.shiftFrequencyWeekTimes(referenceShift, referenceShiftTimes)
                this.shiftFrequencyWeekTimes(currentShift, currentTimes)
                for (let i = 0; i < referenceShiftTimes.length; i++) {
                    const time = referenceShiftTimes[i]
                    if (currentTimes.includes(time)) {
                        overlap = {
                            ...this.isOverlapingOtherShifts(currentShift.shift, [referenceShift.shift], true),
                            shift: currentShift.shift,
                        }
                        break
                    }
                }
            }
        }
        return overlap
    }

    /**
     * Returns an array with times for all the shift occurrence in the
     * next weeksAmount weeks
     * @param {Object} shift the shift for which to build a times array
     * @param {Array} arr the array to fill the times with
     * @param {Number} weeksAmount the number of loop increments
     */
    shiftFrequencyWeekTimes(shift, arr = [], weeksAmount = 52) {
        // build and insert a range of 15 minutes increment times of the shift from and to
        const insertRange = (from, to) => {
            const shiftTimeRange = Vue.moment().momentTimeRange(from.clone().add(15, 'minutes'), to, 15, 'minutes', 'YYYY-MM-DD HH:mm')
            shiftTimeRange.forEach(range => {
                arr.push(range)
            })
        }
        // insert initial times before starting the loop
        insertRange(shift.from, shift.to)
        let referenceWeeks = 0
        let referenceLoopFrom = shift.from.clone()
        let referenceLoopTo = shift.to.clone()
        const isReferenceShiftEnded = () => {
            // check if the shift checks should still be done
            // stop checks when the shift last_occurrence is lower
            // or equal than the reference time check
            if (!shift.last_occurrence) return false
            return shift.last_occurrence < referenceLoopFrom.apiFormat()
        }
        // loop through the amount of provided weeksAmount and keep adding the shift frequency
        // to the shift start and end times to build a time range for each week
        // that the shift will occur inside the provided weekAmount param
        while (referenceWeeks <= weeksAmount) {
            // insert current loop time range
            insertRange(referenceLoopFrom, referenceLoopTo)
            // update the times with the frequency increment
            // for the next loop batch
            referenceLoopFrom = referenceLoopFrom.add(shift.frequency, 'weeks')
            referenceLoopTo = referenceLoopTo.add(shift.frequency, 'weeks')
            referenceWeeks += shift.frequency
            // check if the shift is ended in the current batch
            // and break the loop
            if (isReferenceShiftEnded()) {
                break
            }
        }
    }

    unknownDepartment() {
        return {
            department_name: language.t('ui.singles.unknown'),
            department_shortname: language.t('ui.singles.unknown'),
        }
    }

    /**
     * Calculate shift length in minutes (subtract breaks)
     * @param {*} shift (Object)
     * @returns Number
     */

    shiftMinutes(shift) {
        let breakDuration = 0
        shift.breaks.forEach(shiftBreak => {
            breakDuration += Vue.moment.duration(shiftBreak.duration).asMinutes()
        })
        const from = Vue.moment(shift.start_datetime)
        const to = Vue.moment(shift.end_datetime)
        return Vue.moment.duration(Vue.moment(to).diff(Vue.moment(from))).asMinutes() - breakDuration
    }

    /**
     * Create real abbreviation for department name, department_shortname is not always a short ;-)
     */
    departmentAbbreviation(department) {
        if (!department || !department.department_shortname) return null
        if (department.department_shortname.length < 5) {
            return department.department_shortname
        }
        return department.department_shortname.substring(0, 3)
    }

    rdoDuration(rdo) {
        const start = Vue.moment(rdo.start_date).setTime(rdo.start_time)
        const end = Vue.moment(rdo.end_date).setTime(rdo.end_time)
        return Vue.moment.duration(end.diff(start))
    }

    /**
     * Checks if two object with { from, to } string times are overlapping
     * @param {Object} blockOne
     * @param {Object} blockTwo
     * @returns Boolean
     */
    overlapingBlockTimes(blockOne, blockTwo) {
        const isSameOrBefore = blockOne.from <= blockTwo.from && blockOne.to >= blockTwo.to
        const isBetween = blockOne.to > blockTwo.from && blockOne.to <= blockTwo.to
        const isSameOrAfter = blockOne.from >= blockTwo.from && blockOne.from < blockTwo.to
        if (isSameOrAfter || isBetween || isSameOrBefore) {
            return true
        }
        return false
    }
}

export default new SchedulingHelper()
