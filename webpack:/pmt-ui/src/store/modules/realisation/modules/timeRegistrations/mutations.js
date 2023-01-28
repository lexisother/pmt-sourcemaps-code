import stringHelper from '../../../../../libraries/stringHelper'
import _ from 'lodash'

const mutations = {
    SET_TIME_REGISTRATIONS(state, payload) {
        state.timeRegistrations = extendTimeRegistrations(payload)
        mutations.SET_UNTOUCHED_TIME_REGISTRATIONS(state)
    },
    SET_UNTOUCHED_TIME_REGISTRATIONS(state) {
        state.untouchedTimeRegistrations = state.timeRegistrations
    },
    UPDATE_UNTOUCHED_TIME_REGISTRATIONS(state, accountId) {
        const untouchedTimeRegistrationsClone = state.untouchedTimeRegistrations
        const employeeIndex = untouchedTimeRegistrationsClone.findIndex(o => o.account_id === accountId)
        untouchedTimeRegistrationsClone[employeeIndex] = state.timeRegistrations[employeeIndex]
        state.untouchedTimeRegistrations = untouchedTimeRegistrationsClone
    },
    REVERT_TO_UNTOUCHED_TIME_REGISTRATIONS(state, unprocessedAccounts) {
        if (unprocessedAccounts) {
            const newTimeRegistrations = JSON.parse(JSON.stringify(state.timeRegistrations))
            newTimeRegistrations.forEach((timeRegistration, index) => {
                if (unprocessedAccounts.includes(timeRegistration.account_id)) {
                    newTimeRegistrations[index] = state.untouchedTimeRegistrations[index]
                }
            })
            state.timeRegistrations = newTimeRegistrations
        } else {
            state.timeRegistrations = state.untouchedTimeRegistrations
        }
    },
    SET_TIME_REGISTRATIONS_DATE(state, payload) {
        state.timeRegistrationsDate = payload
    },
    SET_TIME_REGISTRATIONS_LOADING(state, payload) {
        state.timeRegistrationsLoading = payload
    },
    SET_GROUP_ON(state, payload) {
        let groupOn = JSON.parse(JSON.stringify(state.groupOn))

        if (Array.isArray(payload)) {
            groupOn = payload
        } else if (groupOn.includes(payload)) {
            const index = groupOn.findIndex(o => o === payload)
            groupOn.splice(index, 1)
        } else if (payload) {
            groupOn.push(payload)
        }

        state.groupOn = groupOn
    },
    SET_SORT_ON(state, payload) {
        state.sortOn = payload
    },
    TOGGLE_SORT_DIRECTION(state) {
        state.sortAscending = !state.sortAscending
    },
    SET_SORT_ASCENDING(state, payload) {
        state.sortAscending = payload
    },
    SET_SEARCH_STRING(state, payload) {
        state.searchString = payload
    },
    /**
     * Update entire employee object
     */
    UPDATE_EMPLOYEE_TIME_REGISTRATION(state, payload) {
        const timeRegistrations = JSON.parse(JSON.stringify(state.timeRegistrations))
        const timeRegistrationIndex = timeRegistrations.findIndex(o => o.account_id === payload.account_id)
        timeRegistrations[timeRegistrationIndex] = payload
        state.timeRegistrations = timeRegistrations
    },
    /**
     * Update an individual realisation
     */
    UPDATE_REALISATION(state, payload) {
        const timeRegistrationsClone = JSON.parse(JSON.stringify(state.timeRegistrations))
        const employeeIndex = timeRegistrationsClone.findIndex(o => o.account_id === payload.accountId)

        if (!payload.realisation) { // remove individual realisation
            timeRegistrationsClone[employeeIndex].realisation.splice(payload.realisationIndex, 1)
        } else if (payload.realisationIndex === -1) { // create a new realisation
            timeRegistrationsClone[employeeIndex].realisation.push(payload.realisation)
            state.realisationIndex = timeRegistrationsClone[employeeIndex].realisation.length - 1
        } else { // update individual realisation
            timeRegistrationsClone[employeeIndex].realisation[payload.realisationIndex] = payload.realisation
        }

        state.timeRegistrations = JSON.parse(JSON.stringify(timeRegistrationsClone))

        // in case of no grouping, just change status
        if (payload.status) {
            mutations.UPDATE_STATUS(state, { accountId: payload.accountId, status: payload.status })
        }
    },
    /**
     * Update status, in all cases to appoved
     */
    UPDATE_STATUS(state, payload) {
        const timeRegistrationsClone = JSON.parse(JSON.stringify(state.timeRegistrations))
        const employeeIndex = timeRegistrationsClone.findIndex(o => o.account_id === payload.accountId)

        timeRegistrationsClone[employeeIndex].displayStatus = payload.status
        timeRegistrationsClone[employeeIndex].status = 'fully_approved'
        timeRegistrationsClone[employeeIndex].status_color = 'success'

        state.timeRegistrations = timeRegistrationsClone

        // realisation has been processed, so untouched array can be updated as well
        mutations.UPDATE_UNTOUCHED_TIME_REGISTRATIONS(state, payload.accountId)
    },
    SET_ACCOUNT_ID(state, payload) {
        state.accountId = payload
    },
    SET_REALISATION_INDEX(state, payload) {
        state.realisationIndex = payload
    },
    SET_INITIAL_REALISATION(state) {
        const timeRegistrationIndex = state.timeRegistrations.findIndex(o => o.account_id === state.accountId)
        if (state.timeRegistrations[timeRegistrationIndex]) {
            state.initialRealisation = JSON.parse(JSON.stringify(state.timeRegistrations[timeRegistrationIndex].realisation[state.realisationIndex]))
        }
    },
    SET_CREATING(state, payload) {
        state.creating = payload
    },
    SET_EDIT_IN_MODAL(state, payload) {
        state.editInModal = payload
    },
    UPDATE_REMARK(state, payload) {
        const timeRegistrations = JSON.parse(JSON.stringify(state.timeRegistrations))
        const timeRegistrationIndex = timeRegistrations.findIndex(o => o.account_id === payload.accountId)
        timeRegistrations[timeRegistrationIndex].remark = payload.remark
        state.timeRegistrations = timeRegistrations
    },
    CLEAR_SEARCH(state) {
        const timeRegistrations = JSON.parse(JSON.stringify(state.timeRegistrations))
        timeRegistrations.forEach(registration => {
            registration.fullName = stringHelper.escapeString(registration.fullName)
        })
        state.timeRegistrations = timeRegistrations
    },
    SET_ACCESSIBLE_DEPARTMENTS(state, payload) {
        if (payload.allDepartmentsAccess) {
            state.accessibleDepartments = payload.allDepartments.map(o => o.department_id)
        } else {
            state.accessibleDepartments = payload.departments.map(o => o.department_id)
        }
    },
    SET_WEEK_STATUSES(state, payload) {
        state.weekStatuses = payload
    },
    SET_GLOBAL_TIME_REGISTRATIONS_CARD_STATE(state, payload) {
        state.globalTimeRegistrationsCardState = payload
    },
    SET_EXPANDED_EMPLOYEE_CARDS(state, payload) {
        let expandedEmployeeCardsClone = state.expandedEmployeeCards
        if (payload) {
            // all cards must be expanded
            expandedEmployeeCardsClone = state.timeRegistrations.map(tr => { return tr.account_id })
        } else {
            // all cards must be collapsed
            expandedEmployeeCardsClone = []
        }
        state.expandedEmployeeCards = expandedEmployeeCardsClone
    },
    TOGGLE_EMPLOYEE_CARD(state, accountId) {
        const expandedEmployeeCardsClone = state.expandedEmployeeCards
        if (expandedEmployeeCardsClone.includes(accountId)) {
            // card is already expanded, collapse it now
            const index = expandedEmployeeCardsClone.findIndex(i => i === accountId)
            expandedEmployeeCardsClone.splice(index, 1)
        } else {
            expandedEmployeeCardsClone.push(accountId)
        }
        state.expandedEmployeeCards = expandedEmployeeCardsClone
    },
    CLEAR_SCROLL_TO_EMPLOYEE_CARD_ID(state) {
        state.scrollToEmployeeCardId = null
    },
    SET_WEEK_STORES(state, payload) {
        const weekStoresClone = JSON.parse(JSON.stringify(state.weekStores))

        // create array with unique store objects
        const stores = []
        payload.result.result.forEach(storeGroup => {
            storeGroup.stores.forEach(store => {
                if (!stores.find(s => s.id === store.id)) {
                    stores.push(store)
                }
            })
        })
        weekStoresClone[payload.yearWeek] = stores
        state.weekStores = weekStoresClone
    },
}

export default mutations

/**
 * extend object with first name, last name full name and start time for filtering operations
 */
function extendTimeRegistrations(payload) {
    const output = []
    if (payload.timeRegistrations) {
        payload.timeRegistrations.forEach(employeeTimeRegistration => {
            const employee = payload.employees.find(o => o.account_id === employeeTimeRegistration.account_id) || null
            if (employee) {
                output.push({
                    ...employeeTimeRegistration,
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    fullName: employee.name,
                    startTime: employeeTimeRegistration.schedules.length ? employeeTimeRegistration.schedules[0].time_from : null,
                    displayStatus: setDisplayStatus(employeeTimeRegistration),
                    remark: '',
                    realisation: relevantRealisations(employeeTimeRegistration.realisation),
                })
            }
        })
    }
    return output
}

function setDisplayStatus(employeeTimeRegistration) {
    if (employeeTimeRegistration.status === 'fully_approved') {
        return 'approved'
    } else if ((employeeTimeRegistration.status === 'pending' || employeeTimeRegistration.status === 'partially_approved') && employeeTimeRegistration.status_color === 'success') {
        return 'ready'
    }
    return 'pending'
}

// remove empty realisations, should be done in API; bug https://retail-solutions.atlassian.net/browse/PMT3-9195 reported for it
function relevantRealisations(realisation) {
    const output = []
    realisation.forEach(rls => {
        if (rls.time_from !== rls.time_to && rls.total_time !== '00:00') {
            output.push(rls)
        }
    })
    return output
}

function employeeDepartmentIds(employeeTimeRegistration) {
    const scheduleDepartmentIds = employeeTimeRegistration.schedules.map(s => s.department_id)
    const realisationDepartmentIds = employeeTimeRegistration.realisation.map(s => s.department_id)
    const combined = scheduleDepartmentIds.concat(realisationDepartmentIds)
    return [...new Set(combined)]
}
