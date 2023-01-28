import objectHelper from '../../../../../libraries/objectHelper'
import { timerEnums } from '../../../../../pages/realisation/timer/constants/timerConstants'
import Vue from 'vue'
import * as moment from '../../../../../config/moment'
Vue.use(moment)

const getters = {
    TIMERS_DATA(state, getters, rootState) {
        let timersToday = state.timersToday

        timersToday = setActiveDepartment(timersToday, rootState.departments.departments)

        if (state.searchString && state.searchString.length > 1) {
            const fields = ['department', 'employee_first_name', 'department_id', 'employee_first_name', 'employee_last_name', 'name', 'age']
            timersToday = objectHelper.filterOnSearchString(JSON.parse(JSON.stringify(timersToday)), state.searchString, fields, 2)
        }

        if (state.sortOn) {
            timersToday = objectHelper.sortByKey(timersToday, state.sortOn, state.sortAscending)
        }

        // Filter on status
        timersToday = filterOnStatus(timersToday, rootState.pageFilters)

        // Filter on age
        timersToday = filterOnAge(timersToday, rootState.pageFilters)

        // Filter on selected departments
        if (rootState.pageFilters.departments.length) {
            const filteredTimers = []
            timersToday.forEach(timer => {
                if (rootState.pageFilters.departments.includes(timer.department_id)) {
                    filteredTimers.push(timer)
                }
            })
            timersToday = filteredTimers
        }

        if (state.groupOn.length === 2) {
            const result = {}

            const groupedOnStatus = groupOn(timersToday, 'timerStatus')
            for (const [key, value] of Object.entries(groupedOnStatus)) {
                result[key] = groupOn(value, 'activeDepartment')
            }

            timersToday = result
        }

        if (state.groupOn.length === 1) {
            const statusOrDeparment = state.groupOn.includes('department')
                ? 'activeDepartment'
                : 'timerStatus'
            timersToday = groupOn(timersToday, statusOrDeparment)
        }

        return timersToday
    },
    USERS_NOT_SCHEDULED(state) {
        return state.usersNotScheduled.filter(o => o.planning_labor_access)
    },
    GROUP_ON(state) {
        return state.groupOn
    },
    SCHEDULES_CONTAINER_WIDTH(state, getters, rootState) {
        const pageWidth = rootState.pageWidth
        if (pageWidth < 1200) {
            return pageWidth - 40
        } else if (pageWidth < 1904) {
            return pageWidth - 816
        }
        return 1184
    },
    LOG_SCHEDULES_CONTAINER_WIDTH(state, getters, rootState) {
        const pageWidth = rootState.pageWidth
        if (pageWidth < 1200) {
            return pageWidth - 48
        }
        return 1152
    },
    SORT_ON(state) {
        return state.sortOn
    },
    SEARCH_STRING(state) {
        return state.searchString
    },
    IS_LOADING(state) {
        return state.loading
    },
}

export default getters

/**
 * Active department is most relevant department (name) to be displayed in timer
 * Depends on active timer or schedule closest to current time
 */

function setActiveDepartment(timersToday, departments) {
    let activeDepartmentId
    const now = Vue.moment()
    timersToday.forEach(timer => {
        activeDepartmentId = -1
        if (timer.timers.length) {
            // find most recent timer
            timer.timers.forEach(tmr => {
                if (now.isSameOrAfter(tmr.datetime, 'minutes')) {
                    activeDepartmentId = tmr.department_id
                }
            })
        } else if (timer.schedules.length) {
            // no timers active, find most relevant schedule
            activeDepartmentId = timer.schedules[0].department_id
            for (let n = 0; n < timer.schedules.length; n++) {
                const start = timer.schedules[n].start_datetime
                const end = timer.schedules[n].start_datetime

                if ((now.isSameOrAfter(start) && now.isBefore(end)) ||
                    now.isSameOrAfter(end) ||
                    now.subtract(30, 'minutes').isBefore(start)) {
                    // current time is within schedule or schedule already ended or schedule is about to start in 30 minutes
                    activeDepartmentId = timer.schedules[n].department_id

                    if ((now.isSameOrAfter(start) && now.isBefore(end)) || now.subtract(30, 'minutes').isBefore(start)) {
                        // no further looping needed if current time is within schedule or schedule is near
                        break
                    }
                }
            }
        }

        if (activeDepartmentId > -1) {
            const activeDepartment = departments.find(o => o.department_id === activeDepartmentId)
            timer.activeDepartmentId = activeDepartmentId
            timer.activeDepartment = activeDepartment ? activeDepartment.department_name : null
            timer.activeDepartmentShort = activeDepartment ? activeDepartment.department_shortname : null
        }
    })

    return timersToday
}

function filterOnStatus(timersToday, pageFilters) {
    const activeFilters = []
    if (pageFilters.timerPlanned) activeFilters.push(timerEnums.SCHEDULED)
    if (pageFilters.timerTooLate) activeFilters.push(timerEnums.IN_LATE)
    if (pageFilters.timerWorking) activeFilters.push(timerEnums.WORKING)
    if (pageFilters.timerPaused) activeFilters.push(timerEnums.PAUSED)
    if (pageFilters.timerReady) activeFilters.push(timerEnums.READY)

    if (activeFilters.length) {
        const filteredTimeRegistrations = []

        timersToday.forEach(timer => {
            if (activeFilters.includes(timer.timerStatus)) {
                filteredTimeRegistrations.push(timer)
            }
        })
        return filteredTimeRegistrations
    }

    return timersToday
}

function filterOnAge(timersToday, pageFilters) {
    if (pageFilters.age.length) {
        return timersToday.filter(timer => {
            return pageFilters.age.includes(timer.age.toString()) || (pageFilters.age.includes('18') && timer.age >= 18)
        })
    }

    return timersToday
}

function groupOn(timers, key) {
    let output = timers.reduce(
        (prev, current) => ({
            ...prev,
            [current[key]]: (prev[current[key]] || []).concat(current),
        }),
        {},
    )

    if (key === 'timerStatus') {
        output = orderGroupedTimers(output)
    }

    return output
}

function orderGroupedTimers(timers) {
    const keys = ['late', 'working', 'paused', 'scheduled', 'ready']
    const output = {}
    keys.forEach(key => {
        if (timers[key]) output[key] = timers[key]
    })
    return output
}
