import service from '../../../services/SchedulingService'
import storeService from '../../../services/StoreService'
import payrollDetailService from '../../../services/PayrollDetailService'
import columns from '../../../store/modules/scheduling/data/resourceColumns'
import Vue from 'vue'
import * as moment from '../../../config/moment'
import language from '../../../config/language'
Vue.use(moment)
const actions = {

    /**
     * Gets steer info based on payload
     * the force parameter in the payload
     * will force another api call, regardless
     * if we already have data for the given week.
     * @param {Object} payload
     * @returns {Promise}
     */
    async getWeekSteerInfo(context, payload) {
        const existingData = context.getters.WEEK_STEER_INFO(payload.date)
        if (existingData && !payload.force) {
            return new Promise((resolve) => { resolve(existingData) })
        }
        context.commit('TOGGLE_LOADING', 'planning/steerInfo', { root: true })
        const result = await service.getSteerInformation(payload)
            .catch(error => {
                context.commit('SET_API_ERRORS', 'steerInformation', { root: true })
                throw error
            }).finally(() => context.commit('TOGGLE_LOADING', 'planning/steerInfo', { root: true }))
        context.commit('SET_DIRTY_GRID', null)
        context.commit('SET_WEEK_STEER_INFO', { date: payload.date, result })
        return result
    },

    /**
     * GET the current payroll details for the employee.
     * This includes individual days and totals
     *
     * @param {Object} payload
     * @returns {Promise}
    */
    getWeekPayrollDetailsTotalsForEmployees({ commit, getters }, payload) {
        const { week, year } = Vue.moment(payload.from).weekYearObject()
        // check for existing payroll
        const payroll = getters.WEEK_PAYROLL_DETAILS_TOTALS({
            year,
            week,
        })
        if (payroll) {
            // return existing payroll
            return new Promise((resolve) => { resolve(payroll) })
        }
        return payrollDetailService.getPayrollDetailsTotals(payload).then((result) => {
            commit('SET_WEEK_EMPLOYEES_PAYROLL_DETAILS_TOTALS', { result, payload })
            return getters.WEEK_PAYROLL_DETAILS_TOTALS({
                year,
                week,
            })
        }).catch(() => {
            commit('SET_WEEK_EMPLOYEES_PAYROLL_DETAILS_TOTALS', { result: undefined, payload: undefined })
        })
    },

    createShift(context, payload) {
        context.commit('SET_SAVING_SHIFT', payload.guid)
        return service.createShift(payload).then((result) => {
            context.commit('SET_SAVING_SHIFT', null)
            context.commit('planning/SET_LAST_MODIFIED_STANDARD_SHIFT', null, { root: true })
            return result
        }).catch(async err => {
            context.commit('SET_SAVING_SHIFT', null)
            await context.commit('SET_SAVING_SHIFT_ERROR', { guid: payload.guid, error: err })
            throw err
        })
    },

    createShiftInstance(context, payload) {
        context.commit('SET_SAVING_SHIFT', payload.guid)
        return service.createShiftInstance(payload).then((data) => {
            context.commit('SET_SAVING_SHIFT', null)
            if (data.additional_result) {
                if (data.additional_result.cla_validations) {
                    context.commit('planning/UPDATE_CLA_VALIDATION_OUTCOMES', data, { root: true })
                }
                if (data.additional_result.saved_virtual_instances) {
                    context.commit('planning/UPDATE_EMPLOYEE_VIRTUAL_INSTANCES', data.additional_result.saved_virtual_instances, { root: true })
                }
                if (data.additional_result.shift_instances && data.additional_result.shift_instances.length) {
                    context.commit('planning/UPDATE_EMPLOYEE_INSTANCES', data.additional_result.shift_instances, { root: true })
                }
            }
            return data.result
        }).catch(async err => {
            context.commit('SET_SAVING_SHIFT', null)
            await context.commit('SET_SAVING_SHIFT_ERROR', { guid: payload.guid, error: err })
            throw err
        })
    },

    createShiftWithInstance(context, payload) {
        context.commit('SET_SAVING_SHIFT', payload.guid)
        return service.createShiftWithInstance(payload).then((data) => {
            context.commit('SET_SAVING_SHIFT', null)
            if (data.additional_result) {
                if (data.additional_result.cla_validations) {
                    context.commit('planning/UPDATE_CLA_VALIDATION_OUTCOMES', data, { root: true })
                }
                if (data.additional_result.saved_virtual_instances) {
                    context.commit('planning/UPDATE_EMPLOYEE_VIRTUAL_INSTANCES', data.additional_result.saved_virtual_instances, { root: true })
                }
                if (data.additional_result.shift_instances && data.additional_result.shift_instances.length) {
                    context.commit('planning/UPDATE_EMPLOYEE_INSTANCES', data.additional_result.shift_instances, { root: true })
                }
            }
            return data.result
        }).catch(async err => {
            context.commit('SET_SAVING_SHIFT', null)
            await context.commit('SET_SAVING_SHIFT_ERROR', { guid: payload.guid, error: err })
            throw err
        })
    },

    updateShift(context, payload) {
        context.commit('SET_SAVING_SHIFT', payload.guid)
        return service.updateShift(payload).then((result) => {
            context.commit('SET_SAVING_SHIFT', null)
            context.commit('planning/SET_LAST_MODIFIED_STANDARD_SHIFT', null, { root: true })
            return result
        }).catch(async err => {
            context.commit('SET_SAVING_SHIFT', null)
            await context.commit('SET_SAVING_SHIFT_ERROR', { guid: payload.guid, error: err })
            throw err
        })
    },

    updateShiftInstance(context, payload) {
        context.commit('SET_SAVING_SHIFT', payload.guid)
        return service.updateShiftInstance(payload).then((data) => {
            context.commit('SET_SAVING_SHIFT', null)
            if (data.additional_result) {
                if (data.additional_result.cla_validations) {
                    context.commit('planning/UPDATE_CLA_VALIDATION_OUTCOMES', data, { root: true })
                }
                if (data.additional_result.saved_virtual_instances) {
                    context.commit('planning/UPDATE_EMPLOYEE_VIRTUAL_INSTANCES', data.additional_result.saved_virtual_instances, { root: true })
                }
                if (data.additional_result.shift_instances && data.additional_result.shift_instances.length) {
                    context.commit('planning/UPDATE_EMPLOYEE_INSTANCES', data.additional_result.shift_instances, { root: true })
                }
            }
            return data.result
        }).catch(async err => {
            context.commit('SET_SAVING_SHIFT', null)
            await context.commit('SET_SAVING_SHIFT_ERROR', { guid: payload.guid, error: err })
            throw err
        })
    },

    deleteShiftInstance(context, { shift, date }) {
        context.commit('SET_SAVING_SHIFT', shift.guid)
        return service.deleteShiftInstance(shift).then((data) => {
            context.commit('SET_SAVING_SHIFT', null)
            if (data.additional_result) {
                if (data.additional_result.cla_validations) {
                    context.commit('planning/UPDATE_CLA_VALIDATION_OUTCOMES', data, { root: true })
                }
                if (data.additional_result.saved_virtual_instances && data.additional_result.saved_virtual_instances.length) {
                    context.commit('planning/UPDATE_EMPLOYEE_VIRTUAL_INSTANCES', data.additional_result.saved_virtual_instances, { root: true })
                }
                if (data.additional_result.shift_instances && data.additional_result.shift_instances.length) {
                    context.commit('planning/UPDATE_EMPLOYEE_INSTANCES', data.additional_result.shift_instances, { root: true })
                }
            }
            return data.result
        }).catch(async err => {
            context.commit('SET_SAVING_SHIFT', null)
            await context.commit('SET_SAVING_SHIFT_ERROR', { guid: shift.guid, error: err })
            throw err
        })
    },

    deleteShift(context, { shift, date }) {
        context.commit('SET_SAVING_SHIFT', shift.guid)
        return service.deleteShift(shift).then((result) => {
            context.commit('SET_SAVING_SHIFT', null)
            return result
        }).catch(async err => {
            context.commit('SET_SAVING_SHIFT', null)
            await context.commit('SET_SAVING_SHIFT_ERROR', { guid: shift.guid, error: err })
            throw err
        })
    },

    getShiftBreakSuggestions(context) {
        if (context.state.shiftBreakSuggestions.length) {
            return context.state.shiftBreakSuggestions
        }
        return service.getShiftBreakSuggestions().then((result) => {
            context.commit('SET_SHIFT_BREAKS_SUGGESTIONS', result)
            return result
        }).catch(err => {
            throw err
        })
    },
    // RESOURCES EXPANDER
    /**
     * Sets the css variable --scheduler-resources-width to the provided width.
     * This variable is used by the scheduler grid and resource expander components.
     * @param {String, Number} width
     */
    SET_RESOURCES_WIDTH(context, width) {
        document.documentElement.style.setProperty('--scheduler-resources-width', `${width}px`)
    },
    /**
     * Toggles the width of the scheduler resources
     * If expander is expanded:
     *      1. Sets the css variable --scheduler-resources-width to the default width
     *      2. Sets the expander.expanded property to false
     * If expander is collapsed:
     *      1. Sets the css variable --scheduler-resources-width to the new calculated width based on visible columns
     *      2. Sets the expander.expanded property to true
     * This variable is used by the scheduler grid and resource expander components.
     */
    TOGGLE_RESOURCES_WIDTH({ state, getters, rootGetters, dispatch, commit }) {
        const newWidth = (state.expander.expanded ? state.expander.defaultResourcesWidth : getters.EXPANDED_WIDTH_FROM_VISIBLE_COLUMNS)
        dispatch('SET_RESOURCES_WIDTH', newWidth)
        commit('TOGGLE_EXPANDED_RESOURCES')
    },
    /**
     * Updates the with of the scheduler resources to the new calculated width
     */
    UPDATE_RESOURCES_WIDTH({ state, getters, dispatch }) {
        const newWidth = getters.EXPANDED_WIDTH_FROM_VISIBLE_COLUMNS
        dispatch('SET_RESOURCES_WIDTH', newWidth)
    },
    /**
     * Sets the initial with of the scheduler resources to the calculated width of the always visible columns
     */
    SET_INITIAL_RESOURCES_WIDTH({ state, getters, rootGetters, dispatch, commit }) {
        state.resourceColumns = columns
        const newWidth = getters.WIDTH_FROM_ALWAYS_VISIBLE_COLUMNS
        commit('SET_DEFAULT_RESOURCE_WIDTH', newWidth)
        dispatch('SET_RESOURCES_WIDTH', newWidth)
    },

    /**
     * Returns remarks for all employees current user has access to for a day.
     *
     * @param {VUEX} context
     * @param {Object} payload
     */
    getWeekDayRemarks(context, payload) {
        // Check if it was already fetched for this date.
        const weeklyDayRemarks = context.getters.WEEKLY_DAY_REMARKS(payload.date)
        if (weeklyDayRemarks) {
            return new Promise((resolve) => { resolve(weeklyDayRemarks) })
        }
        const from = payload.date.startOf('isoWeek').apiFormat()
        const to = payload.date.endOf('isoWeek').apiFormat()
        return service.getRemarks({ 'date[gte]': from, 'date[lte]': to }).then(result => {
            context.commit('SET_WEEKLY_DAY_REMARKS', { date: payload.date, remarks: result })
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns standard remarks for all employees
     *
     * @param {Object} payload
     */
    getStandardDayRemarks(context) {
        // Check if it was already fetched for this date.
        const dayRemarks = context.getters.STANDARD_DAY_REMARKS
        if (Object.keys(dayRemarks).length) {
            return new Promise((resolve) => { resolve(dayRemarks) })
        }

        return service.getStandardRemarks().then(result => {
            context.commit('SET_STANDARD_DAY_REMARKS', result)
        }).catch(error => {
            throw error
        })
    },

    /**
     * Saves a standard remark
     *
     * @param {Object} payload
     */
    saveStandardRemark(context, payload) {
        return service.saveStandardRemark(payload).then(result => {
            return result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Creates a standard remark
     *
     * @param {Object} payload
     */
    createStandardRemark(context, payload) {
        return service.createStandardRemark(payload).then(result => {
            return result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Deletes a standard remark
     *
     * @param {Object} payload
     */
    deleteStandardRemark(context, payload) {
        return service.deleteStandardRemark(payload).then(result => {
            return result
        }).catch(error => {
            throw error
        })
    },

    saveEmployeeDayRemark(context, payload) {
        let apiCall = null
        if (payload.isNew || (!payload.id && payload.remark !== '')) {
            // when new or coming from standard remarks
            // create a new stand-alone remark for the day
            delete payload.isNew
            delete payload.id
            apiCall = 'createDayRemark'
        } else if (payload.remark !== '') {
            apiCall = 'updateDayRemark'
        } else {
            apiCall = 'deleteDayRemark'
        }
        return service[apiCall](payload).then(result => {
            if (apiCall === 'deleteDayRemark') {
                context.commit('REMOVE_DAY_REMARK_FOR_EMPLOYEE', payload)
            } else {
                context.commit('SET_DAY_REMARK_FOR_EMPLOYEE', result)
            }
            return result
        }).catch(error => {
            throw error
        })
    },

    getWeeklyBookableHourTypes(context, date) {
        const existingBookableHourTypes = context.getters.WEEK_BOOKABLE_HOUR_TYPES(date)
        if (existingBookableHourTypes) {
            return new Promise((resolve) => {
                resolve(existingBookableHourTypes)
            })
        }
        return service.getBookableHourTypes({ date: date.apiFormat() }).then(result => {
            context.commit('SET_WEEK_BOOKABLE_HOUR_TYPES', { date, result })
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns status for a week.
     *
     * @param context
     * @param payload
     *
     * @returns {Promise<unknown>|Promise<void>}
     */
    getWeekStatus(context, payload) {
        const date = payload ? payload.date : undefined
        // check if it was fetched before
        if (!payload.force) {
            if (date) {
                const existing = Object.keys(context.getters.WEEK_STATUS(date))
                if (existing.length > 0) {
                    return new Promise(resolve => resolve(existing))
                }
            } else {
                const existing = context.getters.ALL_WEEK_STATUSES
                if (existing.length) {
                    return new Promise(resolve => resolve(existing))
                }
            }
        }
        context.commit('TOGGLE_LOADING', 'planning/weekStatus', { root: true })
        const servicePayload = {
            week: date ? date.yearWeekApiFilter() : undefined,
            latest_status: payload ? payload.latest_status : undefined,
            limit: 10_000,
        }

        return storeService.getWeekStatuses(servicePayload).then(statuses => {
            context.commit('SET_WEEK_STATUS', { date, statuses })
            return statuses
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'planning/weekStatus', { root: true })
        })
    },

    async getClaSettings(context) {
        const existing = Object.keys(context.getters.CLA_SETTINGS)
        if (existing.length > 0) {
            return new Promise(resolve => resolve(context.getters.CLA_SETTINGS))
        }
        return service.getClaSettings().then(result => {
            context.commit('SET_CLA_SETTINGS', result)
            return result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns departments status for a week.
     *
     * @param context
     * @param payload
     *
     * @returns {Promise<unknown>|Promise<void>}
     */
    getDepartmentsWeekStatus(context, payload) {
        // check if it was fetched before
        const existing = context.rootGetters['planning/WEEK_STORE_DATA'](payload.date).department_status
        if (existing.length > 0 && !payload.override) {
            return new Promise(resolve => resolve(existing))
        }
        context.commit('TOGGLE_LOADING', 'planning/finalizedDepartmentStatus', { root: true })

        const servicePayload = {
            week: payload.date.yearWeekApiFilter(),
        }

        return service.getDepartmentsWeekStatus(servicePayload).then(result => {
            context.commit('SET_DEPARTMENTS_WEEK_STATUS', { date: payload.date, result })
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'planning/finalizedDepartmentStatus', { root: true })
        })
    },

    getLastFinalizedDepartmentStatus(context) {
        // check if it was fetched before
        const existing = context.getters.LAST_FINALIZED_DEPARTMENT_DATE
        if (Object.keys(existing).length) {
            return new Promise(resolve => resolve(existing))
        }
        context.commit('TOGGLE_LOADING', 'planning/finalizedDepartmentStatus', { root: true })
        const servicePayload = {
            'week[gte]': Vue.moment().yearWeekApiFilter(),
            latest_status: true,
            status: 'finalized',
            sorting: '-week',
        }

        return service.getDepartmentsWeekStatus(servicePayload).then(result => {
            context.commit('SET_LAST_FINALIZED_DEPARTMENT_DATE', result)
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'planning/finalizedDepartmentStatus', { root: true })
        })
    },

    /**
     * Approves or reject a substitute request on a shift
     * @param {Object} payload
     * @returns {Promise}
     */
    assessSubstituteRequest(context, payload) {
        return service.assessSubstituteRequest(payload).then(result => {
            return result
        }).catch(err => {
            throw err
        })
    },

    getSchedulingNotifications(context, payload) {
        const date = payload.date
        const { year, week } = payload.date.weekYearObject()
        payload.year = year
        payload.week = week
        payload.include_remarks = false
        payload.overrule_warnings = false
        payload.simulate = true
        const existingData = context.getters.SCHEDULING_NOTIFICATIONS(payload.date)
        if (!payload.force && existingData.length && !payload.force) {
            return new Promise((resolve) => { resolve(existingData) })
        }
        if (Vue.moment(payload.date).startOf('week').isSameOrAfter(Vue.moment().startOf('week'))) {
            delete payload.date
            return service.getSchedulingNotifications(payload).then(result => {
                context.commit('SET_SCHEDULING_NOTIFICATIONS', { ...result, year, week, date })
                return result
            }).catch(err => {
                throw err
            })
        }
    },

    finalizeDepartments(context, payload) {
        delete payload.month

        payload.simulate = false
        return service.finalizeDepartments(payload).then(result => {
            context.dispatch('getDepartmentsWeekStatus', { date: payload.date, override: true })
            // re-fetch finalize notifications for all departments
            context.dispatch('getSchedulingNotifications', { ...payload, department_ids: payload.employeeDepartments, simulate: true, force: true })
            context.commit('SET_SNACKBAR', {
                message: language.t('pages.scheduling.publishPopUp.apiActions.finalized'),
                success: true,
            }, { root: true })
            return result
        }).catch(err => {
            throw err
        })
    },

    closeDepartments(context, payload) {
        delete payload.month
        delete payload.include_remarks
        return service.closeDepartments(payload).then(async result => {
            // eslint-disable-next-line camelcase
            const { date, department_ids } = payload
            context.dispatch('getDepartmentsWeekStatus', { date, override: true })
            context.commit('planning/SET_DEPARTMENT_SHIFTS_READ_ONLY', { date, department_ids, readOnly: true }, { root: true })
            context.commit('SET_SNACKBAR', {
                message: language.t('pages.scheduling.publishPopUp.apiActions.closed'),
                success: true,
            }, { root: true })
            return result
        }).catch(err => {
            throw err
        })
    },

    reopenDepartments(context, payload) {
        delete payload.month
        delete payload.include_remarks
        return service.reopenDepartments(payload).then(async result => {
            // eslint-disable-next-line camelcase
            const { date, department_ids } = payload
            await context.dispatch('getDepartmentsWeekStatus', { date, override: true })
            context.commit('planning/SET_DEPARTMENT_SHIFTS_READ_ONLY', { date, department_ids, readOnly: false }, { root: true })
            context.commit('SET_SNACKBAR', {
                message: language.t('pages.scheduling.publishPopUp.apiActions.reopened'),
                success: true,
            }, { root: true })
            return result
        }).catch(err => {
            throw err
        })
    },

    getSchedulingWorkloadData(context, date) {
        const { year, week } = date.weekYearObject()
        const weeklyDetails = context.getters.SCHEDULING_WORKLOAD_DATA({ date })
        if (weeklyDetails.productive_hours.length > 0) {
            return new Promise((resolve) => { resolve(weeklyDetails) })
        }
        return service.getSchedulingWorkloadData({ date }).then(result => {
            context.commit('SET_SCHEDULING_WORKLOAD_DATA', { ...result, year, week })
            return result
        }).catch(error => {
            context.commit('SET_API_ERRORS', 'timeDistribution', { root: true })
            throw error
        })
    },

    getSchedulingWorkloadDataDepartment(context, payload) {
        const { year, week } = payload.date.weekYearObject()
        return service.getSchedulingWorkloadData(payload).then(result => {
            context.commit('SET_SCHEDULING_DEPARTMENT_WORKLOAD_DATA', { days: result.result.days, year, week, department_ids: payload.department_ids })
            return result
        }).catch(error => {
            throw error
        })
    },

    getIndirectTaskTypes({ commit, state }) {
        if (state.indirectTaskTypes.length) {
            // return existing indirect task types
            return new Promise((resolve) => { resolve(state.indirectTaskTypes) })
        }
        return service.getIndirectTaskTypes().then(async result => {
            await commit('SET_INDIRECT_TASK_TYPES', result)
            return result
        }).catch(error => {
            throw error
        })
    },
    getWeekDetails(context, date) {
        const weeklyDetails = context.getters.WEEK_DETAILS(date)
        if (weeklyDetails) {
            return new Promise((resolve) => { resolve(weeklyDetails) })
        }
        return service.getWeekDetails(date).then(result => {
            context.commit('SET_WEEK_DETAILS', { date, result })
            return result
        }).catch(error => {
            throw error
        })
    },

    async workloadGraphHeightAction(context, height) {
        await context.commit('SET_WORKLOAD_GRAPH_HEIGHT', height)
        if (!context.state.settings.workloadChart) {
            document.documentElement.style.setProperty('--workload-graph-height', '0px')
            document.documentElement.style.setProperty('--workload-graph-canvas-height', '0px')
            return
        }
        document.documentElement.style.setProperty('--workload-graph-height', `${context.state.workloadGraphHeight}px`)
        document.documentElement.style.setProperty('--workload-graph-canvas-height', `${context.state.workloadGraphCanvasHeight}px`)
    },

    getTodaysShifts(context) {
        const payload = {
            'date[gte]': Vue.moment().apiFormat(),
            'date[lte]': Vue.moment().apiFormat(),
            store_id: context.rootGetters['stores/currentStore']?.id,
        }
        return service
            .getShifts(payload)
            .then(result => {
                context.commit('SET_TODAY_SHIFTS', result)
                return result
            })
            .catch(error => {
                throw error
            })
    },

    deleteStandardShift(context, shift) {
        context.commit('SET_SAVING_SHIFT', shift.guid)
        return service.deleteShift(shift).then((result) => {
            return result
        }).catch(async err => {
            throw err
        }).finally(() => {
            context.commit('SET_SAVING_SHIFT', null)
        })
    },
}
export default actions
