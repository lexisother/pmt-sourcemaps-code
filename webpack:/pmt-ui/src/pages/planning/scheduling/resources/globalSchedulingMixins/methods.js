import { mapActions, mapMutations } from 'vuex'
import schedulingHelper from '@/libraries/schedulingHelper'
import shiftHelper from '@/libraries/shiftHelper'
import objectHelper from '@/libraries/objectHelper'

let lastTimePasted = 0

export default {
    methods: {
        ...mapMutations(['SET_SNACKBAR', 'HIDE_SNACKBAR', 'SET_APP_PRINTING', 'TOGGLE_LOADING']),
        ...mapMutations(['UPDATE_PAGE_FILTER', 'UPDATE_ENABLED_FILTERS', 'CLEAR_PAGE_FILTERS', 'CLEAR_FILTER_CATEGORY', 'SET_CRITICAL_APIS_LIST', 'SET_API_ERRORS', 'REMOVE_NON_CRITICAL_API_ERRORS', 'UPDATE_SCROLL_POSITION']),
        ...mapMutations('scheduling', {
            changeSetting: 'changeSetting',
            CHANGE_PRINT_SETTING: 'CHANGE_PRINT_SETTING',
            SET_ACTIVE_CONTEXT_MENU: 'SET_ACTIVE_CONTEXT_MENU',
            SET_PUBLISH_MODE: 'SET_PUBLISH_MODE',
            SET_LAYOUT_SCROLL: 'SET_LAYOUT_SCROLL',
            TOGGLE_COLUMN_SORT: 'TOGGLE_COLUMN_SORT',
            TOGGLE_VISIBLE_COLUMN: 'TOGGLE_VISIBLE_COLUMN',
            SET_COLUMN_VISIBILITY: 'SET_COLUMN_VISIBILITY',
            SET_RESOURCES_SEARCH: 'SET_RESOURCES_SEARCH',
            SET_HOVERED_TIMEBLOCK: 'SET_HOVERED_TIMEBLOCK',
            SET_SAVING_SHIFT: 'SET_SAVING_SHIFT',
            SET_SAVING_SHIFT_ERROR: 'SET_SAVING_SHIFT_ERROR',
            SET_WEEK_IS_LOADING: 'SET_WEEK_IS_LOADING',
            SET_SHIFT_TO_ASSESS_SSR: 'SET_SHIFT_TO_ASSESS_SSR',
            SET_CAROUSEL_SNACKBAR_FILTER_AMOUNT: 'SET_CAROUSEL_SNACKBAR_FILTER_AMOUNT',
            SET_EXPANDED_PANELS: 'SET_EXPANDED_PANELS',
            SET_WORKLOAD_VIEW: 'SET_WORKLOAD_VIEW',
            SET_GRID_SELECTED_STANDARD_SHIFTS_ROW: 'SET_GRID_SELECTED_STANDARD_SHIFTS_ROW',
            SET_PRINT_DATE: 'SET_PRINT_DATE',
            SET_PRINT_VIEW: 'SET_PRINT_VIEW',
            SET_DIRTY_GRID: 'SET_DIRTY_GRID',
            SET_CLA_WARNING_POPOVER: 'SET_CLA_WARNING_POPOVER',
        }),
        ...mapActions('configuration/holidays', ['getPublicHolidays']),
        ...mapActions('account', {
            getWeekEmployees: 'getWeekEmployees',
            getColleaguesForWeek: 'getColleaguesForWeek',
        }),
        ...mapActions('scheduling', {
            getWeekSteerInfo: 'getWeekSteerInfo',
            getShiftBreakSuggestions: 'getShiftBreakSuggestions',
            deleteShiftInstance: 'deleteShiftInstance',
            deleteShift: 'deleteShift',
            SET_INITIAL_RESOURCES_WIDTH: 'SET_INITIAL_RESOURCES_WIDTH',
            TOGGLE_RESOURCES_WIDTH: 'TOGGLE_RESOURCES_WIDTH',
            UPDATE_RESOURCES_WIDTH: 'UPDATE_RESOURCES_WIDTH',
            createShift: 'createShift',
            createShiftInstance: 'createShiftInstance',
            createShiftWithInstance: 'createShiftWithInstance',
            updateShift: 'updateShift',
            updateShiftInstance: 'updateShiftInstance',
            getWeeklyBookableHourTypes: 'getWeeklyBookableHourTypes',
            getWeekStatus: 'getWeekStatus',
            getDepartmentsWeekStatus: 'getDepartmentsWeekStatus',
            getLastFinalizedDepartmentStatus: 'getLastFinalizedDepartmentStatus',
            assessSubstituteRequest: 'assessSubstituteRequest',
            finalizeDepartments: 'finalizeDepartments',
            closeDepartments: 'closeDepartments',
            reopenDepartments: 'reopenDepartments',
            getSchedulingWorkloadData: 'getSchedulingWorkloadData',
            getSchedulingWorkloadDataDepartment: 'getSchedulingWorkloadDataDepartment',
            getWeekDetails: 'getWeekDetails',
            workloadGraphHeightAction: 'workloadGraphHeightAction',
            getSchedulingNotifications: 'getSchedulingNotifications',
            deleteStandardShift: 'deleteStandardShift',
            saveStandardRemark: 'saveStandardRemark',
            createStandardRemark: 'createStandardRemark',
            deleteStandardRemark: 'deleteStandardRemark',
            getClaSettings: 'getClaSettings',
        }),
        ...mapMutations('datepicker', ['UPDATE_DATEPICKER']),
        ...mapActions('configuration/cao', ['getCaoRules']),
        ...mapMutations('planning', [
            'RESET_EMPLOYEES_DATA',
            'SET_CUSTOM_TIME_FROM_KEYBOARD',
            'TOGGLE_SHOW_SEARCH',
            'SET_DAY_TOTALS_STEER_TYPE',
            'STORE_COPIED_SHIFT',
            'SET_HOVERED_DAY',
            'SET_HOVERED_TIME',
            'SET_SNACKBAR_ADDITIONAL_SETTING',
            'SET_MOBILE_PLANNING_SWIPE_DIRECTION',
            'TOGGLE_WEEK_CLOSE_NOTIFICATION_SNACKBAR',
            'SET_EMPLOYEE_DEPARTMENTS',
            'SET_STANDARD_SHIFT_EMPLOYEE',
            'RESET_LAST_MODIFIED_STANDARD_SHIFT',
            'SET_CURRENT_EMPLOYEE_DEPARTMENTS',
        ]),
        ...mapActions('planning', [
            'getPlanningEmployees',
            'getAccountWeekShifts',
            'getAvailabilities',
            'getRdoRequests',
            'getSubstituteRequests',
            'getBusinessTimes',
            'getContracts',
            'getAccountWeekDayRemarks',
            'saveEmployeeDayRemark',
            'getWabCounters',
            'getWageInfo',
            'getWeekBalances',
            'getClaValidationOutcomes',
            'getStandardShifts',
            'getStandardDayRemarks',
            'getPlannableEmployees',
            'getSentShiftInstances',
            'getSentDayRemarks',
            'getAvailabilityWeeksets',
            'getStoreGroups',
            'getNonProductiveShiftCalculation',
            'getCloseWeekNotifications',
            'closeWeek',
            'reopenWeek',
            'getPlanningEmployeeData',
            'getDepartments',
            'getShiftSurcharges',
            'deleteSurcharge',
            'createSurcharge',
            'updateSurcharge',
            'downloadExcelPlanning',
            'getEmployeeDepartments',
            'getAllStructuresDepartments',
        ]),
        /**
         * Updates the scroll position of the layout
         * This is used by the schduling grid to show a nice shadow for the header
         * when the grid is scrolled vertically more than 45 pixels and remove the shadow
         * when the grid is scrolled all the way to the top. See more in WeekTimeline.vue
         */
        updateScroll (event) {
            const top = event.srcElement.scrollTop
            const left = event.srcElement.scrollLeft
            this.SET_LAYOUT_SCROLL({ top, left })
            if (this.activeContextMenu) {
                // hide any open context menu on scroll
                this.SET_ACTIVE_CONTEXT_MENU(null)
            }
            if (this.$refs.timelineGrid) {
                // hide any open remark menus or warning popover on scroll
                this.$refs.timelineGrid.remarkPopover.show = false
                this.SET_CLA_WARNING_POPOVER(null)
            }
        },
        mainPlanningEvents (e) {
            const stop = (e) => {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
            }
            if (e.code === 'Escape') {
                this.TOGGLE_SHOW_SEARCH(false)
            }
            if (e.target.matches('input') || e.target.matches('textarea') || e.target.matches('[contenteditable="true"]')) {
                return
            }
            /**
             * 1. Prevents default behavior for scrolling when spacebar is pressed
             *      We use spacebar keyup event to create a new shift on the grid or
             *      to open the edit form for an existing timeblock
             */
            if (e.code === 'Space') {
                e.preventDefault()
            }
            // Opens the employee search menu and focuses on the search input
            if (e.code === 'Slash') {
                if (this.hasActiveShift()) return
                stop(e)
                this.TOGGLE_SHOW_SEARCH(true)
            }
        },
        /**
         * Translates provided query against main baseTranslation path
         * Accepts params that can be Vue i18n accepted params
         * @param {String} query
         * @param {Any} params
         * @returns {String} translated string
         */
        baseTranslate (query, params) {
            return this.$t(`pages.scheduling.${query}`, params)
        },
        /**
         * Translates provided query against main baseTranslation path
         * Accepts params that can be Vue i18n accepted params
         * @param {String} query
         * @param {Any} params
         * @returns {String} translated string
         */
        baseTranslateCheckHours (query, params) {
            return this.$t(`pages.checkHours.${query}`, params)
        },
        /**
         * Changes the route when day buttons are clicked
         */
        changeRoute (day) {
            this.$router.replace({
                name: 'day-planning',
                params: day.dayWeekYearObject(true),
                query: Object.assign({}, this.$route.query, { day: day.date() }),
            }).catch(() => { })
        },
        toggleSetting (setting) {
            const weekExcludedSettings = ['availabilities', 'nonAvailabilities', 'approvedSubstituteRequests', 'approvedRdo', 'pendingRdo']
            const excludedSettings = []
            if (!this.CAN_VIEW_OTHERS_AVAILABILITIES || !this.HAS_AVAILABILITY_MODULE) {
                excludedSettings.push('availabilities')
                excludedSettings.push('nonAvailabilities')
                excludedSettings.push('alwaysShowAvailabilityWeekViewEmployeeClick')
            }
            if (excludedSettings.includes(setting)) return
            if (!this.isDayView && weekExcludedSettings.includes(setting)) return
            if (setting === 'weekStatus') {
                if (this.CAN_READ_DEPARTMENT_STATUS) {
                    this.changeSetting({ setting, value: !this.settings[setting] })
                }
                return
            }
            this.changeSetting({ setting, value: !this.settings[setting] })
            if (setting === 'workloadChart') {
                this.workloadGraphHeightAction(!this.settings[setting] ? 0 : 200)
            }
            if (setting === 'alwaysShowAllRemarks') {
                this.changeSetting({ setting: 'alwaysShowRemarksWeekViewEmployeeClick', value: false })
            }
        },
        togglePrintSetting (setting) {
            this.CHANGE_PRINT_SETTING({ setting, value: !this.printSettings[setting] })
        },
        async setSnackbarFilter (e) {
            await this.CLEAR_PAGE_FILTERS()
            await this.UPDATE_PAGE_FILTER({ filter: 'notificationSnackbars', value: e.reference })
            if (e.reference === 'rm60') {
                e.ids.forEach(id => {
                    this.UPDATE_PAGE_FILTER({ filter: 'departments', value: id })
                })
            }
        },

        openSnackbarFilter (additionalSetting) {
            this.changeSetting({ setting: 'weekPublishWarnings', value: true })
            this.changeSetting({ setting: 'weekStatus', value: false })
            this.changeSetting({ setting: 'publishShifts', value: false })
            this.SET_SNACKBAR_ADDITIONAL_SETTING(additionalSetting)
            this.UPDATE_ENABLED_FILTERS(this.enabledFilters)
        },

        closeSnackbarFilter () {
            this.CLEAR_PAGE_FILTERS()
            this.changeSetting({ setting: 'weekPublishWarnings', value: false })
            this.UPDATE_ENABLED_FILTERS(this.enabledFilters)
        },

        employeeContract (accountId) {
            const contracts = this.ALL_EMPLOYEES_CONTRACTS
            return contracts[accountId] ? contracts[accountId][0] : {}
        },

        shiftOverlaps (shift) {
            if (this.isStandard) {
                const employeeStandardShifts = this.activeEmployeeFrequencyRowsAllShifts(shift.account_id, shift.frequencyId).filter(s => !s.nonProductive && s.guid !== shift.guid && !s.isNew)
                return schedulingHelper.checkStandardShiftsFrequencyOverlap(employeeStandardShifts, shift)
            } else {
                const employee = this.weekPlanningData[shift.account_id || 'not_assigned']
                if (employee) {
                    const shiftsToCheck = employee.shifts.filter(s => !s.nonProductive && !s.notAssigned && s.guid !== shift.guid && !s.isNew)
                    if (shiftsToCheck.length) {
                        return schedulingHelper.isOverlapingOtherShifts(shift, shiftsToCheck)
                    }
                }
            }
            return {}
        },

        insideBusinessTimes (time) {
            if (this.weekBusinessTimes) {
                const dayBusinessTimes = this.weekBusinessTimes.store_availability ? this.weekBusinessTimes.store_availability[time.isoWeekday() - 1] : { business_from_time: '00:00', business_to_time: '23:59' }
                if (dayBusinessTimes.closed) {
                    return false
                }
                const isBeforeBusinessTimes = time.shortTime() < dayBusinessTimes.business_from_time && dayBusinessTimes.business_from_time !== '00:00'
                const isAfterBusinessTimes = time.shortTime() >= dayBusinessTimes.business_to_time && dayBusinessTimes.business_to_time !== '00:00'
                return !isBeforeBusinessTimes && !isAfterBusinessTimes
            }
            return time
        },

        dayIsClosed (day) {
            if (this.weekBusinessTimes) {
                return this.weekBusinessTimes.store_availability[day.isoWeekday() - 1].closed
            }
            return false
        },

        /**
         * Sets a permanent snackbar with week is closed message
         */
        checkWeekStatus () {
            if (this.weekIsClosed) {
                this.SET_SNACKBAR({ message: this.baseTranslate('weekStatus.weekIs', { status: this.weekStatusTranslation() }), warning: true })
            } else {
                this.HIDE_SNACKBAR()
            }
        },

        weekStatusTranslation () {
            if (!this.weekStatus.status) return ''
            return this.baseTranslate(`weekStatus.statuses.${this.weekStatus.status}`)
        },

        departmentsWeekStatuses (departmentId) {
            const statuses = this.weekStoreData?.department_status?.filter(s => s.department_id === departmentId) || []
            if (!statuses.length) return []
            const sortedStatuses = objectHelper.sortByKey(statuses, 'changed_on').reverse()
            if (!sortedStatuses.length) return []
            if ((sortedStatuses[0]?.status === 'finalized' || sortedStatuses[0]?.status === 'changed') && sortedStatuses[1]?.status === 'closed') {
                sortedStatuses[0].reopened = true
            }
            return sortedStatuses
        },

        departmentStatus (departmentId) {
            if (!departmentId) return { isClosed: false }
            const departmentStatus = this.departmentsWeekStatuses(departmentId).slice(0, 1)[0]
            const isClosed = departmentStatus && departmentStatus.status === 'closed'
            return {
                ...departmentStatus,
                isClosed,
            }
        },

        departmentClosed (departmentId) {
            if (!departmentId) return false
            return this.departmentStatus(departmentId).isClosed
        },

        departmentStatusTranslation (weekStatus) {
            if (!weekStatus || !weekStatus.status) return
            return this.$t(`pages.scheduling.weekStatus.departmentStatuses.${weekStatus.status}`)
        },

        departmentStatusChanged (status) {
            let changedBy = this.$t('ui.singles.admin')
            if (status && status.changed_by && status.changed_by.full_name) {
                changedBy = status.changed_by.full_name
            }
            return `${status.changed_on ? `${this.$moment(status.changed_on).fromNow()} • ` : ''}${changedBy}`
        },

        /**
         * Updates current page grouping in VUEX
         *   - toggles groupByEmployees
         *   - toggles groupByDepartment
         */
        togglePageGrouping () {
            /**
             * Following if statement is made so that when the 'hideUnrelatedDepartmentShifts' is set to true it cannot be changed in employeeView, even if it's set to true. So this means
             * some data might be hidden with no way to unhide it
             */
            if (this.showHideUnrelatedDepartmentShiftsFilter && this.settings.hideUnrelatedDepartmentShifts) {
                this.changeSetting({ setting: 'hideUnrelatedDepartmentShifts', value: false })
            }
            this.UPDATE_PAGE_FILTER({ filter: 'groupByEmployees' })
            this.UPDATE_PAGE_FILTER({ filter: 'groupByDepartment' })
        },

        shiftHasAnotherWeekTimes (shift, day) {
            const from = this.$moment(shift.start_datetime)
            const to = this.$moment(shift.end_datetime)
            const date = day || this.SELECTED_DATE.startOf('isoWeek')
            return {
                startsPreviousWeek: date.isoWeekday() === 1 && from.isoWeek() < date.isoWeek(),
                endsNextWeek: date.isoWeekday() === 7 && to.isoWeek() > date.isoWeek(),
            }
        },

        timeBlockLeftPosition ({ from, timeIntervalStep = 60, timeBoxWidth = 50 }) {
            if (!this.isDayView) return
            const shiftStartMinutes = from.diff(from.clone().startOf('day'), 'minutes')
            return Math.floor(shiftStartMinutes / timeIntervalStep * timeBoxWidth.toFixed(2))
        },

        timeBlockWidth ({ from, to, timeIntervalStep = 60, timeBoxWidth = 50 }) {
            if (!this.isDayView) return
            const duration = from.diff(to, 'minutes')
            return (Math.abs(duration) * (timeBoxWidth / timeIntervalStep)) - 1
        },

        canEditShiftBookableHourType (shift) {
            if (shift.type === this.shiftTypes.NORMAL || shift.type === this.shiftTypes.EXCHANGE) return true
            if (this.bookableHourForeignTypes && shift.nonProductive) {
                if (!this.bookableHourForeignTypes[shift.foreign_type]) {
                    return false
                }
                return this.bookableHourForeignTypes[shift.foreign_type].editable
            }
            return true
        },

        getShiftPopoverPosition ({ element, shift, animateOrigin, animateTo }) {
            const position = {
                animateOrigin: animateOrigin || 'top',
                animateTo: animateTo || 'left',
                nudgeBottom: 0,
                x: 0,
                y: 0,
                width: shift.readOnly ? 345 : shift.nonProductive ? 300 : 435,
                transition: 'scale-transition',
            }
            if (!element && !this.shiftElement(shift)) return position
            const elementRect = (element || this.shiftElement(shift)).getBoundingClientRect()
            // animate from
            if ((elementRect.y - (elementRect.height * 2)) > (window.innerHeight / 2)) {
                position.animateOrigin = animateOrigin || 'bottom'
            } else {
                position.animateOrigin = animateOrigin || 'top'
            }
            if (window.innerWidth < position.width + elementRect.right) {
                // opens on the left
                position.animateTo = animateTo || 'right'
                position.x = elementRect.x - position.width - 5
                position.y = elementRect.y
            } else {
                // opens on the right
                position.animateTo = animateTo || 'left'
                position.x = elementRect.x + elementRect.width + 5
                position.y = elementRect.y
            }
            const popoverHeight = () => {
                if (shift.readOnly) return 245
                if (shift.nonProductive) return 445
                if (shift.notAssigned) return 620
                const employee = this.weekPlanningData[shift.account_id]
                const hasWab = this.employeeTimesHaveWabWarning(employee, {
                    from: shift.start_datetime,
                    to: shift.end_datetime,
                })
                // add 45 to the popover height when an overlap is detected
                const overlapHeight = this.shiftHasOverlap(shift, true, true) ? 45 : 0
                const wabWarningHeight = hasWab ? 57 : 0
                if (shift.isNew) {
                    if (this.CAN_READ_INDIRECT_HOURS_OR_TASKS) {
                        return 600 + overlapHeight + wabWarningHeight
                    }
                    return 560 + overlapHeight + wabWarningHeight
                }
                if (this.CAN_READ_INDIRECT_HOURS_OR_TASKS) {
                    return 570 + overlapHeight + wabWarningHeight
                }
                return 530 + overlapHeight + wabWarningHeight
            }
            if ((window.innerHeight - position.y - 5) <= popoverHeight()) {
                // adjust top position so it does not overflow on the bottom
                position.y = window.innerHeight - (popoverHeight() + 15)
            }
            if (isNaN(position.x) || !position.x) {
                position.x = 0
            }
            if (isNaN(position.y) || !position.y) {
                position.y = 0
            }
            return position
        },

        shiftElement (shift) {
            const idQuery = !shift.isNew ? `#shift_${shift.guid}` : '#new_shift'
            return document.querySelector(idQuery)
        },

        shiftOnDateFilter (shift, date = this.SELECTED_DATE) {
            const checkDate = date.clone()
            const from = this.$moment(shift.start_datetime)
            const to = this.$moment(shift.end_datetime)
            const sameFrom = from.apiFormat() === checkDate.apiFormat()
            const sameTo = to.apiFormat() === checkDate.apiFormat()
            const { startsPreviousWeek, endsNextWeek } = this.shiftHasAnotherWeekTimes(shift, checkDate)
            const startsPreviousDay = !this.isDayView && from.isSame(checkDate.clone().subtract(1, 'days'), 'day')
            const endsNextDay = !this.isDayView && to.isSame(checkDate.clone().add(1, 'days'), 'day')
            return startsPreviousWeek || endsNextWeek || (this.isDayView && (startsPreviousDay || endsNextDay)) || sameFrom || sameTo
        },

        notification (ref) {
            return this.SCHEDULING_NOTIFICATION({ date: this.SELECTED_DATE, reference: ref })
        },

        employeeNotifications (accountId) {
            const allOrSingle = (arr) => {
                if (arr) {
                    if (accountId) {
                        return arr.includes(accountId)
                    }
                    const filteredEmployees = this.sortedEmployeesWithShifts().map(e => e.account_id)
                    return arr.filter(a => filteredEmployees.includes(a))
                }
            }
            return {
                deviation: allOrSingle(this.notification('rm1').ids),
                availability: allOrSingle(this.notification('RM.2').extra_data.pendingAvailabilityRequests),
                rdo: allOrSingle(this.notification('RM.2').extra_data.pendingRdoRequests),
                ssr: allOrSingle(this.notification('RM.2').extra_data.pendingSubstituteRequests),
                wab2: allOrSingle(this.notification('wab2').ids),
                wab3: allOrSingle(this.notification('wab3').ids),
                blockingCao: allOrSingle(this.notification('cla').ids),
                blockingAtw: Math.random() < 0.25,
                overlap: {
                    plannable: allOrSingle(this.notification('OVERLAP.OTHER.SHIFTS').ids),
                    nonPlannable: allOrSingle(this.notification('OVERLAP.NON.PLANNABLE').ids),
                },
                scheduleExceedsNorm: this.notification('SCHEDULE.EXCEEDS.NORM').ids, // department ids
                rm30: allOrSingle(this.notification('rm30').ids),
                rm40: allOrSingle(this.notification('rm40').ids),
                rm50: allOrSingle(this.notification('rm50').ids),
                rm60: this.notification('rm60').ids, // department ids
                rm70: this.notification('rm70').ids, // store ids
                rm80: this.notification('rm80').ids, // department ids
                co80: allOrSingle(this.notification('co80').ids),
                claWarnings: allOrSingle(this.notification('claWarnings').ids),
            }
        },

        employeeRdoRequests (accountId) {
            const employee = this.weekPlanningData[accountId]
            const weekRequests = employee.rdoRequests
            const employeeWeekRequests = weekRequests ? weekRequests[accountId] : undefined
            if (this.isDayView) {
                return (employeeWeekRequests || []).filter(rdo => {
                    return this.SELECTED_DATE.isBetween(this.$moment(rdo.start_date).setTime(rdo.start_time), this.$moment(rdo.end_date).setTime(rdo.end_time))
                })
            }
            return employeeWeekRequests || []
        },

        pendingEmployeeRdoRequests (accountId) {
            return this.employeeRdoRequests(accountId).filter(request => request.status === 'pending')
        },

        employeeSubstituteRequests (accountId) {
            return this.WEEKLY_SUBSTITUTE_REQUESTS(this.SELECTED_DATE)[accountId] || []
        },

        pendingEmployeeSubstituteRequests (accountId) {
            const ssrs = this.employeeSubstituteRequests(accountId).filter(ssr => ssr.status === 'pending')
            if (this.isDayView) {
                return ssrs.filter(ssr => this.$moment(ssr.schedule_time_from).apiFormat() === this.SELECTED_DATE.apiFormat())
            }
            return ssrs
        },

        employeePendingRequests (accountId) {
            const pendingRequests = []
            const notifications = this.employeeNotifications(accountId)
            if (notifications.availability) {
                pendingRequests.push('availability')
            }
            if (notifications.rdo) {
                pendingRequests.push('rdo')
            }
            if (notifications.ssr) {
                pendingRequests.push('ssr')
            }
            return pendingRequests
        },

        employeeDepartmentIds (accountId) {
            const employee = this.weekPlanningData[accountId]
            if (!employee) return []
            return employee.departments.map(d => d.department_id)
        },

        activeEmployeeFrequencyRows (accountId) {
            const employee = this.weekPlanningData[accountId]
            return employee?.frequencyRows.filter(row => {
                return !row.to || row.to.isAfterOrSameWeekAs(this.firstSelectableStandardShiftsDate)
            }) || []
        },

        employeeFrequencyRowById (accountId, frequencyId) {
            const employee = this.weekPlanningData[accountId]
            return employee.frequencyRows.find(row => row.id === frequencyId)
        },

        isShiftLentOut (shift) {
            return shift && shift.exchange_store_id && shift.store_id === this.currentStore.id
        },

        isShiftLentIn (shift) {
            return shift && shift.store_id !== this.currentStore.id
        },

        shiftExchangeStore (shift) {
            if (!shift) return {}
            const storeId = this.isShiftLentIn(shift) ? shift.store_id : shift.exchange_store_id
            const exchangeStore = this.exchangeStores.find(s => s.store_id === storeId)
            return exchangeStore
        },

        activeEmployeeFrequencyRowsAllShifts (accountId, currentFrequencyId) {
            const shifts = []
            const currentFrequencyRow = this.employeeFrequencyRowById(accountId, currentFrequencyId)
            this.activeEmployeeFrequencyRows(accountId).filter(row => {
                if (!row.to) return true
                if (row.to.isSame(currentFrequencyRow.from, 'week') || row.to.isAfter(currentFrequencyRow.from, 'week')) {
                    return true
                }
                return false
            }).forEach(row => {
                row.shifts.filter(s => !s.isNew).forEach(shift => {
                    shifts.push(shift)
                })
            })
            return shifts
        },

        /**
         * Set an error snackbar and also undo the shift values
         * using the backupShift param
         * @param {ApiError} error
         * @param {Object} backupShift
         */
        setError (error, backupShift = {}, isError = true, showSnackbar = true) {
            if (isError) {
                console.error(error)
            }
            const employee = this.weekPlanningData[backupShift.account_id]
            if (Object.keys(backupShift).length && employee) {
                if (backupShift.key) {
                    backupShift.key += 1
                } else {
                    backupShift.key = 1
                }
                // this.updateEmployeeShift(backupShift)
                employee.updateShift(backupShift)
                employee.selected = false
                setTimeout(() => {
                    employee.selected = true
                    if (this.isStandardShifts) {
                        this.SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(backupShift.frequencyId)
                    }
                }, 0)
            }
            if (error.code === 'shifts.departmentNotInStructure') {
                const department = this.currentEmployeeDepartments.find(d => d.department_id === backupShift.department_id)
                if (error.info && department) {
                    error.message = this.$t('apiErrors.shifts.departmentNotInStructure', [department.department_name, this.$moment(error.info).weekYearFormat()])
                    isError = true
                }
            }
            if (error.code === 'shifts.invalidLastOccurrence') {
                error.message = this.$t('apiErrors.shifts.invalidLastOccurrence')
            }
            if (error.code === 'shifts.departmentNotInSet' && employee) {
                error.message = this.$t('apiErrors.shifts.departmentNotInSet', {
                    employeeName: employee.name,
                    departmentName: this.currentEmployeeDepartments.find(d => d.department_id === backupShift.department_id).department_name,
                    date: error.info,
                })
            }
            if (error.code === 'departmentStatus.weekNotReleased') {
                error.message = this.$t('apiErrors.departmentStatus.weekNotReleased')
            }
            if (error.code === 'shifts.departmentNotEditable') {
                error.message = `${this.$t('apiErrors.shifts.departmentNotEditable')} (${this.$moment(backupShift.start_datetime).euFormat()})`
            }
            if (showSnackbar) {
                setTimeout(() => {
                    this.SET_SNACKBAR({
                        message: error.message,
                        error: isError,
                        warning: !isError,
                        timeout: 7000,
                    })
                }, 0)
            }
        },

        /**
         * Adds a new shift to VUEX state
         * Used when a new element is added on the grid
         * @param {String} from
         * @param {String} to
         * @param {Object} employee
         * @param {Object} department
         */
        async addGridShift ({ from, to, employee, department, nonProductiveSimple = false, frequencyRow, copied = false, type = 'G', duration, breaks, fromKeyboard = false }) {
            if (this.CUSTOM_TIME_FROM_KEYBOARD) {
                from = this.$moment(from).setTime(this.CUSTOM_TIME_FROM_KEYBOARD)
                to = from.clone().add(1, 'hours')
            }
            const newShift = this.NEW_SHIFT({
                account_id: employee.notAssigned ? 'not_assigned' : employee.account_id,
                department_id: department ? department?.department_id : null,
                from: this.$moment(from),
                to: this.$moment(to),
                age: employee.age,
                nonProductive: nonProductiveSimple,
                nonProductiveSimple,
                notAssigned: employee.notAssigned,
                type,
                breaks,
            })
            if (nonProductiveSimple) {
                newShift.duration = duration
            }
            let day = this.$moment(to).day()
            if (day === 0) {
                day = 7
            }
            if (frequencyRow) {
                if (!frequencyRow.toWeekYear) {
                    frequencyRow.toWeekYear = frequencyRow.to ? frequencyRow.to.weekYearObject() : null
                }
                newShift.frequency = frequencyRow.frequency
                newShift.last_occurrence = frequencyRow.to ? this.$moment().set({ year: frequencyRow.toWeekYear.year, isoWeek: frequencyRow.toWeekYear.week }).day(day).apiFormat() : null
                newShift.frequencyId = frequencyRow.id
            }
            newShift.copied = copied
            newShift.fromKeyboard = fromKeyboard
            newShift.style = shiftHelper.shiftStyle(newShift, department)
            employee.addShift(newShift)
        },
        async addShift ({ from, to, nonProductiveSimple = false, departmentId, frequencyRow, employee, fromKeyboard = false }) {
            let department = {}
            const otherEmployeeDepartment = (d) => {
                const employeeOtherNonClosedDepartments = this.selectedEmployeeDepartments.filter(d => (this.isCheckHours || !d.isClosed))
                if (employeeOtherNonClosedDepartments.length) {
                    // if employee has other departments selected the first non-closed one
                    d = employeeOtherNonClosedDepartments[0]
                } else {
                    // if the added shift department is closed, add the first non-closed department to the new shift
                    d = this.currentEmployeeDepartments.filter(d => (this.isCheckHours || !d.isClosed))[0]
                }
                return d
            }
            if (departmentId) {
                // group by department option
                department = this.currentEmployeeDepartments.find(d => d.department_id === departmentId && (this.isCheckHours || !d.isClosed))
                if (!department) {
                    department = otherEmployeeDepartment(department)
                }
            } else {
                // suggest the selected employee default department if it exists in the app user departments set
                const suggestedEmployeeDepartment = this.currentEmployeeDepartments.find(d => d.department_id === this.selectedEmployeeDefaultDepartment.department_id && (this.isCheckHours || !d.isClosed))
                if (!suggestedEmployeeDepartment) {
                    department = this.currentEmployeeDepartments.filter(d => (this.isCheckHours || !d.isClosed))[0]
                } else {
                    // if the added shift department is closed, add the first non-closed department to the new shift
                    department = suggestedEmployeeDepartment || this.currentEmployeeDepartments.filter(d => (this.isCheckHours || !d.isClosed))[0]
                }
            }
            if (!nonProductiveSimple && this.$moment(to).shortTime() === '00:00') {
                to = this.$moment(to).subtract(1, 'minutes').longApiFormat()
            }
            this.addGridShift({ from, to, employee, department, nonProductiveSimple, frequencyRow, fromKeyboard })
        },
        newStandardShiftOnTime (day, frequencyRow) {
            this.addShift({
                employee: this.weekPlanningData[frequencyRow.account_id],
                from: day.clone().setTime('12:00').longApiFormat(),
                to: day.clone().setTime('13:00').longApiFormat(),
                frequencyRow,
            })
        },
        hideStandardShiftsColumns () {
            if (this.isStandardShifts) {
                const hideColumns = ['wab', 'deviation', 'vak', 'atv', 'tvt', 'contractType', 'contractHours']
                hideColumns.forEach(column => {
                    this.SET_COLUMN_VISIBILITY({ column, visible: false })
                })
            }
        },

        showShiftsColumns () {
            const showColumns = ['vak', 'atv', 'tvt', 'contractType', 'deviation']
            showColumns.forEach(c => {
                this.SET_COLUMN_VISIBILITY({ column: c, visible: true })
            })
        },

        departmentById (id) {
            return this.departments.find(d => d.department_id === Number(id)) || {}
        },

        employeeById (id) {
            return this.allEmployees.find(e => e.account_id === Number(id))
        },

        fitsSearchParam (employee) {
            if (this.resourceSearch === '') return true
            const fits = (str) => {
                return (str || '').toString().toLowerCase().includes(this.resourceSearch.toString().trim().toLowerCase())
            }

            const fitsShiftDepartment = (d) => {
                return Boolean(fits(d.department_name) || fits(d.department_shortname) || fits(d.department_id))
            }

            const fitsShiftIndirectTasks = (s) => {
                return s.indirect_hours?.some(it => {
                    return Boolean(fits(this.weekStoreData?.indirect_tasks?.find(t => t.id === it.indirect_task_id)?.description))
                })
            }

            const fitsDepartment = employee.departments.find(d => {
                return fits(d.department_name) || fits(d.department_shortname) || fits(d.department_id)
            })
            const fitsCompetences = employee.competences?.find(a => {
                return fits(a.competence_name)
            })

            const fitsShiftElements = employee.allShifts(this.DEPARTMENT_STATUS_HISTORY_ID)?.some(s => {
                return fits(s.start_datetime) ||
                    fits(s.end_datetime) ||
                    fits(s.break_length) ||
                    fits(s.remark) ||
                    fits(s.duration) ||
                    fitsShiftDepartment(this.departmentById(s.department_id)) ||
                    fits(s.foreign_type) ||
                    fitsShiftIndirectTasks(s)
            })

            const fitsDayRemark = employee.allRemarks(this.DEPARTMENT_STATUS_HISTORY_ID)?.some(dr => {
                return fits(dr.remark)
            })

            const fitsWabWarnings = fits(employee.wab_counters.period_threshold) || fits(employee.wab_counters.period_hours) || fits(employee.wab_counters.rounded_percentage)

            const deviation = (this.DEPARTMENT_STATUS_HISTORY_ID ? employee.deviationSentShifts : employee.deviation) || ''
            const fitsDeviation = fits(deviation) || fits(deviation.replace(/[+-]/g, ''))

            const fitsContract = fits(employee.contract?.contractHours) || fits(employee.contract?.contract_type)

            const fitsAvailability = employee.requests?.availabilities?.data?.some(a => fits(a.type))

            return fits(employee.name) ||
                fits(employee.age) ||
                fits(employee.details?.labor_cost) ||
                fits(employee.account_id) ||
                fits(employee.personnel_number) ||
                Boolean(fitsDepartment) ||
                Boolean(fitsCompetences) ||
                Boolean(fitsShiftElements) ||
                Boolean(fitsDayRemark) ||
                Boolean(fitsWabWarnings) ||
                Boolean(fitsDeviation) ||
                Boolean(fitsContract) ||
                Boolean(fitsAvailability)
        },

        async setAccountSearch () {
            const accountSearch = this.isStandardShifts && (this.$route.query.account_id || this.$route.params.account_id)
            if (isNaN(accountSearch)) {
                this.SET_RESOURCES_SEARCH('')
                return
            }
            const employee = this.weekPlanningData[accountSearch]
            if (employee) {
                this.SET_RESOURCES_SEARCH(employee.account_id)
                this.SET_STANDARD_SHIFT_EMPLOYEE(employee)
            }
        },

        /**
         * Returns if an employee has or not a department in their set
         * @param {Object} employee
         * @param {Number} departmentId
         * @returns Boolean
         */
        employeeHasDepartment (employee, departmentId) {
            return employee.departments.some(d => d.department_id === departmentId)
        },

        async updateEmployeeShift (shift) {
            const employee = this.weekPlanningData[shift.account_id]
            await employee.updateShift(shift)
        },

        async addEmployeeShift (shift) {
            const employee = this.weekPlanningData[shift.account_id]
            await employee.addShift(shift)
        },

        async removeEmployeeShift (shift) {
            const employee = this.weekPlanningData[shift.account_id]
            await employee.removeShift(shift)
        },

        async addNotAssignedShift (shift) {
            const employee = this.weekPlanningData.not_assigned
            await employee.addShift(shift)
        },

        async setEmployeeShiftsOverlapScenarios (accountId) {
            const employee = this.weekPlanningData[accountId]
            await employee.setNonPlannableMoments(this.SELECTED_DATE)
        },

        /**
         * All employees that do not have standard shifts will get a new row,
         * by default, on the Standard Shifts Page which will have => row.isNew = true.
         * When creating a standard shift on that row, we will update the isNew = false.
         * @param {Object} shift
         */
        async consolidateNewEmployeeFrequencyRow (shift) {
            const employee = this.weekPlanningData[shift.account_id]
            await employee.updateFrequencyRow({
                id: shift.frequencyId,
                account_id: shift.account_id,
                isNew: false,
            })
        },

        async removeEmployeeSubstituteRequests (shift) {
            const employee = this.weekPlanningData[shift.account_id]
            shift.pending_substitute_request = null
            shift.overlaps = this.setShiftOverlaps(shift)
            await employee.updateShift(shift)
        },

        /**
         * Returns if a shift can be transferred to other date; check on employment date or expiration of contract
         * @param {Object} payload
         * @returns Boolean
         */
        canBeTransferredToDate (shift) {
            const employee = this.weekPlanningData[shift.account_id]
            const isUnemployed = ((employee.date_of_unemployment && this.$moment(shift.start_datetime).isAfter(employee.date_of_unemployment, 'day')) ||
                (employee.details.date_of_employment && this.$moment(shift.start_datetime).isBefore(employee.details.date_of_employment, 'day')))
            const hasExpiredContract = this.hasExpiredContract(employee, this.$moment(shift.start_datetime))
            const { before, after, during } = this.shiftOverlaps(shift)
            return {
                employed: !isUnemployed || !hasExpiredContract,
                overlap: before || after || during,
            }
        },

        /**
         * Returns a color based on cla status
         * @param {String} status
         * @returns String
         */
        warningColor (rule) {
            if (rule.error) {
                return 'var(--red-100)'
            }
            if (rule.warn) {
                return 'var(--orange-100)'
            }
            return 'var(--grey-80)'
        },

        setSchedulingApiError (apiCall, error) {
            console.error(error)
            this.SET_API_ERRORS(apiCall)
        },

        employeeFilters (employee) {
            const notifications = this.employeeNotifications(employee.account_id)
            const claValidationAccess = ((!this.CAN_READ_CLA_VALIDATIONS && !this.CAN_READ_CAO_RULES) || employee.lentIn)
            let departmentIds = []
            let shifts = []
            if (!this.isStandardShifts) {
                if (this.isDayView) {
                    shifts = employee.dayShifts(this.SELECTED_DATE, this.DEPARTMENT_STATUS_HISTORY_ID, employee.groupDepartmentId)
                } else {
                    shifts = employee.allShifts(this.DEPARTMENT_STATUS_HISTORY_ID, employee.groupDepartmentId)
                }
                departmentIds = shifts.filter(s => !s.nonProductiveSimple).concat(employee.departments).map(s => s.department_id)
            } else if (employee.frequencyRows.length) {
                shifts = employee.allFrequencyRowsShifts()
                shifts.forEach(s => {
                    if (!departmentIds.includes(s.department_id)) {
                        departmentIds.push(s.department_id)
                    }
                })
            }
            const filterSettings = {
                department_ids: departmentIds,
                age_filter_key: employee.age_filter_key,
                contract_type: employee.contract?.contract_type,
                competences: employee.competences,
            }
            if (!this.isStandardShifts) {
                filterSettings.deviation = notifications.deviation
                filterSettings.pendingRequests = this.employeePendingRequests(employee.account_id)
                filterSettings.hasAvailabilityRequests = notifications.availability
                filterSettings.hasRdoRequest = notifications.rdo
                filterSettings.hasSsrRequest = notifications.ssr
                filterSettings.hasWab2Warnings = notifications.wab2
                filterSettings.hasWab3Warnings = notifications.wab3
                filterSettings.blockingCao = notifications.blockingCao
                filterSettings.blockingAtw = Math.random() < 0.25
                filterSettings.overlap = notifications.overlap.plannable || notifications.overlap.nonPlannable
                filterSettings.scheduleExceedsNorm = employee.departments.every((department) => {
                    return notifications.scheduleExceedsNorm.includes(department.department_id)
                })
                filterSettings.rm30 = notifications.rm30
                filterSettings.rm40 = notifications.rm40
                filterSettings.rm50 = notifications.rm50
                filterSettings.rm60 = employee.departments.some((department) => {
                    return notifications.rm60.includes(department.department_id)
                })
                filterSettings.rm70 = notifications.rm70.includes(employee.store_id)
                filterSettings.rm80 = Boolean(notifications.rm80.length)
                filterSettings.co80 = notifications.co80
                filterSettings.claWarnings = !claValidationAccess ? this.employeeClaValidations(employee).length : false
                if (this.isCheckHours && !employee.notAssigned) {
                    filterSettings.closeWeekNotifications = []
                    const closeWeekNotifications = this.CLOSE_WEEK_EMPLOYEES_NOTIFICATIONS(this.SELECTED_DATE)[employee.account_id]
                    if (closeWeekNotifications) {
                        filterSettings.closeWeekNotifications = closeWeekNotifications.map(n => n.rule_name)
                    }
                }
            }
            const fitsFilter = () => {
                if (this.SHOW_SENT_SCHEDULES) return true
                return (this.isStandardShifts && this.$route.query.account_id) || this.FITS_FILTERS_ON(filterSettings)
            }
            const employmentDate = this.$moment(employee.details.date_of_employment).startOf('isoWeek')
            const unemploymentDate = this.$moment(employee.details.date_of_unemployment || this.$moment().apiFormat())
            if (this.isStandardShifts) {
                if (employee.notAssigned || employee.lentIn) return false
                const hasShifts = shifts.length
                const showWithStandardShifts = () => {
                    if (!this.filters.hideEmployeesWithStandardSchedules) return true
                    return !hasShifts
                }
                const showWithoutStandardShifts = () => {
                    if (!this.filters.hideEmployeesWithoutStandardSchedules) return true
                    return hasShifts
                }
                const isEmployedToday = () => {
                    if (!employee.details.date_of_unemployment) return true
                    return unemploymentDate.apiFormat() >= this.$moment().apiFormat()
                }
                return fitsFilter() &&
                    showWithStandardShifts() &&
                    showWithoutStandardShifts() &&
                    isEmployedToday()
            } else {
                const hasOtherShiftsThanReadOnly = () => {
                    if (!this.filters.hideReadOnlyShifts) return true
                    return shifts.some(s => !s.readOnly)
                }
                const showUnassigned = () => {
                    if (!this.filters.hideNotAssignedShifts) return true
                    return !employee.notAssigned
                }
                const showWithoutSchedules = () => {
                    if (employee.notAssigned) return true
                    if (!this.filters.hideEmployeesWithoutSchedules) return true
                    return shifts.some(s => !s.nonProductive)
                }
                const showWithSchedules = () => {
                    if (employee.notAssigned) return true
                    if (!this.filters.hideEmployeesWithSchedules) return true
                    return !shifts.some(s => !s.nonProductive && !s.isNew)
                }
                const showUnassignedRow = () => {
                    if (!this.isDayView || !employee.notAssigned) return true
                    return this.isDayView && employee.notAssigned
                }
                const isEmployed = () => {
                    if (employee.notAssigned || employee.lentIn) return true
                    const employeedInWeek = employmentDate.isBeforeOrSameDayAs(this.SELECTED_DATE) && unemploymentDate.isAfterOrSameDayAs(this.SELECTED_DATE)
                    if (!this.isDayView && employeedInWeek) return true
                    return employee.isEmployed(this.SELECTED_DATE)
                }
                const showInSentShifts = () => {
                    if (!this.DEPARTMENT_STATUS_HISTORY_ID) return true
                    if (employee.notAssigned || employee.lentIn) return false
                    if (this.loading.sentSchedules || this.loading.sentDayRemarks) return false
                    const hasSentShiftsResults = employee.departmentHistorySentShifts[this.DEPARTMENT_STATUS_HISTORY_ID]
                    const hasSentRemarksResults = employee.departmentHistorySentRemarks[this.DEPARTMENT_STATUS_HISTORY_ID]
                    return hasSentShiftsResults || hasSentRemarksResults
                }
                return fitsFilter() &&
                    hasOtherShiftsThanReadOnly() &&
                    showUnassigned() &&
                    showWithoutSchedules() &&
                    showWithSchedules() &&
                    showUnassignedRow() &&
                    isEmployed() &&
                    showInSentShifts()
            }
        },

        hasCLAWarning (employee, daytime) {
            const wabWarning = employee.getWabWarnings()[daytime.apiFormat()]
            if ((this.IS_MOBILE || (this.settings.wabWarnings || employee.selected)) && wabWarning) {
                const from = this.$moment(wabWarning.from).set({ minute: 0 })
                const to = this.$moment(wabWarning.to).set({ minute: 59 })
                if (this.isDayView) {
                    return daytime.isAfterOrSameTimeAs(from) && daytime.isBeforeOrSameTimeAs(to)
                } else {
                    return daytime.isAfterOrSameDayAs(from) && daytime.isBeforeOrSameDayAs(to)
                }
            }
            return false
        },

        employeeClaValidations (employee) {
            const date = this.isDayView ? this.SELECTED_DATE : undefined
            return employee.validations.filter(validation => {
                const hasStatus = validation.error || validation.warn
                const forDay = !date || (date && (validation.validation_date === date.apiFormat() || validation.validation_date === '0000-00-00'))
                return hasStatus && forDay
            })
        },

        shiftPlannableEmployees (shift) {
            const employees = this.allPlannableEmployees().filter(e => e)
            const hasShiftDepartment = (e) => {
                return e.departments.find(d => d.department_id === shift.department_id)
            }
            const result = employees.filter(e => {
                const hasLpgu = e.details.labor_cost
                return hasShiftDepartment(e) && hasLpgu
            })
            // employees that also have wage per hour
            if (result.length) return result
            // employees that have or not wage per hour
            return employees.filter(e => hasShiftDepartment(e))
        },

        allPlannableEmployees () {
            return this.SHIFT_PLANNABLE_EMPLOYEES.map(accountId => {
                const employee = this.weekPlanningData[accountId]
                return employee
            })
        },

        customEmployeesSorting (property, employees, sortAscending) {
            let result = []
            switch (property) {
                case 'name': {
                    result = result.concat(employees.slice().sort(this.compareName))
                    break
                }
                case 'employee_first_name': {
                    result = result.concat(employees.slice().sort(this.compareFirstName))
                    break
                }
                case 'employee_last_name': {
                    result = result.concat(employees.slice().sort(this.compareLastName))
                    break
                }
                case 'startTime': {
                    let onStartTime = []
                    const employeesWithShiftsOnDate = employees.filter(e => {
                        return e.allShifts(this.DEPARTMENT_STATUS_HISTORY_ID).filter(s => this.$moment(s.start_datetime).apiFormat() === this.SELECTED_DATE.apiFormat() && !s.nonProductive).length
                    })
                    const employeesWithShiftIds = employeesWithShiftsOnDate.map(e => e.account_id)
                    const allOtherEmployees = employees.filter(e => {
                        return !employeesWithShiftIds.includes(e.account_id)
                    })
                    onStartTime = employeesWithShiftsOnDate.slice().sort(this.compareStartTime)
                    return result.concat(!sortAscending ? onStartTime.slice().reverse() : onStartTime, allOtherEmployees)
                }
                case 'lpgu': {
                    let onLpgu = []
                    const employeesWithoutLpgu = employees.filter(e => !e.details.labor_cost)
                    const employeesWithLpgu = employees.filter(e => e.details.labor_cost)
                    onLpgu = employeesWithLpgu.slice().sort(this.compareLpgu)
                    result = result.concat(onLpgu, employeesWithoutLpgu)
                    break
                }
                case 'remark': {
                    const onRemark = employees.slice().sort(this.compareRemarks)
                    result = result.concat(onRemark)
                    break
                }
                case 'contractType': {
                    const onContractType = employees.slice().sort(this.compareContractType)
                    result = result.concat(onContractType)
                    break
                }
                case 'contractHours': {
                    const onContractHours = employees.slice().sort(this.compareContractHours)
                    result = result.concat(onContractHours)
                    break
                }
                case 'plannedHours': {
                    const onPlannedHours = employees.slice().sort(this.comparePlannedHours)
                    result = result.concat(onPlannedHours)
                    break
                }
                case 'productiveHours': {
                    const onProductiveHoursHours = employees.slice().sort(this.compareProductiveHours)
                    result = result.concat(onProductiveHoursHours)
                    break
                }
                case 'nonProductiveHours': {
                    const onNonProductiveHoursHours = employees.slice().sort(this.compareNonProductiveHours)
                    result = result.concat(onNonProductiveHoursHours)
                    break
                }
                case 'employeeChecked': {
                    const onChecked = employees.slice().sort(this.compareCheckedEmployee)
                    result = result.concat(onChecked)
                    break
                }
                case 'deviation': {
                    const onDeviation = employees.slice().sort(this.compareContractDeviation)
                    result = result.concat(onDeviation)
                    break
                }
                case 'cao': {
                    const validationRanks = (e) => {
                        const validationRank = this.isDayView ? e.dailyValidationRanks[this.SELECTED_DATE.apiFormat()] : e.weekValidationRanks
                        e.rank = validationRank.rank
                        return validationRank
                    }
                    // first show sorted cao error employees
                    const errorCaoEmployees = employees.filter(e => {
                        const ranks = validationRanks(e)
                        const hasOnlyError = ranks.error && !ranks.warn
                        const hasErrorAndWarn = ranks.error && ranks.warn
                        return hasOnlyError || hasErrorAndWarn
                    })
                    // then add all cao warn sorted employees
                    const warnCaoEmployees = employees.filter(e => {
                        const ranks = validationRanks(e)
                        return ranks.warn && !ranks.error
                    })
                    // then all employees that do not have error or warn cao
                    const nonCaoEmployees = employees.filter(e => {
                        const ranks = validationRanks(e)
                        return !ranks.error && !ranks.warn
                    })
                    const onErrorCao = errorCaoEmployees.slice().sort(this.compareCao)
                    const onWarnCao = warnCaoEmployees.slice().sort(this.compareCao)
                    result = result.concat(nonCaoEmployees, onWarnCao, onErrorCao)
                    break
                }
                default: {
                    const onAllOtherColumns = employees.slice().sort((a, b) => this.compareOtherColumns(a, b, property))
                    result = result.concat(onAllOtherColumns)
                    break
                }
            }
            if (!sortAscending) {
                return result.slice().reverse()
            } else {
                return result
            }
        },

        async employeeFocus (employee) {
            const employeeDetailsElement = document.querySelector(`.planning-grid-row[data-account-id="${employee.account_id}"] .name-column`)
            if (employeeDetailsElement) {
                employeeDetailsElement.focus()
                employeeDetailsElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        },

        showDayShift (shift) {
            if (!shift.isNew || !this.groupDepartmentId || shift.lentOut) return true
            return this.groupDepartmentId
        },

        employeeDaysRemarks (employee) {
            return this.weekDays.map(day => {
                const dayRemark = { ...employee.dayRemark(day, this.DEPARTMENT_STATUS_HISTORY_ID) }
                if (!Object.keys(dayRemark).length) {
                    return {
                        account_id: employee.account_id,
                        remark: '',
                        isNew: true,
                        date: day.apiFormat(),
                    }
                }
                return dayRemark
            })
        },

        lentEmployeeInTooltip (employee) {
            const store = employee.exchangeStore
            if (store && employee.lentIn && !employee.notAssigned) {
                const translationPayload = { name: store.store_name, number: store.retail_store_number }
                return this.$t('pages.scheduling.tooltips.lentInFromStore', translationPayload)
            }
            return ''
        },

        nonPlannableMoments (day, employee) {
            if (this.SHOW_SENT_SCHEDULES) return []
            const result = []
            const dataSources = {}
            dataSources.availabilities = employee.dayAvailabilities(day)
            dataSources.approvedSSRs = employee.approvedSubstituteRequests(day)
            dataSources.rdos = employee.rdoRequestsOnDay(day)
            const startDate = this.SELECTED_DATE.clone().startOf('isoWeek')
            if (dataSources.rdos.length) {
                dataSources.rdos.forEach(rdo => {
                    result.push({
                        rdoRequest: rdo,
                        from: rdo.start_time,
                        to: rdo.end_time,
                        component: 'RdoTimeBlock',
                        id: rdo.id,
                        index: this.isDayView ? 1 : day.isoWeekday(),
                        ref: 'rdoRequest',
                    })
                })
            }
            if (dataSources.approvedSSRs.length) {
                dataSources.approvedSSRs.forEach(ssr => {
                    result.push({
                        subtituteRequest: ssr,
                        from: this.$moment(ssr.schedule_time_from).shortTime(),
                        to: this.$moment(ssr.schedule_time_to).shortTime(),
                        component: 'SubstituteRequestTimeBlock',
                        id: ssr.id,
                        ref: 'substituteRequest',
                    })
                })
            }
            if (dataSources.availabilities.length) {
                dataSources.availabilities.forEach(availability => {
                    const availabilityTimes = schedulingHelper.availabilityTimes(availability, startDate)
                    result.push({
                        availability,
                        from: availabilityTimes.from.shortTime(),
                        to: availabilityTimes.to.shortTime(),
                        component: 'AvailabilityTimeBlock',
                        id: availability.availability_id,
                        ref: 'availability',
                    })
                })
            }
            return result.sort((a, b) => a.from > b.from ? 1 : b.from > a.from ? -1 : 0)
        },

        steerInfoDayHeaderMeaning (day, departmentId) {
            const norm = this.baseTranslate('steerInformation.dataType.norm')
            const planned = this.baseTranslate('steerInformation.dataType.planned')
            const deviation = this.baseTranslate('steerInformation.dataType.deviation')
            const department = this.departmentById(departmentId)
            const departmentText = Object.keys(department).length ? ` ${this.$t('ui.singles.for')} ${department.department_name}` : ''
            const dayText = day ? ` (${this.$t('ui.singles.on')} ${day.format('dd, DD MMM')})` : ''
            return `${norm} | ${planned} | ${deviation}${departmentText}${dayText}`
        },

        /**
         * Checks if current shift is modified by the form
         * @returns {Boolean}
         */
        isShiftModified (payload) {
            const exceeds24Hours = () => {
                const from = this.$moment(payload.shift.start_datetime)
                const to = this.$moment(payload.shift.end_datetime)
                return this.$moment.duration(to.diff(from)).asMinutes() > (24 * 60)
            }
            if (!payload.shift) return false
            if (exceeds24Hours()) return false
            const differentFrom = this.$moment(payload.shift.start_datetime).longApiFormat() !== this.$moment(payload.backupShift.start_datetime).longApiFormat()
            const differentTo = this.$moment(payload.shift.end_datetime).longApiFormat() !== this.$moment(payload.backupShift.end_datetime).longApiFormat()
            if (payload.shift.duration) {
                const duration = this.$moment.duration(payload.shift.duration).asMinutes()
                // when shift starts at 23:45 and ends at 23:59,
                // we will allow 14 minutes shift.
                // All other times have validations that
                // do not allow for 14 minutes shift durations
                if (duration < 14) {
                    return false
                }
            }
            if (payload.shift.nonProductive) {
                const differentDuration = payload.shift.duration !== payload.backupShift.duration
                const hasForeignType = payload.shift.foreign_type
                const hasEmployee = payload.skipEmployeeCheck || (payload.isNewFromGrid || (!payload.isNewFromGrid && payload.selectedEmployee.account_id))
                const differentNonProductive = payload.shift.type !== payload.backupShift.type || payload.shift.foreign_type !== payload.backupShift.foreign_type
                return hasForeignType && hasEmployee && (differentDuration || differentNonProductive)
            }
            if (!payload.skipDepartmentCheck && (!payload.selectedDepartment || !Object.keys(payload.selectedDepartment).length)) return false
            if (payload.shift.isNew) return true
            const differentTimes = differentFrom || differentTo
            const differentBreak = payload.backupShift.breaks[0] && payload.shift.breaks[0].duration !== payload.backupShift.breaks[0].duration
            const differentDepartment = payload.shift.department_id !== payload.backupShift.department_id
            const differentRemark = payload.shift.remark !== payload.backupShift.remark
            const differentStore = payload.shift.exchange_store_id !== payload.backupShift.exchange_store_id
            const differentAccount = payload.shift.account_id !== payload.backupShift.account_id
            return differentTimes || differentBreak || differentDepartment || differentAccount || differentRemark || differentStore
        },

        setShiftOverlaps (shift) {
            if (this.isStandardShifts || shift.lentOut || shift.lentIn) {
                return schedulingHelper.newOverlapScenario()
            }
            const day = this.$moment(shift.start_datetime)
            const employee = this.weekPlanningData[shift.account_id]
            return schedulingHelper.shiftOverlapsNonPlannableMoments(shift, {
                rdos: employee.rdoRequests,
                availabilities: employee.availabilities,
                storeAvailability: employee.storeAvailability,
                substituteRequests: employee.approvedSubstituteRequests(day),
            })
        },

        /**
         * Determines if the shift is in the current week or a past week.
         * @returns {Boolean}
         */
        isCurrentShift (shift) {
            return this.$moment(shift.end_datetime).isoWeek() <= this.$moment().isoWeek()
        },

        /**
         * Determines if rights to edit breaks are in place,
         * based on the isCurrentShift method and permissions
         * @returns {Boolean}
         */
        canEditBreaks (shift) {
            if (this.isStandardShifts) return true
            if (this.isCurrentShift(shift)) {
                return this.CAN_EDIT_SHIFT_BREAKS.current.all || this.CAN_EDIT_SHIFT_BREAKS.current.only_increase
            } else {
                return this.CAN_EDIT_SHIFT_BREAKS.future.all || this.CAN_EDIT_SHIFT_BREAKS.future.only_increase
            }
        },

        /**
         * Determines if the shift breaks can only be increased in duration,
         * based on current permissions.
         * @returns {Boolean}
         */
        onlyBreakIncreaseAllowed (shift) {
            if (this.isStandardShifts) return false
            if (this.isCurrentShift(shift)) {
                return this.CAN_EDIT_SHIFT_BREAKS.current.only_increase
            } else {
                return this.CAN_EDIT_SHIFT_BREAKS.future.only_increase
            }
        },

        breaksTooltip (shift) {
            if (this.canEditBreaks(shift)) return ''
            if (this.isCurrentShift(shift)) return this.baseTranslate('tooltips.cannotEditCurrentBreaks')
            return this.baseTranslate('tooltips.cannotEditFutureBreaks')
        },

        minBreaksValue (shift) {
            if (this.canEditBreaks(shift) && this.onlyBreakIncreaseAllowed(shift)) {
                if (!this.BREAK_SUGGESTIONS.length) {
                    return shift.breaks[0].duration
                }
                const employee = this.weekPlanningData[shift.account_id]
                const newBreakSuggestion = this.BREAK_SUGGESTION(
                    this.$moment(shift.start_datetime),
                    this.$moment(shift.end_datetime),
                    employee?.age || 18,
                ) || shift.breaks[0]
                return newBreakSuggestion.duration
            }
            return '00:00'
        },

        deleteShiftFromKeyboard () {
            const shiftElement = document.activeElement
            if (!shiftElement || !shiftElement.classList.contains('planning-shift')) return
            const employee = this.weekPlanningData[shiftElement.dataset.accountId]
            const shift = employee.shifts.find(s => s.shift_id === +shiftElement.dataset.shiftId)
            if (shift) {
                if (!shift.lentIn && !shift.readOnly) {
                    this.deleteShiftBlock(shift, employee)
                } else {
                    let snackbarMessage = ''
                    if (shift.lentIn) {
                        snackbarMessage = this.baseTranslate('copyPaste.errors.lentIn')
                    } else if (shift.readOnly) {
                        snackbarMessage = this.baseTranslate('copyPaste.errors.readOnly')
                    }
                    this.SET_SNACKBAR({ message: snackbarMessage, warning: true })
                }
            }
        },

        copyShift (shift) {
            if (shift || this.hasActiveShift()) {
                const shiftDataset = shift ? { accountId: shift.account_id } : document.activeElement.dataset
                const employee = this.weekPlanningData[shiftDataset.accountId]
                const shiftToCopy = () => {
                    if (shift) return shift
                    const findShift = (s) => s.guid === Number(shiftDataset.shiftGuid)
                    if (this.isStandard) {
                        return employee.allFrequencyRowsShifts().find(findShift)
                    } else {
                        return employee.allShifts().find(findShift)
                    }
                }
                const copy = shiftToCopy()
                const disableNonProductiveOnDayView = this.isDayView && copy.nonProductive
                if (copy && !disableNonProductiveOnDayView) {
                    if (!copy.exchange_store_id) {
                        this.STORE_COPIED_SHIFT(copy)
                    } else {
                        this.SET_SNACKBAR({ message: this.baseTranslate('copyPaste.errors.lentOut'), warning: true })
                    }
                }
            }
        },
        async pasteShift (dayTime) {
            if (this.isDayView) {
                const selectedCell = document.querySelector('.selected-cell')
                if (selectedCell) {
                    const cellTime = selectedCell.dataset.dateTime
                    dayTime = this.$moment(cellTime)
                } else {
                    dayTime = null
                }
            } else if (!dayTime) {
                dayTime = this.SELECTED_DATE
            }
            const now = new Date()
            if ((now - lastTimePasted) < 200 || this.hasActiveShift()) return
            lastTimePasted = now

            let employee = {}
            if (this.COPIED_SHIFT) {
                employee = this.weekPlanningData[this.COPIED_SHIFT.account_id]
                if (this.selectedGridAccount().account_id !== this.COPIED_SHIFT.account_id) {
                    employee = this.selectedGridAccount()
                }
            }

            if (!this.COPIED_SHIFT || this.weekIsClosed || this.departmentStatus(this.COPIED_SHIFT.department_id).isClosed || employee.readOnly) {
                let snackbarMessage = ''
                if (!this.COPIED_SHIFT) {
                    snackbarMessage = this.baseTranslate('copyPaste.errors.notCopied')
                } else if (this.weekIsClosed) {
                    snackbarMessage = this.baseTranslate('copyPaste.errors.weekClosed')
                } else if (this.departmentStatus(this.COPIED_SHIFT.department_id).isClosed) {
                    snackbarMessage = this.baseTranslate('copyPaste.errors.departmentClosed')
                } else if (employee.readOnly) {
                    snackbarMessage = this.baseTranslate('copyPaste.errors.readOnly')
                }
                this.SET_SNACKBAR({ message: snackbarMessage, warning: true })
                return
            }
            const shiftToPaste = {
                employee,
                department: this.departments.find(d => d.department_id === this.COPIED_SHIFT.department_id),
                nonProductiveSimple: this.COPIED_SHIFT.nonProductive,
                frequencyRow: this.employeeFrequencyRowById(employee.account_id, this.SELECTED_STANDARD_SHIFTS_ROW) || undefined,
                copied: true,
                type: this.COPIED_SHIFT.type,
                duration: this.COPIED_SHIFT.duration,
                breaks: this.COPIED_SHIFT.breaks,
            }
            const shiftFrom = this.$moment(this.COPIED_SHIFT.start_datetime)
            const shiftTo = this.$moment(this.COPIED_SHIFT.end_datetime)
            if (!this.isDayView) {
                shiftToPaste.from = shiftFrom.isoWeekYear(dayTime.isoWeekYear()).isoWeek(dayTime.isoWeek()).isoWeekday(dayTime.isoWeekday()).longApiFormat()
                shiftToPaste.to = shiftTo.isoWeekYear(dayTime.isoWeekYear()).isoWeek(dayTime.isoWeek()).isoWeekday(dayTime.isoWeekday()).longApiFormat()
            } else {
                // Logic for day view to change the startTime and endTime based on hovered cell
                const duration = this.$moment.duration(shiftTo.diff(shiftFrom, 'minutes'), 'minutes').asMinutes()
                shiftToPaste.from = (dayTime || shiftFrom).longApiFormat()
                shiftToPaste.to = this.$moment(shiftToPaste.from).add(duration, 'minutes').longApiFormat()
            }
            await this.addGridShift(shiftToPaste)
        },

        departmentSelectOptions ({ selectedDepartment, selectedStore, shift }) {
            let employeeDepartments = []
            const lentOut = shift.exchange_store_id && shift.store_id === this.currentStore.id
            const isStandard = this.isStandardShifts || Boolean(this.$route.meta.standard_shifts_account_id)
            if (lentOut) {
                // in case we have a lend out situation we return the exchange store departments
                employeeDepartments = selectedStore.departments || []
            } else {
                if (shift.notAssigned || !this.selectedGridAccount()) {
                    employeeDepartments = this.currentEmployeeDepartments
                } else {
                    const selectedEmployeeDepartments = this.currentEmployeeDepartments.filter(d => {
                        return this.selectedGridAccount().departments.find(e => e.department_id === d.department_id)
                    })
                    if (isStandard) {
                        const employee = this.weekPlanningData[shift.account_id]
                        const frequencyRow = employee.frequencyRows.find(r => r.id === shift.frequencyId)
                        if (!frequencyRow) return selectedEmployeeDepartments
                        const payload = {
                            date: frequencyRow.from,
                            account_id: this.selectedGridAccount().account_id,
                        }
                        employeeDepartments = this.EMPLOYEE_DEPARTMENTS(payload)
                    } else {
                        const otherUserDepartments = this.currentEmployeeDepartments.filter(d => {
                            return !this.selectedGridAccount().departments.find(e => e.department_id === d.department_id)
                        })
                        employeeDepartments = selectedEmployeeDepartments.concat(otherUserDepartments)
                    }
                }
            }
            return employeeDepartments.map(department => {
                return {
                    label: department.department_name,
                    subTitle: this.departmentSubTitle(department, selectedStore, shift),
                    key: department.department_id,
                    selected: selectedDepartment.department_id === department.department_id,
                    value: department,
                    disabled: !this.isCheckHours && this.departmentStatus(department.department_id).isClosed,
                    hidden: false,
                    simple: true,
                }
            })
        },

        departmentSubTitle (department, store, shift) {
            const lentOut = shift.exchange_store_id && shift.store_id === this.currentStore.id
            const employee = this.weekPlanningData[shift.account_id]
            const employeeHasDepartment = () => {
                if (shift.notAssigned || !employee) {
                    return this.currentEmployeeDepartments
                }
                return employee.departments.find(e => e.department_id === department.department_id)
            }
            const status = this.departmentStatus(department.department_id)
            if (status.isClosed) {
                return `${this.departmentStatusTranslation(status)} - ${this.departmentStatusChanged(status)}`
            } else if (!employeeHasDepartment() && !lentOut && !shift.notAssigned) {
                const name = employee.details.employee_first_name
                return !this.isStandardShifts
                    ? this.baseTranslate('shiftPopover.outsideEmployeeDepartments', { name })
                    : this.baseTranslate('shiftPopover.outsideEmployeeDepartmentsStandard', { name })
            } else if (lentOut) {
                return store.store_name
            }
        },

        shiftStore (shift) {
            const store = this.shiftExchangeStore(shift)
            return store || {
                ...this.currentStore,
                store_name: this.currentStore.name,
                retail_store_number: this.currentStore.storeNumber.toString(),
            }
        },

        /**
         * List of bookable hour types for the bookable hour types select component
         * @return {Array}
         */
        bookableHourTypesOptions (selectedBookableHour, categories = ['non_productive']) {
            if (!this.bookableHourTypes) return []
            const isStandard = this.isStandardShifts || Boolean(this.$route.meta.standard_shifts_account_id)
            const source = Object.keys(this.bookableHourTypes).filter(key => {
                // return only bookable hours that have at least one editable foreign option
                if (!categories.includes(this.bookableHourTypes[key].category)) return false
                return this.bookableHourTypes[key].foreign_options
                    .filter(f => f.editable && (!isStandard || (isStandard && f.add_from_standard))).length
            })
            return source.map(hourType => this.bookableHourTypeMapper(this.bookableHourTypes[hourType], selectedBookableHour))
        },

        bookableHourTypeMapper (item, selectedBookableHour) {
            return {
                label: item.type,
                subTitle: item.local_description,
                key: item.type,
                selected: selectedBookableHour.type === item.type,
                value: item,
                disabled: false,
                hidden: false,
                simple: true,
            }
        },

        bookableHourForeignTypeOptions (selectedBookableHour, selectedBookableHourForeignType, categories = ['non_productive']) {
            if (selectedBookableHour.type) {
                return selectedBookableHour.foreign_options.map(item => this.bookableHourForeignTypeMapper(item, selectedBookableHour))
            }
            if (!this.bookableHourForeignTypes) return []
            return Object.keys(this.bookableHourForeignTypes)
                .filter(key => categories.includes(this.bookableHourForeignTypes[key].category))
                .map(hourType => {
                    const item = this.bookableHourForeignTypes[hourType]
                    return this.bookableHourForeignTypeMapper(item, selectedBookableHourForeignType)
                })
        },

        bookableHourForeignTypeMapper (item, selectedBookableHourForeignType) {
            return {
                label: item.foreign_type,
                subTitle: item.foreign_description,
                key: item.type,
                selected: selectedBookableHourForeignType.foreign_type === item.foreign_type,
                value: item,
                disabled: !item.editable,
                hidden: false,
            }
        },

        disabledHourType (bookableHourType) {
            // for now no rules for disabling a bookable hour type are available
            // F hour type should be disabled for F type non productive shifts with start and end times
            // non productive shifts with start and end times arer currently not supported in the code
            return false
        },

        bookableHourTypeLabel (bookableHourType) {
            const isDisabledLabel = this.disabledHourType(bookableHourType) ? this.baseTranslate('shiftPopover.nonProductive.onlyAvailableWithDuration') : ''
            return `${bookableHourType.local_description} ${isDisabledLabel}`
        },

        unrelatedDepartmentFilter (shift, employee) {
            if (!this.settings.hideUnrelatedDepartmentShifts) return true
            let hasDepartment = false
            if (this.filters.groupByDepartment) {
                hasDepartment = shift.department_id === this.groupDepartmentId
            } else if (this.filters.departments.length) {
                hasDepartment = this.filters.departments.includes(shift.department_id)
            }
            return shift.nonProductive || hasDepartment || employee.selected
        },

        employeeDayShifts (employee, day, groupDepartmentId) {
            return employee.dayShifts(day, this.DEPARTMENT_STATUS_HISTORY_ID, groupDepartmentId).filter(s => this.unrelatedDepartmentFilter(s, employee))
        },

        employeeTotalHours (employee, isStandard, frequencyRow) {
            if (isStandard) {
                const frequencyRowMinutes = employee.getStandardMinutes(frequencyRow.id)
                return this.$moment.duration({ minutes: frequencyRowMinutes.total }).format('HH:mm')
            }
            if (this.SHOW_SENT_SCHEDULES) {
                return employee.totalPlannedHoursSentShifts || '00:00'
            }
            return employee.totalPlannedHours || '00:00'
        },
        employeeTotalProductiveHours (employee, isStandard, frequencyRow) {
            if (isStandard) {
                const frequencyRowMinutes = employee.getStandardMinutes(frequencyRow.id)
                return this.$moment.duration({ minutes: frequencyRowMinutes.productive }).format('HH:mm')
            }
            if (this.SHOW_SENT_SCHEDULES) {
                return employee.plannedHoursSentShifts || '00:00'
            }
            return employee.plannedHours || '00:00'
        },
        employeeTotalNonProductiveHours (employee, isStandard, frequencyRow) {
            if (isStandard) {
                const frequencyRowMinutes = employee.getStandardMinutes(frequencyRow.id)
                return this.$moment.duration({ minutes: frequencyRowMinutes.nonProductive }).format('HH:mm')
            }
            if (this.SHOW_SENT_SCHEDULES) {
                return employee.plannedHoursNonProductiveSentShifts || '00:00'
            }
            return employee.plannedHoursNonProductive || '00:00'
        },

        employeePlannedHours (employee) {
            const minutes = this.SHOW_SENT_SCHEDULES
                ? employee.plannedMinutesDayTotalsSentShifts(this.SELECTED_DATE, this.DEPARTMENT_STATUS_HISTORY_ID)
                : employee.plannedMinutesDayTotals(this.SELECTED_DATE)
            return this.$moment.duration({ minutes }).format('HH:mm')
        },

        wabWarningInfoTooltip (employee, showTitle, date) {
            const wabWarning = employee.wabWarnings[date.apiFormat()]
            const from = `${wabWarning.from.format('dd DD MMM')} ${wabWarning.from.shortTime()}`
            const to = `${wabWarning.to.format('dd DD MMM')} ${wabWarning.to.shortTime()}`
            return (showTitle ? this.baseTranslate('warnings.extraPayout') : '') +
                `<div>${this.baseTranslate('warnings.extraPayoutInfo')}:</div>` +
                `<div>${this.$t('ui.singles.from')}: ${from}</div>` +
                `<div>${this.$t('ui.singles.to')}: ${to}</div>`
        },

        isUnemployed (employee, day) {
            if ((employee.details.date_of_employment && day.isBefore(employee.details.date_of_employment)) ||
                (employee.details.date_of_unemployment && day.isAfter(employee.details.date_of_unemployment))) {
                return true
            }
            return false
        },

        employeeDetailsTooltipContent (employee, detail) {
            if (detail === 'age') {
                return this.$t('ui.singles.age')
            }
            if (detail === 'contractHours' && employee.contract?.use_minmax) {
                return this.$t(`pages.scheduling.resourceColumns.${detail}.label`) + ' (min/max)'
            }
            return this.$t(`pages.scheduling.resourceColumns.${detail}.label`)
        },

        showEmployeeWabCounter (employee) {
            if (this.isStandardShifts || this.SHOW_SENT_SCHEDULES) return false
            const wab = employee.wab_counters
            return wab && wab.period_threshold
        },

        async navigateToMobileAccountPage (employee) {
            const query = { selected_account: employee.account_id }
            await this.$router.push({ name: 'mobile-planning', params: { ...this.$route.params }, query }).catch(() => { })
            return true
        },

        /**
         * Returns a list of employees on the provided department ID
         * @param {Number} departmentId
         * @returns {Array} array
         */
        departmentSortedEmployeesWithShifts (employees, departmentId) {
            return employees.filter(employee => {
                if (employee.lentIn) {
                    let hasDepartmentShifts = false
                    for (let i = 0; i < employee.shifts.length; i++) {
                        if (employee.shifts[i].department_id === departmentId) {
                            hasDepartmentShifts = true
                            break
                        }
                    }
                    return hasDepartmentShifts
                }
                employee.groupDepartmentId = departmentId
                const hasDepartment = employee.departments.some(dep => dep.department_id === departmentId)
                const hasShifts = employee.shifts.some(s => s.department_id === departmentId)
                return employee.notAssigned || hasDepartment || hasShifts
            })
        },

        variableToHexcode (variable) {
            return getComputedStyle(document.body).getPropertyValue(variable).trim()
        },

        /**
         * List of employees that are sorted from the ResourceHeaderColumns
         */
        async sortedEmployeesWithShifts () {
            const { name, sortBy, sortAscending } = this.SORTED_COLUMN
            const employees = this.filteredEmployeesWithShifts()
            // when sorted on start-time in week view we show employees sorted by name,
            // because there is no good way to sort on start-time on all shifts of the week
            if ((name === 'name' || (!this.isDayView && name === 'startTime')) && sortAscending && sortBy) {
                // employees are sorted ascending by default
                return employees
            }
            if (sortBy) {
                const actualEmployees = employees.filter(e => !e.notAssigned && !e.lentIn)
                const notAssignedOrLentInEmployees = employees.filter(e => e.notAssigned || e.lentIn)
                const result = this.customEmployeesSorting(name, actualEmployees, sortAscending)
                return notAssignedOrLentInEmployees.concat(result)
            }
            return employees
        },

        /**
         * Returns a list of employees, filtered based on pages filters and resource search
         * @returns {Array}
         */
        filteredEmployeesWithShifts () {
            return Object.keys(this.weekPlanningData).filter(accountId => {
                const employee = this.weekPlanningData[accountId]
                const showNotAssigned = !this.isCheckHours && !this.SHOW_SENT_SCHEDULES
                const routeAccount = this.$route.query.account_id
                const isRouteAccount = !routeAccount || (routeAccount && Number(routeAccount) === employee.account_id)
                return isRouteAccount && this.fitsSearchParam(employee) && this.employeeFilters(employee) && (showNotAssigned || (!showNotAssigned && !employee.notAssigned))
            })
        },

        hasExpiredContract (employee, day) {
            if (this.isStandard || this.ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING) return false
            employee.hasExpiredContract(day)
        },

        shiftDepartment (shift) {
            let departments = this.departments
            if (shift.exchange_store_id) {
                departments = this.weekStoreData?.all_departments || this.departments
            }
            return departments.find(d => d.department_id === shift.department_id) || schedulingHelper.unknownDepartment()
        },

        shiftOutsideDepartmentsFilter (shift, planningStandardShifts) {
            if ((this.isStandardShifts && this.$route.query.account_id) || planningStandardShifts) return false
            return !shift.nonProductiveSimple && this.filters.departments.length && !this.filters.departments.includes(this.shiftDepartment(shift).department_id)
        },

        shiftOutsideDepartmentGroup (shift, groupDepartmentId) {
            const differentFromGroupingDepartment = groupDepartmentId && groupDepartmentId !== shift.department_id && !shift.nonProductive
            const differentFromSentDepartment = this.SHOW_SENT_SCHEDULES && this.SENT_SCHEDULES_DEPARTMENT_ID !== shift.department_id
            if (shift.isNew) return false
            return differentFromGroupingDepartment || differentFromSentDepartment
        },

        shiftColor (shift, groupDepartmentId, planningStandardShifts) {
            const grey = this.variableToHexcode('--grey-80')
            if (shift.lentIn || shift.exchange_store_id || shift.nonProductive) return grey
            const accessToDepartment = this.currentEmployeeDepartments.find(d => d.department_id === shift.department_id)
            if (this.shiftOutsideDepartmentsFilter(shift, planningStandardShifts) || this.shiftOutsideDepartmentGroup(shift, groupDepartmentId) || !accessToDepartment) {
                return grey
            }
            if (this.shiftDepartment(shift) && !shift.exchange_store_id && !shift.lentIn && !shift.nonProductive) {
                return this.shiftDepartment(shift).color
            }
            return grey
        },

        shiftStyle (shift, groupDepartmentId, planningStandardShifts) {
            const color = this.shiftColor(shift, groupDepartmentId, planningStandardShifts)
            const contrastColor = this.$helpers.getContrastColorFromHex(color, this.variableToHexcode('--grey-140'))
            const nonProductiveBackground = this.$helpers.transparentize(this.variableToHexcode('--grey-100'), 10)
            const outsideFilters = this.shiftOutsideDepartmentsFilter(shift) || this.shiftOutsideDepartmentGroup(shift, groupDepartmentId)
            return {
                '--department-color': color,
                '--secondary-department-color': this.$helpers.transparentize(color, 7),
                '--ternary-department-color': this.$helpers.transparentize(color, 10),
                '--text-color': outsideFilters || shift.lentIn || shift.lentOut || shift.nonProductive ? 'white' : contrastColor,
                '--non-productive-background-color': `${nonProductiveBackground}`,
                '--shift-border': this.$helpers.transparentize(color, 35),
                '--opacity': outsideFilters ? '0.7' : '1',
            }
        },

        shiftOverlapsBusinessTimes (shift) {
            if (this.isStandardShifts || this.SHOW_SENT_SCHEDULES) return false
            return shift.overlaps?.businessTimes?.from || shift.overlaps?.businessTimes?.to
        },

        shiftOverlapsNonAvailability (shift) {
            if (this.isStandardShifts || this.SHOW_SENT_SCHEDULES) return false
            return shift.overlaps?.availability?.some
        },

        defaultWeekStatusOnDate (date) {
            const draft = { status: 'draft' }
            const closed = { status: 'closed' }
            const data = !this.isSteerinformationPage ? this.weekStoreData?.week_statuses : this.weekStatuses
            const firstStatus = data?.[0]
            if (firstStatus) {
                const firstStatusDate = this.$moment()
                    .isoWeekYear(firstStatus.year)
                    .isoWeek(firstStatus.week)
                if (date.isBefore(firstStatusDate, 'week')) {
                    return closed
                } else {
                    return draft
                }
            }
            return draft
        },

        weekStatusOnDate (date) {
            const data = !this.isSteerinformationPage ? this.weekStoreData?.week_statuses : this.weekStatuses
            return data?.find(ws => {
                const sameWeek = ws.week === date.isoWeek()
                const sameYear = ws.year === date.isoWeekYear()
                return sameWeek && sameYear
            }) || this.defaultWeekStatusOnDate(date)
        },

        selectEmployeeRowAndFrequency (employee, frequencyRow) {
            if (this.isStandard && frequencyRow) {
                this.SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(frequencyRow.id)
            }
        },

        selectedGridAccount () {
            let query = '.planning-grid-row.selected'
            if (this.isCheckHours) {
                query = '.employee-shifts-and-details.selected'
            }
            const selectedRow = document.querySelector(query)
            if (selectedRow) {
                const employee = this.weekPlanningData[selectedRow.dataset.accountId]
                return employee
            }
        },

        async filterPlanningRows (val) {
            await this.$nextTick()
            const query = this.isCheckHours ? '.check-hours-employee-row' : '.planning-grid-row:not(.header)'
            const employeeRows = [...document.querySelectorAll(query)]
            employeeRows.forEach(row => {
                const { accountId } = row.dataset
                const employee = this.weekPlanningData[accountId]
                if (employee) {
                    if (typeof val === 'boolean') {
                        if (val) {
                            row.classList.remove('hidden')
                        } else {
                            row.classList.add('hidden')
                        }
                    } else if (this.fitsSearchParam(employee) && this.employeeFilters(employee)) {
                        row.classList.remove('hidden')
                    } else {
                        row.classList.add('hidden')
                    }
                }
            })
            const visibleRows = [...document.querySelectorAll('.planning-grid-row:not(.header):not(.hidden)')]
            visibleRows.forEach((row, index) => {
                // This is needed for displaying the dragging label for the first row
                // underneath the shift, for the first employee in the planning rows,
                // either grouped on employees or departments
                row.dataset.accountIndex = index
            })
            return visibleRows
        },

        shiftIsOutsideDepartmentsFilter (shift) {
            if (shift.nonProductive) return false
            return Boolean(this.filters.departments.length) && !this.filters.departments.includes(shift.department_id)
        },

        shiftPendingSubstituteRequest (shift) {
            if (!shift || !Object.keys(shift.pending_substitute_request || {}).length) return null
            return shift.pending_substitute_request
        },

        showHideUnrelatedDepartmentShiftElements (shiftElements = [], selectedAccountId) {
            const hide = this.settings.hideUnrelatedDepartmentShifts
            shiftElements.forEach(shift => {
                const dataset = shift.dataset
                if (dataset.nonProductive === 'true') return
                if (!hide) {
                    shift.style.display = 'block'
                    return
                }
                const isRowSelected = selectedAccountId === Number(dataset.accountId)
                if (hide && isRowSelected) {
                    shift.style.display = 'block'
                    return
                }
                if (hide && ((this.filters.departments.includes(Number(dataset.departmentId)) || (this.filters.groupByDepartment && Number(dataset.departmentId) === Number(dataset.groupDepartmentId))))) {
                    shift.style.display = 'block'
                    return
                }
                shift.style.display = 'none'
            })
        },

        publicHolidaysOnDay (day) {
            const { year, month } = day.dayMonthYearObject()
            const dayHoliday = this.weekStoreData?.public_holidays?.find(holiday => {
                return holiday.day === day.date() && holiday.month === month && (holiday.year === year || holiday.year === null)
            })
            return dayHoliday ? dayHoliday.name : null
        },

        updateSurchargeType (surcharge, employee, event) {
            employee.updateSurcharge({
                ...surcharge,
                type: event.selectedType.type,
                foreign_type: event.selectedForeignType.foreign_type,
            })
        },
        updateSurchargeLength (surcharge, employee, event) {
            employee.updateSurcharge({
                ...surcharge,
                length: event,
            })
        },

        downloadExcel () {
            const department_id = this.currentEmployeeDepartments.map(d => d.department_id).join('_')
            this.downloadExcelPlanning({ date: this.SELECTED_DATE, department_id })
        },

        shiftHasOverlap (shift, includeBusinessTimes = false, includeShift = true) {
            const {
                availability: { some: a },
                rdo: { pending: b, approved: c },
                substituteRequests: { approved: d },
                businessTimes: { from: e, to: f },
            } = shift.overlaps
            const { before: g, during: h, after: i } = this.shiftOverlaps(shift)
            return a | b | c | d | (includeBusinessTimes && (e | f)) | (includeShift && (g | h | i))
        },

        shiftHasNonPlannableOverlap (shift, includeBusinessTimes = false) {
            const {
                availability: { some: a },
                rdo: { pending: b, approved: c },
                substituteRequests: { approved: d },
            } = shift.overlaps
            return a | b | c | d
        },

        employeeTimesHaveWabWarning (employee, { from, to }) {
            if (this.isStandard) return false
            const start = this.$moment(from)
            const end = this.$moment(to).subtract(15, 'minutes')
            const wabWarning = employee.wabWarnings[start.apiFormat()]
            if (!this.isStandard && wabWarning) {
                const startHasWabWarning = start.isAfterOrSameTimeAs(wabWarning.from) && start.isBeforeOrSameTimeAs(wabWarning.to)
                const endHasWabWarning = end.isAfterOrSameTimeAs(wabWarning.from) && end.isBeforeOrSameTimeAs(wabWarning.to)
                if (startHasWabWarning || endHasWabWarning) {
                    return true
                } else {
                    return false
                }
            }
        },

        hasActiveShift () {
            return document.activeElement.classList.contains('planning-shift')
        },

        shiftDuration (shift) {
            const from = this.$moment(shift.start_datetime)
            const to = this.$moment(shift.end_datetime)
            let breaksDuration = 0
            shift.breaks?.forEach(br => {
                breaksDuration += this.$moment.duration(br.duration).asMinutes()
            })
            return this.$moment.duration(to.diff(from)).subtract(breaksDuration, 'minutes')
        },

    },
}
