import language from '../../config/language'
import globalSettings from '../../config/global-settings'
import Vue from 'vue'

const getters = {
    GET_SNACKBAR: (state) => {
        return state.snackbar
    },

    PAGE_WIDTH: (state) => {
        return state.pageWidth
    },

    PAGE_HEIGHT: (state) => {
        return state.pageHeight
    },

    PAGE_SIZE: (state) => {
        return {
            height: state.pageHeight,
            width: state.pageWidth,
        }
    },

    GET_SCROLL_POSITION: (state) => {
        return state.scroll
    },

    IS_MOBILE: (state, getters) => {
        // For now we will show the desktop version on tablets
        return !getters.IS_TABLET && ((globalSettings.helpers.isTouchDevice() && state.pageWidth < globalSettings.settings.screenSize.large) || state.pageWidth < globalSettings.settings.screenSize.small)
    },

    IS_TABLET: () => {
        const userAgent = navigator.userAgent.toLowerCase()
        const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent)
        return isTablet || getters.IS_IPAD_OS()
    },

    IS_IPAD_OS() {
        return navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(navigator.platform)
    },

    IS_LANDSCAPE: (state) => {
        return state.pageWidth > state.pageHeight
    },

    COMPUTED_PAGE_FILTERS: (state, getters, rootState, rootGetters) => (show, departments, roles, date) => {
        const filters = {}
        if (show.notificationSnackbars && date && !rootGetters['scheduling/IS_STANDARD_SHIFTS']) {
            filters.notificationSnackbars = rootGetters['scheduling/SCHEDULING_NOTIFICATIONS_TYPES'](date.startOf('isoWeek')).map(filter => {
                const icon = filter.type === 'blocking' ? 'alert-circle-outline' : 'alert-outline'
                const iconColor = filter.type === 'blocking' ? 'var(--red-100)' : 'var(--orange-100)'
                return { value: filter.reference, label: language.t(`ui.filtersFlyOut.${filter.reference}`), icon, iconColor }
            })
        }
        if (show.closeWeekNotifications && date) {
            const notifications = rootGetters['planning/CLOSE_WEEK_NOTIFICATIONS'](date)
            if (notifications && notifications.length) {
                filters.closeWeekNotifications = notifications.map(notification => {
                    const icon = notification.blocking ? 'alert-circle-outline' : 'alert-outline'
                    const iconColor = notification.blocking ? 'var(--red-100)' : 'var(--orange-100)'
                    return { value: notification.rule_name, label: language.t(`pages.scheduling.weekCloseNotifications.${notification.rule_name}`, { employeeCount: notification.account_ids.length }), icon, iconColor }
                })
            }
        }
        if (show.departments && departments && departments.length && departments[0]) {
            filters.departments = departments.map(department => {
                return { value: department.department_id, label: department.department_name, color: department.color }
            })
        }
        if (rootGetters['auth/canViewOthersContractData'] && show.contractTypes) {
            filters.contractTypes = rootGetters['contracts/DISTINCT_CONTRACT_TYPES'].map(contractType => {
                return { value: contractType, label: contractType }
            })
        }
        if (show.weeksetStatuses) {
            filters.weeksets = [
                { value: 'pending', label: language.t('entities.weekset.status.pending'), icon: 'help-circle-outline' },
                { value: 'rejected', label: language.t('entities.weekset.status.rejected'), icon: 'close-circle-outline' },
                { value: 'approved', label: language.t('entities.weekset.status.approved'), icon: 'check-circle-outline' },
                { value: 'none', label: language.t('entities.weekset.status.noWeekset'), icon: 'calendar-remove' },
            ]
        }
        if (show.availabilityTypes) {
            filters.availability = [
                { value: 'preferred', label: language.t('components.timeBlock.types.preferred'), icon: 'check' },
                { value: 'agreed', label: language.t('components.timeBlock.types.agreed'), icon: 'lock' },
                { value: 'school', label: language.t('components.timeBlock.types.school'), icon: 'school' },
                { value: 'sport', label: language.t('components.timeBlock.types.sport'), icon: 'soccer' },
                { value: 'other', label: language.t('components.timeBlock.types.other'), icon: 'cancel' },
                { value: 'none', label: language.t('components.timeBlock.types.none'), icon: 'calendar-remove' },
            ]
        }
        if (show.age && !show.timerAge) {
            filters.age = [
                { value: '13_14_year', label: '13/14 ' + language.t('ui.filtersFlyOut.year') },
                { value: '15_year', label: '15 ' + language.t('ui.filtersFlyOut.year') },
                { value: '16_17_year', label: '16/17 ' + language.t('ui.filtersFlyOut.year') },
                { value: '18_year_up', label: '18 ' + language.t('ui.filtersFlyOut.andUp') },
            ]
        }
        if (show.age && show.timerAge) {
            filters.age = [
                { value: '14', label: '14 ' + language.t('ui.filtersFlyOut.year') },
                { value: '15', label: '15 ' + language.t('ui.filtersFlyOut.year') },
                { value: '16', label: '16 ' + language.t('ui.filtersFlyOut.year') },
                { value: '17', label: '17 ' + language.t('ui.filtersFlyOut.year') },
                { value: '18', label: '18 ' + language.t('ui.filtersFlyOut.andUp') },
            ]
        }
        if (show.competences) {
            const competences = rootGetters['account/COMPETENCES']
            filters.competences = competences.filter(c => c.visible).map(c => {
                return { value: c.id, label: c.name, color: c.color }
            })
        }
        if (show.weekdays) {
            const daysArray = Vue.moment().toCalendarArray('week')
            filters.weekdays = daysArray.map(day => {
                return { value: day.appWeekday(), label: day.format('dddd') }
            })
        }
        if (show.months) {
            filters.months = []
            const months = Vue.moment().monthsArray()
            months.forEach(element => {
                filters.months.push({ value: element, label: element })
            })
        }
        if (show.showRouteMethods) {
            filters.routeMethods = [
                { value: 'get', label: language.t('ui.filtersFlyOut.showGETMethods') },
                { value: 'put', label: language.t('ui.filtersFlyOut.showPUTMethods') },
                { value: 'post', label: language.t('ui.filtersFlyOut.showPOSTMethods') },
                { value: 'delete', label: language.t('ui.filtersFlyOut.showDELETEMethods') },
            ]
        }
        if (show.storeGroups && (rootGetters['auth/isOrganisationalUser'] || rootGetters['auth/isUserAdmin'])) {
            const storeGroups = rootGetters['auth/STORE_GROUPS']
            if (storeGroups.length > 0) {
                filters.storeGroups = storeGroups.map(storeGroup => {
                    return { value: storeGroup.id, label: storeGroup.name }
                })
            }
        }
        if (show.roles && roles.length > 0) {
            filters.roles = roles.map(role => {
                return { value: role.id, label: role.role_name }
            })
        }

        if (show.active) {
            filters.active = [
                { label: language.t('pages.manageAccounts.filters.active'), text: language.t('pages.manageAccounts.filters.active'), value: 'active', isDropdown: true },
                { label: language.t('pages.manageAccounts.filters.inactive'), text: language.t('pages.manageAccounts.filters.inactive'), value: 'inactive', isDropdown: true },
                { label: language.t('pages.manageAccounts.filters.all'), text: language.t('pages.manageAccounts.filters.all'), value: 'all', isDropdown: true },
            ]
        }

        if (show.newsCategories) {
            filters.newsCategories = state.news.categories.map(category => {
                return { value: category.news_category_id, label: category.news_category_name }
            })
        }

        if (show.pendingRequests && !rootGetters['scheduling/IS_STANDARD_SHIFTS']) {
            filters.pendingRequests = ['rdo', 'ssr', 'availability'].map(filter => {
                return { value: filter, label: language.t('ui.filtersFlyOut.' + filter) }
            })
        }

        return filters
    },

    COMPUTED_PAGE_SETTINGS: (state, getters, rootState, rootGetters) => (show) => {
        const settings = {}
        if (show.dayTotals) {
            settings.showDayTotals = { label: language.t('ui.filtersFlyOut.showDayTotals') }
        }
        if (show.hideNonEditablePatterns) {
            settings.hideNonEditablePatterns = { label: language.t('ui.filtersFlyOut.hideNonEditablePatterns') }
        }
        if (show.showNormHoursInDistributionNonEditView) {
            settings.showNormHoursInDistributionNonEditView = { label: language.t('ui.filtersFlyOut.showNormHoursInDistributionNonEditView') }
        }
        if (show.hideZeroProcessValues) {
            settings.hideZeroProcessValues = { label: language.t('ui.filtersFlyOut.hideZeroProcessValues') }
        }
        if (show.hideNonEditableProcesses) {
            settings.hideNonEditableProcesses = { label: language.t('ui.filtersFlyOut.hideNonEditableProcesses') }
        }
        if (show.showWorkCostOnDayLevel) {
            settings.showWorkCostOnDayLevel = { label: language.t('ui.filtersFlyOut.showWorkCostOnDayLevel') }
        }
        if (show.showWorkTimeOnDayLevel) {
            settings.showWorkTimeOnDayLevel = { label: language.t('ui.filtersFlyOut.showWorkTimeOnDayLevel') }
        }
        if (show.displayFullYear) {
            settings.displayFullYear = { label: language.t('ui.filtersFlyOut.displayFullYear') }
        }
        if (show.displayInfoCards) {
            settings.displayInfoCards = { label: language.t('ui.filtersFlyOut.displayInfoCards') }
        }
        if (show.showDayRemarkAsColumn) {
            settings.showDayRemarkAsColumn = { label: language.t('ui.filtersFlyOut.showDayRemarkAsColumn') }
        }
        if (show.showNonProductivesColumn) {
            settings.showNonProductivesColumn = { label: language.t('ui.filtersFlyOut.showNonProductivesColumn') }
        }
        if (show.showBreakColumn) {
            settings.showBreakColumn = { label: language.t('ui.filtersFlyOut.showBreakColumn') }
        }
        if (show.showWorkedColumn) {
            settings.showWorkedColumn = { label: language.t('ui.filtersFlyOut.showWorkedColumn') }
        }
        if (show.hideEmployeesWithSchedules) {
            settings.hideEmployeesWithSchedules = { label: language.t('ui.filtersFlyOut.hideEmployeesWithSchedules') }
        }
        if (show.hideEmployeesWithStandardSchedules) {
            settings.hideEmployeesWithStandardSchedules = { label: language.t('ui.filtersFlyOut.hideEmployeesWithStandardSchedules') }
        }
        if (show.hideEmployeesWithoutSchedules) {
            settings.hideEmployeesWithoutSchedules = { label: language.t('ui.filtersFlyOut.hideEmployeesWithoutSchedules') }
        }
        if (show.hideEmployeesWithoutStandardSchedules) {
            settings.hideEmployeesWithoutStandardSchedules = { label: language.t('ui.filtersFlyOut.hideEmployeesWithoutStandardSchedules') }
        }
        if (show.hideNotAssignedShifts) {
            settings.hideNotAssignedShifts = { label: language.t('ui.filtersFlyOut.hideNotAssignedShifts') }
        }
        if (show.hideReadOnlyShifts) {
            settings.hideReadOnlyShifts = { label: language.t('ui.filtersFlyOut.hideReadOnlyShifts') }
        }
        if (show.hideLpgu) {
            settings.hideLpgu = { label: language.t('ui.filtersFlyOut.hideLpgu') }
        }
        if (show.hideAge) {
            settings.hideAge = { label: language.t('ui.filtersFlyOut.hideAge') }
        }
        if (show.pendingRealisation) {
            settings.pendingRealisation = {
                label: language.t('ui.filtersFlyOut.pendingRealisation'),
                icon: 'feature-search-outline',
                iconColor: 'var(--orange-100)',
            }
        }
        if (show.readyRealisation) {
            settings.readyRealisation = {
                label: language.t('ui.filtersFlyOut.readyRealisation'),
                icon: 'cog-outline',
                iconColor: 'var(--green-100)',
            }
        }
        if (show.approvedRealisation) {
            settings.approvedRealisation = {
                label: language.t('ui.filtersFlyOut.approvedRealisation'),
                icon: 'check-circle-outline',
                iconColor: 'var(--blue-100)',
            }
        }
        if (show.pendingRdo) {
            settings.pendingRdo = { label: language.t('ui.filtersFlyOut.pendingRdo'), value: 'pending', icon: 'timer-sand' }
        }
        if (show.approvedRdo) {
            settings.approvedRdo = { label: language.t('ui.filtersFlyOut.approvedRdo'), value: 'approved', icon: 'done' }
        }
        if (show.deniedRdo) {
            settings.deniedRdo = { label: language.t('ui.filtersFlyOut.deniedRdo'), value: 'denied', icon: 'close' }
        }
        if (show.hideUnrelatedDepartmentShifts) {
            settings.hideUnrelatedDepartmentShifts = { label: language.t('ui.filtersFlyOut.hideUnrelatedDepartmentShifts'), keybordShortcut: 'SHIFT + H' }
        }
        if (show.alwaysShowAvailabilityWeekViewEmployeeClick) {
            settings.alwaysShowAvailabilityWeekViewEmployeeClick = { label: language.t('ui.filtersFlyOut.alwaysShowAvailabilityWeekViewEmployeeClick'), keybordShortcut: 'SHIFT + B' }
        }
        if (show.alwaysShowRemarksWeekViewEmployeeClick) {
            settings.alwaysShowRemarksWeekViewEmployeeClick = { label: language.t('ui.filtersFlyOut.alwaysShowRemarksWeekViewEmployeeClick'), keybordShortcut: 'SHIFT + O' }
        }
        if (show.alwaysShowAllRemarks) {
            settings.alwaysShowAllRemarks = { label: language.t('ui.filtersFlyOut.alwaysShowAllRemarks'), keybordShortcut: 'SHIFT + R' }
        }
        if (show.showNormPlannedHours) {
            settings.showNormPlannedHours = { label: language.t('ui.filtersFlyOut.showNormPlannedHours'), keybordShortcut: 'K' }
        }
        if (show.timerTooLate) {
            settings.timerTooLate = { label: language.t('ui.filtersFlyOut.timerTooLate'), icon: 'ClockAlertOutline', iconColor: 'var(--red-80)' }
        }
        if (show.timerWorking) {
            settings.timerWorking = { label: language.t('ui.filtersFlyOut.timerWorking'), icon: 'MotionPlayOutline', iconColor: 'var(--green-100)' }
        }
        if (show.timerPaused) {
            settings.timerPaused = { label: language.t('ui.filtersFlyOut.timerPaused'), icon: 'Pause', iconColor: 'var(--green-100)' }
        }
        if (show.timerPlanned) {
            settings.timerPlanned = { label: language.t('ui.filtersFlyOut.timerPlanned'), icon: 'TimerSand', iconColor: 'var(--grey-80)' }
        }
        if (show.timerReady) {
            settings.timerReady = { label: language.t('ui.filtersFlyOut.timerReady'), icon: 'CheckCircleOutline', iconColor: 'var(--blue-100)' }
        }

        return settings
    },

    COMPUTED_PAGE_GROUPING: () => (show) => {
        const grouping = {}
        if (show.groupByDepartment) {
            grouping.groupByDepartment = { label: language.t('ui.filtersFlyOut.groupByDepartment') }
        }
        if (show.groupByEmployees) {
            grouping.groupByEmployees = { label: language.t('ui.filtersFlyOut.groupByEmployees') }
        }
        if (show.groupByDay) {
            grouping.groupByDay = { label: language.t('ui.filtersFlyOut.groupByDay') }
        }
        if (show.groupByPattern) {
            grouping.groupByPattern = { label: language.t('ui.filtersFlyOut.groupByPattern') }
        }
        if (show.groupByProcess) {
            grouping.groupByProcess = { label: language.t('ui.filtersFlyOut.groupByProcess') }
        }
        if (show.showOrganisationalNews) {
            grouping.showOrganisationalNews = { label: language.t('ui.filtersFlyOut.organisationalNews') }
        }
        if (show.showActiveNewsItems) {
            grouping.showActiveNewsItems = { label: language.t('ui.filtersFlyOut.activeNewsItems'), info: language.t('pages.newsOverview.info.activeNewsInfo') }
        }
        if (show.showInactiveNewsItems) {
            grouping.showInactiveNewsItems = { label: language.t('ui.filtersFlyOut.inactiveNewsItems'), info: language.t('pages.newsOverview.info.inactiveNewsInfo') }
        }
        return grouping
    },

    HAS_FILTERS: (state) => {
        let result = false
        // eslint-disable-next-line no-unused-vars
        for (const filter in state.pageFilters) {
            if (state.pageFilters[filter]?.length) {
                result = true
                break
            }
        }
        return result
    },

    /**
     * Returns the number of filters applied.
     *
     * @param state
     * @returns {number}
     */
    APPLIED_FILTERS_COUNT: (state) => {
        let result = 0
        // eslint-disable-next-line no-unused-vars
        for (const filter in state.enabledFilters) {
            if (!state.enabledFilters[filter]) {
                // skip counting not enabled filters
                continue
            }
            if (Array.isArray(state.pageFilters[filter]) && state.pageFilters[filter].length) {
                result += state.pageFilters[filter].length
            } else if (typeof state.pageFilters[filter] === 'boolean' && state.pageFilters[filter]) {
                result++
            }
        }

        return result
    },

    /**
     * Returns true if filters are applied for a certain category.
     *
     * @param state
     * @returns {function(*)}
     */
    IS_FILTER_APPLIED: (state) => (filterCategory) => {
        return (state.pageFilters[filterCategory] && state.pageFilters[filterCategory].length)
    },

    /**
     * Returns true if settings are applied as boolean values.
     *
     * @param state
     * @returns {function(*)}
     */
    IS_SETTING_APPLIED: (state) => (setting) => {
        return (state.pageFilters[setting])
    },

    /**
     * Return if a row fits a certain filter param
     * @param {Object} filters - Object containing row filters (properties)
     * @returns {Boolean}
     */

    FITS_FILTERS_ON: (state) => (filters) => {
        // Filter by age.
        if (state.pageFilters.age.length > 0) {
            if (!filters.age_filter_key || !state.pageFilters.age.includes(filters.age_filter_key)) {
                return false
            }
        }

        // filter for employees with filtered department as default
        if (state.pageFilters.departments.length > 0 && filters.department_ids) {
            const hasDepartment = state.pageFilters.departments.some(dep => filters.department_ids.includes(dep))
            if (!hasDepartment) {
                return false
            }
        }

        // Filter by weekset status, exclude none status from search
        if (state.pageFilters.weeksets.length > 0 && !state.pageFilters.weeksets.includes('none') && state.pageFilters.weeksets.length === 1 && filters.weeksets) {
            if (filters.weeksets.filter(weekset => state.pageFilters.weeksets.includes(weekset.status)).length === 0) {
                return false
            }
        }

        // another filter on weekset status for none, which is not part of the original statuses
        if (state.pageFilters.weeksets.length > 0 && state.pageFilters.weeksets.includes('none') && state.pageFilters.weeksets.length === 1 && filters.weeksets) {
            if (filters.weeksets.length > 0) {
                return false
            }
        }

        // Filter by availabilities
        if (state.pageFilters.availability.length > 0 && filters.availability_types) {
            if (filters.availability_types.filter(value => state.pageFilters.availability.includes(value)).length === 0) {
                return false
            }
        }

        // Filter by contract type
        if (state.pageFilters.contractTypes.length > 0) {
            if (!filters.contract_type || !state.pageFilters.contractTypes.includes(filters.contract_type)) {
                return false
            }
        }

        // Filter by competences
        if (state.pageFilters.competences.length > 0) {
            if (!filters.competences || filters.competences.filter(c => state.pageFilters.competences.includes(c.competence_id)).length === 0) {
                return false
            }
        }

        // * NOTIFCATION SNACKBAR FILTERS START * //
        if (state.pageFilters.notificationSnackbars.length > 0) {
            const deviation = filters.deviation && state.pageFilters.notificationSnackbars.includes('rm1')
            const hasAvailabilityRequests = filters.hasAvailabilityRequests && state.pageFilters.notificationSnackbars.includes('pendingAvailabilityRequests')
            const hasRdoRequest = filters.hasRdoRequest && state.pageFilters.notificationSnackbars.includes('pendingRdoRequests')
            const hasSsrRequest = filters.hasSsrRequest && state.pageFilters.notificationSnackbars.includes('pendingSubstituteRequests')
            const hasWab2Warnings = filters.hasWab2Warnings && state.pageFilters.notificationSnackbars.includes('wab2')
            const hasWab3Warnings = filters.hasWab3Warnings && state.pageFilters.notificationSnackbars.includes('wab3')
            const blockingCao = filters.blockingCao && state.pageFilters.notificationSnackbars.includes('cla')
            const blockingAtw = filters.blockingAtw && state.pageFilters.notificationSnackbars.includes('blockingAtw')
            const overlap = filters.overlap && state.pageFilters.notificationSnackbars.includes('overlapNonPlannable')
            const scheduleExceedsNorm = filters.scheduleExceedsNorm && state.pageFilters.notificationSnackbars.includes('scheduleExceedsNorm')
            const rm30 = filters.rm30 && state.pageFilters.notificationSnackbars.includes('rm30')
            const rm40 = filters.rm40 && state.pageFilters.notificationSnackbars.includes('rm40')
            const rm50 = filters.rm50 && state.pageFilters.notificationSnackbars.includes('rm50')
            const rm60 = filters.rm60 && state.pageFilters.notificationSnackbars.includes('rm60')
            const rm70 = filters.rm70 && state.pageFilters.notificationSnackbars.includes('rm70')
            const rm80 = filters.rm80 && state.pageFilters.notificationSnackbars.includes('rm80')
            const co80 = filters.co80 && state.pageFilters.notificationSnackbars.includes('co80')
            const claWarnings = filters.claWarnings && state.pageFilters.notificationSnackbars.includes('claWarnings')
            return deviation ||
                hasAvailabilityRequests ||
                hasRdoRequest ||
                hasSsrRequest ||
                hasWab2Warnings ||
                hasWab3Warnings ||
                blockingCao ||
                blockingAtw ||
                overlap ||
                scheduleExceedsNorm ||
                rm30 ||
                rm40 ||
                rm50 ||
                rm60 ||
                rm70 ||
                rm80 ||
                co80 ||
                claWarnings
        }

        if (state.pageFilters.closeWeekNotifications.length > 0 && filters.closeWeekNotifications) {
            const hasCloseWeekNotification = state.pageFilters.closeWeekNotifications.some(n => filters.closeWeekNotifications.includes(n))
            if (!hasCloseWeekNotification) {
                return false
            }
        }

        if (state.pageFilters.pendingRequests.length > 0 && filters.pendingRequests) {
            const hasRequest = state.pageFilters.pendingRequests.some(pr => filters.pendingRequests.includes(pr))
            if (!hasRequest) {
                return false
            }
        }

        return true
    },

    /**
     * Returns true if maintenanceMode is set to true in either localstorage or state.
     *
     * @param state
     * @returns {Boolean|boolean|string}
     */
    isMaintenanceMode: (state) => {
        return state.maintenanceMode || !!localStorage.getItem('maintenanceMode')
    },

    PAGE_FILTERS_DATE(state) {
        return state.pageFiltersDate
    },

    COLLAPSED_SECTIONS(state) {
        return state.collapsedSections
    },
    IS_PRINTING(state) {
        return state.printing
    },

    CRITCAL_APIS_LIST(state) {
        return state.criticalApisList
    },

    CRITICAL_API_FAILS(state, getters) {
        if (state.criticalApisList.length) {
            return getters.CRITCAL_APIS_LIST.some(block => {
                return state.apiErrors.includes(block)
            })
        }
    },

    TABLE_ROWS_PER_PAGE(state) {
        return state.tableRowsPerPage
    },
}
export default getters
