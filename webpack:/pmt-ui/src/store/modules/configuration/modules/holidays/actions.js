import service from '../../../../../services/configuration/HolidaysService'
import storeService from '../../../../../services/StoreService'

const actions = {
    /**
     * Gets all public holidays
     * @returns {Promise}
     */
    getPublicHolidays(context, payload) {
        if (context.state.publicHolidays.length > 0) {
            // public holidays are already in store, so we return them
            return context.state.publicHolidays
        }
        return service.getPublicHolidays(payload).then(data => {
            context.commit('SET_PUBLIC_HOLIDAYS', data)
            return data
        }).catch(error => {
            context.commit('SET_API_ERRORS', 'publicHolidays', { root: true })
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    addPublicHoliday(context, payload) {
        return service.addPublicHoliday(payload).then(data => {
            context.commit('ADD_PUBLIC_HOLIDAY', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    editPublicHoliday(context, payload) {
        return service.editPublicHoliday(payload).then(data => {
            context.commit('EDIT_PUBLIC_HOLIDAY', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    deletePublicHoliday(context, id) {
        return service.deletePublicHoliday(id).then(data => {
            context.commit('DELETE_PUBLIC_HOLIDAY', id)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    /**
     * Gets all holiday rules
     * @returns {Promise}
     */
    getHolidayRules(context) {
        if (context.state.holidayRules.length > 0) {
            return context.state.holidayRules
        }

        return service.getHolidayRules().then(data => {
            context.commit('SET_HOLIDAY_RULES', data)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
    addHolidayRule(context, payload) {
        return service.addHolidayRule(payload).then(data => {
            context.commit('ADD_HOLIDAY_RULE', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
    editHolidayRule(context, payload) {
        return service.editHolidayRule(payload).then(data => {
            context.commit('EDIT_HOLIDAY_RULE', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
    deleteHolidayRule(context, id) {
        return service.deleteHolidayRule(id).then(data => {
            context.commit('DELETE_HOLIDAY_RULE', id)
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
    recalculateHolidayRules(context, payload) {
        return storeService.recalculate(payload).then(() => {
            return true
        }).catch(error => {
            throw error
        })
    },

    /**
     * Gets all school holidays
     * @returns {Promise}
     */
    getSchoolHolidays(context) {
        if (context.state.schoolHolidays && context.state.schoolHolidays.length > 0) {
            // school holidays are already in store, so we return them
            return context.state.schoolHolidays
        }
        return service.getSchoolHolidays().then(data => {
            context.commit('SET_SCHOOL_HOLIDAYS', data)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    addSchoolHoliday(context, payload) {
        return service.addSchoolHoliday(payload).then(data => {
            context.commit('ADD_SCHOOL_HOLIDAY', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    editSchoolHoliday(context, payload) {
        return service.editSchoolHoliday(payload).then(data => {
            context.commit('EDIT_SCHOOL_HOLIDAY', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    deleteSchoolHoliday(context, id) {
        return service.deleteSchoolHoliday(id).then(data => {
            context.commit('DELETE_SCHOOL_HOLIDAY', id)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },

    /**
     * Gets all school holiday regions
     * @returns {Promise}
     */
    getSchoolHolidayRegions(context, payload) {
        if (context.state.schoolHolidayRegions && context.state.schoolHolidayRegions.length > 0) {
            // school holiday regions are already in store, so we return them
            return context.state.schoolHolidayRegions
        }
        return service.getSchoolHolidayRegions().then(data => {
            context.commit('SET_SCHOOL_HOLIDAY_REGIONS', data)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
    addSchoolHolidayRegion(context, payload) {
        return service.addSchoolHolidayRegion(payload).then(data => {
            context.commit('ADD_SCHOOL_HOLIDAY_REGION', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
    editSchoolHolidayRegion(context, payload) {
        return service.editSchoolHolidayRegion(payload).then(data => {
            context.commit('EDIT_SCHOOL_HOLIDAY_REGION', data)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
    deleteSchoolHolidayRegion(context, id) {
        return service.deleteSchoolHolidayRegion(id).then(data => {
            context.commit('DELETE_SCHOOL_HOLIDAY_REGION', id)
            context.commit('SET_HOLIDAYS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_HOLIDAYS_API_ERROR', error.message)
            throw error
        })
    },
}
export default actions
