import { getFormattedNumber } from '../../../libraries/steerInformationHelper'
import vuexHelper from '../../../libraries/vuexHelper'
import Vue from 'vue'
import * as moment from '../../../config/moment'
import { store } from '../../../store'
Vue.use(moment)

const mutations = {
    INIT_SCREEN_VIEW() {
        this.commit('steerInformation/SET_TOTALS')
        this.commit('steerInformation/SET_TOTALS_REALIZED')
        this.commit('steerInformation/SUM_WAGE_COSTS')
        this.commit('steerInformation/SUM_HOURS')
    },
    SET_WEEK_STATUS(state, value) {
        state.weekStatus = value
    },
    SET_WEEK_STATUSES(state, array) {
        state.weekStatuses = array
    },
    SET_STEER_INFORMATION_LOADING(state, value) {
        state.steerInformationLoading = value
    },
    SET_STEER_INFORMATION_INTERSECTIONS(state, payload) {
        const result = payload

        // Delete indirect hours from the array if there is no right to it
        if (!store.getters['auth/CAN_ADD_INDIRECT_TASKS']) {
            if (!result.totals) return
            const indexOfIndirectHours = result.totals.findIndex(t => t.name === 'indirect-hours')
            result.totals.splice(indexOfIndirectHours, 1)
        }

        vuexHelper.setYearWeekData(state, 'steerInformationIntersections', payload, payload.year, payload.week)
    },
    SET_INTERSECTIONS_LOADING(state, value) {
        state.intersectionsLoading = value
    },
    SET_STEER_INFORMATION_WORKLOAD_LOADING(state, value) {
        state.steerInformationWorkloadLoading = value
    },
    SET_FORECAST_DATA(state, payload) {
        const { year, week } = payload.date.weekYearObject()
        vuexHelper.setYearWeekData(state, 'forecastData', payload.result, year, week)
    },
    SET_MAX_RELEASED_DATE(state, value) {
        state.maxReleasedDate = value
    },
    SET_API_PARAM_HOURS(state, payload) {
        state.settings.hoursSelection = payload
    },
    SET_API_PARAM_COSTS(state, payload) {
        state.settings.costsSelection = payload
    },
    SET_DEPARTMENT_TYPES(state, value) {
        state.departmentTypes = value
    },
    TOGGLE_PERCENTAGE_COLUMN(state, value) {
        state.settings.showPercentageColumn = value
    },
    TOGGLE_BUDGET_COLUMN(state, value) {
        state.settings.showBudgetColumn = value
    },
    SET_DAYS_DISABLED(state, dayNumber) {
        if (!dayNumber) state.daysDisabled = [true, true, true, true, true, true, true]
        const daysDisabled = []
        const currentDay = dayNumber - 1
        for (let i = 0; i < 7; i++) {
            if (i <= currentDay) {
                daysDisabled.push(true)
            }
            if (i > currentDay) {
                daysDisabled.push(false)
            }
        };
        state.daysDisabled = daysDisabled
    },
    SET_STEER_INFORMATION(state, payload) {
        state.steerInformation = payload
    },
    SET_CHANGE_TRIGGERED(state, payload) {
        state.changeTriggered = payload
    },
    SUM_WAGE_COSTS(state) {
        const { cost, external, turnover } = this.getters['steerInformation/GROUPED_STEER_INFORMATION_DEPARTMENTS']
        state.wageCostsTotalPlanned = sumHour(turnover, 'turnover', 'costs')
        state.wageCostsTotalActual = sumHour(cost, 'realized', 'costs')
        state.wageCostsTotalDeviation = sumHour(external, 'expected', 'costs')
    },
    SUM_HOURS(state) {
        const { cost, external, turnover } = this.getters['steerInformation/GROUPED_STEER_INFORMATION_DEPARTMENTS']
        state.wageHoursTotalPlanned = sumHour(turnover, 'turnover', 'hours')
        state.wageHoursTotalActual = sumHour(cost, 'realized', 'hours')
        state.wageHoursTotalDeviation = sumHour(external, 'expected', 'hours')
    },
    SET_WEEKLY_VALUE(state, payload) {
        state.forecastData.store.weekly.value = payload
    },
    SET_TOTALS(state, payload = null) {
        let departmentData = []
        if (!payload) {
            departmentData = this.getters['steerInformation/GROUPED_STEER_INFORMATION_DEPARTMENTS']
        } else {
            departmentData = payload
        }
        const { cost, external, turnover } = departmentData
        const turnoverTotal = sumDepartmentByType(turnover, 'turnover')
        const costTotal = sumDepartmentByType(cost, 'cost')
        const externalTotal = sumDepartmentByType(external, 'external')
        // set turnover total value
        state.turnoverTotal = turnoverTotal
        // set store total value
        const storeTotal = turnoverTotal - costTotal
        state.storeTotal = getFormattedNumber(storeTotal)
        // set business total value
        const businessTotal = turnoverTotal - costTotal + externalTotal
        state.businessTotal = getFormattedNumber(businessTotal)
    },
    SET_TOTALS_REALIZED(state, payload = null) {
        let departmentData = []
        if (!payload) {
            departmentData = this.getters['steerInformation/GROUPED_STEER_INFORMATION_DEPARTMENTS']
        } else {
            departmentData = payload
        }
        const { cost, external, turnover } = departmentData
        const turnoverTotal = sumDepartmentByType(turnover, 'turnover')
        const costTotal = sumDepartmentByType(cost, 'cost')
        const externalTotal = sumDepartmentByType(external, 'external')
        // set turnover total value
        state.realizedTurnoverTotal = getFormattedNumber(turnoverTotal)
        // set store total value
        const storeTotal = turnoverTotal - costTotal
        state.realizedStoreTotal = getFormattedNumber(storeTotal)
        // set business total value
        const businessTotal = turnoverTotal - costTotal + externalTotal
        state.realizedBusinessTotal = getFormattedNumber(businessTotal)
    },
    RECALCULATE_REALIZED(state, payload) {
        let weekTotal = 0
        const steerinformationDepartment = Object.values(this.getters['steerInformation/GROUPED_STEER_INFORMATION_DEPARTMENTS']).flat().find(item => item.department_id === payload.department_id)
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            weekTotal += parseFloat(steerinformationDepartment.days[dayIndex].turnover.realized)
        }
        steerinformationDepartment.totals.turnover.realized = getFormattedNumber(weekTotal)
        this.commit('steerInformation/SET_TOTALS_REALIZED')
    },
    SET_FIELD_NAME(state, payload) {
        state.fieldName = payload
    },
    SYNC_FORE_CAST_DATA(state, date) {
        const foreCastData = this.getters['steerInformation/FORECAST'](date)
        const fieldName = state.fieldName
        for (let departmentIndex = 0; departmentIndex < foreCastData.week_forecast_data.departments.length; departmentIndex++) {
            const foreCastDepartmentId = foreCastData.week_forecast_data.departments[departmentIndex].id
            const steerinformationDepartment = state.steerInformation.departments.find(item => item.department_id === foreCastDepartmentId)
            const departmentTotal = getFormattedNumber(foreCastData.week_forecast_data.departments[departmentIndex].weekly.value)
            // set department total value
            steerinformationDepartment.totals.turnover[fieldName] = departmentTotal
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const departmentDayValue = getFormattedNumber(foreCastData.week_forecast_data.departments[departmentIndex].days[dayIndex].value)
                // set department day value
                steerinformationDepartment.days[dayIndex].turnover[fieldName] = getFormattedNumber(departmentDayValue)
            }
        }
        this.commit('steerInformation/SET_TOTALS')
        this.commit('steerInformation/SUM_WAGE_COSTS')
    },
    SET_DATA_LOADED(state, value) {
        state.dataLoaded = value
    },
    SET_SEARCH_STRING(state, payload) {
        state.searchString = payload
    },
    SET_EXPORT_COLUMN(state, payload) {
        state.columnsToExport = payload
    },
}
export default mutations

const sumHour = (array, columnName, totalType) => {
    let sumResult = 0
    if (!array) return sumResult
    const columns = [
        { identifier: 'turnover', key: 'norm_actual' },
        { identifier: 'realized', key: 'planning_actual' },
        { identifier: 'expected', key: 'deviation' },
    ]
    const activeColumn = columns.find(c => c.identifier === columnName).key
    for (let departmentTypeIndex = 0; departmentTypeIndex < array.length; departmentTypeIndex++) {
        sumResult += array[departmentTypeIndex].totals[totalType][activeColumn]
    }

    return sumResult
}
const sumDepartmentByType = (array, type) => {
    let sumResult = 0
    if (!array) return sumResult
    for (let departmentTypeIndex = 0; departmentTypeIndex < array.length; departmentTypeIndex++) {
        sumResult += Number(array[departmentTypeIndex].totals.turnover[type])
    }
    return Number(sumResult)
}
