import Vue from 'vue'
import accountHelper from '../../../libraries/accountHelper'
import vuexHelper from '../../../libraries/vuexHelper'
import stringHelper from '../../../libraries/stringHelper'
import router from '../../../config/router'
const mutations = {
    SET_ASSESSMENTS(state, data) {
        Vue.set(state.assessments, `'${data.week}'`, data.assessments)
    },
    SET_ASSESSMENT_HISTORY(state, result) {
        Vue.set(state.assessmentHistory, `'${result.account_id}'`, result.assessments)
    },
    INSERT_EMPLOYEE_ASSESSMENTS(state, data) {
        const weekAssessments = state.assessments[`'${data.week}'`]
        if (!weekAssessments) {
            // if there are no assessments for the provided week we simply set them as a whole
            Vue.set(state.assessments, `'${data.week}'`, data.assessments)
            return
        }
        // else we take each employee department assessment and update/insert as needed
        data.assessments.forEach(assessment => {
            // find an existing assessment for the employee on the same department
            const existingEmployeeAssessmentIndex = weekAssessments.findIndex(item => {
                return item.account_id === assessment.account_id && item.department_id === assessment.department_id
            })
            // if existingEmployeeAssessmentIndex === -1 then we need to insert
            // into current assessments, so we get the provided week assessments length as index,
            // which does not exist so the assessments gets added to the array
            const updateIndex = existingEmployeeAssessmentIndex > -1 ? existingEmployeeAssessmentIndex : state.assessments[`'${data.week}'`].length
            Vue.set(state.assessments[`'${data.week}'`], updateIndex, assessment)
        })
    },
    SET_ALL_EMPLOYEES(state, result) {
        state.employees = result.map(employee => {
            return accountHelper.mapEmployee(employee)
        })
    },
    SET_WEEK_EMPLOYEES(state, payload) {
        const { year, week } = Vue.moment(payload.date).weekYearObject()
        const mappedEmployees = payload.result.map(employee => {
            return accountHelper.mapEmployee(employee)
        })
        vuexHelper.setYearWeekData(state, 'weekEmployees', mappedEmployees, year, week)
    },
    SET_ALL_STORE_EMPLOYEES(state, result) {
        state.storeEmployees = result
    },
    SET_ALL_STORE_EMPLOYEES_FOR_WEEK(state, payload) {
        state.storeEmployeesForWeek = payload.colleagues // to be deprecated from NewsLetterSend and SelectColleaguesStep
        // set current store employees
        const storeEmployees = payload.colleagues.filter(employee => {
            return employee.store_id === payload.currentStoreId
        })
        vuexHelper.setYearWeekData(state, 'weekStoreEmployees', storeEmployees, payload.year, payload.week)
        // set exchange employees
        const exchangeEmployees = payload.colleagues.filter(employee => {
            return employee.store_id !== payload.currentStoreId
        })
        vuexHelper.setYearWeekData(state, 'weekExchangeEmployees', exchangeEmployees, payload.year, payload.week)
    },

    SET_ORGANISATIONAL_ACCOUNTS(state, result) {
        state.organisationalAccounts = result
    },

    SET_EMPLOYEES_LOADING(state, loading) {
        state.employeesLoading = loading
    },
    setBalances(state, result) {
        state.balances = result
    },
    reset(state) {
        // add any other resets needed here
        state.employees = []
        state.storeEmployees = []
        state.storeEmployeesForWeek = []
        state.assessments = []
    },
    /**
     * Updates password strength, minimum length for password and username.
     *
     * @param state
     * @param payload
     * @constructor
     */
    UPDATE_PASSWORD_STRENGTH(state, payload) {
        // Update password strength value
        if (payload.password_strength) {
            if (Object.values(state.PASSWORD_STRENGTHS).indexOf(payload.password_strength) > -1) {
                state.validations.password.strength = payload.password_strength
            }
        }
        // Update password minimum length based on payload or strength.
        if (payload.password_minimum_length) {
            state.validations.password.minLength = payload.password_minimum_length
        } else {
            if (state.PASSWORD_STRENGTHS.HIGH === state.validations.password.strength) {
                state.validations.password.minLength = state.PASSWORD_MIN_LENGTHS.HIGH
            }
            if (state.PASSWORD_STRENGTHS.NONE === state.validations.password.strength) {
                state.validations.password.minLength = state.PASSWORD_MIN_LENGTHS.NONE
            }
        }
        if (payload.username_minimum_length) {
            state.validations.username.minLength = payload.username_minimum_length
        }
    },

    SET_PMT_MESSAGES(state, messages) {
        state.pmt_messages = messages || []
    },

    MARK_MESSAGE_AS_READ(state, id) {
        const stateMessageIndex = state.pmt_messages.findIndex(message => message.id === id)
        if (stateMessageIndex > -1) {
            state.pmt_messages.splice(stateMessageIndex, 1)
        }
        /* Update Local storage messages */
        const user = JSON.parse(localStorage.getItem('user'))
        const storageMessageIndex = user.pmt_messages ? user.pmt_messages.findIndex(message => message.id === id) : -1
        if (storageMessageIndex > -1) {
            user.pmt_messages.splice(storageMessageIndex, 1)
            localStorage.setItem('user', JSON.stringify(user))
        }
    },

    setMyCalendarSettings(state, settings) {
        // If calendar is activated, set link settings for iCalCalendar and googleCalendar, if false return settings as is
        if (settings.activated) {
            const splitCalendar = settings.calendar_url.split('http://')
            settings.iCalCalendar = 'webcal://' + splitCalendar[1]
            settings.iCalCalendarMobile = settings.calendar_url
            settings.googleCalendar = 'https://www.google.com/calendar/render?cid=' + settings.calendar_url
            state.calendarSettings = settings
        } else {
            state.calendarSettings = settings
        }
    },

    SET_WEEKLY_WAGE_INFO(state, payload) {
        const { year, week } = payload.date.weekYearObject()
        vuexHelper.setYearWeekData(state, 'weeklyWageInfo', stringHelper.groupBy(payload.result, 'account_id'), year, week)
    },

    SET_USER_SETTINGS(state, settings) {
        state.userSettings = settings
    },

    SET_USER_SETTINGS_FLAT(state, settings) {
        state.userSettingsFlat = JSON.stringify(settings)
    },

    UPDATE_USER_SETTINGS(state, routeName) {
        // FILTERS: START
        const filters = {}
        Object.keys(this.state.enabledFilters).forEach(key => {
            const removedFilters = ['showStandardShiftsWithLastOccurrence']
            if (!removedFilters.includes(key)) {
                filters[key] = this.state.pageFilters[key]
            }
        })

        // Because these options are only available on create-planning I manually add them here
        if (routeName === 'check-hours' || routeName === 'create-planning' || routeName === 'standard-shifts') {
            filters.groupByEmployees = this.state.pageFilters.groupByEmployees
            filters.groupByDepartment = this.state.pageFilters.groupByDepartment
        }
        // We need to exclude notifications since they can change per week
        if (filters.notificationSnackbars) {
            delete filters.notificationSnackbars
        }
        // FILTERS: END

        // COLUMNS: START
        let columns = []
        if (routeName === 'check-hours' || routeName === 'create-planning' || routeName === 'standard-shifts') {
            columns = this.state.scheduling.resourceColumns
        }
        // COLUMNS: END

        // SETTINGS: START
        const settings = {}
        if (routeName === 'check-hours' || routeName === 'create-planning' || routeName === 'standard-shifts') {
            Object.keys(this.state.scheduling.settings).forEach(setting => {
                settings[setting] = this.state.scheduling.settings[setting]
            })
        }

        if (routeName === 'leave-and-absence') {
            // user settings for sorting and grouping rdo list
            settings.rdoListViewSorting = this.state.rdoRequests.rdoListViewSorting
            settings.rdoTimelineViewSorting = this.state.rdoRequests.rdoTimelineViewSorting
            settings.groupOn = this.state.rdoRequests.groupOn
        }

        if (routeName === 'time-registrations') {
            // user settings for time registrations page
            settings.globalTimeRegistrationsCardState = this.state.realisation.timeRegistrations.globalTimeRegistrationsCardState
            settings.timeRegistrationsGroupOn = this.state.realisation.timeRegistrations.groupOn
            settings.timeRegistrationsSortOn = this.state.realisation.timeRegistrations.sortOn
            settings.timeRegistrationsSortAscending = this.state.realisation.timeRegistrations.sortAscending
        }
        if (routeName === 'timer') {
            // user settings for timer page
            settings.timerGroupOn = this.state.realisation.timer.groupOn
            settings.timerSortOn = this.state.realisation.timer.sortOn
            settings.timerSortAscending = this.state.realisation.timer.sortAscending
        }
        const excludedSettings = this.getters['scheduling/EXCLUDED_USER_SETTINGS_FOR_SAVING']
        if (excludedSettings) {
            excludedSettings.forEach(excludedSetting => {
                delete settings[excludedSetting]
            })
        }

        if (routeName === 'settings-steerinformation') {
            Object.keys(this.state.steerInformation.settings).forEach(setting => {
                settings[setting] = this.state.steerInformation.settings[setting]
            })
        }

        // set table rows per page
        if (this.state.tableRowsPerPage?.hasOwnProperty(routeName)) {
            const tableRowsPerPage = this.state.tableRowsPerPage[routeName]
            settings.tableRowsPerPage = typeof tableRowsPerPage === 'object' ? tableRowsPerPage : parseInt(tableRowsPerPage)
        }

        // We need to exclude certain settings here

        // SETTINGS: END
        if (!state.userSettings) return

        if (state.userSettings) {
            const index = state.userSettings.findIndex(s => s.screen === routeName)
            if (index === -1) {
                state.userSettings.push({
                    screen: routeName,
                    settings: {
                        filters,
                        columns,
                        settings,
                        introCheck: state.userSettings.find(s => s.screen === routeName) ? !!state.userSettings.find(s => s.screen === routeName).settings.introCheck : false,
                    },
                })
            } else if (state.userSettings) {
                state.userSettings[index] = {
                    screen: routeName,
                    settings: {
                        filters,
                        columns,
                        settings,
                        introCheck: state.userSettings.find(s => s.screen === routeName) ? !!state.userSettings.find(s => s.screen === routeName).settings.introCheck : false,
                    },
                }
            }
        }
    },

    SET_USER_SETTINGS_PAGE(state, page) {
        const index = state.userSettings.findIndex(s => s.screen === page)
        if (index > -1) {
            const filters = state.userSettings[index].settings.filters
            const columns = state.userSettings[index].settings.columns
            const settings = state.userSettings[index].settings.settings

            if (filters) {
                Object.keys(filters).forEach(key => {
                    this.state.pageFilters[key] = filters[key]
                })
            }
            if (columns.length) {
                this.state.scheduling.resourceColumns = columns
            }
            if (settings) {
                Object.keys(settings).forEach(key => {
                    this.state.scheduling.settings[key] = settings[key]
                    this.state.steerInformation.settings[key] = settings[key]
                })
            }
        }

        if (router.currentRoute.query.department_id) {
            this.state.pageFilters.departments = router.currentRoute.query.department_id.replace(/, +/g, ',').split(',').map(Number)
        }
    },

    SET_USER_SETTINGS_PAGE_INTRO_CHECK(state, page) {
        state.userSettings.find(s => s.screen === page).settings.introCheck = true
    },

    SET_CURRENT_EMPLOYEE(state, employee) {
        employee = accountHelper.mapEmployee(employee)
        state.currentEmployee = employee
    },

    UPDATE_ACCOUNT(state, payload) {
        const accountIndex = state.organisationalAccounts.findIndex(o => o.account_id === payload.account_id)
        if (accountIndex > -1) {
            Vue.set(state.organisationalAccounts, accountIndex, payload)
        }
    },

    CREATE_ACCOUNT(state, payload) {
        state.organisationalAccounts.push(payload)
    },

    REMOVE_ACCOUNT(state, accountId) {
        const accountIndex = state.organisationalAccounts.findIndex(o => o.account_id === accountId)
        if (accountIndex > -1) {
            state.organisationalAccounts.splice(accountIndex, 1)
        }
    },

    SET_COMPETENCES(state, competences) {
        state.competences = competences
    },
}

export default mutations
