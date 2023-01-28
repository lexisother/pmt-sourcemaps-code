import Vue from 'vue'
import * as moment from '../../../config/moment'
import schedulesHelper from '../../../libraries/schedulesHelper'
import vuexHelper from '../../../libraries/vuexHelper'
import stringHelper from '../../../libraries/stringHelper'
Vue.use(moment)

const mutations = {
    setPayrollDetailsTotals(state, { item, payload }) {
        if (!item || !payload) {
            return
        }
        const mappedPayrol = schedulesHelper.mapPayrollDetails({ item, payload })
        const { week, year } = Vue.moment(payload.from).weekYearObject()
        const data = {
            period: mappedPayrol.details,
            days: mappedPayrol.days,
        }
        vuexHelper.setYearWeekAccountIdData(state, 'payrollDetailsTotals', data, year, week, payload.accountId)
    },

    setPayrollDetails(state, { payload, payroll }) {
        const { week, year } = Vue.moment(payload.from).weekYearObject()
        vuexHelper.setYearWeekAccountIdData(state, 'payrollDetails', payroll, year, week, payload.accountId)
    },

    setEmployeeIndirectHours(state, payload) {
        const { week, year } = payload.date.weekYearObject()
        let hours = payload.result.hours
        if (hours.length) {
            hours = hours.map(hour => {
                const task = payload.result.aggregation.indirect_tasks[hour.indirect_task_id]
                hour.indirect_taks_code = task.code
                hour.indirect_taks_description = task.description
                return hour
            })
        }
        vuexHelper.setYearWeekAccountIdData(state, 'indirectHours', hours, year, week, payload.accountId)
    },

    /**
     *
     * @param {VUEX} state
     * @param {Object}
     */
    setWeekSchedule(state, { payload, result }) {
        const data = {}
        const { year, week } = payload
        const departments = this.getters['departments/employeeWeekDepartments']({ accountId: payload.accountId, year, week })
        const mappedResult = schedulesHelper.mapScheduleResponse(result, departments, payload.date)
        // makes a day schedules array for each day
        mappedResult.forEach(schedule => {
            const dayIndex = Vue.moment(schedule.from).isoWeekday()
            if (!data[dayIndex]) {
                data[dayIndex] = []
            }

            if (schedulesHelper.visibleShiftStatusesEmployee.includes(schedule.status)) {
                data[dayIndex].push(schedule)
            }
        })

        // sorts the shifts based on starting time
        for (const key in data) {
            data[key].sort(function (a, b) {
                return a.startTime.localeCompare(b.startTime)
            })
        }
        vuexHelper.setYearWeekAccountIdData(state, 'weekSchedule', data, year, week, payload.accountId)
    },

    setAllWeekSchedules(state, data) {
        // setting an array value at custom index is not reactive in vue, we must use Vue.set to atchieve reactiveness
        // https://vuejs.org/v2/guide/reactivity.html#For-Arrays
        Vue.set(state.allWeekSchedules, `'${data.year}-${data.week}'`, data.schedules)
    },

    /**
     * Sets the week balances for an employee
     * @param {Number} year
     * @param {Number} week
     * @param {Object} balances
     */
    async setWeekBalancesForAccount(state, { year, week, balances }) {
        balances.forEach(balance => {
            vuexHelper.setYearWeekAccountIdData(state, 'weekBalances', balance, year, week, balance.account_id)
        })
    },

    updateNonproductive(state, data) {
        state.weekSchedule.nonProductiveData = data
    },

    setScheduleEmployee(state, employeeId) {
        state.scheduleEmployeeId = employeeId
    },

    setBalanceHistory(state, history) {
        state.balanceHistory = history
    },

    /**
     * Stores schedules for current user and his/her colleagues per day.
     *
     * @param state
     * @param payload
     */
    setDayColleaguesSchedules(state, payload) {
        Vue.set(state.dayColleaguesSchedules, payload.date, payload.data)
    },

    reset(state) {
        state.payrollDetailsTotals = {}
        state.payrollDetails = []
        state.weekSchedule.weekData = {}
        state.dayColleaguesSchedules = {}
        state.dayRemarks = []
        state.weekDayRemarks = {}
        state.allWeekSchedules = []
        state.weekBalances = {}
        state.indirectHours = {}
        state.scheduleEmployeeId = 0
        state.balanceHistory = []
        state.employeeWeekFinal = {}
        state.employeeWeekStatus = {}
        state.weekIndirectHours = {}
        state.indirectTaskTypes = []
        state.currentAccountBalances = null
        state.endOfYearAccountBalances = null
    },

    /**
     * Stores in state week status information for an employee.
     *
     * @param state
     * @param payload
     */
    setEmployeeWeekStatus(state, payload) {
        vuexHelper.setAccountIdYearWeekData(state, 'employeeWeekStatus', payload.data, payload.year, payload.week, payload.accountId)
    },

    setDayRemarks(state, payload) {
        Vue.set(state.dayRemarks, payload.date.apiFormat(), {})
        payload.remarks.forEach(remark => {
            Vue.set(state.dayRemarks[payload.date.apiFormat()], remark.account_id, remark)
        })
    },

    setWeekRemarks(state, payload) {
        const { year, week } = payload.date.weekYearObject()
        vuexHelper.setYearWeekAccountIdData(state, 'weekDayRemarks', payload.remarks, year, week, payload.accountId)
    },

    SET_WEEK_INDIRECT_HOURS(state, payload) {
        const { year, week } = payload.date.weekYearObject()
        const hours = payload.hours.map(h => {
            // we mark all hours as being valid
            h.valid = true
            return h
        })
        vuexHelper.setYearWeekData(state, 'weekIndirectHours', stringHelper.groupBy(hours, 'account_id'), year, week)
    },

    SET_SCHEDULE_FOR_PERIOD(state, payload) {
        let shifts = []
        payload.forEach(shift => {
            shifts = shifts.concat(shift.instances)
        })
        state.scheduleForPeriod = shifts
    },

    SET_ACCOUNT_BALANCES(state, balances) {
        state.currentAccountBalances = balances
    },

    SET_END_OF_YEAR_ACCOUNT_BALANCE(state, balance) {
        state.endOfYearAccountBalances = balance
    },
}

export default mutations
