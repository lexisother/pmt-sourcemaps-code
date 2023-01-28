import { getFormattedNumber, groupBy } from '../../../libraries/steerInformationHelper'
import vuexHelper from '../../../libraries/vuexHelper'
import Vue from 'vue'
import language from '../../../config/language'
const getters = {
    FORECAST: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.forecastData, { year, week }) || {}
    },
    DEPARTMENT_TYPES: (state) => {
        return state.departmentTypes
    },
    STEER_INFORMATION: (state, getters, rootState) => {
        const steerInformation = state.steerInformation
        const departmentTypes = state.departmentTypes
        let groupedDepartments = []
        // filter on departments
        if (rootState.pageFilters.departments.length > 0) {
            groupedDepartments = steerInformation.departments.filter(item => rootState.pageFilters.departments.includes(item.department_id))
        }
        // conditions needs to be met to group
        if (!steerInformation.departments || !departmentTypes) return
        // use standard departments when no filter is used
        if (groupedDepartments.length === 0) groupedDepartments = state.steerInformation.departments
        groupedDepartments = groupBy(groupedDepartments.map(item => ({
            department_type: item.department_type,
            ...item,
        })), k => k.department_type)

        return {
            business_totals: steerInformation.business_totals,
            cost_totals: steerInformation.cost_totals,
            external_totals: steerInformation.external_totals,
            store_totals: steerInformation.store_totals,
            turnover_totals: steerInformation.turnover_totals,
            store_id: steerInformation.store_id,
            totals: steerInformation.totals,
            week: steerInformation.week,
            year: steerInformation.year,
            departments: groupedDepartments,
        }
    },
    EXPORT_DATA: (state) => {
        // todo: replace with more generic function
        const steerInformationDepartments = state.steerInformation.departments

        const turnoverExpected = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'turnover expected',
                weektotal: element.totals.turnover.expected.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.turnover.expected)
            })
            return result
        })

        const turnoverRealized = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'turnover realized',
                weektotal: element.totals.turnover.realized.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.turnover.realized)
            })
            return result
        })

        const turnoverBudget = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'turnover budget',
                weektotal: element.totals.turnover.budget.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.turnover.budget)
            })
            return result
        })

        const turnoverPlanned = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'turnover planned',
                weektotal: element.totals.turnover.planned.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.turnover.planned)
            })
            return result
        })

        const costsBudget = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'costs budget',
                weektotal: element.totals.costs.budget.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.costs.budget)
            })
            return result
        })

        const costsDeviation = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'costs deviation',
                weektotal: element.totals.costs.deviation.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.costs.deviation)
            })
            return result
        })

        const costsNormActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'costs norm_actual',
                weektotal: element.totals.costs.norm_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.costs.norm_actual)
            })
            return result
        })

        const costsPlanned = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'costs planned',
                weektotal: element.totals.costs.planned.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.costs.planned)
            })
            return result
        })

        const costsPlanningActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'costs planning_actual',
                weektotal: element.totals.costs.planning_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.costs.planning_actual)
            })
            return result
        })

        const hoursBudget = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'hours budget',
                weektotal: element.totals.hours.budget.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.hours.budget)
            })
            return result
        })

        const hoursDeviation = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'hours deviation',
                weektotal: element.totals.hours.deviation.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.hours.deviation)
            })
            return result
        })

        const hoursNormActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'hours norm_actual',
                weektotal: element.totals.hours.norm_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.hours.norm_actual)
            })
            return result
        })

        const hoursPlanned = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'hours planned',
                weektotal: element.totals.hours.planned.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.hours.planned)
            })
            return result
        })

        const hoursPlanningActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'hours planning_actual',
                weektotal: element.totals.hours.planning_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.hours.planning_actual)
            })
            return result
        })

        const productivityBudget = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'productivity budget',
                weektotal: element.totals.productivity.budget.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.productivity.budget)
            })
            return result
        })

        const productivityDeviation = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'productivity deviation',
                weektotal: element.totals.productivity.deviation.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.productivity.deviation)
            })
            return result
        })

        const productivityNormActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'productivity norm_actual',
                weektotal: element.totals.productivity.norm_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.productivity.norm_actual)
            })
            return result
        })

        const productivityPlanned = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'productivity planned',
                weektotal: element.totals.productivity.planned.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.productivity.planned)
            })
            return result
        })

        const productivityPlanningActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'productivity planning_actual',
                weektotal: element.totals.productivity.planning_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.productivity.planning_actual)
            })
            return result
        })

        const averageHourlyWageBudget = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'average_hourly_wage budget',
                weektotal: element.totals.average_hourly_wage.budget.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.average_hourly_wage.budget)
            })
            return result
        })

        const averageHourlyWageDeviation = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'average_hourly_wage deviation',
                weektotal: element.totals.average_hourly_wage.deviation.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.average_hourly_wage.deviation)
            })
            return result
        })

        const averageHourlyWageNormActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'average_hourly_wage norm_actual',
                weektotal: element.totals.average_hourly_wage.norm_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.average_hourly_wage.norm_actual)
            })
            return result
        })

        const averageHourlyWagePlanned = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'average_hourly_wage planned',
                weektotal: element.totals.average_hourly_wage.planned.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.average_hourly_wage.planned)
            })
            return result
        })

        const averageHourlyWagePlanningActual = steerInformationDepartments.map(element => {
            const result = {
                0: element.name,
                1: 'average_hourly_wage planning_actual',
                weektotal: element.totals.average_hourly_wage.planning_actual.toFixed(2),
            }
            element.days.forEach((d, i) => {
                result[i + 2] = getFormattedNumber(d.average_hourly_wage.planning_actual)
            })
            return result
        })

        const headers = [
            { text: 'Department' },
            { text: 'Type' },
            { text: 'Maandag' },
            { text: 'Dinsdag' },
            { text: 'Woensdag' },
            { text: 'Donderdag' },
            { text: 'Vrijdag' },
            { text: 'Zaterdag' },
            { text: 'Zondag' },
            { text: 'WeekTotal' },
        ]
        const itemArray = [
            ...turnoverExpected,
            ...turnoverRealized,
            ...turnoverPlanned,
            ...turnoverBudget,
            ...costsBudget,
            ...costsDeviation,
            ...costsNormActual,
            ...costsPlanned,
            ...costsPlanningActual,
            ...hoursBudget,
            ...hoursDeviation,
            ...hoursNormActual,
            ...hoursPlanned,
            ...hoursPlanningActual,
            ...productivityBudget,
            ...productivityDeviation,
            ...productivityNormActual,
            ...productivityPlanned,
            ...productivityPlanningActual,
            ...averageHourlyWageBudget,
            ...averageHourlyWageDeviation,
            ...averageHourlyWageNormActual,
            ...averageHourlyWagePlanned,
            ...averageHourlyWagePlanningActual,
        ].sort((a, b) => {
            a = a[0]
            b = b[0]
            return (a === b) ? 0 : (a < b) ? -1 : 1
        })
        const exportData = {
            items: itemArray,
            headers,
        }
        return exportData
    },
    GROUPED_STEER_INFORMATION_DEPARTMENTS: (state) => {
        const steerInformation = state.steerInformation
        const departmentTypes = state.departmentTypes
        if (!steerInformation.departments || !departmentTypes) return
        const result = groupBy(steerInformation.departments.map(item => ({
            department_type: item.department_type,
            ...item,
        })), k => k.department_type)
        return result
    },
    STEER_INFO_MERGED_DEPARTMENT_TYPES: (state) => {
        return state.departmentTypes
    },
    MAX_RELEASED_DATE: (state) => {
        return state.maxReleasedDate
    },
    DEPARTMENT_BASED_ON_ID: (state, getters, rootState, rootGetters) => (id) => {
        return rootGetters['departments/all'].find(item => item.department_id === id)
    },
    SELECTED_DATE: (state) => (route) => {
        const { week, year } = route.params
        return Vue.moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek')
    },
    STEER_INFORMATION_INTERSECTIONS: (state, getters, rootState, rootGetters) => (date) => {
        const { week, year } = Vue.moment(date).weekYearObject()
        return vuexHelper.getYearWeekStateData(state.steerInformationIntersections, { year, week }) || {}
    },
    EXPORT_INTERSECTIONS: (state, getters) => (date) => {
        const result = []
        const selectedColumns = state.columnsToExport
        const totals = getters.STEER_INFORMATION_INTERSECTIONS(date).totals
        selectedColumns.forEach(selectedColumn => {
            const getHeaders = function (reportName) {
                const headers = []
                totals.forEach(item => {
                    if (item.name === reportName) {
                        item.sections.forEach(elm =>
                            Object.assign(headers, Object.keys(elm).map(x => ({
                                text: language.t(`pages.steerInformationPage.intersections.${reportName.replace(/-./g, x => x[1].toUpperCase())}.${x}`), // the regex here camelCases the provided string
                            }))),
                        )
                    }
                },
                )
                return [...headers.filter(item => item.text !== 'name')]
            }

            const getSections = (reportName) => {
                const result = []
                totals.forEach(item => {
                    if (item.name === reportName) {
                        item.sections.forEach(elm =>
                            result.push(Object.values(elm)),
                        )
                    }
                },
                )
                return result
            }

            const getTotals = (reportName) => {
                const result = []
                totals.forEach(item => {
                    if (item.name === reportName && item.name !== 'total') {
                        const total = item.total
                        item.total.name = language.t('pages.steerInformationPage.intersections.total')
                        result.push(Object.values(total))
                    }
                },
                )
                return [...result.flat()]
            }

            const exportData = {
                items: [...getSections(selectedColumn), getTotals(selectedColumn)],
                headers: [...getHeaders(selectedColumn)],
                type: selectedColumn,
            }

            result.push(exportData)
        })
        return result
    },
}
export default getters
