import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    mixins: [mixins],
    computed: {
        /**
         * Raw productive_hours from the api response
         * @param {any} date when a date filter needs to be applied
         * @returns Object
         */
        productiveHours () {
            return (date, departmentId) => {
                const typeInfo = this.departmentSteerTypeInfo('hours', date, departmentId)
                return {
                    title: this.baseTranslate('steerInformation.data.productive_hours'),
                    ...this.calculatedInfo(typeInfo, 'productive_hours'),
                }
            }
        },
        /**
         * Raw productive_costs from the api response
         * @param {any} date when a date filter needs to be applied
         * @returns Object
         */
        productiveCosts () {
            return (date, departmentId) => {
                const typeInfo = this.departmentSteerTypeInfo('costs', date, departmentId)
                return {
                    title: this.baseTranslate('steerInformation.data.productive_costs'),
                    ...this.calculatedInfo(typeInfo, 'productive_costs'),
                }
            }
        },
        /**
         * Calculated Average Hourly Wage.
         * The average_hourly_wage in the api response
         * is not taken into account.
         * costs / hours
         * @param {any} date when a date filter needs to be applied
         * @returns Object
         */
        averageHourlyWage () {
            return (date, departmentId) => {
                const typeInfo = {
                    norm_actual: this.productiveCosts(date, departmentId).norm_actual / this.productiveHours(date, departmentId).norm_actual,
                    planning_actual: this.productiveCosts(date, departmentId).planning_actual / this.productiveHours(date, departmentId).planning_actual,
                }
                return {
                    title: this.baseTranslate('steerInformation.data.average_hourly_wage', date),
                    ...this.calculatedInfo(typeInfo, 'average_hourly_wage'),
                }
            }
        },
        /**
         * Calculated Productivity.
         * The productivity in the api response
         * is not taken into account.
         * CALCULATION:
         * norm_actual: realized turnover / norm_actual productive hours
         * planning_actual: realized turnover / planning_actual productive hours
         * @param {any} date when a date filter needs to be applied
         * @returns Object
         */
        productivity () {
            return (date, departmentId) => {
                const typeInfo = {
                    norm_actual: this.turnover(date, departmentId).realized / this.productiveHours(date, departmentId).norm_actual,
                    planning_actual: this.turnover(date, departmentId).realized / this.productiveHours(date, departmentId).planning_actual,
                }
                return {
                    title: this.baseTranslate('steerInformation.data.productivity'),
                    ...this.calculatedInfo(typeInfo, 'productivity'),
                }
            }
        },
        /**
         * Returns the departments for which to display the steer information
         * @returns {Array} Array
         */
        steerInfoDepartments () {
            if (this.filters.departments.length) return this.filters.departments
            return this.currentEmployeeDepartments.map(d => d.department_id)
        },
        hasCostDepartmentsSelected () {
            if (!this.steerInfo) return false
            if (!this.filters.departments.length) {
                return this.steerInfo.departments.some(d => {
                    return this.steerInfoDepartments.includes(d.department_id) && d.department_type === 'cost'
                })
            }
            return this.steerInfo.departments.some(d => {
                return this.steerInfoDepartments.includes(d.department_id) && d.department_type === 'cost'
            })
        },
        hasOnlyOneCostDepartmentSelected () {
            if (!this.steerInfo) return false
            if (this.steerInfoDepartments.length === 1) {
                return Boolean(this.steerInfo.departments.find(d => {
                    return d.department_id === this.steerInfoDepartments[0] && d.department_type === 'cost'
                }))
            }
            return false
        },
        hasOnlyNonCostDepartmentsSelected () {
            if (!this.steerInfo) return false
            const mappedDepartments = this.steerInfoDepartments.map(d => {
                return this.steerInfo.departments.find(sd => {
                    return sd.department_id === d
                })
            })
            // eslint-disable-next-line camelcase
            return mappedDepartments.every(d => d?.department_type !== 'cost')
        },
        hasAllDepartmentsSelected () {
            return !this.filters.departments.length
        },
        /**
         * Returns formatted Steer information distinct objects
         * @param {Object|undefined} date when a date filter needs to be applied
         * @returns {Object}
         * { productive_hours: Object, productive_costs: Object, average_hourly_wage: Object, productivity: Object }
         */
        steerColumns () {
            return (date, departmentId) => {
                const columns = {}
                columns.productive_hours = this.formatSteerGroupInfo(this.productiveHours(date, departmentId), 'productive_hours')
                if (this.CAN_READ_COSTS) {
                    columns.productive_costs = this.formatSteerGroupInfo(this.productiveCosts(date, departmentId))
                }
                columns.average_hourly_wage = this.formatSteerGroupInfo(this.averageHourlyWage(date, departmentId))
                if (this.hasOnlyOneCostDepartmentSelected || this.hasOnlyNonCostDepartmentsSelected || this.hasAllDepartmentsSelected) {
                    columns.productivity = this.formatSteerGroupInfo(this.productivity(date, departmentId))
                }
                return columns
            }
        },
        /**
         * Rteurns turnover raw values
         * @param {Object|undefined} date when a date filter needs to be applied
         * @returns {Object} Object
         */
        turnover () {
            return (date, departmentId) => {
                if (this.hasAllDepartmentsSelected && !departmentId) {
                    let dataSource
                    if (date) {
                        dataSource = this.steerInfo.business_totals?.days.find(d => d.day === date.isoWeekday()).turnover
                    } else {
                        // eslint-disable-next-line camelcase
                        dataSource = this.steerInfo?.business_totals?.totals?.turnover
                    }
                    return {
                        expected: dataSource?.expected,
                        realized: dataSource?.realized,
                        kind: 'turnover',
                    }
                }
                const typeInfo = this.departmentSteerTypeInfo('turnover', date, departmentId)
                return {
                    expected: typeInfo.expected,
                    realized: typeInfo.realized,
                    kind: 'turnover',
                }
            }
        },
        /**
         * Formats the turnover values
         * @param {Object|undefined} date when a date filter needs to be applied
         * @returns {Object}
         */
        formattedTurnover () {
            return date => {
                return this.formatSteerGroupInfo(this.turnover(date), 'turnover')
            }
        },
    },
    methods: {
        /**
         * Returns calculated total sums for productive_hours, productive_costs or turnover
         * @param {String} type productive_hours, productive_costs or turnover
         * @param {Object} date the day to look for steer info
        * If the date is undefined and:
        *  - inside day view, the SELECTED_DATE will be used to find in the days array
        *  - inside week view or the steer info is expanded, the totals object will be used to sum up values.
         * @returns {Object} Object
         */
        departmentSteerTypeInfo (type, date, departmentId) {
            const departmentInfo = this.steerInfo.departments.filter(d => {
                if (departmentId) {
                    return d.department_id === departmentId
                } else {
                    return this.steerInfoDepartments.includes(Number(d.department_id))
                }
            })
            const result = type !== 'turnover'
                ? {
                    norm_actual: 0,
                    planning_actual: 0,
                }
                : {
                    expected: 0,
                    realized: 0,
                }
            departmentInfo.forEach(department => {
                let sourceDate = date
                if (!sourceDate) {
                    sourceDate = this.$route.params.day && !this.settings.steerInformationExtended ? this.SELECTED_DATE : undefined
                }
                let departmentDataSource
                if (sourceDate) {
                    if (!departmentId && this.hasAllDepartmentsSelected) {
                        departmentDataSource = this.steerInfo.business_totals.days.find(d => d.day === sourceDate.isoWeekday())
                    } else {
                        departmentDataSource = department.days.find(d => d.day === sourceDate.isoWeekday())
                    }
                } else {
                    if (!departmentId && this.hasAllDepartmentsSelected) {
                        departmentDataSource = this.steerInfo.business_totals.totals
                    } else {
                        departmentDataSource = department.totals
                    }
                }
                // turnover and productivity is shown only when:
                //      - all selected departments are turnover or external
                //      - only one department is selected and it is a cost department
                if (type === 'turnover') {
                    if (this.hasAllDepartmentsSelected || this.hasOnlyOneCostDepartmentSelected || department.department_type !== 'cost') {
                        if (this.hasAllDepartmentsSelected) {
                            result.expected = Number(departmentDataSource.turnover.expected)
                            result.realized = Number(departmentDataSource.turnover.realized)
                        } else {
                            result.expected += Number(departmentDataSource.turnover.expected)
                            result.realized += Number(departmentDataSource.turnover.realized)
                        }
                    }
                } else if (type === 'productivity') {
                    if (this.hasOnlyOneCostDepartmentSelected || department.department_type !== 'cost') {
                        if (this.hasOnlyOneCostDepartmentSelected || department.department_type !== 'cost') {
                            if (this.hasAllDepartmentsSelected) {
                                result.norm_actual = Number(departmentDataSource[type].norm_actual)
                                result.planning_actual = Number(departmentDataSource[type].planning_actual)
                            } else {
                                result.norm_actual += Number(departmentDataSource[type].norm_actual)
                                result.planning_actual += Number(departmentDataSource[type].planning_actual)
                            }
                        }
                    }
                } else {
                    if (type === 'productive_hours') {
                        type = 'hours'
                    }
                    if (type === 'productive_costs') {
                        type = 'costs'
                    }
                    if (this.hasAllDepartmentsSelected) {
                        result.norm_actual = Number(departmentDataSource[type].norm_actual)
                        result.planning_actual = Number(departmentDataSource[type].planning_actual)
                    } else {
                        result.norm_actual += Number(departmentDataSource[type].norm_actual)
                        result.planning_actual += Number(departmentDataSource[type].planning_actual)
                    }
                }
            })
            return result
        },
        daySteerTypeInfo (type, date) {
            const departmentInfo = this.steerInfo.departments.filter(d => {
                return this.steerInfoDepartments.includes(Number(d.department_id))
            })
            const departmentResults = []
            const totals = {
                deviation: 0,
                deviationError: false,
                kind: type,
                norm_actual: 0,
                planning_actual: 0,
            }
            departmentInfo.forEach(department => {
                const calculated = this.calculatedInfo(this.departmentSteerTypeInfo(type, date, department.department_id), type)
                departmentResults.push(calculated)
            })
            departmentResults.forEach(result => {
                Object.keys(result).forEach(key => {
                    if (key !== 'kind' && key !== 'deviationError') {
                        totals[key] += result[key]
                    }
                    totals.deviationError = (totals.planning_actual - totals.norm_actual) > 0
                })
                totals.kind = result.kind
            })
            return this.formatSteerGroupInfo(totals, totals.kind)
        },
        /**
         * Returns a formatted steer info object
         *  - as formatted hours in case of productive_hours
         *  - as formatted currency number for everything else
         * @param {Object} info
         * @param {String} kind
         * @returns {Object}
         */
        formatSteerGroupInfo (info, kind) {
            const infoCopy = { ...info }
            if (kind === 'turnover') {
                infoCopy.realized = this.$helpers.formatCurrency(infoCopy.realized)
                infoCopy.expected = this.$helpers.formatCurrency(infoCopy.expected)
                return infoCopy
            } else {
                const isHours = kind === 'productive_hours'
                const time = (hours) => {
                    let negative = false
                    if (hours < 0) {
                        negative = true
                    }
                    return `${negative ? '- ' : ''}${this.$moment.duration({ hours: Math.abs(hours) }).format('HH:mm')}`
                }
                infoCopy.planning_actual = isHours ? time(infoCopy.planning_actual) : this.$helpers.formatCurrency(infoCopy.planning_actual)
                infoCopy.norm_actual = isHours ? time(infoCopy.norm_actual) : this.$helpers.formatCurrency(infoCopy.norm_actual)
                infoCopy.deviation = isHours ? time(infoCopy.deviation) : this.$helpers.formatCurrency(infoCopy.deviation)
                return infoCopy
            }
        },
        /**
         * Calculated steer info object.
         * Deviation and DeviationError are returned as calculated values.
         * @param {Object} info
         * @param {String} kind
         * @returns {Object}
         */
        calculatedInfo (info, kind) {
            const planned = isNaN(info.planning_actual) || !isFinite(info.planning_actual) ? 0 : info.planning_actual
            const norm = isNaN(info.norm_actual) || !isFinite(info.norm_actual) ? 0 : info.norm_actual
            return {
                norm_actual: norm,
                planning_actual: planned,
                deviation: planned - norm,
                deviationError: (planned - norm) > 0,
                kind,
            }
        },
        /**
         * Classes will be added based on the deviationError value
         * In general a positive item for deviationError means that it is bad but for some there can be an exception
         * Exceptions: productivity
         * @param {Object} item
         * @returns {Object}
         */
        valueClasses (item) {
            return {
                'value-error': item.kind !== 'productivity' ? item.deviationError : !item.deviationError,
                plus: item.deviationError,
            }
        },
    },
}
