import assessments from '../../../services/AssessmentsService'
import accountService from '../../../services/AccountService'
import rdo from '../../../services/RdoService'
import accountHelper from '../../../libraries/accountHelper'
import * as moment from '../../../config/moment'
import Vue from 'vue'
Vue.use(moment)

const actions = {

    getAssessments({ commit }, payload) {
        const apiPayload = { ...payload }
        delete apiPayload.update
        return assessments.getAssessments(apiPayload).then(result => {
            if (payload.account_id && payload.update) {
                // when assessments are saved by the manager
                // we get the saved results only for that employee
                // and we update/insert into the existing assessments array
                commit('INSERT_EMPLOYEE_ASSESSMENTS', { week: payload.week, assessments: result, account_id: payload.account_id })
            } else {
                // in any other case we set all the assessments
                commit('SET_ASSESSMENTS', { week: payload.week, assessments: result })
            }
            return result
        }).catch(error => {
            throw error
        })
    },

    getAssessmentHistory(context, payload) {
        return assessments.getEmployeeAssessmentHistory(payload).then(result => {
            context.commit('SET_ASSESSMENT_HISTORY', { assessments: result, account_id: payload.account_id })
            return result
        }).catch(error => {
            throw error
        })
    },

    activateAccount({ commit }, payload) {
        return accountService.activateAccount(payload).then(response => {
            return response
        })
    },

    checkIfUserExists({ commit }, payload) {
        return accountService.checkIfUsernameExists(payload).then(response => {
            commit('UPDATE_PASSWORD_STRENGTH', response)
            return response
        }).catch(error => {
            return error
        })
    },

    /**
     * Returns true if the username is not currently used.
     *
     * @param commit
     * @param payload
     * @returns {Promise<T>}
     * @constructor
     */
    IS_USERNAME_AVAILABLE({ commit }, payload) {
        return accountService.checkCurrentUserNames(payload).then(response => {
            if (response.username_available) {
                return true
            }

            const receivedErrors = response.reason.map(reason => reason.code)
            return !receivedErrors.includes('account.existingUsername')
        }).catch(error => {
            return error
        })
    },

    getEmployees(context, payload) {
        return accountService.getEmployees({ ...payload, limit: 10000, include_future_accounts: true }).then(result => {
            context.commit('SET_EMPLOYEES_LOADING', false)
            // Do not store filtered data as "all employees".
            if (payload.department_id === undefined) {
                context.commit('SET_ALL_EMPLOYEES', result)
            } else {
                return result.map(employee => {
                    return accountHelper.mapEmployee(employee)
                })
            }

            return result
        })
    },

    getWeekEmployees(context, date) {
        const existingEmployees = context.getters.MY_WEEK_COLLEAGUES(date)
        if (existingEmployees.length) {
            return new Promise((resolve) => { resolve(existingEmployees) })
        }
        return accountService.getWeekEmployees({
            date: date.apiFormat(),
            limit: 1000,
            include_future_accounts: true,
            active: true,
        }).then(result => {
            context.commit('SET_EMPLOYEES_LOADING', false)
            context.commit('SET_WEEK_EMPLOYEES', { result, date })
            return result
        })
    },

    getStoreEmployees(context, payload) {
        context.commit('SET_EMPLOYEES_LOADING', true)
        if (payload) {
            payload.store_id = payload.store_id || context.rootGetters['stores/currentStore'].id
        } else {
            payload = {
                store_id: context.rootGetters['stores/currentStore'].id,
            }
        }
        return accountService.getStoreEmployees(payload).then(result => {
            context.commit('SET_ALL_STORE_EMPLOYEES', result)
            context.commit('SET_EMPLOYEES_LOADING', false)
            return result
        })
    },

    /**
     * Returns all store employees for a week.
     *
     * @returns {Promise<*>}
     */
    getStoreEmployeesForWeek(context, payload) {
        return accountService.getStoreEmployeesForWeek(payload.store_id, payload).then(response => { return response })
    },

    /**
     * Fetches the store employees for a week and removes the current user (payload.currentUserId) from response.
     *
     * @param context
     * @param payload
     * @returns {Promise<unknown>}
     */
    getColleaguesForWeek(context, payload) {
        const existingWeekStoreEmployees = context.getters.WEEK_STORE_EMPLOYEES(payload.year, payload.week)
        if (existingWeekStoreEmployees) {
            return new Promise((resolve) => { resolve(existingWeekStoreEmployees) })
        }
        return accountService.getStoreEmployeesForWeek(payload.storeId, payload).then(colleagues => {
            const currentStoreId = context.rootGetters['stores/currentStore'].id
            context.commit('SET_ALL_STORE_EMPLOYEES_FOR_WEEK', { colleagues, currentStoreId, ...payload })
            return colleagues
        })
    },

    getBalances({ commit }, payload) {
        return rdo.getLeaveBalance(payload).then(response => {
            for (const key in response) {
                if (response[key] === null) {
                    delete response[key]
                }
            }
            commit('setBalances', response)
        })
    },

    updateUserAccountInformation(context, payload) {
        return accountService.updateUserAccountInformation(payload).then(result => {
            context.commit('auth/updateUserData', { username: payload.username }, { root: true })
            return result
        })
    },

    changePasswordFromRecover({ commit }, payload) {
        return accountService.changePasswordFromRecover(payload).then(response => {
            return response
        })
    },

    READ_APP_MESSAGE(context, id) {
        return accountService.readPmtMessage(id).then(result => {
            context.commit('MARK_MESSAGE_AS_READ', id)
            return result
        })
    },

    /**
     * Calls api to save assessment and then saves api response to VUEX
     * @param {VUEX} context
     * @param {Object} payload
     */
    saveEmployeeAssessment(context, payload) {
        return assessments.saveAssessment(payload).then(result => {
            // the result returns a day assessment.
            // TODO see if there's anything we can do to autosave this.
            // Currently we would have to manually construct an assessment object in the front
            // when we do not have any assessment for an employee, in order to insert the result,
            // which will imply some hardcoding of object keys.
            // request api change to return full week employee assessment and uncomment bellow commit
            return result
        }).catch(error => {
            throw error
        })
    },

    removeEmployeeAssessment(context, assessmentId) {
        return assessments.removeAssessment(assessmentId).then(result => {
            return result
        }).catch(error => {
            throw error
        })
    },

    getCalendarSettings({ commit }) {
        return accountService.getCalendarSettings()
            .then((response) => {
                commit('setMyCalendarSettings', response)
            })
    },

    GET_ORGANISATIONAL_ACCOUNTS(context, payload) {
        payload = payload || {}
        // Check if it was fetched before.
        if (!payload.forceReload && context.state.organisationalAccounts.length) {
            return new Promise((resolve) => { resolve(context.state.organisationalAccounts) })
        }
        delete payload.forceReload

        return accountService.getEmployees({ ...payload }).then(result => {
            const mappedAccounts = result.map(employee => {
                return accountHelper.mapOrgAccount(employee)
            })
            context.commit('SET_ORGANISATIONAL_ACCOUNTS', mappedAccounts)
            return mappedAccounts
        })
    },

    /**
     * Returns an organisational account by id.
     * @param context
     * @param id
     * @returns {*}
     * @constructor
     */
    GET_ORGANISATION_ACCOUNT(context, id) {
        // Get from state if already fetched.
        if (context.state.organisationalAccounts.length) {
            return context.getters.ORGANISATIONAL_ACCOUNT_BY_ID(id)
        }

        return accountService.getEmployees({ account_id: id }).then(result => {
            if (result.length === 0) {
                return {}
            }

            return accountHelper.mapOrgAccount(result[0])
        })
    },

    /**
     * Creates or updates an account.
     *
     * @param context
     * @param payload
     *
     * @returns {Promise<Object>}
     */
    SAVE_ACCOUNT(context, payload) {
        return !payload.account_id ? accountService.createAccount(payload) : accountService.updateAccount(payload.account_id, payload)
    },

    /**
     * Deletes an account by id.
     *
     * @param context
     * @param id
     * @constructor
     */
    DELETE_ACCOUNT(context, id) {
        return accountService.deleteAccount(id)
    },

    getWageInfo(context, payload) {
        const existingWageInfo = context.getters.WEEK_EMPLOYEES_WAGE_INFO(payload.date)
        if (existingWageInfo) {
            return new Promise((resolve) => {
                resolve(existingWageInfo)
            })
        }
        return accountService.getWageInfo(payload).then(result => {
            context.commit('SET_WEEKLY_WAGE_INFO', { date: payload.date, result })
            return result
        }).catch(err => {
            throw err
        })
    },

    async getUserSettings(context, to) {
        const existingUserSettings = Object.keys(context.state.userSettings).length
        if (!existingUserSettings) {
            const result = await accountService.getUserSettings().then(result => {
                context.commit('SET_USER_SETTINGS', result)
                context.commit('SET_USER_SETTINGS_FLAT', result)
                return result
            }).catch(err => {
                throw err
            })
            context.commit('SET_USER_SETTINGS_PAGE', to.meta.settingsRoute)
            return result
        } else {
            context.commit('SET_USER_SETTINGS_PAGE', to.meta.settingsRoute)
        }
    },

    setUserSettings(context) {
        const settingsString = JSON.stringify(context.state.userSettings)
        if (context.state.userSettingsFlat !== settingsString && context.rootGetters['auth/isAuthenticated']) {
            if (Object.keys(context.state.userSettings).length) {
                return accountService.setUserSettings(context.state.userSettings).then(result => {
                    context.commit('SET_USER_SETTINGS', result)
                    context.commit('SET_USER_SETTINGS_FLAT', result)
                    return result
                }).catch(err => {
                    throw err
                })
            }
        }
    },

    async getCurrentEmployee(context) {
        const existingCurrentEmployee = context.getters.CURRENT_EMPLOYEE
        if (existingCurrentEmployee) {
            return new Promise((resolve) => {
                resolve(existingCurrentEmployee)
            })
        }
        const currentUser = context.rootGetters['auth/user']
        const isOrganisationalUser = context.rootGetters['auth/isOrganisationalUser']
        const allDepartmentsAccess = context.rootGetters['auth/HAS_ALL_DEPARTMENTS_ACCESS']
        if (!isOrganisationalUser || !allDepartmentsAccess) {
            const currentEmployee = await accountService.getEmployee(currentUser.accountId).catch(err => { throw err }) || []
            context.commit('SET_CURRENT_EMPLOYEE', currentEmployee[0])
            return currentEmployee[0]
        }
        return new Promise((resolve) => { resolve() })
    },

    async getCompetences(context) {
        if (context.state.competences.length) {
            return new Promise(resolve => {
                resolve(context.state.competences)
            })
        }
        const competences = await accountService.getCompetences().catch(err => { throw err })
        context.commit('SET_COMPETENCES', competences)
        return competences
    },

}

export default actions
