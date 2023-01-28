import payrollDetailService from '../../../services/PayrollDetailService'
import service from '../../../services/MyScheduleService'
import Vue from 'vue'
import * as moment from '../../../config/moment'
import schedulesHelper from '../../../libraries/schedulesHelper'
Vue.use(moment)

const actions = {
    /**
     * GET the current payrolldetails for the employee.
     * This includes individual days and totals
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    getWeekPayrollDetailsForEmployee({ commit, getters }, payload) {
        const { week, year } = Vue.moment(payload.from).weekYearObject()
        // check for existing payroll
        const payroll = getters.accountPayrollDetailsTotals({
            accountId: payload.accountId,
            year,
            week,
        })
        if (payroll) {
            // return existing payroll
            return new Promise((resolve) => { resolve(payroll) })
        }
        payrollDetailService.getPayrollDetailsTotals(payload).then((item) => {
            commit('setPayrollDetailsTotals', { item, payload })
        }).catch(() => {
            commit('setPayrollDetailsTotals', { item: undefined, payload: undefined })
        })
    },

    /**
     * GET the extended payrolldetails for the employee.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    getPayrollDetails({ commit, getters }, payload) {
        const { week, year } = Vue.moment(payload.from).weekYearObject()
        // check for existing payroll
        const payroll = getters.accountPayrollDetails({
            accountId: payload.accountId,
            year,
            week,
        })
        if (payroll) {
            // return existing payroll
            return new Promise((resolve) => { resolve(payroll) })
        }
        // else make the api call to fetch the details
        return payrollDetailService.getPayrollDetails(payload).then(payroll => {
            commit('setPayrollDetails', { payload, payroll })
            return payroll
        }).catch(error => {
            throw error
        })
    },

    /**
     * Calls the api to fetch indirect hours for an employee
     * @param {Object} payload
     */
    getWeekIndirectHoursForEmployee({ commit, getters, rootGetters }, payload) {
        // check permissions to see indirect tasks
        const canSeeIndirectTasks = rootGetters['auth/canYou']('planning', 'indirect_tasks')
        if (!canSeeIndirectTasks) {
            // return the rsolved promise
            return new Promise((resolve) => { resolve(false) })
        }
        // check for existing indirect hours
        const indirectHours = getters.weekIndirectHours({
            date: payload.date,
            accountId: payload.accountId,
        })
        if (indirectHours) {
            // return existing indirect hours
            return new Promise((resolve) => { resolve(indirectHours) })
        }
        const apiPayload = {
            'date[gte]': payload.date.startOf('isoWeek').apiFormat(),
            'date[lte]': payload.date.endOf('isoWeek').apiFormat(),
            account_id: payload.accountId,
        }
        // else make the api call to fetch the details
        return service.getIndirectHours(apiPayload).then(result => {
            commit('setEmployeeIndirectHours', { date: payload.date, accountId: payload.accountId, result })
            return result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Calls the api to fetch indirect hours for an employee
     * @param {Object} payload
     */
    getWeekIndirectHours({ commit, getters, rootGetters }, payload) {
        // check for existing indirect hours
        const indirectHours = getters.WEEK_INDIRECT_HOURS({
            year: payload.date.isoWeekYear(),
            week: payload.date.isoWeek(),
        })
        if (indirectHours) {
            // return existing indirect hours
            return new Promise((resolve) => { resolve(indirectHours) })
        }
        const apiPayload = {
            'date[gte]': payload.date.startOf('isoWeek').apiFormat(),
            'date[lte]': payload.date.endOf('isoWeek').apiFormat(),
        }
        // else make the api call to fetch the details
        return service.getIndirectHours(apiPayload).then(result => {
            commit('SET_WEEK_INDIRECT_HOURS', { date: payload.date, hours: result.hours })
            return result
        }).catch(error => {
            throw error
        })
    },

    getWeekSchedule({ commit, getters }, payload) {
        // check for existing week schedules
        const weekschedules = getters.weekSchedule(payload)
        if (weekschedules) {
            // return existing schedules
            return new Promise((resolve) => { resolve(weekschedules) })
        }
        // else make the api call to fetch the schedules
        return service.getWeekSchedule(payload).then(result => {
            commit('setWeekSchedule', { payload, result })
        }).catch(error => {
            throw error
        })
    },

    getAllWeekSchedules({ commit }, payload) {
        const apiPayload = {
            week: `${payload.year}-${payload.week < 10 ? '0' + payload.week : payload.week}`,
            limit: 2000,
        }
        return service.getSchedules(apiPayload).then(async result => {
            await commit('setAllWeekSchedules', { year: payload.year, week: payload.week, schedules: result })
            return result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns the schedules for a day for current employee and all employees working on common departments.
     *
     * @param {Object} context
     * @param {Object} payload
     *
     * @returns {Promise}
     */
    getDayDepartmentSchedules(context, payload) {
        const statePayload = {
            account_id: payload.user.accountId,
            date: payload.date.apiFormat(),
            departments: payload.departments,
        }

        // Check if it was fetched before.
        const daySchedules = context.getters.getDayColleaguesSchedules(payload.date.apiFormat())
        if (daySchedules) {
            return new Promise((resolve) => { resolve(daySchedules) })
        }

        const employeesSchedule = service.getColleaguesShifts(statePayload)
        const mySchedules = service.getMyShifts(statePayload)
        return Promise.all([employeesSchedule, mySchedules])
            .then((responses) => {
                const combinedResult = schedulesHelper.combineDayScheduleData(responses[0], payload.departments, responses[1], payload.employees)
                context.commit('setDayColleaguesSchedules', { ...statePayload, data: combinedResult })
                return combinedResult
            })
    },

    getWeekBalances({ commit, getters }, payload) {
        // check for existing balances
        const { accountId, year, week } = payload
        const balances = getters.weekBalances({ accountId, year, week })
        if (balances) {
            // return existing balances
            return new Promise((resolve) => { resolve(balances) })
        }
        // else make the api call to fetch the balances
        return service.getWeekBalances(payload).then(balances => {
            commit('setWeekBalancesForAccount', { year, week, balances })
        }).catch(error => {
            throw error
        })
    },

    getBalanceHistory(context, payload) {
        payload.accountId = context.rootState.auth.user.accountId
        return service.getBalanceHistory(payload).then(balances => {
            context.commit('setBalanceHistory', balances)
            return balances
        }).catch(error => {
            throw error
        })
    },

    /**
     * Fetches and returns week status for an employee and also stores it in state.
     *
     * @param context
     * @param payload
     * @returns {Promise<T>}
     */
    getEmployeeWeekStatus(context, payload) {
        // Check if it was fetched before.
        const weekStatus = context.getters.employeeWeekStatus(payload)
        if (weekStatus) {
            return new Promise((resolve) => { resolve(weekStatus) })
        }
        return service.getEmployeeWeekStatus(payload).then(response => {
            context.commit('setEmployeeWeekStatus', {
                accountId: payload.accountId,
                week: payload.week,
                year: payload.year,
                data: response,
            })
            return response
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns remarks for all employees current user has access to for a day.
     *
     * @param {VUEX} context
     * @param {Object} payload
     */
    getDayRemarks(context, payload) {
        // Check if it was already fetched for this date.
        const dayRemarks = context.getters.dayRemarks(payload.date)
        if (dayRemarks) {
            return new Promise((resolve) => { resolve(dayRemarks) })
        }

        return service.getRemarks({ date: payload.date.apiFormat() }).then(result => {
            context.commit('setDayRemarks', { date: payload.date, remarks: result })
        }).catch(error => {
            throw error
        })
    },

    /**
     * Get remarks on day level for employee
     * @param {VUEX} context
     * @param {Object} payload
     */
    getEmployeeWeekRemarks({ commit, getters }, payload) {
        // check for existing week remarks
        const hasWeekRemarks = getters.hasWeekRemarks({
            accountId: payload.accountId,
            date: payload.date,
        })
        if (hasWeekRemarks) {
            // return existing payroll
            return new Promise((resolve) => { resolve() })
        }
        const apiPayload = {
            'date[gte]': payload.date.startOf('isoWeek').apiFormat(),
            'date[lte]': payload.date.endOf('isoWeek').apiFormat(),
            account_id: payload.accountId,
        }
        // else make the api call to fetch the details
        return service.getRemarks(apiPayload).then(result => {
            commit('setWeekRemarks', { date: payload.date, accountId: payload.accountId, remarks: result })
        }).catch(error => {
            throw error
        })
    },

    getScheduleForPeriod(context, payload) {
        // check if not already fetched
        const scheduleForPeriod = context.state.scheduleForPeriod
        if (scheduleForPeriod.length) {
            return new Promise((resolve) => { resolve(scheduleForPeriod) })
        }
        return service.getWeekSchedule(payload).then(result => {
            context.commit('SET_SCHEDULE_FOR_PERIOD', result)
        })
    },

    async getAccountBalancesForDay(context, { day, accountId }) {
        const existing = context.getters.ACCOUNT_BALANCES
        if (existing) {
            return new Promise(resolve => {
                resolve(existing)
            })
        }
        const payload = { day, accountId }
        const balances = await service.getAccountBalancesForDay(payload).catch(err => { throw err })
        context.commit('SET_ACCOUNT_BALANCES', balances)
        return context.getters.ACCOUNT_BALANCES
    },

    async getEndOfYearBalance(context, { day, accountId }) {
        const existing = context.getters.END_OF_YEAR_ACCOUNT_BALANCE
        if (existing) {
            return new Promise(resolve => {
                resolve(existing)
            })
        }
        const payload = { day, accountId }
        const balances = await service.getAccountBalancesForDay(payload).catch(err => { throw err })
        context.commit('SET_END_OF_YEAR_ACCOUNT_BALANCE', balances)
        return context.getters.END_OF_YEAR_ACCOUNT_BALANCE
    },
}
export default actions
