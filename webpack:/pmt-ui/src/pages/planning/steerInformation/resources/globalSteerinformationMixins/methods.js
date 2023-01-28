import { mapActions, mapMutations } from 'vuex'
import timeHelper from '@/libraries/timeHelper'

export default {
    methods: {
        ...mapActions('scheduling', ['getWeekStatus']),
        ...mapActions('account', ['setUserSettings', 'getUserSettings']),
        ...mapActions(['PRINT', 'EXPORT_EXCEL']),
        ...mapActions('steerInformation', [
            'initForeCast',
            'saveForeCast',
            'initExportData',
            'initWeekScope',
            'getSteerInformationIntersections',
        ]),
        ...mapMutations(['UPDATE_ENABLED_FILTERS']),
        ...mapMutations('steerInformation', [
            'SET_API_PARAM_HOURS',
            'SET_API_PARAM_COSTS',
            'SUM_HOURS',
            'SET_TOTALS',
            'SET_TOTALS_REALIZED',
            'RECALCULATE_REALIZED',
            'SET_CHANGE_TRIGGERED',
            'SET_FIELD_NAME',
            'SET_SEARCH_STRING',
            'SET_WEEK_STATUS',
            'SUM_WAGE_COSTS',
            'SET_TOTALS',
            'SET_TOTALS_REALIZED',
            'SYNC_FORE_CAST_DATA',
            'RECALCULATE_REALIZED',
            'SET_CHANGE_TRIGGERED',
            'SET_FIELD_NAME',
            'SET_INTERSECTIONS_LOADING',
        ]),
        ...mapMutations('account', ['UPDATE_USER_SETTINGS']),
        ...mapMutations(['SET_APP_ONLINE', 'UPDATE_PAGE_WIDTH', 'SET_APP_PRINTING']),
        async loadWeekStatus () {
            const payload = { week: this.selectedDate.yearWeekApiFilter(), latest_status: true }
            return this.getWeekStatus(payload)
        },
        changeRoute (params) {
            this.$router.replace({
                name: this.$router.history.current.name,
                params,
            }).catch(() => { })
        },
        async changeSelectedDate (date, full = true) {
            const { year, week } = date.weekYearObject()
            this.changeRoute({ year, week })
            if (full) {
                const weekState = await this.getWeekStatus({ date, latest_status: true })
                this.setWeekStatus(weekState, { year, week })
                return this.initPage()
            } else {
                await this.getWeekStatus({ date, latest_status: true })
                return this.initForeCast({ date, full })
            }
        },
        showMenu () {
            this.visibleMenu = true
        },
        setColorPositiveOrNegative (value1, value2, flipPosAndNeg = true) {
            const difference = value1 - value2
            return difference === 0 ? '-' : difference
        },
        formatTime (value, flipNegAndPos = false) {
            const isNegative = value < 0
            let val = value
            let prefix = value > 0 ? '+' : ''
            if (!flipNegAndPos) {
                prefix = value > 0 ? '' : '+'
            }
            if (isNegative) {
                prefix = '-'
                val = Math.abs(value)
            }
            return `${prefix}${timeHelper.floatToHoursAndMinutes(this.$moment.duration(val, 'hours'))}`
        },
        formatDeviation (value, flipNegAndPos = true) {
            if (isNaN(Number(value))) return value
            value = Number(value).toFixed(2)
            let prefix = value > 0 ? '+' : ''
            if (!flipNegAndPos) {
                prefix = value > 0 ? '' : '+'
            } return `${prefix}${this.$helpers.formatNumber(value)}`
        },
        formatNumber (value, noPrefix = true) {
            if (isNaN(Number(value))) return value
            value = Number(value).toFixed(2)
            if (noPrefix) return this.$helpers.formatNumber(value)
            let prefix = ''
            const isBiggerThenZero = Number(value) > 0
            if (isBiggerThenZero) {
                prefix = '+'
            }
            return `${prefix}${this.$helpers.formatNumber(value)}`
        },
        showPercentageForCosts (value, a, b) {
            if (!this.showPercentageColumn) return value
            if (a > 0 && b > 0) {
                const calculatedPercentage = ((100 * b) / a).toFixed(2)
                return `${value} (${calculatedPercentage}%)`
            } else {
                return value
            }
        },
        calculateDifference (value1, value2, flipNegAndPos = false, removePrefix = false) {
            const difference = value1 - value2
            const equalDifference = value1 === value2
            let prefix = difference < 0 ? '' : '+'
            let showPrefix = prefix
            if (flipNegAndPos) {
                prefix = difference > 0 ? '' : '+'
            }
            if (removePrefix) {
                showPrefix = ''
            }
            return equalDifference ? '-' : `${showPrefix}${this.$helpers.formatNumber(difference)}`
        },
        calculateDifferencePercentage (value1, value2) {
            const firstValue = value1
            const secondValue = value2
            const firstIsZero = value1 === 0
            const secondIsZeo = value2 === 0
            let difference = ((firstValue - secondValue) / secondValue) * 100
            if (!isFinite(difference) && firstIsZero && !secondIsZeo) {
                difference = -100
            }
            if (!isFinite(difference) && !firstIsZero && secondIsZeo) {
                difference = 100
            }
            if (firstIsZero && secondIsZeo) {
                difference = 0
            }
            return difference === 0 ? `${this.$helpers.formatNumber(difference)} %` : `${this.$helpers.formatNumber(difference)} %`
        },
        mobileTopbarItems () {
            return {
                filters: true,
                pastDaysSelector: true,
                search: false,
                groupingAndSorting: false,
                collapseAndExpand: false,
            }
        },
        isDepartmentCost (value) {
            if (value[0]) {
                return value[0].department_type === 'cost'
            }
            return false
        },
        isDepartmentExternal (value) {
            if (value[0]) {
                return value[0].department_type === 'external'
            }
            return false
        },
        isDepartmentTurnover (value) {
            if (value[0]) {
                return value[0].department_type === 'turnover'
            }
            return false
        },
        lastRow (value) {
            const lastDepartmentName = this.lastDepartmentTypeName
            const match = []
            if (lastDepartmentName === value[0].department_type) {
                match.push(true)
            }
            if (this.isDepartmentTurnover(value)) {
                match.push(true)
            }
            if (this.isDepartmentCost(value)) {
                match.push(true)
            }
            if (this.isDepartmentExternal(value)) {
                match.push(true)
            }
            return match.every(item => item === true) && match.length === 2
        },
        cannotEditDay (department, dayIndex) {
            if (!this.CAN_EDIT_TURNOVERS) return true
            if (!this.CAN_PROCESS_TURNOVER_API_DATA) return !this.daysDisabled[dayIndex]
            if (!this.daysDisabled[dayIndex] && !this.isDepartmentExternal(department)) return true
            if (!this.isDepartmentExternal(department)) return false
            if (!this.CAN_EDIT_EXTERNAL_TURNOVER) return true
            return !this.daysDisabled[dayIndex] && this.isDepartmentExternal(department)
        },
    },
}
