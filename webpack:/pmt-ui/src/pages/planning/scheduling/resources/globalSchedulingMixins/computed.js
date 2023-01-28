import { mapGetters, mapState } from 'vuex'
export default {
    computed: {
        ...mapGetters(['APPLIED_FILTERS_COUNT']),
        ...mapGetters('account', ['employees', 'CURRENT_EMPLOYEE']),
        ...mapGetters(['IS_MOBILE', 'FITS_FILTERS_ON', 'PAGE_SIZE', 'PAGE_WIDTH', 'IS_PRINTING', 'PAGE_HEIGHT', 'CRITICAL_API_FAILS']),
        ...mapGetters('stores', ['currentStore', 'storeWeekBusinessTimes', 'weekdaysBusinessTimes']),
        ...mapGetters('scheduling', {
            WEEK_STEER_INFO: 'WEEK_STEER_INFO',
            ACTIVE_EVENT: 'ACTIVE_EVENT',
            SORTED_COLUMN: 'SORTED_COLUMN',
            DEFAULT_RESOURCES_WIDTH: 'DEFAULT_RESOURCES_WIDTH',
            WEEK_STATUS: 'WEEK_STATUS',
            EXPANDED_WIDTH_FROM_VISIBLE_COLUMNS: 'EXPANDED_WIDTH_FROM_VISIBLE_COLUMNS',
            ALWAYS_VISIBLE_COLUMNS: 'ALWAYS_VISIBLE_COLUMNS',
            VISIBLE_COLUMNS: 'VISIBLE_COLUMNS',
            ALL_COLUMNS: 'ALL_COLUMNS',
            HOVERED_TIMEBLOCK: 'HOVERED_TIMEBLOCK',
            WEEK_PERIOD: 'WEEK_PERIOD',
            DEFAULT_TOTALS_WIDTH: 'DEFAULT_TOTALS_WIDTH',
            WEEK_BOOKABLE_HOUR_TYPES: 'WEEK_BOOKABLE_HOUR_TYPES',
            WEEK_BOOKABLE_HOUR_TYPE_FOREIGN_OPTIONS: 'WEEK_BOOKABLE_HOUR_TYPE_FOREIGN_OPTIONS',
            EMPLOYEES_EXPANDED: 'EMPLOYEES_EXPANDED',
            WEEK_IS_LOADING: 'WEEK_IS_LOADING',
            ASSESS_SSR_SHIFT: 'ASSESS_SSR_SHIFT',
            SCHEDULING_WORKLOAD_DATA: 'SCHEDULING_WORKLOAD_DATA',
            DIRTY_GRID: 'DIRTY_GRID',
            WEEK_DETAILS: 'WEEK_DETAILS',
            SCHEDULING_NOTIFICATIONS: 'SCHEDULING_NOTIFICATIONS',
            SCHEDULING_NOTIFICATION: 'SCHEDULING_NOTIFICATION',
            SCHEDULING_NOTIFICATIONS_TYPES: 'SCHEDULING_NOTIFICATIONS_TYPES',
            EXPANDED_PANELS: 'EXPANDED_PANELS',
            APPLIED_SETTINGS_COUNT: 'APPLIED_SETTINGS_COUNT',
            SELECTED_STANDARD_SHIFTS_ROW: 'SELECTED_STANDARD_SHIFTS_ROW',
            LAST_FINALIZED_DEPARTMENT_DATE: 'LAST_FINALIZED_DEPARTMENT_DATE',
            PRINT_DATE: 'PRINT_DATE',
            PRINT_VIEW: 'PRINT_VIEW',
            CLA_WARNING_POPOVER: 'CLA_WARNING_POPOVER',
        }),
        ...mapGetters('auth', {
            user: 'user',
            // All ones below are from the permissionGetters
            canFetchStoreSchedules: 'canFetchStoreSchedules',
            canViewOthersContractData: 'canViewOthersContractData',
            CAN_EDIT_NON_PRODUCTIVE: 'CAN_EDIT_NON_PRODUCTIVE',
            CAN_EXCHANGE_TO_OTHER_STORES: 'CAN_EXCHANGE_TO_OTHER_STORES',
            CAN_MANAGE_REMARKS: 'CAN_MANAGE_REMARKS',
            CAN_READ_REMARKS: 'CAN_READ_REMARKS',
            CAN_EDIT_SHIFT_BREAKS: 'CAN_EDIT_SHIFT_BREAKS',
            CAN_PLAN_OTHERS: 'canPlanOthers',
            CAN_EDIT_OWN_PLANNING: 'CAN_EDIT_OWN_PLANNING',
            WAGE_PER_HOUR_READ: 'WAGE_PER_HOUR_READ',
            CAN_VIEW_REMARKS: 'CAN_VIEW_REMARKS',
            CAN_VIEW_OTHERS_AVAILABILITIES: 'CAN_VIEW_OTHERS_AVAILABILITIES',
            HAS_AVAILABILITY_MODULE: 'HAS_AVAILABILITY_MODULE',
            canFindSubstitutes: 'canFindSubstitutes',
            CAN_OVERRULE_FINALIZE_WARNINGS: 'CAN_OVERRULE_FINALIZE_WARNINGS',
            isOrganisationalUser: 'isOrganisationalUser',
            HAS_ALL_DEPARTMENTS_ACCESS: 'HAS_ALL_DEPARTMENTS_ACCESS',
            HAS_PLANNING_PAGE_ACCESS: 'HAS_PLANNING_PAGE_ACCESS',
            HAS_STANDARD_SHIFTS_PAGE_ACCESS: 'HAS_STANDARD_SHIFTS_PAGE_ACCESS',
            CAN_FINALIZE_SCHEDULE: 'CAN_FINALIZE_SCHEDULE',
            CAN_CLOSE_DEPARTMENT: 'CAN_CLOSE_DEPARTMENT',
            CAN_READ_RDO: 'CAN_READ_RDO',
            CAN_READ_SUBSTITUTE_REQUESTS: 'CAN_READ_SUBSTITUTE_REQUESTS',
            CAN_MANAGE_SUBSTITUTE_REQUESTS: 'CAN_MANAGE_SUBSTITUTE_REQUESTS',
            CAN_READ_TIME_DISTRIBUTION: 'CAN_READ_TIME_DISTRIBUTION',
            CAN_READ_STEER_INFORMATION: 'CAN_READ_STEER_INFORMATION',
            CAN_READ_WEEK_DETAILS: 'CAN_READ_WEEK_DETAILS',
            CAN_READ_COSTS: 'CAN_READ_COSTS',
            CAN_READ_DEPARTMENT_STATUS: 'CAN_READ_DEPARTMENT_STATUS',
            CAN_READ_PERIODS: 'CAN_READ_PERIODS',
            CAN_READ_WAB: 'CAN_READ_WAB',
            CAN_READ_CLA: 'CAN_READ_CLA',
            CAN_READ_CLA_VALIDATIONS: 'CAN_READ_CLA_VALIDATIONS',
            CAN_READ_CAO_RULES: 'CAN_READ_CAO_RULES',
            CAN_READ_BOOKABLE_HOUR_TYPES: 'CAN_READ_BOOKABLE_HOUR_TYPES',
            CAN_READ_SHIFTS: 'CAN_READ_SHIFTS',
            CONTRACT_ENDING_SIGNAL_PERIOD: 'CONTRACT_ENDING_SIGNAL_PERIOD',
            ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING: 'ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING',
            CAN_MANAGE_STANDARD_REMARKS: 'CAN_MANAGE_STANDARD_REMARKS',
            CAN_READ_STANDARD_REMARKS: 'CAN_READ_STANDARD_REMARKS',
            CAN_MANAGE_STANDARD_SCHEDULES: 'CAN_MANAGE_STANDARD_SCHEDULES',
            CAN_READ_PLANNABLE_EMPLOYEES: 'CAN_READ_PLANNABLE_EMPLOYEES',
            CAN_ADD_NON_PRODUCTIVES_WITH_TIMES: 'CAN_ADD_NON_PRODUCTIVES_WITH_TIMES',
            CAN_ADD_OVERNIGHT_SHIFTS: 'CAN_ADD_OVERNIGHT_SHIFTS',
            IS_SUPER_ADMIN: 'IS_SUPER_ADMIN',
            CAN_VIEW_CONTACT_INFORMATION: 'canViewContactInformation',
            HAS_MODULE_CHECK_HOURS: 'HAS_MODULE_CHECK_HOURS',
            CAN_ACCESS_CHECK_HOURS_PAGE: 'CAN_ACCESS_CHECK_HOURS_PAGE',
            CAN_CLOSE_WEEK: 'CAN_CLOSE_WEEK',
            CAN_REOPEN_WEEK: 'CAN_REOPEN_WEEK',
            HAS_STORE_VALUES: 'HAS_STORE_VALUES',
            CAN_ADD_INDIRECT_HOURS_ON_EXCHANGE_SHIFT: 'CAN_ADD_INDIRECT_HOURS_ON_EXCHANGE_SHIFT',
            CAN_CLOSE_WEEK_WITH_VIOLATIONS: 'CAN_CLOSE_WEEK_WITH_VIOLATIONS',
            CAN_EDIT_SURCHARGE_VALUE: 'CAN_EDIT_SURCHARGE_VALUE',
            CAN_MANAGE_SURCHARGES: 'CAN_MANAGE_SURCHARGES',
            CAN_READ_SURCHARGES: 'CAN_READ_SURCHARGES',
            CAN_VIEW_KPU: 'CAN_VIEW_KPU',
            CAN_VIEW_RELEASED_WEEKS: 'CAN_VIEW_RELEASED_WEEKS',
            CAN_CHANGE_SURCHARGE_TYPE: 'CAN_CHANGE_SURCHARGE_TYPE',
            ALLOW_CO_SPLIT: 'ALLOW_CO_SPLIT',
            MANAGE_OPEN_DEPARTMENTS_CHECK_HOURS: 'MANAGE_OPEN_DEPARTMENTS_CHECK_HOURS',
        }),
        ...mapGetters('planning', [
            'EMPLOYEES',
            'DEPARTMENTS',
            'ALL_STRUCTURES_DEPARTMENTS',
            'APP_USER_HAS_DEPARTMENT',
            'LAST_MODIFIED_STANDARD_SHIFT',
            'EXCHANGE_STORES',
            'GROUPED_EXCHANGE_STORES',
            'SHIFT_PLANNABLE_EMPLOYEES',
            'CUSTOM_TIME_FROM_KEYBOARD',
            'SHOW_SEARCH',
            'DAY_TOTALS_STEER_TYPE',
            'IS_SHIFT_READ_ONLY',
            'SHIFT_CALCULATION',
            'SNACKBAR_ADDITIONAL_SETTING',
            'MOBILE_PLANNING_SWIPE_DIRECTION',
            'EMPLOYEE_WAB_WARNINGS',
            'CLOSE_WEEK_NOTIFICATIONS',
            'CLOSE_WEEK_EMPLOYEES_NOTIFICATIONS',
            'WEEK_CLOSE_NOTIFICATION_SNACKBAR',
            'WEEK_PLANNING_DATA',
            'WEEK_STORE_DATA',
            'EMPLOYEE_DEPARTMENTS',
            'BREAK_SUGGESTION',
            'BREAK_SUGGESTIONS',
            'NEW_SHIFT',
            'COPIED_SHIFT',
            'CURRENT_EMPLOYEE_DEPARTMENTS',
            'HAS_SENT_SHIFTS_HISTORY',
            'HAS_SENT_DAY_REMARKS_HISTORY',
        ]),
        ...mapGetters('datepicker', ['DATEPICKER_BY_ID']),
        ...mapState('scheduling', {
            settings: 'settings',
            printSettings: 'printSettings',
            resourceSearch: 'resourceSearch',
            mainBackgroundColor: 'mainBackgroundColor',
            activeContextMenu: 'activeContextMenu',
            publishMode: 'publishMode',
            layoutScroll: 'layoutScroll',
            shiftTypes: 'shiftTypes',
            savingShiftId: 'savingShiftId',
            savingShiftError: 'savingShiftError',
            weekPublishWarningsFilterAmount: 'weekPublishWarningsFilterAmount',
            workloadGraphHeight: 'workloadGraphHeight',
        }),
        ...mapState('steerInformation', {
            weekStatuses: 'weekStatuses',
        }),
        ...mapState({
            filters: 'pageFilters',
            apiErrors: 'apiErrors',
            scroll: 'scroll',
        }),
        ...mapState('planning', ['loading', 'groupedExchangeStores', 'hoveredDay', 'hoveredTime', 'standardShiftEmployee']),
        weekPlanningData () {
            return this.WEEK_PLANNING_DATA(this.SELECTED_DATE)
        },
        weekStoreData () {
            return this.WEEK_STORE_DATA(this.SELECTED_DATE)
        },
        dayTimeRange () {
            const date = this.SELECTED_DATE
            if (!this.isDayView) return date.clone().toCalendarArray('week')
            return this.$moment().customRange(date.clone().startOf('day'), date.clone().endOf('day')).splice(0, 24)
        },
        // returns an employee based on the current route query
        mobileSelectedEmployee () {
            return this.weekPlanningData?.[this.$route.query.selected_account]
        },
        exchangeStores () {
            return this.weekStoreData.exchange_stores
        },
        groupedStores () {
            return this.GROUPED_EXCHANGE_STORES(this.SELECTED_DATE)
        },
        isDevelopment () {
            return process.env.NODE_ENV === 'development'
        },
        /**
         * Determines what will be visible in the
         * additional topbar component when on mobile device
         */
        showMobileTopbarItems () {
            if (this.isCheckHours) {
                return {
                    filters: true,
                    datePicker: true,
                }
            }
            if (this.isStandardShifts) {
                return {
                    filters: !this.IS_MOBILE,
                    search: !this.IS_MOBILE,
                }
            }
            return {
                datePicker: !this.SHOW_SENT_SCHEDULES,
                filters: !this.IS_MOBILE, // the filters are inside the employee selector on mobile
                search: true,
                settings: true,
                views: false,
                print: false,
                employeeSelector: false,
                publish: this.IS_MOBILE,
                backToPlanning: false,
                weekStatus: true,
            }
        },
        /**
         * Determines what will be shown and/or hidden on main (second) topbar
         * component when on mobile device
         */
        showDesktopTobarItems () {
            if (this.isCheckHours) {
                return {
                    filters: !this.IS_MOBILE,
                    datePicker: !this.IS_MOBILE,
                    views: true,
                    print: true,
                    weekStatus: true,
                    expandCollapse: true,
                }
            }
            if (this.isStandardShifts) {
                if (this.$route.query.account_id) {
                    return {
                        filters: false,
                        search: false,
                        settings: false,
                        shortcutsMenu: false,
                    }
                }
                return {
                    filters: this.$route.query.account_id || !this.IS_MOBILE,
                    search: !this.IS_MOBILE,
                    settings: !this.IS_MOBILE,
                    shortcutsMenu: !this.IS_MOBILE,
                }
            }
            return {
                datePicker: !this.IS_MOBILE && !this.SHOW_SENT_SCHEDULES,
                publish: !this.SHOW_SENT_SCHEDULES && !this.IS_MOBILE,
                viewSelector: !this.IS_MOBILE,
                filters: !this.IS_MOBILE,
                search: !this.IS_MOBILE,
                settings: !this.IS_MOBILE,
                views: !this.IS_MOBILE && !this.SHOW_SENT_SCHEDULES,
                create: !this.SHOW_SENT_SCHEDULES,
                shortcutsMenu: !this.IS_MOBILE,
                print: !this.SHOW_SENT_SCHEDULES,
                employeeSelector: this.IS_MOBILE,
                backToPlanning: true,
                weekStatus: !this.IS_MOBILE,
                xlsExport: !this.IS_MOBILE,
            }
        },
        datepickerId () {
            return 'planning-datepicker'
        },
        datepicker () {
            return this.DATEPICKER_BY_ID(this.datepickerId)
        },
        firstSelectableStandardShiftsDate () {
            return this.$moment().startOf('isoWeek')
        },
        SHOW_SENT_SCHEDULES () {
            return this.$route.name === 'day-track-schedules' || this.$route.name === 'week-track-schedules'
        },
        DEPARTMENT_STATUS_HISTORY_ID () {
            return Number(this.$route.params.departmentStatusHistoryId)
        },
        SENT_SCHEDULES_DEPARTMENT_ID () {
            return Number(this.$route.params.departmentId)
        },
        SELECTED_DATE () {
            return this.$moment().fromWeekDayRouteParams(this.$route)
        },
        /**
         * A calendar array of the current date week days
         */
        weekDays () {
            return this.SELECTED_DATE.clone().startOf('isoWeek').toCalendarArray('week')
        },
        weekBusinessTimes () {
            return this.weekStoreData.store_times
        },
        weekDetails () {
            return this.weekStoreData?.week_details || {}
        },
        /**
         * Selected grouping option
         */
        groupBy () {
            return this.filters.groupByEmployees ? 'employees' : 'departments'
        },
        /**
         * Current week steer information (still mock data as of now)
         */
        steerInfo () {
            return this.WEEK_STEER_INFO(this.SELECTED_DATE.clone())
        },
        /**
         * Current week departments
         */
        departments () {
            if (this.isStandardShifts) {
                return this.ALL_STRUCTURES_DEPARTMENTS
            }
            return this.weekStoreData.departments
        },
        isDayView () {
            if (this.isCheckHours) return false
            if (this.$route.meta.standard_shifts_account_id) return false
            return Boolean(this.$route.params.day)
        },
        isStandardShifts () {
            return this.$route.name === 'standard-shifts'
        },
        isCheckHours () {
            return this.$route.name === 'check-hours'
        },
        weekStatus () {
            return this.weekStoreData.week_status || { status: 'draft' }
        },
        weekIsClosed () {
            return this.weekStatus.status === 'closed'
        },
        weekIsDraft () {
            return this.weekStatus.status === 'draft'
        },
        weekTimeRange () {
            const weekBusinessTimes = this.weekBusinessTimes
            return this.isDayView
                ? this.SELECTED_DATE.weekTimeRange({ weekBusinessTimes })
                    .filter(d => d.apiFormat() === this.SELECTED_DATE.apiFormat())
                : this.SELECTED_DATE.toCalendarArray('week')
        },
        bookableHourTypes () {
            return this.WEEK_BOOKABLE_HOUR_TYPES(this.SELECTED_DATE)
        },
        bookableHourForeignTypes () {
            return this.WEEK_BOOKABLE_HOUR_TYPE_FOREIGN_OPTIONS(this.SELECTED_DATE)
        },
        employees () {
            return this.allEmployees.filter(e => e.details.role_priority > 1)
        },

        allEmployees () {
            return Object.keys(this.weekPlanningData || {}).map(account_id => this.weekPlanningData[account_id])
        },

        currentEmployeeDepartments () {
            return this.CURRENT_EMPLOYEE_DEPARTMENTS(this.SELECTED_DATE) || []
        },

        standardShiftsVisibleColumns () {
            return ['personnel_number', 'departments', 'competences']
        },

        standardShiftsExcludedSortingColumns () {
            return ['wab', 'plannedHours', 'deviation', 'cao', 'vak', 'tvt', 'atv', 'remark', ...this.invisibleColumnsForPlanning]
        },

        invisibleColumnsForSentSchedules () {
            return ['wab', 'cao', 'vak', 'tvt', 'atv']
        },

        invisibleColumnsForPlanning () {
            return ['productiveHours', 'nonProductiveHours', 'correction', 'compensation', 'surcharges', 'employeeChecked']
        },

        isDayPrinting () {
            return this.PRINT_VIEW === 'day'
        },

        enabledFilters () {
            return {
                hideEmployeesWithoutSchedules: !this.isStandardShifts && !this.SHOW_SENT_SCHEDULES,
                hideEmployeesWithoutStandardSchedules: this.isStandardShifts && !this.SHOW_SENT_SCHEDULES,
                hideEmployeesWithSchedules: !this.isStandardShifts && !this.SHOW_SENT_SCHEDULES,
                hideEmployeesWithStandardSchedules: this.isStandardShifts,
                hideNotAssignedShifts: !this.isStandardShifts && !this.SHOW_SENT_SCHEDULES,
                hideReadOnlyShifts: !this.isStandardShifts && !this.SHOW_SENT_SCHEDULES,
                hideLpgu: true,
                hideAge: true,
                departments: true,
                age: true,
                competences: true,
                contractTypes: true,
                notificationSnackbars: !this.isCheckHours && !this.isStandardShifts && !this.SHOW_SENT_SCHEDULES && (this.IS_MOBILE || (!this.IS_MOBILE && !this.settings.weekPublishWarnings)),
                pendingRequests: !this.isStandardShifts && false, // hidden for now as more thought has to be put in this together with Daniel.
                closeWeekNotifications: this.isCheckHours,
            }
        },

        showHideUnrelatedDepartmentShiftsFilter () {
            if (this.filters.groupByDepartment) {
                return true
            }
            if (this.filters.groupByEmployees) {
                return (this.filters.departments.length > 0 && this.filters.departments.length < this.currentEmployeeDepartments.length)
            }
        },

        weekSchedulingNotifications () {
            return this.SCHEDULING_NOTIFICATIONS(this.SELECTED_DATE)
        },

        blockedDepartments () {
            const departments = []
            this.weekSchedulingNotifications.forEach(notification => {
                if (notification.type === 'blocking') {
                    if (notification.idsType === 'store_ids') {
                        this.currentEmployeeDepartments.forEach(dep => {
                            if (!departments.includes(dep.department_id)) {
                                departments.push(dep.department_id)
                            }
                        })
                    }
                    if (notification.idsType === 'department_ids') {
                        notification.ids.forEach(id => {
                            if (!departments.includes(id)) {
                                departments.push(id)
                            }
                        })
                    }
                    if (notification.idsType === 'account_ids') {
                        notification.ids.forEach(id => {
                            const foundEmployee = this.weekPlanningData[id]
                            if (foundEmployee) {
                                foundEmployee.departments.forEach(dep => {
                                    if (!departments.includes(dep.department_id)) {
                                        departments.push(dep.department_id)
                                    }
                                })
                            }
                        })
                    }
                }
            })
            return departments
        },

        routeQueryEmployee () {
            return this.weekPlanningData?.[this.$route?.query?.account_id]
        },

        selectedEmployeeDefaultDepartment () {
            let employee = this.selectedGridAccount()
            if (this.IS_MOBILE) employee = this.mobileSelectedEmployee
            if (this.isStandardShifts && this.$route.query.account_id) {
                employee = this.standardShiftEmployee
            }
            return employee.departments.find(dep => dep.is_default) || {}
        },

        selectedEmployeeDepartments () {
            if (!this.selectedGridAccount()) return []
            return this.selectedGridAccount().departments.map(d => {
                return {
                    ...d,
                    isClosed: this.departmentClosed(d.department_id),
                }
            })
        },

        /**
         * Open in this case means any status that is not closed.
         * @returns Boolean
         */
        currentEmployeeOpenDepartments () {
            return this.currentEmployeeDepartments.filter(d => !this.departmentClosed(d.department_id))
        },

        lastWeekStatusDate () {
            if (!this.isCheckHours) return null
            const defaultDate = { ...this.$moment().weekYearObject(), status: 'released' }
            const lastWeekStatus = this.weekStoreData.week_statuses?.[0] || defaultDate
            if (lastWeekStatus.status === 'released') {
                return this.$moment()
                    .isoWeekYear(lastWeekStatus.year)
                    .isoWeek(lastWeekStatus.week)
                    .startOf('isoWeek')
            }
        },

        currentPeriod () {
            return this.WEEK_PERIOD(this.SELECTED_DATE.startOf('isoWeek')) || {}
        },

        isStandard () {
            return this.isStandardShifts || Boolean(this.$route.meta.standard_shifts_account_id)
        },

        canCloseWeek () {
            return this.isCheckHours && this.CAN_CLOSE_WEEK && this.HAS_STORE_VALUES && this.HAS_ALL_DEPARTMENTS_ACCESS
        },

        canReopenWeek () {
            return this.isCheckHours && this.CAN_REOPEN_WEEK && this.HAS_STORE_VALUES && this.HAS_ALL_DEPARTMENTS_ACCESS
        },

        canCloseReopenWeeks () {
            if (this.weekStatus.status === 'closed') return this.canReopenWeek
            if (this.weekStatus.status === 'released') return this.canCloseWeek
            return false
        },

        closeWeekNotifications () {
            return this.CLOSE_WEEK_NOTIFICATIONS(this.SELECTED_DATE) || []
        },

        blockingCloseWeekNotifications () {
            return this.closeWeekNotifications.filter(n => n.blocking)
        },

        warningCloseWeekNotifications () {
            return this.closeWeekNotifications.filter(n => !n.blocking)
        },

        ignoreOnGlobalLoading () {
            return ['saveShiftSurcharge', 'plannableEmployees']
        },

        /**
         * Checks if at least one planning loading state prop is true.
         * Except the ones that should be ignored
         * @returns Booleam
         */
        hasAnyLoading () {
            return Boolean(Object.keys(this.loading).find(i => {
                if (!this.ignoreOnGlobalLoading.includes(i)) {
                    return !i.includes('account') && this.loading[i]
                }
                return false
            }))
        },

        closeWeekDisabled () {
            if (this.hasAnyLoading) return this.$t('ui.singles.loading')
            if (this.currentEmployeeOpenDepartments.length) {
                const len = this.currentEmployeeOpenDepartments.length
                return this.baseTranslate('checkHours.someOpenDepartments', {
                    'departments-count': len,
                    'departments-pluralization': this.$t(`ui.singles.${len === 1 ? 'department' : 'departments'}`),
                })
            }
            const previousWeekStatus = this.weekStatusOnDate(this.SELECTED_DATE.clone().subtract(1, 'week'))
            if (previousWeekStatus.status !== 'closed') return this.baseTranslate('warnings.previousWeekNotClosed')
            if (this.weekStatus.status === 'closed') return false
            if (this.weekStatus.status !== 'released') return this.baseTranslate('warnings.weekNotReleased')
            if (this.blockingCloseWeekNotifications.length) {
                return this.baseTranslate('schedulingNotifications.generalBlocking', [this.blockingCloseWeekNotifications.length])
            }
            return false
        },

        showCloseWeekNotifications () {
            if (this.isCheckHours) {
                return this.closeWeekNotifications.length || this.currentEmployeeOpenDepartments.length
            }
            return false
        },

        leftDisplayFromVisibleColumns () {
            const columns = `${this.DEFAULT_RESOURCES_WIDTH}px ${this.EMPLOYEES_EXPANDED ? this.VISIBLE_COLUMNS.map(c => `${c.width}px`).join(' ') : ''}`
            return {
                display: 'grid',
                gridTemplateColumns: columns,
            }
        },

        showSteerInfoSwitch () {
            if (this.isStandardShifts) return false
            if (this.SHOW_SENT_SCHEDULES) return false
            if (!this.CAN_READ_TIME_DISTRIBUTION || !this.CAN_READ_STEER_INFORMATION) return false
            if (!(Object.keys(this.weekStatus).length && !this.weekIsDraft)) return false
            return this.settings.showNormPlannedHours
        },

        showSteerInfoHeader () {
            return this.showSteerInfoSwitch && this.steerInfo
        },

        weekHasHoliday () {
            return this.SELECTED_DATE.toCalendarArray('week').findIndex(day => {
                return this.publicHolidaysOnDay(day)
            }) > -1
        },

        isCrudEnabledCheckHours () {
            if (!this.isCheckHours) return true
            if (this.weekIsClosed) return false
            if (this.MANAGE_OPEN_DEPARTMENTS_CHECK_HOURS) return true
            return !this.currentEmployeeOpenDepartments.length
        },

        isSteerinformationPage () {
            return this.$route.name === 'steerinformation-page' || this.$route.name === 'steerinformation-intersections-page'
        },
    },
}
