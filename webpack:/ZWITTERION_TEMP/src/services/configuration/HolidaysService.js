import pmtApi from '../../libraries/pmtApi'
import * as moment from '../../config/moment'
import Vue from 'vue'
Vue.use(moment)

export default {
    /**
     * Returns a list of cao public holidays.
     * @returns {Array}
     */
    getPublicHolidays(
        from = Vue.moment().add(-100, 'years').startOf('year'),
        to = Vue.moment().add(10, 'years'),
    ) {
        return pmtApi.get('/publicHolidays', {
            params: {
                'date[gte]': from.apiFormat(),
                'date[lte]': to.apiFormat(),
            },
        }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    addPublicHoliday(payload) {
        return pmtApi.post('/publicHolidays', payload).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    editPublicHoliday(payload) {
        return pmtApi.put(`/publicHolidays/${payload.id}`, payload).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    deletePublicHoliday(id) {
        return pmtApi.delete(`/publicHolidays/${id}`).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Returns a list of holiday rules.
     * @returns {Array}
     */
    getHolidayRules() {
        return pmtApi.get('holidayRules', { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    addHolidayRule(payload) {
        return pmtApi.post('holidayRules', payload, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    editHolidayRule(payload) {
        return pmtApi.put(`holidayRules/${payload.id}`, payload, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    deleteHolidayRule(id) {
        return pmtApi.delete(`holidayRules/${id}`, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Returns a list of school holidays.
     * @returns {Array}
     */
    getSchoolHolidays(from = Vue.moment().add(-100, 'years').startOf('year'), to = Vue.moment().add(10, 'years')) {
        return pmtApi.get('/schoolHolidays', {
            params: {
                'date[gte]': from.apiFormat(),
                'date[lte]': to.apiFormat(),
            },
        }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    addSchoolHoliday(payload) {
        return pmtApi.post('/schoolHolidays', payload.body).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    editSchoolHoliday(payload) {
        return pmtApi.put(`/schoolHolidays/${payload.schoolHolidayId}`, payload.body).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    deleteSchoolHoliday(id) {
        return pmtApi.delete(`/schoolHolidays/${id}`).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Returns a list of school holiday regions.
     * @returns {Array}
     */
    getSchoolHolidayRegions() {
        return pmtApi.get('/schoolHolidayRegions', { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    addSchoolHolidayRegion(payload) {
        return pmtApi.post('/schoolHolidayRegions', payload.body, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    editSchoolHolidayRegion(payload) {
        return pmtApi.put(`/schoolHolidayRegions/${payload.id}`, payload.body, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    deleteSchoolHolidayRegion(id) {
        return pmtApi.delete(`/schoolHolidayRegions/${id}`, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
}
