import vuexHelper from '../../../libraries/vuexHelper'
import objectHelper from '../../../libraries/objectHelper'
import schedulingHelper from '../../../libraries/schedulingHelper'
import PlanningShift from '../../../libraries/planningShift'
import * as moment from '../../../config/moment'
import Vue from 'vue'
Vue.use(moment)

const getters = {
    DEPARTMENTS: (state, getters, rootState, rootGetters) => (date, includeOrganizational = false) => {
        return getters.GET_YEAR_WEEK_DATA(date, 'departments')
    },
    ALL_STRUCTURES_DEPARTMENTS(state, getters, rootState, rootGetters) {
        return state.allStructuresDepartments
    },
    /**
     * Returns true if the current application user has the provided department
     * @returns {Boolean}
     */
    APP_USER_HAS_DEPARTMENT: (state, getters, rootState, rootGetters) => (departmentId, date) => {
        const isOrganizationalUser = rootGetters['auth/isOrganisationalUser']
        const allDepartmentsAccess = rootGetters['auth/HAS_ALL_DEPARTMENTS_ACCESS']
        const appUser = rootGetters['auth/user']
        if (isOrganizationalUser || allDepartmentsAccess) {
            return true
        }
        const planningData = getters.GET_YEAR_WEEK_DATA(date, 'planningData')
        const currentUser = planningData[appUser.accountId]
        if (!currentUser) return false
        const currentEmployeeDepartmentIds = currentUser.departments.map(d => d.department_id)
        return currentEmployeeDepartmentIds.includes(departmentId)
    },
    GET_YEAR_WEEK_DATA: (state) => (date, prop) => {
        const { year, week } = date.dayWeekYearObject()
        return (vuexHelper.getYearWeekStateData(state[prop], { year, week }) || [])
    },

    EXCHANGE_STORES: (state, getters, rootState, rootGetters) => (date) => {
        const stores = []
        const groupedExchangeStores = getters.GET_YEAR_WEEK_DATA(date, 'groupedExchangeStores')
        Object.keys(groupedExchangeStores).forEach(gs => {
            stores.push(groupedExchangeStores[gs][0])
        })
        return stores
    },

    GROUPED_EXCHANGE_STORES: (state, getters, rootState, rootGetters) => (date) => {
        return getters.GET_YEAR_WEEK_DATA(date, 'groupedExchangeStores')
    },

    IS_SHIFT_READ_ONLY: (state, getters, rootState, rootGetters) => (shift, date, checkDepartmentStatus = true) => {
        const departmentStatus = getters.DEPARTMENTS_WEEK_STATUS_ON_ID({ date, departmentId: shift.department_id }).slice(0, 1)[0]
        return shift.read_only || (checkDepartmentStatus && departmentStatus?.status === 'closed')
    },

    LAST_MODIFIED_STANDARD_SHIFT(state) {
        return state.lastModifiedStandardShift
    },

    SHIFT_PLANNABLE_EMPLOYEES(state) {
        return state.shiftPlannableEmployees
    },

    CLA_VALIDATION_OUTCOMES: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        const yearData = state.claValidationOutcomes[year]
        if (yearData && yearData[week]) {
            if (yearData[week]) {
                return yearData[week]
            }
        }
    },

    CUSTOM_TIME_FROM_KEYBOARD(state) {
        return state.customTimeFromKeyboard
    },

    SHOW_SEARCH(state) {
        return state.showSearch
    },

    DAY_TOTALS_STEER_TYPE(state) {
        return state.dayTotalsSteerType
    },

    // eslint-disable-next-line camelcase
    SHIFT_CALCULATION: (state) => ({ year, week, guid, account_id }) => {
        const data = vuexHelper.getYearWeekStateDataForAccount(state.shiftCalculation, { year, week, accountId: account_id })
        if (data) {
            return data[guid]
        }
    },

    SNACKBAR_ADDITIONAL_SETTING(state) {
        return state.additionalSnackbarSetting
    },

    MOBILE_PLANNING_SWIPE_DIRECTION(state) {
        return state.mobilePlanningSwipeDirection
    },

    EMPLOYEE_WAB_WARNINGS: (state) => (date, accountId) => {
        const { year, week } = date.dayWeekYearObject()
        const warnings = vuexHelper.getYearWeekStateData(state.employeesWabWarnings, { year, week })
        if (warnings) {
            return warnings[accountId]
        }
    },

    WEEK_INDIRECT_HOURS: (state) => (date) => {
        const { year, week } = date.dayWeekYearObject()
        return vuexHelper.getYearWeekStateData(state.weekIndirectHours, { year, week })
    },

    CLOSE_WEEK_NOTIFICATIONS: (state) => (date) => {
        const { year, week } = date.dayWeekYearObject()
        return vuexHelper.getYearWeekStateData(state.closeWeekNotifications, { year, week })
    },

    CLOSE_WEEK_EMPLOYEES_NOTIFICATIONS: (state) => (date) => {
        const { year, week } = date.dayWeekYearObject()
        return vuexHelper.getYearWeekStateData(state.closeWeekEmployeesNotifications, { year, week }) || []
    },

    WEEK_CLOSE_NOTIFICATION_SNACKBAR(state, value) {
        return state.weekCloseNotificationSnackbar
    },

    WEEK_PLANNING_DATA: (state) => (date) => {
        const { year, week } = date.dayWeekYearObject()
        return vuexHelper.getYearWeekStateData(state.planningData, { year, week })
    },

    WEEK_STORE_DATA: (state) => (date) => {
        const { year, week } = date.dayWeekYearObject()
        return vuexHelper.getYearWeekStateData(state.storeData, { year, week }) || []
    },

    EMPLOYEE_DEPARTMENTS: (state) => ({ date, account_id }) => {
        const { year, week } = date.dayWeekYearObject()
        const data = vuexHelper.getYearWeekStateDataForAccount(state.employeeDepartments, { year, week, accountId: account_id })
        return data || []
    },

    /**
     * Returns departments week status for a week-year.
     *
     * @param {String} week
     */
    DEPARTMENTS_WEEK_STATUS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return state.storeData?.[year]?.[week]?.department_status || []
    },

    /**
     * Returns departments week status for a week-year.
     *
     * @param {String} week
     */
    DEPARTMENTS_WEEK_STATUS_ON_ID: (state, getters) => ({ date, departmentId }) => {
        const departmentStatuses = getters.DEPARTMENTS_WEEK_STATUS(date)
        if (departmentStatuses) {
            const statuses = objectHelper.sortByKey(departmentStatuses.filter(e => e.department_id === departmentId), 'changed_on').reverse()
            if (statuses.length) {
                if ((statuses[0]?.status === 'finalized' || statuses[0]?.status === 'changed') && statuses[1]?.status === 'closed') {
                    statuses[0].reopened = true
                }
            }
            return statuses
        }
        return []
    },

    BREAK_SUGGESTION: (state) => (from, to, age) => {
        if (!age) {
            age = 18
        }
        const weekday = from.isoWeekday()
        const startTime = from.shortTime()
        const endTime = to.shortTime()
        const suggestions = state.shiftBreakSuggestions
        let foundBreak
        // eslint-disable-next-line no-labels
        suggestionsLoop:
        for (let s = 0; s < suggestions.length; s++) {
            if (suggestions[s].start_time !== startTime) {
                continue
            }
            for (let e = 0; e < suggestions[s].end_times.length; e++) {
                const endTimes = suggestions[s].end_times[e]
                if (endTimes.end_time !== endTime) {
                    continue
                }
                for (let d = 0; d < endTimes.days.length; d++) {
                    const day = endTimes.days[d]
                    if (!day.day_number.find(day => day === weekday)) {
                        continue
                    }
                    // if break_adult is present we apply the suggestion if the age provided is 18+
                    foundBreak = day.break_adult && age >= 18 ? day.break_adult : day.break
                    // eslint-disable-next-line no-labels
                    break suggestionsLoop
                }
            }
        }
        if (!foundBreak) return false
        return {
            duration: foundBreak,
        }
    },

    BREAK_SUGGESTIONS(state) {
        return state.shiftBreakSuggestions
    },

    NEW_SHIFT: (state, getters, rootState, rootGetters) => (payload) => {
        const from = Vue.moment(payload.start_datetime || payload.from)
        const to = Vue.moment(payload.end_datetime || payload.to)
        const departments = rootGetters['planning/DEPARTMENTS'](from)
        const currentStore = rootGetters['stores/currentStore']
        const defaultBreak = { duration: '00:00' }
        const defaultBreaks = !payload.nonProductive ? [getters.BREAK_SUGGESTION(from, to, payload.age) || defaultBreak] : [defaultBreak]
        let breaksDuration = 0
        defaultBreaks.forEach(br => {
            breaksDuration += Vue.moment.duration(br.duration).asMinutes()
        })
        return new PlanningShift({
            ...payload,
            account_id: payload.account_id,
            break_length: payload.break_length || defaultBreaks[0].duration,
            breaks: payload.breaks || defaultBreaks,
            created: payload.created || getters.CREATED_BY(),
            department_id: payload.department_id,
            duration: payload.duration || Vue.moment.duration(to.diff(from)).subtract(breaksDuration, 'minutes').format('HH:mm'),
            end_datetime: to.longApiFormat(),
            exchange_store_id: payload.exchange_store_id || null,
            frequency: payload.frequency || null,
            frequencyId: payload.frequencyId || null,
            instances: payload.instances || [getters.NEW_SHIFT_INSTANCE(payload)],
            last_modified: payload.last_modified || getters.CREATED_BY(),
            last_occurrence: payload.last_occurrence || null,
            name: payload.shiftName || null,
            remark: payload.remark || '',
            shift_id: payload.shift_id || null,
            start_datetime: from.longApiFormat(),
            status: payload.status || 'planned',
            store_id: payload.store_id || currentStore.id,
            type: payload.type || 'G',
            foreign_type: payload.foreign_type || null,
            notAssigned: payload.notAssigned,
            isNew: payload.isNew || true,
            readOnly: payload.readOnly || false,
            nonProductive: payload.nonProductive || false,
            nonProductiveSimple: payload.nonProductiveSimple || false,
            overlaps: schedulingHelper.newOverlapScenario(),
            indirect_hours: [],
            department: departments.find(d => d.department_id === payload.department_id),
        })
    },

    NEW_SHIFT_INSTANCE: (state, getters, rootState, rootGetters) => (payload) => {
        const from = Vue.moment(payload.start_datetime || payload.from)
        const to = Vue.moment(payload.end_datetime || payload.to)
        const defaultBreak = getters.BREAK_SUGGESTION(from, to, payload.age) || { duration: '00:00' }
        return {
            account_id: payload.account_id,
            break_length: defaultBreak.duration,
            breaks: [defaultBreak],
            created: getters.CREATED_BY(),
            department_id: payload.department_id || 0,
            duration: Vue.moment.duration(to.diff(from)).format('HH:mm'),
            end_datetime: to.longApiFormat(),
            last_modified: getters.CREATED_BY(),
            processor: payload.processor || null,
            processor_id: payload.processorId || null,
            remark: payload.remark || '',
            rule_ref: payload.ruleRef || null,
            shift_id: null,
            shift_instance_id: payload.shiftInstanceId || 123456,
            start_datetime: from.longApiFormat(),
            status: payload.status || 'new',
            type: payload.type || 'G',
        }
    },

    CREATED_BY: (state, getters, rootState, rootGetters) => (accountId) => {
        const currentUser = rootGetters['auth/user']
        return {
            account_id: currentUser.accountId,
            datetime: Vue.moment().longApiFormat(),
        }
    },

    COPIED_SHIFT(state) {
        return state.copiedShift
    },

    CURRENT_EMPLOYEE_DEPARTMENTS: (state) => (date) => {
        const { year, week } = date.dayWeekYearObject()
        return vuexHelper.getYearWeekStateData(state.currentWeekEmployeeDepartments, { year, week })
    },

    HAS_SENT_SHIFTS_HISTORY: (state) => (id) => {
        return state.fetchedDepartmentSentShiftHistory.includes(id)
    },

    HAS_SENT_DAY_REMARKS_HISTORY: (state) => (id) => {
        return state.fetchedDepartmentSentDayRemarksHistory.includes(id)
    },
}
export default getters
