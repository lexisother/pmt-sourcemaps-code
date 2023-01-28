import Vue from 'vue'
import vuexHelper from '../../../libraries/vuexHelper'

const getters = {

    /**
     * Returns payroll details totals for an employee in the provided year-week
     * @param {VUEX} state
     * @param {Object} { accountId, year, week }
     * @returns {Object} {days: [ ... ], period: { ... }}
     */
    accountPayrollDetailsTotals: (state) => ({ accountId, year, week }) => {
        if (!accountId || !year || !week) {
            return {}
        }
        return vuexHelper.getYearWeekStateDataForAccount(state.payrollDetailsTotals, { accountId, year, week })
    },

    /**
     * Returns the productive payroll details for the provided day.
     * @param {Number} accountId
     * @param {Object} day
     */
    accountPayrollDetailsDayTotals: (state, getters) => ({ accountId, day }) => {
        // get the details of the week if any
        const weekDetails = getters.accountPayrollDetailsTotals({
            accountId,
            week: day.isoWeek(),
            year: day.isoWeekYear(),
        })
        if (weekDetails && weekDetails.days && weekDetails.days.length) {
            // find the details day to match the provided day
            const result = weekDetails.days.find(dayPayroll => {
                if (dayPayroll.date === day.apiFormat()) {
                    if (dayPayroll.totals.productive !== '00:00') {
                        return dayPayroll.totals
                    }
                }
                return ''
            })
            return result ? result.totals : undefined
        }
        return undefined
    },

    /**
     * Returns payroll details for an employee in the provided year-week
     * @param {VUEX} state
     * @param {Object} { accountId, year, week }
     * @returns {Array}
     */
    accountPayrollDetails: (state) => ({ accountId, year, week }) => {
        if (!accountId || !year || !week) {
            return []
        }
        return vuexHelper.getYearWeekStateDataForAccount(state.payrollDetails, { accountId, year, week })
    },

    /**
     * Returns the account week schedule on the provided year-week
     * @param {VUEX} state
     * @param {Object} { accountId, year, week }
     */
    weekSchedule: (state) => ({ accountId, year, week }) => {
        if (!accountId || !year || !week) {
            return []
        }
        return vuexHelper.getYearWeekStateDataForAccount(state.weekSchedule, { accountId, year, week })
    },

    /**
     * Returns the account day schedule on the provided year-week-day
     * @param {VUEX} state
     * @param {Object} { accountId, year, week, day }
     */
    daySchedule: (state, getters) => ({ accountId, year, week, day }) => {
        const weekSchedules = getters.weekSchedule({ accountId, year, week })
        return weekSchedules ? weekSchedules[day] : []
    },

    /**
     * Returns the schedules for a day for current employee and all employees working on common departments.
     *
     * @param state
     * @returns {function(*): *|undefined}
     */
    getDayColleaguesSchedules: (state) => (date) => {
        return state.dayColleaguesSchedules[date]
    },

    /**
     * Returns the account week balances on the provided year-week
     * @param {VUEX} state
     * @param {Object} { accountId, year, week }
     */
    weekBalances: (state) => ({ accountId, year, week }) => {
        if (!year || !week) {
            return undefined
        }
        if (accountId) {
            return vuexHelper.getYearWeekStateDataForAccount(state.weekBalances, { accountId, year, week })
        }
        return vuexHelper.getYearWeekStateData(state.weekBalances, { year, week })
    },

    /**
     * Returns the remarks for all the users the current user has access to for a provided day
     *
     * @param {VUEX} state
     * @param {Object} {date}
     * @returns {Object}
     */
    dayRemarks: (state) => (date) => {
        if (!date) {
            return undefined
        }

        return state.dayRemarks[date.apiFormat()]
    },

    /**
     * Returns a remark for the provided accountId on provided day.
     * If can be stores in 2 different states: dayRemarks (grouped by date) or weekDayRemarks (grouped by year-week-day)
     *
     * @param {VUEX} context
     * @param {Object} {accountId, date}
     * @returns {Object}
     */
    dayRemarksForEmployee: (state) => ({ accountId, date }) => {
        if (!accountId || !date) {
            return undefined
        }
        const { year, week } = date.weekYearObject()
        const dayRemarks = state.dayRemarks[date.apiFormat()]
        if (dayRemarks && dayRemarks[accountId]) {
            return dayRemarks[accountId]
        }
        const accountData = vuexHelper.getYearWeekStateDataForAccount(state.weekDayRemarks, { accountId, year, week })
        return accountData ? accountData.find(remark => remark.date === date.apiFormat()) : undefined
    },

    /**
     * Returns if remarks are present for provided date week
     * @param {VUEX} state
     * @param {Number, Object} {accountId, date}
     * @returns {Object}
     */
    hasWeekRemarks: (state) => ({ accountId, date }) => {
        if (!accountId || !date) {
            return undefined
        }
        const { year, week } = date.weekYearObject()
        return !!vuexHelper.getYearWeekStateDataForAccount(state.weekDayRemarks, { accountId, year, week })
    },

    /**
     * Returns true if remarks should be displayed/added to the schedule email for selected week.
     *
     * @param state
     * @returns {boolean}
     */
    showScheduleRemarks(state) {
        if (!state.weekSchedule || (state.weekSchedule && !state.weekSchedule.remarkData)) {
            return false
        }
        const remarkData = state.weekSchedule && state.weekSchedule.remarkData ? state.weekSchedule.remarkData : {}
        let showRemark = false
        Object.keys(remarkData).forEach(key => {
            showRemark = remarkData[key].filter(elem => {
                return elem.show_remark
            }).length > 0
        })

        return showRemark
    },

    /**
     * Returns the account weekly indirect hours in the week of the provided date
     * @param {VUEX} state
     * @param {Object} { accountId, year, week }
     */
    weekIndirectHours: (state) => ({ date, accountId }) => {
        if (!accountId || !date) {
            return undefined
        }
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateDataForAccount(state.indirectHours, { accountId, year, week })
    },

    /**
     * Returns the provided accountId indirect hours on the provided day
     * @param {Object} { day, accountId }
     * @returns {Array}
     */
    dayIndirectHours: (state, getters) => ({ day, accountId }) => {
        const weekIndirectHours = getters.weekIndirectHours({ date: day, accountId })
        return weekIndirectHours
            ? weekIndirectHours.filter(elem => {
                return parseInt(elem.day) === day.isoWeekday()
            })
            : []
    },

    /**
     * Returns the provided accountId payroll details on the provided day
     * @param {Object} { day, accountId }
     * @returns {Array}
     */
    accountDayPayrollDetails: (state) => ({ day, accountId }) => {
        const { week, year } = day.weekYearObject()
        const accountDayPayrolls = vuexHelper.getYearWeekStateDataForAccount(state.payrollDetails, { accountId, year, week })
        return accountDayPayrolls
            ? accountDayPayrolls.filter(elem => {
                return parseInt(elem.day) === day.isoWeekday()
            })
            : []
    },

    /**
     * Checks if the user has schedule on given day and department
     * @param {Moment} day
     * @param {Number} account_id
     * @param {Number} department_id
     * Returns Boolean
     */
    hasScheduleOnDayAndDepartment: (state) => (day, accountId, departmentId) => {
        const result = state.allWeekSchedules.find(item => {
            const sameAccount = item.account_id === accountId
            const sameDepartment = item.department_id === departmentId
            const sameDay = day.apiFormat() === Vue.moment(item.schedule_time_from).apiFormat()
            if (sameAccount && sameDepartment && sameDay) {
                return item
            }
            return {}
        })
        return !!result
    },

    /**
     * Returns status of a week for an employee.
     *
     * @param state
     * @returns {function({accountId?: *, year?: *, week?: *}): (undefined)}
     */
    employeeWeekStatus: (state) => ({ accountId, year, week }) => {
        if (!accountId || !year || !week) {
            return undefined
        }
        const yearData = state.employeeWeekStatus[accountId] ? state.employeeWeekStatus[accountId][year] : false
        return yearData ? yearData[week] : undefined
    },

    WEEK_INDIRECT_HOURS: (state) => ({ year, week }) => {
        if (!year || !week) {
            return undefined
        }
        return vuexHelper.getYearWeekStateData(state.weekIndirectHours, { year, week })
    },

    SCHEDULE_FOR_PERIOD: (state) => {
        return state.scheduleForPeriod
    },

    ACCOUNT_BALANCES(state) {
        return state.currentAccountBalances
    },

    END_OF_YEAR_ACCOUNT_BALANCE(state) {
        return state.endOfYearAccountBalances
    },
}
export default getters
