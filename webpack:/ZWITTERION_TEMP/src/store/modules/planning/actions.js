import * as moment from '../../../config/moment'
import Vue from 'vue'
import AccountService from '../../../services/AccountService'
import DepartmentsService from '../../../services/DepartmentsService'
import SchedulingService from '../../../services/SchedulingService'
import PlanningEmployee from '../../../libraries/planningEmployee'
import RdoService from '../../../services/RdoService'
import SubstituteService from '../../../services/SubstituteService'
import MyScheduleService from '../../../services/MyScheduleService'
import AvailabilityService from '../../../services/AvailabilityService'
import language from '../../../config/language'
Vue.use(moment)

const actions = {
    async getPlanningEmployees(context, { date, standard }) {
        const apiCalls = [
            context.dispatch(standard ? 'getAllStructuresDepartments' : 'getDepartments', date),
            context.dispatch('getEmployees', date),
            context.dispatch('scheduling/getDepartmentsWeekStatus', { date }, { root: true }),
        ]
        return Promise.all(apiCalls).catch(error => {
            throw error
        })
    },

    async getCurrentEmployee(context) {
        return context.dispatch('account/getCurrentEmployee', undefined, { root: true }).catch(err => { throw err })
    },

    async getEmployees(context, date) {
        toggleLoading(context, 'employees')
        const currentUser = context.rootGetters['auth/user']
        const canEditOwnShifts = context.rootGetters['auth/CAN_EDIT_OWN_PLANNING']
        const { year, week } = date.dayWeekYearObject()
        const existingEmployees = context.getters.GET_YEAR_WEEK_DATA(date, 'employees')
        if (existingEmployees.length) {
            toggleLoading(context, 'employees')
            return new Promise((resolve) => { resolve({ existing: true, employees: existingEmployees }) })
        }
        const storeId = context.rootGetters['stores/currentStore'].id
        const employeesPayload = {
            date: date.apiFormat(),
            limit: 1000,
            include_future_accounts: true,
            active: true,
        }
        const exchangeEmployeesPayload = { year, week, storeId, exchange: true }
        await context.dispatch('getStoreGroups', date)
        const employeeCalls = [
            AccountService.getExchangeEmployeesForWeek(exchangeEmployeesPayload),
            AccountService.getWeekEmployees(employeesPayload),
        ]
        const planningEmployee = (e) => {
            return new PlanningEmployee(e)
        }
        const departments = context.getters.DEPARTMENTS(date)
        const notAssignedSingleMock = {
            name: language.t('pages.scheduling.resources.unassigned'),
            departments,
            account_id: 'not_assigned',
            notAssigned: true,
        }
        const weeksBeforeContractEnd = this.getters['auth/CONTRACT_ENDING_SIGNAL_PERIOD']
        return Promise.all(employeeCalls)
            .then(async results => {
                const exchangeEmployees = results[0]
                const employees = results[1]
                exchangeEmployees.forEach(employee => {
                    const exchangeStore = context.getters.GET_YEAR_WEEK_DATA(date, 'groupedExchangeStores')[employee.store_id]
                    if (exchangeStore && exchangeStore.length) {
                        employee.exchangeStore = exchangeStore[0]
                    }
                })
                const allEmployees = [notAssignedSingleMock].concat(exchangeEmployees, employees)
                    .map(e => {
                        const sameAsCurrentUser = canEditOwnShifts && e.account_id === currentUser.accountId
                        const readOnly = !sameAsCurrentUser && !e.notAssigned && !e.planning_labor_access
                        return {
                            ...planningEmployee({
                                ...e,
                                weeksBeforeContractEnd,
                                selectedDate: date,
                                readOnly,
                            }),
                        }
                    })
                await context.commit('SET_YEAR_WEEK_DATA', { result: allEmployees, date, prop: 'employees' })
                return context.getters.GET_YEAR_WEEK_DATA(date, 'employees')
            })
            .catch(error => {
                throw error
            })
            .finally(() => {
                toggleLoading(context, 'employees')
            })
    },

    async getDepartments(context, date) {
        toggleLoading(context, 'departments')
        const existingDepartments = context.getters.GET_YEAR_WEEK_DATA(date, 'departments')
        if (existingDepartments.length) {
            toggleLoading(context, 'departments')
            return new Promise((resolve) => { resolve(existingDepartments) })
        }
        const result = await DepartmentsService.getDepartments({ date: date.apiFormat() })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'departments'))
        await context.commit('SET_YEAR_WEEK_DATA', { result, date, prop: 'departments' })
        return context.state.departments
    },

    async getAllStructuresDepartments(context, date) {
        toggleLoading(context, 'departments')
        const existingDepartments = context.getters.ALL_STRUCTURES_DEPARTMENTS
        if (existingDepartments.length) {
            toggleLoading(context, 'departments')
            return new Promise((resolve) => { resolve(existingDepartments) })
        }
        const result = await DepartmentsService.getAllStructuresDepartments({ date: date.apiFormat() })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'departments'))
        context.commit('SET_ALL_STRUCTURES_DEPARTMENTS', result)
        return context.getters.GET_YEAR_WEEK_DATA(date, 'departments')
    },

    async getStoreGroups(context, date) {
        toggleLoading(context, 'storeGroups')
        const existingStoreGroups = context.getters.GET_YEAR_WEEK_DATA(date, 'storeGroups')
        if (existingStoreGroups.length) {
            const existingExchangeStores = context.getters.GET_YEAR_WEEK_DATA(date, 'exchangeStores')
            toggleLoading(context, 'storeGroups')
            return new Promise((resolve) => {
                resolve({
                    storeGroups: existingStoreGroups,
                    exchangeStores: existingExchangeStores,
                })
            })
        }
        const storeId = context.rootGetters['stores/currentStore'].id
        const { year, week } = date.dayWeekYearObject()
        const yearWeek = `${year}-${week}`
        const storeGroupData = await SchedulingService.getStoreGroups({ storeId, yearWeek })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'storeGroups'))
        const { stores, departments } = storeGroupData.aggregation
        const store_groups = storeGroupData.result
        const { storeGroups, exchangeStores } = await mapStoreGroups({ stores, store_groups, departments })
        context.commit('SET_STORE_GROUPS', { storeGroups, date })
        context.commit('SET_EXCHANGE_STORES', { exchangeStores, date })
        return { storeGroups, exchangeStores }
    },

    async getAccountWeekShifts(context, { date, accountId }) {
        toggleLoading(context, 'accountShifts', accountId)
        const currentStoreId = context.rootGetters['stores/currentStore'].id
        const payload = {
            'date[gte]': date.startOf('isoWeek').apiFormat(),
            'date[lte]': date.endOf('isoWeek').apiFormat(),
            account_id: accountId,
            store_id: currentStoreId,
        }
        const result = await SchedulingService.getShifts(payload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'accountShifts', accountId))
        context.commit('SET_WEEK_EMPLOYEE_SHIFTS', { date, result, currentStoreId, accountId })
        return result
    },

    async getAvailabilities(context, date) {
        toggleLoading(context, 'availabilities')
        const availabilities = await context.dispatch('availability/getEmployeesAvailabilitiesForWeek', date, { root: true })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'availabilities'))
        context.commit('SET_EMPLOYEES_AVAILABILITIES', { date, availabilities })
        return availabilities
    },

    async getRdoRequests(context, date) {
        toggleLoading(context, 'rdoRequests')
        const apiPayload = {
            from_date: date.startOf('isoWeek').apiFormat(),
            to_date: date.endOf('isoWeek').apiFormat(),
        }
        const rdoRequests = await RdoService.getAllRequests(apiPayload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'rdoRequests'))
        context.commit('SET_RDO_REQUESTS', { date, rdoRequests })
        return rdoRequests
    },

    async getSubstituteRequests(context, date) {
        toggleLoading(context, 'substituteRequests')
        const apiPayload = {
            'date[gte]': date.startOf('isoWeek').apiFormat(),
            'date[lte]': date.endOf('isoWeek').apiFormat(),
        }
        const substituteRequests = await SubstituteService.getSubstituteRequests(apiPayload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'substituteRequests'))
        context.commit('SET_SUBSTITUTE_REQUESTS', { date, substituteRequests })
        return substituteRequests
    },

    async getBusinessTimes(context, date) {
        toggleLoading(context, 'businessTimes')
        const businessTimes = await context.dispatch('stores/getCurrentStoreWeekBusinessTimes', date, { root: true })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'businessTimes'))
        context.commit('SET_EMPLOYEES_BUSINESS_TIMES', { date, businessTimes })
        return businessTimes
    },

    async getContracts(context, date) {
        toggleLoading(context, 'contracts')
        // we need to get all employees contracts, so we do not provide a date filter
        const contracts = await context.dispatch('contracts/getContracts', {}, { root: true })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'contracts'))
        context.commit('SET_EMPLOYEES_CONTRACTS', { date, contracts })
        return contracts
    },

    /**
     * Returns remarks for all employees current user has access to for a day.
     *
     * @param {VUEX} context
     * @param {Object} payload
     */
    async getAccountWeekDayRemarks(context, { date, accountId }) {
        toggleLoading(context, 'accountWeekRemarks', accountId)
        const apiPayload = {
            'date[gte]': date.startOf('isoWeek').apiFormat(),
            'date[lte]': date.endOf('isoWeek').apiFormat(),
            account_id: accountId,
        }
        const result = await SchedulingService.getRemarks(apiPayload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'accountWeekRemarks', accountId))
        context.commit('SET_EMPLOYEE_DAY_REMARKS', { date, remarks: result, accountId })
        return result
    },

    async saveEmployeeDayRemark(context, payload) {
        let apiCall = null
        if (payload.isNew || !payload.id) {
            delete payload.isNew
            apiCall = 'createDayRemark'
        } else if (payload.remark !== '') {
            apiCall = 'updateDayRemark'
        } else {
            apiCall = 'deleteDayRemark'
        }
        toggleSaving(context, apiCall)
        const remark = await SchedulingService[apiCall](payload)
            .catch(err => { throw err })
            .finally(() => toggleSaving(context, apiCall))
        return { remark, apiCall }
    },

    /**
     * Calls the api to fetch indirect hours for an employee
     * @param {Object} payload
     */
    async getIndirectTasks(context, date) {
        toggleLoading(context, 'indirectTasks')
        const apiPayload = {
            'date[gte]': date.startOf('isoWeek').apiFormat(),
            'date[lte]': date.endOf('isoWeek').apiFormat(),
        }
        const result = await SchedulingService.getIndirectHours(apiPayload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'indirectTasks'))
        context.commit('SET_EMPLOYEE_INDIRECT_HOURS', { date, tasks: result.hours })
        return result
    },

    async addIndirectHours(context, payload) {
        toggleSaving(context, 'addIndirectHours')
        const task = await SchedulingService.addIndirectHours(payload)
            .catch(err => { throw err })
            .finally(() => toggleSaving(context, 'addIndirectHours'))
        return { ...payload, ...task[0] }
    },

    async changeIndirectHours(context, payload) {
        toggleSaving(context, 'changeIndirectHours')
        const task = await SchedulingService.changeIndirectHours(payload)
            .catch(err => { throw err })
            .finally(() => toggleSaving(context, 'changeIndirectHours'))
        return { ...payload, ...task[0] }
    },

    deleteIndirectHours(context, payload) {
        toggleSaving(context, 'deleteIndirectHours')
        return SchedulingService.deleteIndirectHours(payload)
            .catch(err => { throw err })
            .finally(() => toggleSaving(context, 'deleteIndirectHours'))
    },

    async getWabCounters(context, { date, accountId, currentCounters = [] }) {
        toggleLoading(context, 'accountWabCounters', accountId)
        const periods = context.getters.GET_YEAR_WEEK_DATA(date, 'storeData')?.periods || []
        const wabCounters = []
        const wabCounterCalls = periods.map(period => {
            return SchedulingService.getWabCounters({ period, date, accountId })
        })
        await Promise.all(wabCounterCalls)
            .then(results => {
                results.forEach(result => {
                    result.counters.forEach(counter => {
                        const { period_year, period_number, start_date, end_date } = result
                        counter.period = { period_year, period_number, start_date, end_date }
                        wabCounters.push(counter)
                    })
                })
            })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'accountWabCounters', accountId))
        return wabCounters
    },

    async getWageInfo(context, date) {
        toggleLoading(context, 'wageInfo')
        const wageInfo = await AccountService.getWageInfo({ date })
            .then((wageInfo) => context.commit('SET_EMPLOYEES_WAGE_INFO', { date, wageInfo }))
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'wageInfo'))
        return wageInfo
    },

    async getWeekBalances(context, { date, accountId }) {
        toggleLoading(context, 'accountBalances', accountId)
        const balances = await MyScheduleService.getWeekBalances({ ...date.weekYearObject(), accountId })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'accountBalances', accountId))
        context.commit('SET_EMPLOYEE_BALANCES', { date, balances, accountId })
        return balances
    },

    async getClaValidationOutcomes(context, date) {
        const { week, year } = date.weekYearObject()
        toggleLoading(context, 'clavalidationOutcomes')
        const outcomes = await SchedulingService.getClaValidationOutcomes({ week, year })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'clavalidationOutcomes'))
        context.commit('SET_EMPLOYEES_VALIDATION_OUTCOMES', { date, outcomes })
        context.commit('SET_CLA_VALIDATION_OUTCOMES', { date, outcomes })
        return outcomes
    },

    async getStandardShifts(context, { date, accountId }) {
        const loading = accountId ? 'accountStandardShifts' : 'standardShifts'
        toggleLoading(context, loading, accountId)
        const currentStore = context.rootGetters['stores/currentStore']
        const standardShifts = await SchedulingService.getStandardShifts({ account_id: accountId, store_id: currentStore.id })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, loading, accountId))
        context.commit('SET_STANDARD_SHIFTS', { date, result: standardShifts, currentStoreId: currentStore.id, accountId })
        return standardShifts
    },

    /**
     * Returns standard remarks for all employees
     *
     * @param {Object} payload
     */
    async getStandardDayRemarks(context, { date, accountId }) {
        const loading = accountId ? 'accountStandardRemarks' : 'standardRemarks'
        toggleLoading(context, loading, accountId)
        const standardRemarks = await SchedulingService.getStandardRemarks({ account_id: accountId })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, loading, accountId))
        context.commit('SET_STANDARD_DAY_REMARKS', { standardRemarks, date, accountId })
        return standardRemarks
    },

    async getPlannableEmployees(context, shift) {
        toggleLoading(context, 'plannableEmployees')
        const payload = {}
        if (shift.notAssigned || !shift.shift_instance_id) {
            payload['datetime[gte]'] = shift.start_datetime
            payload['datetime[lte]'] = shift.end_datetime
        } else {
            payload.shift_instance_id = shift.shift_instance_id
        }
        const employees = await SchedulingService.getPlannableEmployees(payload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'plannableEmployees'))
        context.commit('SET_SHIFT_PLANNABLE_EMPLOYEES', employees.map(e => +e))
    },

    /**
     * Gets the sent shift instances
     *
     * @param {Object} { departmentStatusHistoryId, date }
     * @returns {Promise}
     */
    async getSentShiftInstances(context, { departmentStatusHistoryId, date }) {
        toggleLoading(context, 'sentSchedules')
        const servicePayload = {
            department_status_history_id: departmentStatusHistoryId,
        }
        const result = await SchedulingService.getSentShiftInstances(servicePayload).catch(err => { throw err })
        await context.commit('SET_SENT_SHIFT_INSTANCES', { result, departmentStatusHistoryId, date })
        toggleLoading(context, 'sentSchedules')
        return result
    },

    /**
     * Gets the sent day remarks
     *
     * @param {Object} { departmentStatusHistoryId, date }
     * @returns {Promise}
     */
    async getSentDayRemarks(context, { departmentStatusHistoryId, date }) {
        const servicePayload = {
            department_status_history_id: departmentStatusHistoryId,
        }
        toggleLoading(context, 'sentDayRemarks')
        const result = await SchedulingService.getSentDayRemarks(servicePayload).catch(err => { throw err })
        await context.commit('SET_SENT_REMARKS', { result, departmentStatusHistoryId, date })
        toggleLoading(context, 'sentDayRemarks')
        return result
    },

    async getAvailabilityWeeksets(context, date) {
        toggleLoading(context, 'weeksets')
        const weeksets = await AvailabilityService.getWeeklyWeeksets(date.startOf('isoWeek').apiFormat())
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'weeksets'))
        context.commit('SET_EMPLOYEES_WEEKSETS', { weeksets, date })
    },

    async getNonProductiveShiftCalculation(context, payload) {
        const existing = context.getters.SHIFT_CALCULATION(payload)
        if (existing) {
            return new Promise((resolve) => { resolve(existing) })
        }
        toggleLoading(context, 'shiftCalculation')
        const shiftCalculation = await SchedulingService.getNonProductiveShiftCalculation(payload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'shiftCalculation'))
        context.commit('SET_SHIFT_CALCULATION', { ...payload, ...shiftCalculation })
        return shiftCalculation
    },

    async getCloseWeekNotifications(context, date) {
        const params = date.weekYearObject()
        const existingCloseWeekNotifications = context.getters.CLOSE_WEEK_NOTIFICATIONS(date)
        if (existingCloseWeekNotifications) {
            return new Promise((resolve) => { resolve(existingCloseWeekNotifications) })
        }
        toggleLoading(context, 'closeWeekNotifications')
        const notifications = await SchedulingService.getCloseWeekNotifications(params)
            .then(notifications => context.commit('SET_CLOSE_WEEK_NOTIFICATIONS', { date, notifications }))
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'closeWeekNotifications'))
        return notifications
    },

    async closeWeek(context, { date, department_ids }) {
        const params = date.weekYearObject()
        delete params.month
        toggleLoading(context, 'closingWeek')
        const closedWeek = await SchedulingService.closeWeek(params)
            .then(() => context.commit('SET_DEPARTMENT_SHIFTS_READ_ONLY', { date, department_ids, readOnly: true }))
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'closingWeek'))
        return closedWeek
    },

    async reopenWeek(context, date) {
        const params = date.weekYearObject()
        delete params.month
        toggleLoading(context, 'closingWeek')
        const closedWeek = await SchedulingService.reopenWeek(params)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'closingWeek'))
        return closedWeek
    },

    async getPlanningEmployeeData(context, { date, standard = false, force }) {
        const existing = context.getters.GET_YEAR_WEEK_DATA(date, 'planningData')
        if (!force && Object.keys(existing).length) {
            return new Promise(resolve => resolve(existing))
        }
        toggleLoading(context, 'planningData')
        const params = date.weekYearObject()
        const currentStore = context.rootGetters['stores/currentStore']
        const CAN_READ_STANDARD_REMARKS = context.rootGetters['auth/CAN_READ_STANDARD_REMARKS']
        context.dispatch('getCurrentEmployee')
        const calls = [
            SchedulingService.getPlanningData(params),
            SchedulingService.getEmployeeData(params),
            SchedulingService.getStoreData(params),
        ]
        if (standard) {
            calls.push(SchedulingService.getStandardShifts({ store_id: currentStore.id }))
            if (CAN_READ_STANDARD_REMARKS) {
                calls.push(SchedulingService.getStandardRemarks())
            }
        }
        await Promise.all(calls)
            .then(([planningData, employeeData, storeData, standardShifts, standardRemarks]) => {
                if (standard) {
                    context.commit('SET_ALL_STRUCTURES_DEPARTMENTS', storeData.result.departments)
                } else {
                    context.commit('SET_YEAR_WEEK_DATA', { result: storeData.result.departments, date, prop: 'departments' })
                }
                const { stores, departments } = storeData.aggregation.store_groups
                const store_groups = storeData.result.store_groups
                const { exchangeStores } = mapStoreGroups({ stores, store_groups, departments })
                storeData.result.exchange_stores = exchangeStores
                storeData.result.all_departments = Object.keys(departments || {}).map(department_id => departments[department_id])
                context.commit('SET_YEAR_WEEK_DATA', { result: storeData.result, date, prop: 'storeData' })
                context.commit('scheduling/SET_WEEK_BOOKABLE_HOUR_TYPES', { result: storeData.result.bookable_hour_types, date }, { root: true })
                context.commit('SET_PLANNING_DATA', { date, planningData, employeeData, storeData: storeData.result })
                context.commit('SET_SHIFT_BREAKS_SUGGESTIONS', storeData.result.breaks)
                if (standard) {
                    context.commit('SET_STANDARD_SHIFTS', { date, result: standardShifts, currentStoreId: currentStore.id })
                    if (CAN_READ_STANDARD_REMARKS) {
                        context.commit('SET_STANDARD_DAY_REMARKS', { standardRemarks, date })
                    }
                }
            })
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'planningData'))
        return context.getters.GET_YEAR_WEEK_DATA(date, 'planningData')
    },

    async getShiftSurcharges(context, date) {
        const payload = {
            'date[gte]': date.startOf('isoWeek').apiFormat(),
            'date[lte]': date.endOf('isoWeek').apiFormat(),
        }
        toggleLoading(context, 'shiftSurcharges')
        const surcharges = await SchedulingService.getShiftSurcharges(payload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'shiftSurcharges'))
        context.commit('SET_SHIFT_SURCHARGES', { date, surcharges })
        return surcharges
    },

    async deleteSurcharge(context, surcharge) {
        toggleLoading(context, 'saveShiftSurcharge', surcharge.guid)
        return SchedulingService.deleteShiftSurcharge(surcharge.shift_surcharge_id)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'saveShiftSurcharge', surcharge.guid))
    },

    async createSurcharge(context, surcharge) {
        toggleLoading(context, 'saveShiftSurcharge', surcharge.guid)
        return SchedulingService.createShiftSurcharge(surcharge)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'saveShiftSurcharge', surcharge.guid))
    },

    async updateSurcharge(context, surcharge) {
        toggleLoading(context, 'saveShiftSurcharge', surcharge.guid)
        return SchedulingService.updateShiftSurcharge(surcharge)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'saveShiftSurcharge', surcharge.guid))
    },

    async downloadExcelPlanning(context, payload) {
        const { week, year } = payload.date.weekYearObject()
        const apiPayload = {
            department_id: payload.department_id,
            week_number: week,
            year,
            // hardcoded values are intended for now
            sort_type: 2,
            keys: 0,
            show_departments: 1,
            show_nonproductive: 1,
            bhv: 0,
            show_checkout_responsibility: 0,
            show_executive_staff: 0,
            show_social_hygiene: 0,
            // end hardcoded values
        }
        toggleLoading(context, 'excelDownload')
        return SchedulingService.downloadExcelPlanning(apiPayload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'excelDownload'))
    },

    async getEmployeeDepartments(context, payload) {
        const existing = context.getters.EMPLOYEE_DEPARTMENTS(payload)
        if (existing.length) {
            return new Promise((resolve) => { resolve(existing) })
        }
        toggleLoading(context, 'employeeDepartments')

        const { year, week } = payload.date.dayWeekYearObject()
        payload.week = week
        payload.year = year

        const result = await AccountService.getEmployeeDepartments(payload)
            .catch(err => { throw err })
            .finally(() => toggleLoading(context, 'employeeDepartments'))
        context.commit('SET_EMPLOYEE_DEPARTMENTS', { result, payload })
        return context.getters.EMPLOYEE_DEPARTMENTS(payload)
    },
}

function mapStoreGroups({ stores, store_groups, departments }) {
    const exchangeStores = []
    const addedStores = []
    store_groups.forEach(sg => {
        if (sg.exchange) {
            sg.stores.forEach(store => {
                const newStore = stores[store.id]
                const newStoreDepartments = store.departments.map(department => {
                    return departments[department]
                })
                newStore.departments = newStoreDepartments
                newStore.store_group = sg
                if (!addedStores.includes(newStore.store_id)) {
                    exchangeStores.push(newStore)
                    addedStores.push(newStore.store_id)
                }
            })
        }
    })
    return { store_groups, exchangeStores }
}

function toggleLoading(context, prop, value) {
    if (value) {
        if (context.state.loading[prop] === value) {
            context.state.loading[prop] = null
        } else {
            context.state.loading[prop] = value
        }
    } else {
        context.commit('TOGGLE_LOADING', `planning/${prop}`, { root: true })
    }
}

function toggleSaving(context, prop, value) {
    context.commit('TOGGLE_SAVING', `planning/${prop}`, { root: true })
}

export default actions
