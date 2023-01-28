import { timerEnums, clockStatus } from '../../../../../pages/realisation/timer/constants/timerConstants'
import * as moment from '../../../../../config/moment'
import Vue from 'vue'
Vue.use(moment)

const mutations = {
    SET_TIMERS(state, payload) {
        const { timers, employees, schedules, departments } = payload
        state.timersToday = employees
            .map(item => {
                const schedulesDepartmentId = schedules.find(
                    o => o.account_id === item.account_id,
                )?.department_id || null

                const schedule = schedules
                    .filter(o => o.account_id === item.account_id)
                    .map(el => ({
                        ...el,
                        department_shortname:
                            departments.find(
                                dep => dep.department_id === el.department_id,
                            )?.department_shortname || null,
                    }))
                    .sort((a, b) => Vue.moment(a.start_datetime) - Vue.moment(b.start_datetime))

                const tmrs = timers.filter(
                    d => d.account_id === item.account_id,
                )

                const department = departments.find(
                    d => d.department_id === schedulesDepartmentId,
                ) || null

                const timerStatus = setStatus(tmrs, schedule, item.name)

                return {
                    timerStatus,
                    ...item,
                    firstName: item.employee_first_name,
                    lastName: item.employee_last_name,
                    startTime: schedule?.find(item => item)?.start_datetime,
                    endTime: schedule?.find(item => item)?.end_datetime,
                    schedules: schedule,
                    timers: tmrs,
                    department_id: department?.department_id,
                    department: department?.department_name,
                    departmentColor: department?.color,
                }
            })
            .filter(elm => elm.timers.length || elm.schedules.length)
    },
    SET_USERS_WITHOUT_DEPARTMENT_AND_TIMER(state, payload) {
        const { employees, currentStoreId } = payload
        const accountIdsPlannedAndTimed = state.timersToday.map(
            timer => timer.account_id,
        )
        state.usersNotScheduled = employees
            .filter(
                item => !accountIdsPlannedAndTimed.includes(item.account_id),
            )
            .filter(item => item.store_id === currentStoreId)
    },
    ADD_TIMER(state, payload) {
        const employeeTimer = state.timersToday.find(
            item => item.account_id === payload.account_id,
        )
        if (employeeTimer) {
            employeeTimer.timers.push(payload)
        } else {
            state.timersToday.push(payload)
        }
    },
    SET_GROUP_ON(state, payload) {
        if (Array.isArray(payload)) {
            state.groupOn = payload
            return
        }

        const groupOn = JSON.parse(JSON.stringify(state.groupOn))
        if (groupOn.includes(payload)) {
            const index = groupOn.findIndex(o => o === payload)
            groupOn.splice(index, 1)
        } else {
            groupOn.push(payload)
        }
        state.groupOn = groupOn
    },
    SET_SORT_ON(state, payload) {
        state.sortOn = payload
    },
    TOGGLE_SORT_DIRECTION(state) {
        state.sortAscending = !state.sortAscending
    },
    SET_SORT_ASCENDING(state, payload) {
        state.sortAscending = payload
    },
    SET_LOADING(state, payload) {
        state.loading = payload
    },
    SET_SEARCH_STRING(state, payload) {
        state.searchString = payload
    },
    SET_LOADING_ACCOUNT_ID(state, id) {
        state.loadingAccountId = id
    },
}

const currentTimeFallsInPlannedShift = schedules =>
    schedules.some(item => {
        const currentTime = Date.now()
        const currentTimeIsAfterBegin =
            currentTime > Vue.moment(item.start_datetime).format('x')
        const currentTimeIsBeforeEnd =
            currentTime < Vue.moment(item.end_datetime).format('x')

        return currentTimeIsBeforeEnd && currentTimeIsAfterBegin
    })

const currentTimeIsAfterAnyShift = schedules =>
    schedules.some(item => {
        const currentTime = Date.now()
        return currentTime > Vue.moment(item.end_datetime).format('x')
    })

const currentTimeIsBeforeAnyShift = schedules =>
    schedules.some(item => {
        const currentTime = Date.now()
        return currentTime < Vue.moment(item.start_datetime).format('x')
    })

const currentTimeIsJustBeforeNextShift = schedules =>
    schedules.some(item => {
        const currentTime = Vue.moment()
        const shiftStartWithBuffer = Vue.moment(item.start_datetime).subtract(30, 'minutes')
        const shiftEnd = Vue.moment(item.end_datetime)
        return currentTime > shiftStartWithBuffer && currentTime < shiftEnd
    })

const setStatus = (timerdata, schedule, name) => {
    const lastClockItem = Object.values(timerdata)[Object.values(timerdata).length - 1]
    const currentTimeIsWithinShift = currentTimeFallsInPlannedShift(schedule)
    const hasPassedShifts = currentTimeIsAfterAnyShift(schedule)
    const hasShiftsAhead = currentTimeIsBeforeAnyShift(schedule)
    const hasShiftAheadSoon = currentTimeIsJustBeforeNextShift(schedule)
    const hasClockData = Boolean(timerdata.length)

    const startedClock = lastClockItem?.status === clockStatus.START
    const pausedClock = lastClockItem?.status === clockStatus.PAUSE
    const stoppedClock = lastClockItem?.status === clockStatus.STOP

    const startedClockAmount = timerdata.filter(t => t.status === 'start').length

    if (startedClock) {
        return timerEnums.WORKING
    }

    if (
        (!currentTimeIsWithinShift && !hasPassedShifts && hasShiftsAhead) ||
        (!currentTimeIsWithinShift && hasPassedShifts && hasShiftAheadSoon)
    ) {
        return timerEnums.SCHEDULED
    }

    if (
        (currentTimeIsWithinShift && !hasClockData) ||
        (currentTimeIsWithinShift && startedClockAmount < schedule.length) ||
        (hasPassedShifts && !hasClockData)
    ) {
        return timerEnums.IN_LATE
    }

    if (hasPassedShifts && stoppedClock && !hasShiftAheadSoon) {
        return timerEnums.READY
    }
    if (pausedClock) {
        return timerEnums.PAUSED
    }

    return timerEnums.READY
}

export default mutations
