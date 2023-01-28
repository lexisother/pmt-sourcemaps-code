import moment from 'moment'
import stringHelper from '../../../libraries/stringHelper'

const getters = {

    getSelectedAvailabilityDate(state) {
        return state.availabilityDate
    },

    availabilityTimeBlocks(state) {
        return state.availabilityTimeBlocks
    },

    /**
     * @todo To be moved to getters of DatePicker along with all related date properties.
     */
    getNavigationDirection(state) {
        return !state.previousDate || state.previousDate < state.availabilityDate ? 'right' : 'left'
    },

    activeTimeBlock(state) {
        return state.activeTimeblock
    },

    updateFormTravelTimes(state, times) {
        state.availabilityForm.travel.before = times.before
        state.availabilityForm.travel.after = times.after
    },

    getWeeksetTimeBlocksForDate: (state) => (date) => {
        const result = state.availabilityWeeksetTimeBlocks.filter(item => {
            return date.isSame(moment(item.date)) && item.repeat
        })
        result.sort((a, b) => {
            // sort date timeblocks ascending based on their start time.
            // this is usefull for month grid especially
            const a_time = parseInt(a.timeFrom)
            const b_time = parseInt(b.timeFrom)
            return a_time > b_time ? 1 : b_time > a_time ? -1 : 0
        })
        return result
    },

    getNewWeeksetTimeBlocks: (state) => (date) => {
        const result = state.availabilityNewWeeksetTimeBlocks.filter(item => {
            return date.isSame(moment(item.date))
        })
        return result.sort((a, b) => {
            const a_time = parseInt(a.timeFrom)
            const b_time = parseInt(b.timeFrom)
            return a_time > b_time ? 1 : b_time > a_time ? -1 : 0
        })
    },

    groupedEmployeesWeeksets: (state) => (grouping) => {
        return stringHelper.groupBy(state.employeesWeeksets, grouping)
    },

    weeksetsWithStatus: (state) => (status) => {
        return state.weeksets.filter(item => item.status === status)
    },

    getTimeBlocksForDate: (state) => (day) => {
        const result = state.availabilityTimeBlocks.filter(item => {
            if (item.date instanceof moment && day instanceof moment) {
                return day.isSame(item.date, 'day')
            }
            return moment(day).isSame(moment(item.date), 'day')
        })
        result.sort((a, b) => {
            const a_time = parseInt(a.timeFrom)
            const b_time = parseInt(b.timeFrom)
            return a_time > b_time ? 1 : b_time > a_time ? -1 : 0
        })
        return result
    },

    getPopoverPosition: (state) => (currentFormRect) => {
        let style
        const bodyRect = document.body.getBoundingClientRect()
        const clickedElementRect = state.newTimeBlockPosition ? state.newTimeBlockPosition : { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 }
        const topOffset = clickedElementRect.top - bodyRect.top
        style = {
            left: clickedElementRect.right + 'px',
            top: topOffset - clickedElementRect.height + 'px',
        }
        /* OVERFLOWING RIGHT */
        if (clickedElementRect.right + currentFormRect.width > bodyRect.width) {
            style = {
                left: clickedElementRect.left - currentFormRect.width + 'px',
                top: topOffset - clickedElementRect.height + 'px',
            }
        }
        if (clickedElementRect.bottom > bodyRect.height) { /* OVERFLOWING BOTTOM */
            style.top = clickedElementRect.top - currentFormRect.height + 'px'
        } else if (clickedElementRect.top + currentFormRect.height > bodyRect.height) { /* OVERFLOWING top */
            style.top = clickedElementRect.top - currentFormRect.height + clickedElementRect.height + 'px'
        }
        if (style.top.split('px')[0] < 0) {
            style.top = '15px'
        }
        /* OVERFLOWING left */
        if (style.left.split('px')[0] <= 0) {
            style.left = '15px'
        }
        return style
    },

    employeesWeekAvailabilities: (state) => (week, year) => {
        return state.employeesWeekAvailabilities[`"${week}-${year}"`]
    },

    getWeekEmployeeAvailabilities: (state) => async (payload) => {
        const weekAvailabilities = await state.employeesWeekAvailabilities.find(availability => {
            return availability.week === payload.week && availability.year === payload.year
        })
        if (weekAvailabilities) {
            return await weekAvailabilities.availabilities.filter(availability => {
                return availability.account_id === payload.account_id
            })
        }
        return []
    },

    pendingWeeksets(state) {
        const result = state.weeksets.filter(weekset => {
            return weekset.status === 'pending'
        })
        return result.length
    },

    pendingEmployeesWeeksets(state) {
        const result = state.employeesWeeksets.filter(weekset => {
            return weekset.status === 'pending'
        })
        return result.length
    },

    /**
     * Returns a week set by account id.
     *
     * @param state
     * @returns {function(*=): *}
     */
    WEEKSET_BY_ACCOUNT_ID_AND_DATE: (state) => (accountId, date) => {
        return state.employeesWeeksets.find(set => {
            return parseInt(set.account_id) === parseInt(accountId) && date.isSame(set.start_date, 'isoweek')
        })
    },

    /**
     * Returns a week set by id.
     *
     * @param state
     * @returns {function(*=): *}
     */
    getWeeksetById: (state) => (id) => {
        return state.weeksets.find(set => {
            return parseInt(set.id) === parseInt(id)
        })
    },

    WEEK_AVAILABILITIES: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return state.employeesWeekAvailabilities[`"${week}-${year}"`]
    },
}
export default getters
