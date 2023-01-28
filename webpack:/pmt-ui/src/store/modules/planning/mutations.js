import Vue from 'vue'
import * as moment from '../../../config/moment'
import vuexHelper from '../../../libraries/vuexHelper'
import stringHelper from '../../../libraries/stringHelper'
import schedulingHelper from '../../../libraries/schedulingHelper'
import timeHelper from '../../../libraries/timeHelper'
import PlanningShift from '../../../libraries/planningShift'
import PlanningEmployee from '../../../libraries/planningEmployee'
import shiftHelper from '../../../libraries/shiftHelper'
import language from '../../../config/language'
Vue.use(moment)

const mutations = {
    SET_EMPLOYEES(state, payload) {
        const { year, week } = payload.date.dayWeekYearObject()
        vuexHelper.setYearWeekData(state, 'employees', payload.result, year, week)
    },
    SET_YEAR_WEEK_DATA(state, payload) {
        const { year, week } = payload.date.dayWeekYearObject()
        vuexHelper.setYearWeekData(state, payload.prop, payload.result, year, week)
    },
    SET_STORE_GROUPS(state, { storeGroups, date }) {
        const { year, week } = date.dayWeekYearObject()
        vuexHelper.setYearWeekData(state, 'storeGroups', storeGroups, year, week)
    },
    SET_EXCHANGE_STORES(state, { exchangeStores, date }) {
        const { year, week } = date.dayWeekYearObject()
        vuexHelper.setYearWeekData(state, 'exchangeStores', exchangeStores, year, week)
        const groupedExchangeStores = stringHelper.groupBy(exchangeStores, 'store_id')
        vuexHelper.setYearWeekData(state, 'groupedExchangeStores', groupedExchangeStores, year, week)
    },

    async SET_WEEK_EMPLOYEE_SHIFTS(state, { date, result, currentStoreId, accountId }) {
        const storeData = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'storeData')
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        const employee = employees[accountId]
        if (employee) {
            const currentStoreId = this.getters['stores/currentStore'].id
            const isShiftReadOnly = (shift, date) => {
                if (storeData?.week_status?.status === 'closed') return true
                return this.getters['planning/IS_SHIFT_READ_ONLY'](shift, date)
            }
            const departments = this.getters['planning/DEPARTMENTS'](date)
            const exchangeStore = storeData.exchange_stores.find(s => s.store_id === (Number(employee.store_id) !== currentStoreId ? Number(employee.store_id) : -1))
            employee.shits = shiftHelper.mapShifts(result, date, currentStoreId, departments, isShiftReadOnly, exchangeStore)
        }
    },

    SET_EMPLOYEES_AVAILABILITIES(state, { date, availabilities }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        employees.forEach(employee => {
            employee.setAvailabilities(availabilities[employee.account_id] || [])
        })
    },

    SET_RDO_REQUESTS(state, { date, rdoRequests }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        const groupedRdoRequests = stringHelper.groupBy(rdoRequests, 'account_id')
        employees.forEach(employee => {
            employee.setRdos(groupedRdoRequests[employee.account_id])
        })
    },

    SET_SUBSTITUTE_REQUESTS(state, { date, substituteRequests }) {
        const mappedResult = substituteRequests.map(request => {
            return { ...request, ...durationinfy(request) }
        })
        const groupedSubstituteRequests = stringHelper.groupBy(mappedResult, 'requester_id')
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        const canManageSSR = this.getters['auth/CAN_MANAGE_SUBSTITUTE_REQUESTS']
        employees.forEach(employee => {
            employee.setSubstituteRequests(groupedSubstituteRequests[employee.account_id])
            employee.setReadOnlyShiftsForSubstituteRequests(canManageSSR)
        })
    },

    SET_EMPLOYEES_BUSINESS_TIMES(state, { date, businessTimes }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        const outOfBusinessTimes = rawOutOfBusinessTimes(date, businessTimes.store_availability)
        employees.forEach(employee => {
            employee.setOutOfBusinessTimes(outOfBusinessTimes)
        })
    },

    SET_EMPLOYEES_CONTRACTS(state, { date, contracts }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        const claSettings = this.getters['scheduling/CLA_SETTINGS']
        const wabWarnings = {}
        employees.forEach(employee => {
            const currentContractDateCheck = date.apiFormat()
            let currentContract = null
            const employeeContracts = contracts[employee.account_id] || []
            employeeContracts.forEach(c => {
                if (c.start_date < currentContractDateCheck) {
                    currentContract = c
                }
                employee.contracts.push(c)
            })
            if (currentContract) {
                employee.setContractAndTotals(currentContract, this.getters['scheduling/IS_STANDARD_SHIFTS'])
                employee.setClaDays(claSettings)
                wabWarnings[employee.account_id] = employee.getWabWarnings()
            }
        })
        const { year, week } = date.dayWeekYearObject()
        vuexHelper.setYearWeekData(state, 'employeesWabWarnings', wabWarnings, year, week)
    },

    SET_EMPLOYEE_DAY_REMARKS(state, { date, remarks, accountId }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        const employee = employees[accountId]
        if (employee) {
            employee.resetRemarks(remarks)
        }
    },

    SET_EMPLOYEES_WAGE_INFO(state, { date, wageInfo }) {
        const groupedWageInfo = {}
        wageInfo.forEach(wage => {
            groupedWageInfo[wage.account_id] = wage
        })
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        employees.forEach(employee => {
            const employeeWage = groupedWageInfo[employee.account_id] || {}
            employee.wageInfo = employeeWage
        })
    },

    SET_EMPLOYEE_BALANCES(state, { date, balances, accountId }) {
        const employee = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')[accountId]
        employee.setBalances(balances)
    },

    SET_EMPLOYEES_VALIDATION_OUTCOMES(state, { date, outcomes }) {
        outcomes = outcomes.map(o => mapClaRuleValidationStatus(o))
        const groupedOutcomes = stringHelper.groupBy(outcomes, 'account_id')
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        employees.forEach(employee => {
            const employeeValidations = groupedOutcomes[employee.account_id] || []
            employeeValidations.forEach(v => {
                employee.validations.push(v)
            })
            employee.validations = [...new Set(employee.validations)]
        })
    },

    UPDATE_CLA_VALIDATION_OUTCOMES(state, payload) {
        const validations = payload.additional_result.cla_validations
        const shift = payload.result
        const accountId = shift.account_id
        const date = Vue.moment(shift.start_datetime)
        const employee = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')[accountId]
        employee.setClaValidations(validations.map(mapClaRuleValidationStatus))
    },

    UPDATE_EMPLOYEE_VIRTUAL_INSTANCES(state, instances) {
        const accountId = instances[0].account_id
        const date = Vue.moment(instances[0].start_datetime)
        const employee = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')[accountId]
        instances.forEach(instanceResult => {
            const relatedShiftIndex = employee.shifts.findIndex(s => {
                const sameStart = s.start_datetime === instanceResult.start_datetime
                const sameEnd = s.start_datetime === instanceResult.start_datetime
                const sameDepartment = s.department_id = instanceResult.department_id
                return sameStart && sameEnd && sameDepartment
            })
            if (relatedShiftIndex > -1) {
                const updatedShift = {
                    ...employee.shifts[relatedShiftIndex],
                    ...instanceResult,
                    instances: [instanceResult],
                }
                employee.updateShift(updatedShift)
            }
        })
    },

    UPDATE_EMPLOYEE_INSTANCES(state, instances) {
        const accountId = instances[0].account_id
        const date = Vue.moment(instances[0].start_datetime)
        const employee = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')[accountId]
        instances.forEach(instanceResult => {
            const relatedShiftIndex = employee.shifts.findIndex(s => s.shift_instance_id === instanceResult.shift_instance_id)
            if (relatedShiftIndex > -1) {
                const updatedShift = {
                    ...employee.shifts[relatedShiftIndex],
                    ...instanceResult,
                }
                employee.updateShift(updatedShift)
            }
        })
    },

    SET_STANDARD_SHIFTS(state, { date, result, currentStoreId, accountId }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        const storeData = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'storeData')
        const firstSelectableDate = Vue.moment().startOf('isoWeek')
        const canManageStandardShedules = this.getters['auth/CAN_MANAGE_STANDARD_SCHEDULES']
        const canEditOtherShifts = this.getters['auth/canPlanOthers']
        const canEditOwnShifts = this.getters['auth/CAN_EDIT_OWN_PLANNING']
        const currentUser = this.getters['auth/user']
        const departments = storeData.departments
        let shiftKey = 0
        const shifts = result.filter(shift => {
            const sameStore = shift.store_id === currentStoreId
            const hasEmployee = !!employees[Number(shift.account_id)]
            // Standard shifts that have a last_occurrence in the current week
            // will not get deleted (in case of delete action), but will get a
            // last_occurrence update for the respective day of the current week.
            // This is why we exclude those that have a last_occurrence before today.
            const endsInThePast = Vue.moment(shift.last_occurrence).isBefore(firstSelectableDate, 'week')
            return sameStore && hasEmployee && !endsInThePast
        }).map((shift, index) => {
            shiftKey += 1
            const hasDepartmentAccess = this.getters['planning/APP_USER_HAS_DEPARTMENT'](shift.department_id, date)
            const isReadOnly = () => {
                const to = shift.last_occurrence ? Vue.moment(shift.last_occurrence) : null
                if (!canManageStandardShedules) return true
                // can edit own shifts
                if (shift.account_id === currentUser.account_id && !canEditOwnShifts) return true
                // can edit other employees shifts
                if (shift.account_id !== currentUser.account_id && !canEditOtherShifts && !hasDepartmentAccess) return true
                if (to && to.isBefore(firstSelectableDate, 'week')) return true
                // current user has access to the shift department
                return !shift.lentOut && !shift.nonProductive && !hasDepartmentAccess
            }
            shift.nonProductive = shift.type !== this.state.scheduling.shiftTypes.NORMAL && shift.type !== this.state.scheduling.shiftTypes.EXCHANGE
            shift.nonProductiveSimple = shift.nonProductive && shift.start_datetime === shift.end_datetime
            shift.lentOut = Boolean(shift.exchange_store_id)
            shift.readOnly = isReadOnly()
            shift.overlaps = schedulingHelper.newOverlapScenario()
            shift.year_week = `${Vue.moment(shift.start_datetime).isoWeekYear()}-${Vue.moment(shift.start_datetime).isoWeek()}`
            shift.key = shiftKey
            shift.guid = stringHelper.newIdShort()
            shift.indirect_hours = []
            return new PlanningShift(shift)
        })
        const shiftsGroupedByAccountId = stringHelper.groupBy(shifts, 'account_id')
        state.employeeStandardShiftsByAccountId = shiftsGroupedByAccountId
        const minDate = (employee) => {
            const employmentDate = employee.details.date_of_employment ? Vue.moment(employee.details.date_of_employment) : false
            if (employmentDate && firstSelectableDate.isBefore(employmentDate, 'week')) {
                return employmentDate
            }
            return firstSelectableDate
        }
        const lastShiftUpdate = {}
        Object.keys(shiftsGroupedByAccountId).forEach(accountId => {
            const employee = employees[Number(accountId)]
            const shiftsGroupedByFrequency = stringHelper.groupBy(shiftsGroupedByAccountId[accountId], 'frequency')
            Object.keys(shiftsGroupedByFrequency).forEach(frequency => {
                const shiftsGroupedByYearWeek = stringHelper.groupBy(shiftsGroupedByFrequency[frequency], 'year_week')
                shiftsGroupedByFrequency[frequency] = shiftsGroupedByYearWeek
                Object.keys(shiftsGroupedByYearWeek).forEach(yearWeek => {
                    const frequencyId = stringHelper.newIdShort()
                    const exchangeStore = storeData.exchange_stores.find(s => s.store_id === (Number(employee.store_id) !== currentStoreId ? Number(employee.store_id) : -1))
                    const shifts = shiftHelper.mapShifts(
                        shiftsGroupedByYearWeek[yearWeek],
                        date,
                        currentStoreId,
                        departments,
                        (shift) => { return shift.readOnly },
                        exchangeStore,
                        frequencyId,
                    )
                    shifts.forEach(s => {
                        if (s.last_modified.datetime) {
                            if (!lastShiftUpdate.datetime || lastShiftUpdate.datetime < s.last_modified.datetime) {
                                lastShiftUpdate.datetime = s.last_modified.datetime
                                lastShiftUpdate.account_id = s.last_modified.account_id
                            }
                        } else if (s.created.datetime) {
                            if (!lastShiftUpdate.datetime || lastShiftUpdate.datetime < s.created.datetime) {
                                lastShiftUpdate.datetime = s.created.datetime
                                lastShiftUpdate.account_id = s.created.account_id
                            }
                        }
                    })
                    const firstShift = shifts[0] || { start_datetime: Vue.moment().setTime('00:00').longApiFormat() }
                    const from = Vue.moment(firstShift.start_datetime)
                    let to = firstShift.last_occurrence ? Vue.moment(firstShift.last_occurrence) : null
                    if (!to && employee.details.date_of_unemployment) {
                        to = Vue.moment(employee.details.date_of_unemployment)
                    }
                    employee.frequencyRows.push({
                        frequency: Number(frequency),
                        from,
                        to,
                        shifts,
                        account_id: Number(accountId),
                        id: frequencyId,
                        toWeekYear: to ? to.weekYearObject() : {},
                        minDate: minDate(employee),
                    })
                })
            })
        })
        const seFrequencyRows = (employee) => {
            const newRow = {
                frequency: 1,
                from: minDate(employee),
                to: null,
                shifts: [],
                account_id: employee.account_id,
                id: stringHelper.newIdShort(),
                minDate: minDate(employee),
                isNew: true,
            }
            if (!employee.frequencyRows.length) {
                employee.frequencyRows.push(newRow)
            }
            if (employee.details.date_of_unemployment) {
                newRow.to = Vue.moment(employee.details.date_of_unemployment)
            }
            const pastFrequencyRows = employee.frequencyRows.filter(row => row.to && row.to.isBefore(row.mindDate, 'week')).length
            const currentFrequencyRows = employee.frequencyRows.filter(row => !row.to || (row.to && row.to.isAfterOrSameWeekAs(row.mindDate, 'week'))).length
            const hasOnlyPastRows = pastFrequencyRows > 0 && currentFrequencyRows === 0
            if (hasOnlyPastRows) {
                // insert a custom row anyway, because old rows are all hidden by default
                employee.frequencyRows.push(newRow)
            }
            employee.setPlannedMinutesStandard()
            employee.setPlannedMinutesNonProductiveStandard()
            employee.setMaxStandardShiftCount()
        }
        for (const [account_id, employee] of Object.entries(employees)) {
            if (account_id !== 'not_assigned' && accountId && accountId !== account_id) continue
            seFrequencyRows(employee)
        }
        state.lastModifiedStandardShift = lastShiftUpdate
    },

    SET_STANDARD_DAY_REMARKS(state, { standardRemarks, date, accountId }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        const canManageStandardRemarks = this.getters['auth/CAN_MANAGE_STANDARD_REMARKS']
        const firstSelectableDate = Vue.moment()
        const employeeRemarks = standardRemarks.filter(r => {
            const to = r.end_week && r.end_year ? Vue.moment().isoWeekYear(r.end_year).isoWeek(r.end_week).endOf('isoWeek') : null
            return !to || to.isAfterOrSameWeekAs(firstSelectableDate)
        }).map(remark => {
            remark.year_week = `${remark.start_week}-${remark.start_year}`
            remark.readOnly = !canManageStandardRemarks
            return remark
        })
        const employeeStandardRemarks = stringHelper.groupBy(employeeRemarks, 'account_id')
        Object.keys(employeeStandardRemarks).forEach(account_id => {
            const employee = employees[Number(account_id)]
            if (employee) {
                const remarksGroupedByFrequency = stringHelper.groupBy(employeeStandardRemarks[account_id], 'frequency')
                Object.keys(remarksGroupedByFrequency).forEach(frequency => {
                    const remarksGroupedByYearWeek = stringHelper.groupBy(remarksGroupedByFrequency[frequency], 'year_week')
                    remarksGroupedByFrequency[frequency] = remarksGroupedByYearWeek
                    Object.keys(remarksGroupedByYearWeek).forEach(yearWeek => {
                        const frequencyId = stringHelper.newIdShort()
                        const remark = remarksGroupedByYearWeek[yearWeek][0]
                        const weekDays = Vue.moment().toCalendarArray('week')
                        const dayRemarks = []
                        weekDays.forEach(day => {
                            const dayRemark = {
                                day_number: day.isoWeekday(),
                                remark: '',
                            }
                            const existing = remark.days.find(r => r.day_number === day.isoWeekday())
                            if (existing) {
                                dayRemark.remark = existing.remark
                                delete dayRemark.virtual
                            }
                            dayRemarks.push(dayRemark)
                        })
                        remark.frequencyId = frequencyId
                        remark.days = dayRemarks
                        let to = remark.end_week && remark.end_year ? Vue.moment().isoWeekYear(remark.end_year).isoWeek(remark.end_week).endOf('isoWeek') : null
                        if (!to && employee.details.date_of_unemployment) {
                            to = Vue.moment(employee.details.date_of_unemployment)
                        }
                        employee.frequencyRowsRemarks.push({
                            frequency: Number(frequency),
                            from: Vue.moment().isoWeekYear(remark.start_year).isoWeek(remark.start_week).startOf('isoWeek'),
                            to,
                            remark,
                            account_id: Number(account_id),
                            id: frequencyId,
                        })
                    })
                })
            }
        })
        const updateReadOnly = (employee) => {
            employee.frequencyRowsRemarks.forEach(row => {
                row.remark.readOnly = (row.to && row.to.isBefore(firstSelectableDate, 'week'))
                row.minDate = firstSelectableDate
            })
        }
        if (accountId) {
            const employee = employees[Number(accountId)]
            if (employee) {
                updateReadOnly(employee)
            }
        } else {
            Object.keys(employees).forEach(account_id => {
                const employee = employees[account_id]
                updateReadOnly(employee)
            })
        }
    },

    RESET_EMPLOYEES_DATA(state, date) {
        const { year, week } = date.dayWeekYearObject()
        vuexHelper.setYearWeekData(state, 'employees', [], year, week)
    },

    SET_DEPARTMENT_SHIFTS_READ_ONLY(state, { date, readOnly, department_ids }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        Object.keys(employees).forEach(accountId => {
            const employee = employees[accountId]
            employee.shifts.forEach(shift => {
                if (department_ids.includes(shift.department_id)) {
                    const originalReadOnly = this.getters['planning/IS_SHIFT_READ_ONLY'](shift, date, false)
                    if (shift.notAssigned) {
                        shift.readOnly = readOnly
                    } else if (!readOnly) {
                        // when receiving readOnly false,
                        // we only set the original read only for the shift,
                        // in order to not set readOnly = false, for shifts that should have readOnly = true
                        shift.readOnly = !shift.shift_instance_id || originalReadOnly
                    } else {
                        // else we set readOnly true for all department shifts
                        shift.readOnly = true
                    }
                }
            })
        })
    },

    SET_ALL_STRUCTURES_DEPARTMENTS(state, departments) {
        state.allStructuresDepartments = departments
    },

    SET_SHIFT_PLANNABLE_EMPLOYEES(state, accountIds) {
        state.shiftPlannableEmployees = accountIds
    },

    SET_SENT_SHIFT_INSTANCES(state, { result, departmentStatusHistoryId, date }) {
        const departments = this.getters['planning/DEPARTMENTS'](date)
        result = result.map((shift, i) => {
            const department = departments.find(d => d.department_id === shift.department_id)
            shift.lentOut = Boolean(shift.exchange_store_id)
            shift.nonProductive = shift.type !== this.state.scheduling.shiftTypes.NORMAL && shift.type !== this.state.scheduling.shiftTypes.EXCHANGE
            shift.nonProductiveSimple = shift.nonProductive && shift.start_datetime === shift.end_datetime
            shift.indirect_hours = []
            shift.readOnly = true
            shift.recurring = Boolean(shift.frequency)
            shift.key = i
            shift.guid = stringHelper.newIdShort()
            shift.instances = []
            shift.style = shiftHelper.shiftStyle(shift, department)
            return new PlanningShift(shift)
        })
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        const accountGroupedShifts = stringHelper.groupBy(result, 'account_id')
        // add sent shift instances to employees list
        Object.keys(employees).forEach(account_id => {
            const employee = employees[account_id]
            const sentShifts = accountGroupedShifts[account_id]
            if (sentShifts?.length) {
                employee.setSentDepartmentStatusHistoryShifts(sentShifts, departmentStatusHistoryId)
            }
        })
        Vue.set(state.fetchedDepartmentSentShiftHistory, state.fetchedDepartmentSentShiftHistory.length, departmentStatusHistoryId)
    },

    SET_SENT_REMARKS(state, { result, departmentStatusHistoryId, date }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        const accountGroupedRemarks = stringHelper.groupBy(result, 'account_id')
        Object.keys(employees).forEach(account_id => {
            const employee = employees[account_id]
            const sentRemarks = accountGroupedRemarks[account_id]
            if (sentRemarks?.length) {
                employee.setSentWeekRemarks(sentRemarks, departmentStatusHistoryId)
            }
        })
        Vue.set(state.fetchedDepartmentSentDayRemarksHistory, state.fetchedDepartmentSentDayRemarksHistory.length, departmentStatusHistoryId)
    },

    SET_CLA_VALIDATION_OUTCOMES(state, { date, outcomes }) {
        const { year, week } = date.dayWeekYearObject()
        const groupedOutcomes = stringHelper.groupBy(outcomes, 'account_id')
        vuexHelper.setYearWeekData(state, 'claValidationOutcomes', groupedOutcomes, year, week)
    },

    SET_CUSTOM_TIME_FROM_KEYBOARD(state, time) {
        state.customTimeFromKeyboard = time
    },

    SET_EMPLOYEES_WEEKSETS(state, { weeksets, date }) {
        // add the selected date weeksets to the employee to employees list
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'employees')
        employees.forEach(employee => {
            const employeeWeeksets = weeksets.filter(ws => ws.account_id === employee.account_id)
            employee.setWeeksets(employeeWeeksets)
        })
    },

    TOGGLE_SHOW_SEARCH(state, val) {
        if (typeof val !== 'undefined') {
            state.showSearch = val
        } else {
            state.showSearch = !state.showSearch
        }
    },

    SET_DAY_TOTALS_STEER_TYPE(state, type) {
        state.dayTotalsSteerType = type
    },

    STORE_COPIED_SHIFT(state, shift) {
        if (!shift) {
            state.copiedShift = null
            return
        }
        state.copiedShift = new PlanningShift(shift)
    },

    SET_HOVERED_DAY(state, payload) {
        state.hoveredDay = payload
    },

    SET_HOVERED_TIME(state, payload) {
        state.hoveredTime = payload
    },

    RESET(state) {
        state.employees = {}
        state.exchangeEmployees = {}
        state.employeeStandardShiftsByAccountId = {}
        state.shiftPlannableEmployees = []
        state.departments = {}
        state.allStructuresDepartments = []
        state.storeGroups = []
        state.exchangeStores = []
        state.groupedExchangeStores = {}
        state.showSentSchedules = false
        state.departmentStatusHistoryId = null
        state.sentShiftInstances = {}
        state.sentDayRemarks = {}
        state.claValidationOutcomes = {}
        state.customTimeFromKeyboard = ''
        state.showSearch = false
        state.dayTotalsSteerType = 'productive_hours'
        state.shiftCalculation = {}
        Object.keys(state.loading).forEach(key => {
            state.loading[key] = false
        })
        Object.keys(state.saving).forEach(key => {
            state.saving[key] = false
        })
    },

    async SET_SHIFT_CALCULATION(state, payload) {
        if (payload.error) return
        const { year, week, guid, account_id } = payload
        if (!vuexHelper.getYearWeekStateDataForAccount(state.shiftCalculation, { year, week, accountId: account_id })) {
            await vuexHelper.setYearWeekAccountIdData(state, 'shiftCalculation', {}, year, week, account_id)
        }
        Vue.set(state.shiftCalculation[year][week][account_id], guid, payload)
    },

    SET_SNACKBAR_ADDITIONAL_SETTING(state, setting) {
        state.additionalSnackbarSetting = setting
    },

    SET_MOBILE_PLANNING_SWIPE_DIRECTION(state, direction) {
        state.mobilePlanningSwipeDirection = direction
    },

    SET_EMPLOYEE_INDIRECT_HOURS(state, { date, tasks }) {
        tasks = tasks.map(t => {
            t.guid = stringHelper.newIdShort()
            return t
        })
        const { year, week } = date.dayWeekYearObject()
        vuexHelper.setYearWeekData(state, 'weekIndirectHours', stringHelper.groupBy(tasks, 'shift_instance_id'), year, week)
    },

    SET_CLOSE_WEEK_NOTIFICATIONS(state, { date, notifications }) {
        if (!notifications) return
        const { year, week } = date.dayWeekYearObject()
        const employeeGroupedNotifications = {}
        notifications.forEach(notification => {
            notification.account_ids.forEach(accountId => {
                if (!employeeGroupedNotifications[Number(accountId)]) {
                    employeeGroupedNotifications[Number(accountId)] = []
                }
                employeeGroupedNotifications[Number(accountId)].push(notification)
            })
        })
        vuexHelper.setYearWeekData(state, 'closeWeekNotifications', notifications, year, week)
        vuexHelper.setYearWeekData(state, 'closeWeekEmployeesNotifications', employeeGroupedNotifications, year, week)
    },

    TOGGLE_WEEK_CLOSE_NOTIFICATION_SNACKBAR(state, value) {
        if (typeof value === 'boolean') {
            state.weekCloseNotificationSnackbar = value
        } else {
            state.weekCloseNotificationSnackbar = !state.weekCloseNotificationSnackbar
        }
    },

    UPDATE_PLANNING_DATA(state, payload) {
        const { year, week } = payload.date.dayWeekYearObject()
        const existingPlanningData = vuexHelper.getYearWeekStateData(state.planningData, { year, week })
        if (existingPlanningData && payload.result) {
            payload.result.forEach(employeeData => {
                Vue.set(
                    state.planningData[year][week],
                    employeeData.account_id,
                    new PlanningEmployee({ ...existingPlanningData[employeeData.account_id], ...employeeData }),
                )
            })
            console.log(state.planningData)
        }
    },

    async SET_PLANNING_DATA(state, payload) {
        let contracts = []
        const currentStoreId = this.getters['stores/currentStore'].id
        const { year, week } = payload.date.weekYearObject()
        const planningDataResult = {}
        const isShiftReadOnly = (shift, date) => {
            if (payload.storeData?.week_status?.status === 'closed') return true
            return this.getters['planning/IS_SHIFT_READ_ONLY'](shift, date)
        }
        const departments = payload.storeData.departments
        const currentUser = this.getters['auth/user']
        const canEditOwnShifts = this.getters['auth/CAN_EDIT_OWN_PLANNING']
        const emptyEmployee = {
            account_id: 'not_assigned',
            account_name: language.t('pages.scheduling.resources.unassigned'),
            notAssigned: true,
            store_id: currentStoreId,
            details: {},
            contracts: [],
            competences: [],
            balances: [],
            wab_counters: {},
            day_remarks: [],
            cla_validation_outcomes: [],
            selectedDate: payload.date,
        }
        const storeAvailability = payload.storeData.store_times.store_availability
        const exchangeStore = (storeId) => {
            const isDifferentStore = Number(storeId) !== currentStoreId
            return payload.storeData.exchange_stores.find(s => {
                return s.store_id === (isDifferentStore ? Number(storeId) : -1)
            })
        }
        for (const data of payload.planningData) {
            if (!planningDataResult[data.account_id]) {
                if (!data.account_id) {
                    data.account_id = 'not_assigned'
                    data.account_name = language.t('pages.scheduling.resources.unassigned')
                    data.notAssigned = true
                }
                const employeeData = payload.employeeData.find(e => e.account_id === data.account_id) || emptyEmployee
                if (!employeeData.store_id) continue
                const employeeExchangeStore = exchangeStore(employeeData.store_id)
                data.shifts = shiftHelper.mapShifts(
                    data.shifts,
                    payload.date,
                    currentStoreId,
                    departments,
                    isShiftReadOnly,
                    employeeExchangeStore,
                )
                const sameAsCurrentUser = canEditOwnShifts && employeeData.account_id === currentUser.accountId
                const readOnly = !sameAsCurrentUser && !data.notAssigned && !employeeData.details.planning_labor_access
                planningDataResult[data.account_id] = new PlanningEmployee({
                    ...data,
                    ...employeeData,
                    selectedDate: payload.date,
                    storeAvailability,
                    exchangeStore: employeeExchangeStore,
                    allDepartments: departments,
                    readOnly,
                })
                contracts = contracts.concat(planningDataResult[data.account_id].contracts)
            }
        }
        if (!planningDataResult.not_assigned) {
            emptyEmployee.shifts = []
            emptyEmployee.details = {}
            emptyEmployee.requests = {}
            emptyEmployee.storeAvailability = storeAvailability
            planningDataResult.not_assigned = new PlanningEmployee({
                ...emptyEmployee,
                storeAvailability,
                allDepartments: departments,
                departments,
            })
        }
        vuexHelper.setYearWeekData(state, 'planningData', planningDataResult, year, week)
        this.commit('contracts/setEmployeeContracts', { contracts }, { root: true })
    },

    SET_SHIFT_SURCHARGES(state, { date, surcharges }) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](date, 'planningData')
        for (const [account_id, employee] of Object.entries(employees)) {
            const employeeSurcharges = surcharges.filter(s => s.account_id === Number(account_id)).map(s => {
                s.guid = stringHelper.newIdShort()
                return s
            })
            employee.surcharges = employeeSurcharges
        }
    },

    SET_EMPLOYEE_DEPARTMENTS(state, { result, payload }) {
        vuexHelper.setYearWeekAccountIdData(state, 'employeeDepartments', result[0].departments, payload.year, payload.week, payload.account_id)
    },

    SET_SHIFT_BREAKS_SUGGESTIONS(state, suggestions) {
        state.shiftBreakSuggestions = suggestions
    },

    SET_STANDARD_SHIFT_EMPLOYEE(state, employee) {
        state.standardShiftEmployee = employee
    },

    SET_LAST_MODIFIED_STANDARD_SHIFT(state, result) {
        if (!result) {
            const currentAccountId = this.getters['auth/user'].accountId
            state.lastModifiedStandardShift = {
                datetime: Vue.moment().format('YYYY-MM-DD HH:mm:ss'),
                account_id: currentAccountId,
            }
            return
        }
        state.lastModifiedStandardShift = result
    },

    RESET_LAST_MODIFIED_STANDARD_SHIFT(state) {
        const employees = this.getters['planning/GET_YEAR_WEEK_DATA'](Vue.moment(), 'employees')
        const lastShiftUpdate = {}
        employees.forEach(employee => {
            employee.frequencyRows.forEach(frequencyRow => {
                frequencyRow.shifts.forEach(shift => {
                    if (shift.last_modified.datetime) {
                        if (!lastShiftUpdate.datetime || lastShiftUpdate.datetime < shift.last_modified.datetime) {
                            lastShiftUpdate.datetime = shift.last_modified.datetime
                            lastShiftUpdate.account_id = shift.last_modified.account_id
                        }
                    } else if (shift.created.datetime) {
                        if (!lastShiftUpdate.datetime || lastShiftUpdate.datetime < shift.created.datetime) {
                            lastShiftUpdate.datetime = shift.created.datetime
                            lastShiftUpdate.account_id = shift.created.account_id
                        }
                    }
                })
            })
        })
        state.lastModifiedStandardShift = lastShiftUpdate
    },

    /**
     * Sets current employee departments.
     * If the employee is an organizational user we set all departments.
     * @returns {Array}
     */
    SET_CURRENT_EMPLOYEE_DEPARTMENTS(state, { date, departments }) {
        const HAS_ALL_DEPARTMENTS_ACCESS = this.getters['auth/HAS_ALL_DEPARTMENTS_ACCESS']
        const isOrganisationalUser = this.getters['auth/isOrganisationalUser']
        const { year, week } = date.weekYearObject()
        if (isOrganisationalUser || HAS_ALL_DEPARTMENTS_ACCESS) {
            vuexHelper.setYearWeekData(state, 'currentWeekEmployeeDepartments', departments, year, week)
            return
        }
        const planningData = this.getters['planning/WEEK_PLANNING_DATA'](date)
        const user = this.getters['auth/user']
        const currentWeekEmployee = planningData[user.accountId]
        if (currentWeekEmployee) {
            const currentWeekEmployeeDepartmentIds = currentWeekEmployee.departments.map(d => d.department_id)
            // current user employee departments in the selected week
            const currentWeekEmployeeDepartments = departments.filter(d => currentWeekEmployeeDepartmentIds.includes(d.department_id))
            const currentEmployee = this.CURRENT_EMPLOYEE
            if (currentEmployee && date.isBefore(this.$moment(), 'week')) {
                // for historic weeks push all the departments that
                // the current user has access to now (currentEmployee.departments)
                // and that are missing from the current selected week departments (currentWeekEmployeeDepartments)
                currentEmployee.departments.forEach(d => {
                    // check if department is already in the week departments
                    const existingWeekDepartment = currentWeekEmployeeDepartments.find(dep => dep.department_id === d.department_id)
                    if (!existingWeekDepartment) {
                        // if the department is not already in the selected week departments
                        // push department to current week departments
                        currentWeekEmployeeDepartments.push(d)
                    }
                })
            }
            const deps = currentWeekEmployeeDepartments.sort(compare)
            vuexHelper.setYearWeekData(state, 'currentWeekEmployeeDepartments', deps, year, week)
        }
    },
}

function durationinfy(request) {
    request.time_from = Vue.moment(request.schedule_time_from).format('HH:mm')
    request.time_to = Vue.moment(request.schedule_time_to).format('HH:mm')
    request.duration = timeHelper.duration(request.schedule_time_from, request.schedule_time_to)
    return request
}

/**
 * Returns an array of store out of business times
 * @param {moment} date
 * @param {object} storeAvailability
 * @returns [String]
 */
function rawOutOfBusinessTimes(date, storeAvailability) {
    const result = []
    date.toCalendarArray('week').forEach(day => {
        const dayBusinessTimes = storeAvailability[day.isoWeekday() - 1]
        if (dayBusinessTimes.business_from_time !== '00:00') {
            const from = day.startOf('day')
            const to = from.clone().setTime(dayBusinessTimes.business_from_time).subtract(15, 'minutes')
            Vue.moment()
                .momentTimeRange(from, to, 15, 'minutes', 'YYYY-MM-DD HH:mm')
                .forEach(time => { result.push(time) })
        }
        if (dayBusinessTimes.business_to_time !== '00:00') {
            const from = day.clone().setTime(dayBusinessTimes.business_to_time).add(15, 'minutes')
            const to = day.endOf('day')
            Vue.moment()
                .momentTimeRange(from, to, 15, 'minutes', 'YYYY-MM-DD HH:mm')
                .forEach(time => { result.push(time) })
        }
    })
    return result
}

function mapClaRuleValidationStatus(rule) {
    rule.error = rule.cla_rule_validation_status === 'obly'
    rule.warn = rule.cla_rule_validation_status === 'warn'
    rule.info = rule.cla_rule_validation_status !== 'obly' && rule.cla_rule_validation_status !== 'warn'
    return rule
}

function compare() {
    return (a, b) => {
        if (a > b) {
            return 1
        } else if (a < b) {
            return -1
        }
        return 0
    }
}

export default mutations
