/* eslint-disable camelcase */
import Vue from 'vue'
import * as moment from '../config/moment'
import schedulingHelper from './schedulingHelper'
import globalSettings from '../config/global-settings'
import Employee from './Employee'
import EmployeeContract from './EmployeeContract'
Vue.use(moment)
class PlanningEmployee extends Employee {
    weekRemarks = []
    shifts = []
    _departmentHistorySentShifts = {}
    _departmentHistorySentRemarks = {}
    _laborCost = '--'
    _surcharges = []
    weeksets = []
    wabCounter = {}
    departments_sort_on = ''
    competences_sort_on = ''
    maxDayShiftCount = 0
    maxNonPlannableCount = 0
    frequencyRows = []
    frequencyRowsRemarks = []
    outOfBusinessTimes = []
    selectedDate = Vue.moment()
    exchangeStore = null
    lentIn = false
    lentOut = false
    _validations = []
    _showDailyValidations = {}
    _dayValidations = {}
    claDays = 0
    showExtra = {
        availability: false,
        remarks: false,
        standardShifts: false,
    }

    isChecked = false
    corrections = {}
    _requests = {}

    constructor(payload) {
        super(payload) // Inherits Employee
        this.departments_sort_on = this.departments.length
        this.competences_sort_on = this.competences?.length || 0
        this.selectedDate = payload.selectedDate || Vue.moment()
        if (payload.exchangeStore && Object.keys(payload.exchangeStore).length) {
            const department = payload.exchangeStore.departments.find(d => d.department_id === this.department_id)
            this.allDepartments = payload.exchangeStore.departments || payload.departments
            this.departments = department ? [department] : []
            this.exchangeStore = payload.exchangeStore
            this.role_priority = 100
            this.lentIn = true
        } else {
            this.allDepartments = payload.allDepartments || payload.departments
        }
        if (payload.notAssigned || payload.account_id === 'not_assigned') {
            this.role_priority = 100
        }
        this.requests = payload.requests
        this.storeAvailability = payload.storeAvailability
        this.setWabCounter(payload.wab_counters)
        this.setBalances(payload.balances)
        this.weeksBeforeContractEnd = payload.weeksBeforeContractEnd
        this.shifts = payload.shifts || []
        if (payload.details.labor_cost !== null && payload.details.labor_cost !== undefined) {
            this.laborCost = globalSettings.helpers.formatCurrency(parseFloat(payload.details.labor_cost || 0)?.toFixed(2) || 0)
        } else {
            this.laborCost = '--:--'
        }
        let currentContract = null
        this.contracts = payload.contracts
        this.contracts.forEach(c => {
            if (c.start_date < this.selectedDate.apiFormat()) {
                currentContract = c
            }
        })
        if (currentContract) {
            this.contract = new EmployeeContract(currentContract)
            this.setContractAndTotals()
        }
        if (this.lentIn) {
            this.setContractAndTotals()
        }
        this.setMaxShiftCount()
        this.setNonPlannableMoments()
        this.setAllNonPlannableMoments()
        this.wabWarnings = Vue.moment().daysRangeObject(payload.days_for_historical_schedules || 0)
    }

    get wab_counters() {
        return this._wab_counters
    }

    set wab_counters(val) {
        this._wab_counters = val
    }

    get wab_sort_on() {
        return this._wab_sort_on
    }

    set wab_sort_on(val) {
        this._wab_sort_on = val
    }

    get weeksBeforeContractEnd() {
        return this._weeksBeforeContractEnd
    }

    set weeksBeforeContractEnd(val) {
        this._weeksBeforeContractEnd = val
    }

    get laborCost() {
        return this._laborCost
    }

    set laborCost(val) {
        this._laborCost = val
    }

    get rdoRequests() {
        return this.requests.request_time_off
    }

    get availabilities() {
        return this.requests.availabilities?.data || []
    }

    get substituteRequests() {
        return this.requests.approved_substitute_requests
    }

    get requests() {
        return this._requests
    }

    set requests(newVal) {
        this._requests = newVal
    }

    get plannedMinutes() {
        return this._plannedMinutes
    }

    set plannedMinutes(val) {
        this._plannedMinutes = val
    }

    get plannedMinutesNonProductive() {
        return this._plannedMinutesNonProductive
    }

    set plannedMinutesNonProductive(val) {
        this._plannedMinutesNonProductive = val
    }

    get plannedMinutesSentShifts() {
        return this._plannedMinutesSentShifts
    }

    set plannedMinutesSentShifts(val) {
        this._plannedMinutesSentShifts = val
    }

    get plannedMinutesNonProductiveSentShifts() {
        return this._plannedMinutesSentShiftsNonProductive
    }

    set plannedMinutesNonProductiveSentShifts(val) {
        this._plannedMinutesSentShiftsNonProductive = val
    }

    get plannedHours() {
        return this._plannedHours
    }

    set plannedHours(val) {
        this._plannedHours = val
    }

    get plannedHoursSentShifts() {
        return this._plannedHoursSentShifts
    }

    set plannedHoursSentShifts(val) {
        this._plannedHoursSentShifts = val
    }

    get contract() {
        return this._contract
    }

    set contract(val) {
        this._contract = val
    }

    get negativeDeviation() {
        return this._negativeDeviation
    }

    set negativeDeviation(val) {
        this._negativeDeviation = val
    }

    get negativeDeviationSentShifts() {
        return this._negativeDeviationSentShifts
    }

    set negativeDeviationSentShifts(val) {
        this._negativeDeviationSentShifts = val
    }

    get deviation() {
        return this._deviation
    }

    set deviation(val) {
        this._deviation = val
            ? `${this.negativeDeviation ? '-' : '+'}${val.format('HH:mm')}`
            : '00:00'
    }

    get deviationSentShifts() {
        return this._deviationSentShifts
    }

    set deviationSentShifts(val) {
        this._deviationSentShifts = val
            ? `${this.negativeDeviationSentShifts ? '-' : '+'}${val.format('HH:mm')}`
            : '00:00'
    }

    get totalPlannedHours() {
        return this._totalPlannedHours
    }

    set totalPlannedHours(val) {
        this._totalPlannedHours = val
    }

    get totalPlannedHoursSentShifts() {
        return this._totalPlannedHoursSentShifts
    }

    set totalPlannedHoursSentShifts(val) {
        this._totalPlannedHoursSentShifts = val
    }

    get plannedHoursNonProductive() {
        return this._plannedHoursNonProductive
    }

    set plannedHoursNonProductive(val) {
        this._plannedHoursNonProductive = val
    }

    get plannedHoursNonProductiveSentShifts() {
        return this._plannedHoursNonProductiveSentShifts
    }

    set plannedHoursNonProductiveSentShifts(val) {
        this._plannedHoursNonProductiveSentShifts = val
    }

    get contractEndDate() {
        return this._contractEndDate
    }

    set contractEndDate(val) {
        this._contractEndDate = val
    }

    get atv() {
        return this._atv
    }

    set atv(val) {
        this._atv = val
    }

    get personnel_number_sort_on() {
        if (!isNaN(parseInt(this.details.personnel_number))) {
            return parseInt(this.details.personnel_number)
        }
        return this.details.personnel_number
    }

    get atv_sort_on() {
        return this._atv_sort_on
    }

    set atv_sort_on(val) {
        this._atv_sort_on = val
    }

    get vak() {
        return this._vak
    }

    set vak(val) {
        this._vak = val
    }

    get vak_sort_on() {
        return this._vak_sort_on
    }

    set vak_sort_on(val) {
        this._vak_sort_on = val
    }

    get tvt() {
        return this._tvt
    }

    set tvt(val) {
        this._tvt = val
    }

    get tvt_sort_on() {
        return this._tvt_sort_on
    }

    set tvt_sort_on(val) {
        this._tvt_sort_on = val
    }

    get balances() {
        return this._balances
    }

    set balances(val) {
        this._balances = val
    }

    get surcharges() {
        return this._surcharges
    }

    set surcharges(newVal) {
        this._surcharges = newVal
    }

    get contracts() {
        return this._contracts
    }

    set contracts(newVal) {
        this._contracts = newVal
    }

    get departmentHistorySentShifts() {
        return this._departmentHistorySentShifts
    }

    set departmentHistorySentShifts(newVal) {
        this._departmentHistorySentShifts = newVal
    }

    get departmentHistorySentRemarks() {
        return this._departmentHistorySentRemarks
    }

    set departmentHistorySentRemarks(newVal) {
        this._departmentHistorySentRemarks = newVal
    }

    get allNonPlannableMoments() {
        return this._allNonPlannableMoments
    }

    set allNonPlannableMoments(newVal) {
        this._allNonPlannableMoments = newVal
    }

    get validations() {
        return this._validations
    }

    set validations(newVal) {
        this._validations = newVal
    }

    get showWeekValidations() {
        return this._showWeekValidations
    }

    set showWeekValidations(newVal) {
        this._showWeekValidations = newVal
    }

    get showDailyValidations() {
        return this._showDailyValidations
    }

    set showDailyValidations(newVal) {
        this._showDailyValidations = newVal
    }

    get dayValidations() {
        return this._dayValidations
    }

    set dayValidations(newVal) {
        this._dayValidations = newVal
    }

    get weekValidationRanks() {
        return this._weekValidationRanks
    }

    set weekValidationRanks(newVal) {
        this._weekValidationRanks = newVal
    }

    get dailyValidationRanks() {
        return this._dailyValidationRanks
    }

    set dailyValidationRanks(newVal) {
        this._dailyValidationRanks = newVal
    }

    get allDepartments() {
        return this._allDepartments
    }

    set allDepartments(newVal) {
        this._allDepartments = newVal
    }

    get storeAvailability() {
        return this._storeAvailability
    }

    set storeAvailability(newVal) {
        this._storeAvailability = newVal
    }

    get wabWarnings() {
        return this._wabWarnings
    }

    set wabWarnings(newVal) {
        this._wabWarnings = newVal
    }

    setPlannedMinutes() {
        let minutes = 0
        this.shifts.forEach(shift => {
            if (shift.instances && !shift.nonProductive) {
                if (shift.type === 'G' || shift.type === 'EXCH') {
                    minutes += schedulingHelper.shiftMinutes(shift)
                }
            }
        })
        this.plannedMinutes = minutes
    }

    setPlannedMinutesSentShifts = (statusHistoryId) => {
        let minutes = 0
        let minutesNonProductive = 0
        const shifts = this._departmentHistorySentShifts[statusHistoryId] || []
        shifts.forEach(shift => {
            if (shift.type === 'G' || shift.type === 'EXCH') {
                minutes += schedulingHelper.shiftMinutes(shift)
            } else if (shift.nonProductive) {
                minutesNonProductive += Vue.moment.duration(shift.duration).asMinutes()
            }
        })
        this.plannedMinutesSentShifts = minutes
        this.plannedMinutesNonProductiveSentShifts = minutesNonProductive
        const contractMinutes = this.contract?.duration?.asMinutes() || 0
        const totalPlannedWeekMinutesSentShifts = this.plannedMinutesSentShifts + this.plannedMinutesNonProductiveSentShifts
        this.negativeDeviationSentShifts = contractMinutes > 0 && contractMinutes > totalPlannedWeekMinutesSentShifts
        this.deviationSentShifts = contractMinutes > 0 ? Vue.moment.duration({ minutes: Math.abs(contractMinutes - totalPlannedWeekMinutesSentShifts) }) : null
        this.plannedHoursSentShifts = Vue.moment.duration({ minutes: this.plannedMinutesSentShifts }).format('HH:mm')
        this.plannedHoursNonProductiveSentShifts = Vue.moment.duration({ minutes: this.plannedMinutesNonProductiveSentShifts }).format('HH:mm')
        this.totalPlannedHoursSentShifts = Vue.moment.duration({ minutes: totalPlannedWeekMinutesSentShifts }).format('HH:mm')
    }

    setPlannedMinutesNonProductive = () => {
        let minutes = 0
        this.shifts.forEach(shift => {
            if (shift.nonProductive) {
                minutes += Vue.moment.duration(shift.duration).asMinutes()
            }
        })
        this.plannedMinutesNonProductive = minutes
    }

    setAvailabilities = (payload) => {
        payload.forEach(a => {
            this.availabilities.push(a)
        })
    }

    setRdos = (payload) => {
        this.rdoRequests = payload || []
    }

    setSubstituteRequests = (payload) => {
        this.substituteRequests = payload || []
    }

    removeShiftSubstituteRequests = (shift) => {
        shift.pending_substitute_request = null
        this.updateShift(shift)
    }

    approvedSubstituteRequests = (day) => {
        const requests = this.requests.approved_substitute_requests || []
        if (!day) return requests
        return requests.filter(ssr => {
            const sameStart = Vue.moment(ssr.schedule_time_from).apiFormat() === day.apiFormat()
            const sameEnd = Vue.moment(ssr.schedule_time_to).apiFormat() === day.apiFormat()
            return sameStart || sameEnd
        })
    }

    pendingSubstituteRequests = (shiftInstanceId) => {
        if (!shiftInstanceId) return []
        return this.substituteRequests.filter(ssr => {
            const hasInstance = ssr.shift_instance_id === shiftInstanceId
            return ssr.status === 'pending' && hasInstance
        })
    }

    approvedRdoRequests = () => {
        return this.requests.request_time_off?.filter(request => request.status === 'approved') || []
    }

    pendingRdoRequests = () => {
        return this.requests.request_time_off?.filter(request => request.status === 'pending') || []
    }

    rdoRequestsOnDay = (day) => {
        if (!day) return []
        return this.approvedRdoRequests().concat(this.pendingRdoRequests()).filter(r => {
            const range = Vue.moment().customRange(Vue.moment(r.start_date), Vue.moment(r.end_date), 1, 'days', 'YYYY-MM-DD')
            return range.includes(day.apiFormat())
        })
    }

    dayAvailabilities = (day) => {
        if (!day) return []
        return this.requests.availabilities?.data?.filter(a => a.date === day.apiFormat()) || []
    }

    setAllNonPlannableMoments = () => {
        const availabilities = this.requests.availabilities?.data?.length || 0
        const rdos = this.requests.request_time_off?.filter(r => {
            return r.status === 'pending' || r.status === 'approved'
        })?.length || 0
        const ssrs = this.requests.approved_substitute_requests?.length || 0
        this.allNonPlannableMoments = availabilities + rdos + ssrs
    }

    allShifts = (statusHistoryId = false, groupDepartmentId) => {
        return statusHistoryId ? this.departmentHistorySentShifts[statusHistoryId] || [] : this.shifts
    }

    allFrequencyRowsShifts = () => {
        let shifts = []
        this.frequencyRows.forEach(row => {
            shifts = shifts.concat(row.shifts)
        })
        return shifts
    }

    frequencyRowShifts(frequencyId) {
        const frequencyRow = this.frequencyRows.find(r => r.id === frequencyId)
        return frequencyRow?.shifts || []
    }

    allFrequencyRowsRemarks = () => {
        return this.frequencyRowsRemarks.filter(row => !row.isNew)
    }

    dayShifts = (day, statusHistoryId = false, groupDepartmentId) => {
        const shifts = statusHistoryId ? this.departmentHistorySentShifts[statusHistoryId] || [] : this.shifts
        return shifts.filter(s => {
            const notAssignedOnGroupedDepartmentOnly = !groupDepartmentId || !s.notAssigned || (s.notAssigned && s.department_id === groupDepartmentId)
            const { startsPreviousWeek, endsNextWeek } = this.employeeShiftHasAnotherWeekTimes(s, day)
            return (startsPreviousWeek || endsNextWeek || Vue.moment(s.start_datetime).apiFormat() === day.apiFormat()) && notAssignedOnGroupedDepartmentOnly
        }).sort((a, b) => a.start_datetime > b.start_datetime ? 1 : b.start_datetime > a.start_datetime ? -1 : 0)
    }

    dayViewShifts = () => {
        return this.shifts.filter(s => !s.nonProductiveSimple)
    }

    addShift = (shift) => {
        if (!shift.key) {
            shift.key = 1
        } else {
            shift.key += 1
        }
        if (shift.frequencyId) {
            const frequencyRow = this.frequencyRows.find(r => r.id === shift.frequencyId)
            if (frequencyRow.to) {
                const shiftWeekday = Vue.moment(shift.end_datetime).isoWeekday()
                shift.last_occurrence = frequencyRow.to.isoWeekday(shiftWeekday).apiFormat()
            }
            frequencyRow.shifts.push(shift)
            this.setMaxStandardShiftCount()
            this.setContractAndTotals()
        } else {
            this.shifts.push(shift)
            const date = Vue.moment(shift.start_datetime)
            this.setMaxShiftCount()
            this.setNonPlannableMoments(date)
            this.setContractAndTotals()
        }
    }

    updateOrAddShift = (shift) => {
        const existingShift = this.shifts.find(s => s.shift_id === shift.shift_id)
        shift.isNew = false
        if (!existingShift) {
            this.addShift(shift)
        } else {
            this.updateShift(shift)
        }
    }

    removeNonExistentShifts = (newShiftsArray) => {
        const existingShifts = [...this.shifts]
        const newShiftIds = newShiftsArray.map(s => s.shift_id)
        existingShifts.forEach(shift => {
            if (!newShiftIds.includes(shift.shift_id)) {
                this.removeShift(shift)
            }
        })
    }

    removeShift = (shift) => {
        if (shift.frequencyId) {
            const frequencyRow = this.frequencyRows.find(r => r.id === shift.frequencyId)
            const shiftIndex = frequencyRow.shifts.findIndex(s => s.shift_id === shift.shift_id)
            if (shiftIndex > -1) {
                frequencyRow.shifts.splice(shiftIndex, 1)
                this.setMaxStandardShiftCount()
                this.setContractAndTotals()
                const shiftDate = Vue.moment(shift.start_datetime).apiFormat()
                this.selectFirstWeekdayCellButton(shiftDate, shift.fromKeyboard)
            } else {
                this.removeNewShift(true)
            }
        } else {
            const shiftIndex = this.shifts.findIndex(s => s.shift_id === shift.shift_id)
            if (shiftIndex > -1) {
                this.shifts.splice(shiftIndex, 1)
                this.setMaxShiftCount()
                this.setContractAndTotals()
                const shiftDate = Vue.moment(shift.start_datetime).apiFormat()
                this.selectFirstWeekdayCellButton(shiftDate, shift.fromKeyboard)
            } else {
                this.removeNewShift()
            }
        }
    }

    removeNewShift = (isStandardShifts) => {
        let newShift
        if (isStandardShifts) {
            this.frequencyRows.forEach(row => {
                const shiftIndex = row.shifts.findIndex(s => s.isNew)
                if (shiftIndex > -1) {
                    newShift = row.shifts.find(s => s.isNew)
                    row.shifts.splice(shiftIndex, 1)
                    this.setMaxStandardShiftCount()
                    this.setContractAndTotals()
                }
            })
        } else {
            const shiftIndex = this.shifts.findIndex(s => s.isNew)
            if (shiftIndex > -1) {
                newShift = this.shifts.find(s => s.isNew)
                this.shifts.splice(shiftIndex, 1)
                this.setMaxShiftCount()
                this.setContractAndTotals()
            }
        }
        if (newShift) {
            const shiftDate = Vue.moment(newShift.start_datetime).apiFormat()
            this.selectFirstWeekdayCellButton(shiftDate, newShift.fromKeyboard)
        }
    }

    updateShift = (shift) => {
        if (shift.frequencyId) {
            const frequencyRow = this.frequencyRows.find(r => r.id === shift.frequencyId)
            const shiftIndex = frequencyRow.shifts.findIndex(s => s.shift_id === shift.shift_id)
            if (shiftIndex > -1) {
                shift.key += 1
                Object.keys(shift).forEach(key => {
                    frequencyRow.shifts[shiftIndex][key] = shift[key]
                })
                this.setMaxStandardShiftCount()
                this.setContractAndTotals()
                return frequencyRow.shifts[shiftIndex]
            }
        } else {
            const shiftIndex = this.shifts.findIndex(s => s.shift_id === shift.shift_id)
            if (shiftIndex > -1) {
                shift.key += 1
                this.shifts[shiftIndex] = shift

                if (shift.recurring) {
                    shift.showRecurringIcon = true

                    const differentStartTime = Vue.moment(shift.original?.start_datetime).shortTime() !== Vue.moment(shift.start_datetime).shortTime()
                    const differentEndTime = Vue.moment(shift.original?.end_datetime).shortTime() !== Vue.moment(shift.end_datetime).shortTime()
                    if (differentStartTime || differentEndTime) {
                        shift.showRecurringIcon = false
                    }
                }

                Object.keys(shift).forEach(key => {
                    this.shifts[shiftIndex][key] = shift[key]
                })
            }
            const date = Vue.moment(shift.start_datetime)
            this.setMaxShiftCount()
            this.setNonPlannableMoments(date)
            this.setContractAndTotals()
            return this.shifts[shiftIndex]
        }
    }

    shiftDuration = (shift) => {
        let shiftDuration = Vue.moment.duration(Vue.moment(shift.end_datetime).diff(Vue.moment(shift.start_datetime))).asMinutes()
        shift.breaks.forEach(b => {
            shiftDuration -= Vue.moment.duration(b.duration).asMinutes()
        })
        return shiftDuration
    }

    setMaxShiftCount = () => {
        this.maxDayShiftCount = 0
        this.selectedDate.toCalendarArray('week').forEach(day => {
            const dayShifts = this.shifts.filter(s => schedulingHelper.shiftOnDateFilter(s, day))
            if (dayShifts.length > this.maxDayShiftCount) {
                this.maxDayShiftCount = dayShifts.length
            }
        })
    }

    getMaxShiftCount = (groupDepartmentId) => {
        if (this.notAssigned && groupDepartmentId) {
            return this.getNotAssignedGroupedMaxShiftCount(groupDepartmentId)
        }
        return this.maxDayShiftCount
    }

    getNotAssignedGroupedMaxShiftCount = (groupDepartmentId) => {
        let maxDayShiftCount = 0
        this.selectedDate.toCalendarArray('week').forEach(day => {
            const dayShifts = this.shifts.filter(s => {
                const hasShifts = schedulingHelper.shiftOnDateFilter(s, day)
                const notAssignedOnGroupedDepartmentOnly = s.department_id === groupDepartmentId
                return notAssignedOnGroupedDepartmentOnly && hasShifts
            })
            if (dayShifts.length > maxDayShiftCount) {
                maxDayShiftCount = dayShifts.length
            }
        })
        return maxDayShiftCount
    }

    setMaxStandardShiftCount = () => {
        this.frequencyRows.forEach(frequencyRow => {
            if (frequencyRow.shifts.length) {
                let maxShiftCount = 0
                frequencyRow.from.clone().toCalendarArray('week').forEach(day => {
                    const dayShifts = frequencyRow.shifts.filter(s => Vue.moment(s.start_datetime).weekday() === day.weekday())
                    if (dayShifts.length > maxShiftCount) {
                        maxShiftCount = dayShifts.length
                    }
                })
                frequencyRow.maxShiftCount = maxShiftCount
            } else {
                frequencyRow.maxShiftCount = 0
            }
        })
    }

    shiftByInstanceId = (instanceId) => {
        return this.shifts.find(s => s.shift_instance_id === instanceId)
    }

    shiftByGuid = (guid) => {
        return this.shifts.find(s => s.guid === guid)
    }

    setReadOnlyShiftsForSubstituteRequests = (CAN_MANAGE_SUBSTITUTE_REQUESTS) => {
        const pendingSSRsWithoutPermission = (shift) => {
            if (!CAN_MANAGE_SUBSTITUTE_REQUESTS) {
                return Boolean(this.pendingSubstituteRequests(shift.shift_instance_id).length)
            } else {
                return false
            }
        }
        this.shifts.forEach(shift => {
            if (pendingSSRsWithoutPermission(shift)) {
                shift.readOnly = true
                shift.readOnlySsr = true
            }
        })
    }

    addFrequencyRow = (row) => {
        this.frequencyRows.push(row)
        this.setMaxStandardShiftCount()
    }

    addFrequencyRemarkRow = (row) => {
        this.frequencyRowsRemarks.push(row)
        this.setMaxStandardShiftCount()
    }

    removeFrequencyRow = (id) => {
        const rowIndex = this.frequencyRows.findIndex(r => r.id === id)
        if (rowIndex > -1) {
            this.frequencyRows.splice(rowIndex, 1)
        }
    }

    removeFrequencyRemarkRow = (id) => {
        const rowIndex = this.frequencyRowsRemarks.findIndex(r => r.id === id)
        if (rowIndex > -1) {
            this.frequencyRowsRemarks.splice(rowIndex, 1)
        }
    }

    updateFrequencyRemarkRow = (payload) => {
        const existingFrequencyRemarkRowIndex = this.frequencyRowsRemarks.findIndex(frequency => frequency.id === payload.id)
        if (existingFrequencyRemarkRowIndex > -1) {
            const updatableKeys = ['frequency', 'from', 'to', 'remark', 'isNew']
            Object.keys(payload).forEach(key => {
                if (updatableKeys.includes(key)) {
                    Vue.set(this.frequencyRowsRemarks[existingFrequencyRemarkRowIndex], key, payload[key])
                }
            })
        }
    }

    updateFrequencyRow = (payload) => {
        const existingFrequencyRowIndex = this.frequencyRows.findIndex(frequency => frequency.id === payload.id)
        if (existingFrequencyRowIndex > -1) {
            const updatableKeys = ['frequency', 'from', 'to', 'shifts', 'isNew']
            Object.keys(payload).forEach(key => {
                if (updatableKeys.includes(key)) {
                    Vue.set(this.frequencyRows[existingFrequencyRowIndex], key, payload[key])
                }
            })
        }
    }

    setNonPlannableMoments = (date) => {
        this.shifts.forEach(shift => {
            shift.overlaps = this.shiftOverlaps(shift)
        })
    }

    shiftOverlaps = (shift) => {
        const day = Vue.moment(shift.start_datetime)
        return schedulingHelper.shiftOverlapsNonPlannableMoments(shift, {
            rdos: this.rdoRequests || [],
            availabilities: this.availabilities || [],
            storeAvailability: this.storeAvailability || [],
            substituteRequests: this.approvedSubstituteRequests(day) || [],
        })
    }

    maxNonPlannableMoments = () => {
        let currentCount = 0
        this.selectedDate.toCalendarArray('week').forEach(day => {
            const dayAvailabilities = this.dayAvailabilities(day).length
            const daySSRs = this.approvedSubstituteRequests(day).length
            const dayRDOs = this.requests.request_time_off?.filter(rdo => {
                const approvedAndPending = rdo.status === 'pending' || rdo.status === 'approved'
                const dayMatch = day.isBetween(rdo.start_date, rdo.end_date) || day.isSame(rdo.start_date, 'day') || day.isSame(rdo.end_date, 'day')
                return approvedAndPending && dayMatch
            })?.length || 0
            const combinedDayTotal = Number(dayAvailabilities + daySSRs + dayRDOs)
            if (combinedDayTotal > currentCount) {
                currentCount = combinedDayTotal
            }
        })
        return currentCount
    }

    setMaxNonPlannableCount = (date) => {
        date.toCalendarArray('week').forEach(day => {
            const dayAvailabilities = this.dayAvailabilities(day).length
            const daySSRs = this.approvedSubstituteRequests(day).length
            const dayRDOs = this.requests.request_time_off?.filter(rdo => {
                const approvedAndPending = rdo.status === 'pending' || rdo.status === 'approved'
                const dayMatch = day.isBetween(rdo.start_date, rdo.end_date) || day.isSame(rdo.start_date, 'day') || day.isSame(rdo.end_date, 'day')
                return approvedAndPending && dayMatch
            })?.length || 0
            const combinedDayTotal = Number(dayAvailabilities + daySSRs + dayRDOs)
            if (combinedDayTotal > this.maxNonPlannableCount) {
                this.maxNonPlannableCount = combinedDayTotal
            }
        })
    }

    plannedMinutesDayTotals = (day) => {
        let minutes = 0
        this.shifts.forEach(shift => {
            const from = Vue.moment(shift.start_datetime)
            const to = Vue.moment(shift.end_datetime)
            if (from.date() === day.date()) {
                if (shift.nonProductive) {
                    minutes += Vue.moment.duration(shift.duration).asMinutes()
                } else {
                    minutes += Vue.moment.duration(Vue.moment(to).diff(Vue.moment(from))).asMinutes()
                    minutes -= Vue.moment.duration(shift?.breaks?.duration).asMinutes()
                }
            }
        })
        return minutes
    }

    plannedProductiveMinutesDay = (day) => {
        let minutes = 0
        this.shifts.forEach(shift => {
            const from = Vue.moment(shift.start_datetime)
            const to = Vue.moment(shift.end_datetime)
            if (from.date() === day.date() && !shift.nonProductive) {
                minutes += Vue.moment.duration(Vue.moment(to).diff(Vue.moment(from))).asMinutes()
                shift.breaks.forEach(br => {
                    minutes -= Vue.moment.duration(br.duration).asMinutes()
                })
            }
        })
        return minutes
    }

    plannedNonProductiveMinutesDay = (day) => {
        let minutes = 0
        this.shifts.forEach(shift => {
            const from = Vue.moment(shift.start_datetime)
            if (from.date() === day.date() && shift.nonProductive) {
                minutes += Vue.moment.duration(shift.duration).asMinutes()
            }
        })
        return minutes
    }

    plannedMinutesDayTotalsSentShifts = (day, statusHistoryId) => {
        let minutes = 0
        const shifts = this._departmentHistorySentShifts[statusHistoryId] || []
        shifts.forEach(shift => {
            const from = Vue.moment(shift.start_datetime)
            const to = Vue.moment(shift.end_datetime)
            if (from.date() === day.date()) {
                if (shift.nonProductive) {
                    minutes += Vue.moment.duration(shift.duration).asMinutes()
                } else {
                    minutes += Vue.moment.duration(Vue.moment(to).diff(Vue.moment(from))).asMinutes()
                    shift.breaks.forEach(br => {
                        minutes -= Vue.moment.duration(br.duration).asMinutes()
                    })
                }
            }
        })
        return minutes
    }

    setPlannedMinutesStandard = () => {
        this.frequencyRows.forEach(row => {
            let minutes = 0
            if (row) {
                row.shifts.filter(s => !s.nonProductive).forEach(shift => {
                    minutes += schedulingHelper.shiftMinutes(shift)
                })
            }
            row.plannedMinutes = minutes
        })
    }

    setPlannedMinutesNonProductiveStandard = () => {
        this.frequencyRows.forEach(row => {
            let minutes = 0
            if (row) {
                row.shifts.filter(s => s.nonProductive).forEach(shift => {
                    minutes += Vue.moment.duration(shift.duration).asMinutes()
                })
            }
            row.nonProductiveMinutes = minutes
        })
    }

    getStandardMinutes = (frequencyRowId) => {
        const row = this.frequencyRows.find(r => r.id === frequencyRowId)
        if (row) {
            return {
                total: (row.plannedMinutes || 0) + (row.nonProductiveMinutes || 0),
                productive: row.plannedMinutes || 0,
                nonProductive: row.nonProductiveMinutes || 0,
            }
        }
    }

    productiveNonProductiveTotals = () => {
        const totals = {
            productive: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                week_total: 0,
            },
            non_productive: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                week_total: 0,
            },
        }
        if (this.shifts.length) {
            const days = this.selectedDate.toCalendarArray('week')
            days.forEach(day => {
                this.shifts.forEach(shift => {
                    const from = Vue.moment(shift.start_datetime)
                    if (from.date() === day.date()) {
                        if (shift.nonProductive) {
                            totals.non_productive[day.isoWeekday()] += Vue.moment.duration(shift.duration).asMinutes()
                            totals.non_productive.week_total += Vue.moment.duration(shift.duration).asMinutes()
                        } else {
                            totals.productive[day.isoWeekday()] += Vue.moment.duration(shift.duration).asMinutes()
                            totals.productive.week_total += Vue.moment.duration(shift.duration).asMinutes()
                        }
                    }
                })
            })
        }
        return totals
    }

    setContractAndTotals = () => {
        this.setPlannedMinutes()
        this.setPlannedMinutesNonProductive()
        this.setPlannedMinutesStandard()
        this.setPlannedMinutesNonProductiveStandard()
        const contractMinutes = this.contract?.duration?.asMinutes() || 0
        const totalPlannedWeekMinutes = this.plannedMinutes + this.plannedMinutesNonProductive
        this.negativeDeviation = contractMinutes > 0 && contractMinutes > totalPlannedWeekMinutes
        this.deviation = contractMinutes > 0 ? Vue.moment.duration({ minutes: Math.abs(contractMinutes - totalPlannedWeekMinutes) }) : null
        this.plannedHours = Vue.moment.duration({ minutes: this.plannedMinutes }).format('HH:mm')
        this.plannedHoursNonProductive = Vue.moment.duration({ minutes: this.plannedMinutesNonProductive }).format('HH:mm')
        this.totalPlannedHours = Vue.moment.duration({ minutes: totalPlannedWeekMinutes }).format('HH:mm')
        if (this.weeksBeforeContractEnd) {
            this.setContractEndDate()
        }
    }

    setSentDepartmentStatusHistoryShifts = (sentShifts, statusHistoryId) => {
        this._departmentHistorySentShifts[statusHistoryId] = sentShifts
        this.setPlannedMinutesSentShifts(statusHistoryId)
    }

    setSentWeekRemarks = (sentRemarks, statusHistoryId) => {
        this._departmentHistorySentRemarks[statusHistoryId] = sentRemarks
    }

    /**
     * get end of contract date for employee
     */
    setContractEndDate = () => {
        // find earliest contract end date
        if (this.contracts.length) {
            this.contractEndDate = Vue.moment().add(10, 'years').apiFormat()
            const future = Vue.moment().add(10, 'years')
            let contractEnd = Vue.moment(this.contracts[0].end_date || future.apiFormat())
            this.contracts.forEach(contract => {
                const end = contract.end_date ? Vue.moment(contract.end_date) : future
                if (end && end.isAfter(contractEnd, 'week')) {
                    contractEnd = end
                }
            })
            this.contractEndDate = contractEnd.apiFormat()
        }
    }

    signalBeforeEndOfContractDate = () => {
        if (this.contractEndDate) {
            return Vue.moment(this.contractEndDate).subtract(this.weeksBeforeContractEnd, 'weeks')
        }
        return Vue.moment().add(10, 'years')
    }

    dayRemark = (day, statusHistoryId) => {
        const remarks = statusHistoryId ? this.departmentHistorySentRemarks[statusHistoryId] || [] : this.day_remarks
        if (remarks && remarks.length) {
            return remarks.find(r => r.date === day.apiFormat())
        }
        return null
    }

    allRemarks = (statusHistoryId) => {
        return statusHistoryId ? this.departmentHistorySentRemarks[statusHistoryId] || [] : this.day_remarks
    }

    updateDayRemark = (remark) => {
        const existingIndex = this.day_remarks.findIndex(r => r.date === remark.date)
        if (existingIndex > -1) {
            this.day_remarks[existingIndex] = remark
        }
    }

    removeDayRemark = (remark) => {
        const existingIndex = this.day_remarks.findIndex(r => r.date === remark.date)
        if (existingIndex > -1) {
            this.day_remarks.splice(existingIndex, 1)
        }
    }

    addDayRemark = (remark) => {
        this.day_remarks.push(remark)
    }

    resetRemarks = (remarks) => {
        this.day_remarks = []
        remarks.forEach(r => {
            this.day_remarks.push(r)
        })
    }

    employeeShiftHasAnotherWeekTimes = (shift, date) => {
        const from = Vue.moment(shift.start_datetime)
        const to = Vue.moment(shift.end_datetime)
        return {
            startsPreviousWeek: date.isoWeekday() === 1 && from.isoWeek() < date.isoWeek(),
            endsNextWeek: date.isoWeekday() === 7 && to.isoWeek() > date.isoWeek(),
        }
    }

    setClaDays = (days) => {
        if (this.contract && !this.contract.on_call) return
        if (!this.contract.cao_id) return
        this.claDays = days
        if (this.claDays) {
            // for each cla day we build a { from, to } object
            // we will use this as a base for grid wab warning timeblock types
            this.wabWarnings = Vue.moment().daysRangeObject(this.claDays)
        }
    }

    setClaValidations = async (outcomes) => {
        this.validations = outcomes.filter(validation => {
            return validation.error || validation.warn
        })
        await this.setWeekValidations()
        await this.setDailyValidations()
        this.setValidationRanks()
    }

    setWeekValidations = async () => {
        if (this.validations.length) {
            this.showWeekValidations = true
        } else {
            const hasEmploymentDates = this.details.date_of_employment || this.details.date_of_unemployment
            if (hasEmploymentDates) {
                const weekStart = this.selectedDate.clone().startOf('isoWeek')
                const weekEnd = this.selectedDate.clone().endOf('isoWeek')
                const hasWeekEmplomentStart = Vue.moment(this.details.date_of_employment).isBetween(weekStart, weekEnd, undefined, '[]')
                const hasWeekEmploymentEnd = Vue.moment(this.details.date_of_unemployment).isBetween(weekStart, weekEnd, undefined, '[]')
                const contractSignal = this.signalBeforeEndOfContractDate().isSameOrBefore(this.selectedDate, 'week')
                this.showWeekValidations = hasWeekEmplomentStart || hasWeekEmploymentEnd || contractSignal
            } else {
                this.showWeekValidations = false
            }
        }
        return true
    }

    setDailyValidations = async () => {
        const showDailyValidations = {}
        const dayValidations = {}
        this.selectedDate.toCalendarArray('week').forEach(day => {
            const validations = this.validations.filter(v => v.validation_date === day.apiFormat() || v.validation_date === '0000-00-00')
            const hasValidations = !!validations.length
            const contractAfter = this.details.date_of_employment && Vue.moment(this.details.date_of_employment).isSameOrAfter(day, 'day')
            const contractBefore = this.details.date_of_unemployment && Vue.moment(this.details.date_of_unemployment).isSameOrBefore(day, 'day')
            const contractEnd = this.signalBeforeEndOfContractDate().isSameOrBefore(day, 'day')
            showDailyValidations[day.apiFormat()] = hasValidations || contractAfter || contractBefore || contractEnd
            dayValidations[day.apiFormat()] = validations
        })
        this.showDailyValidations = showDailyValidations
        this.dayValidations = dayValidations
        return true
    }

    setValidationRanks = () => {
        const getStatusCount = (status, date) => {
            return this.validations.filter(v => v[status] && (!date || v.validation_date === date.apiFormat())).length
        }
        this.weekValidationRanks = {
            error: getStatusCount('error'),
            warn: getStatusCount('warn'),
            rank: getStatusCount('error') + getStatusCount('warn'),
        }
        const dailyRanks = {}
        this.selectedDate.toCalendarArray('week').forEach(day => {
            const error = getStatusCount('error', day)
            const warn = getStatusCount('warn', day)
            dailyRanks[day.apiFormat()] = {
                error,
                warn,
                rank: error + warn,
            }
        })
        this.dailyValidationRanks = dailyRanks
    }

    getWabWarnings = () => {
        if (Object.keys(this.wabWarnings)) {
            return this.wabWarnings
        }
    }

    setWabCounter = (counter) => {
        this.wab_counters = counter || {}
        this.wab_sort_on = Vue.moment.duration(this.wab_counters.period_threshold).asMinutes()
    }

    getSort = (on) => {
        return this[`${on}_sort_on`]
    }

    setBalances = (balances) => {
        this.balances = balances[0]
        const balanceEndValue = (detail) => {
            if (this.balances) {
                let value = this.balances[detail] ? this.balances[detail].end_value : '00:00'
                if (value === '0:00') {
                    value = '00:00'
                }
                return value
            }
            return '00:00'
        }
        this.atv = balanceEndValue('atv') || ''
        this.atv_sort_on = Vue.moment.duration(this.atv).asMinutes() || ''
        this.tvt = balanceEndValue('compensation_hours') || ''
        this.tvt_sort_on = Vue.moment.duration(this.tvt).asMinutes()
        this.vak = balanceEndValue('time_off') || ''
        this.vak_sort_on = Vue.moment.duration(this.vak).asMinutes()
    }

    selectFirstWeekdayCellButton = (date, fromKeyboard) => {
        setTimeout(() => {
            const weekdayCell = document.querySelector(`.planning-grid-row.selected .day-time-cell.blocks[data-date="${date}"]`)
            if (weekdayCell) {
                const firstButton = weekdayCell.querySelector('button')
                if (firstButton && !fromKeyboard) {
                    firstButton.focus()
                }
            }
        }, 150)
    }

    setWeeksets = (weeksets) => {
        this.weeksets = weeksets
    }

    toggleDisplay = (display) => {
        this.showExtra[display] = !this.showExtra[display]
    }

    getDisplay = (display) => {
        return this.showExtra[display]
    }

    deselectPlannability = () => {
        this.showExtra.availability = false
        this.showExtra.remarks = false
    }

    getIsChecked = () => {
        return this.isChecked
    }

    toggleChecked = () => {
        this.isChecked = !this.isChecked
    }

    isFullyAvailableForShift = (shift) => {
        const from = Vue.moment(shift.start_datetime)
        const to = Vue.moment(shift.end_datetime)
        const greenAvailabilities = this.dayAvailabilities(from).filter(a => {
            const isGreen = a.type === 'preferred'
            const hasStart = from.shortTime() >= a.time_from
            const hasEnd = to.shortTime() <= a.time_to
            return isGreen && hasStart && hasEnd
        })
        const overlaps = this.shiftOverlaps(shift)
        const hasOtherOverlaps = (
            overlaps.availability.some ||
            overlaps.rdo.pending ||
            overlaps.rdo.approved ||
            overlaps.substituteRequests.approved
        )
        return greenAvailabilities.length > 0 && !hasOtherOverlaps
    }

    addSurcharge = (surcharge) => {
        this._surcharges.push(surcharge)
    }

    deleteSurcharge = (surcharge) => {
        const existingSurcharge = this.surcharges.findIndex(s => s.guid === surcharge.guid)
        if (existingSurcharge > -1) {
            this._surcharges.splice(existingSurcharge, 1)
        }
    }

    updateSurcharge = (surcharge) => {
        const existingSurcharge = this.surcharges.findIndex(s => s.guid === surcharge.guid)
        if (existingSurcharge > -1) {
            Object.keys(surcharge).forEach(key => {
                this._surcharges[existingSurcharge][key] = surcharge[key]
            })
        }
    }

    hasExpiredContract = (day, ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING) => {
        if (ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING) return false
        return this.contract && this.contract.end_date ? day.isAfter(this.contract.end_date, 'day') : false
    }

    addApprovedSubstituteRequest = (request) => {
        this.requests.approved_substitute_requests.push(request)
    }
}

export default PlanningEmployee
