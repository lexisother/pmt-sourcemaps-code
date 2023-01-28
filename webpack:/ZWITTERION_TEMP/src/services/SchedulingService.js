import pmtApi from '../libraries/pmtApi'
import apiHelper from '../libraries/apiHelper'
import Vue from 'vue'
import * as moment from '../config/moment'
import pmt from '../libraries/pmt'
import urlHelper from '../libraries/urlHelper'
Vue.use(moment)

export default {
    /**
     * Gets shifts based on payload params
     * @param {Object} payload
     */
    getShifts(payload) {
        return pmtApi.get('shifts', {
            params: {
                ...payload,
                limit: 4000,
                sorting: '+date',
            },
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    getStandardShifts(payload) {
        // TO DATE = GREATER THAN CURRENT WEEK
        return pmtApi.get('standardShifts', {
            params: {
                ...payload,
                limit: 1000000,
                sorting: '+date',
            },
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns steer information for provided payload.
     *
     * @param payload
     * @returns {Promise<unknown>}
     */
    getSteerInformation(payload) {
        const { year, week } = payload.date.weekYearObject()
        return pmtApi.get(`week/${year}-${week}/steerInformation`, {
            params: { department_id: payload.department_id, hours_categories: 'productive', costs_categories: 'productive' },
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    createShift(payload) {
        return pmtApi.post('shifts', payload).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    createShiftInstance(payload) {
        const params = { params: { include_additional_result: true } }
        return pmtApi.post(`shifts/${payload.shift_id}/instances`, payload.instance, params).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    updateShift(payload) {
        return pmtApi.put(`shifts/${payload.shift_id}`, payload.shift).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    updateShiftInstance(payload) {
        const params = { params: { include_additional_result: true } }
        return pmtApi.put(`shifts/${payload.shift_id}/instances/${payload.shift_instance_id}`, payload.instance, params).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    deleteShift(payload) {
        return pmtApi.delete(`shifts/${payload.shift_id}`).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    deleteShiftInstance(payload) {
        const params = { params: { include_additional_result: true } }
        return pmtApi.delete(`shifts/${payload.shift_id}/instances/${payload.shift_instance_id}`, params).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    createShiftWithInstance(payload) {
        const params = { include_additional_result: true }
        return pmtApi.post('createShiftWithInstance', payload, { params, v3: true, store: true, planning: true }).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    getShiftBreakSuggestions() {
        return pmtApi.get('breaks').then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Gets remarks.
     *
     * @param {Object} payload
     */
    async getRemarks(payload = {}) {
        payload.limit = 1000000
        return pmtApi.get('dayRemarks', { params: payload, v3: true, store: true })
            .then(response => response.data.result)
            .catch(error => { throw error })
    },

    createDayRemark(payload) {
        return pmtApi.post('dayRemarks', payload, { v3: true, store: true }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    updateDayRemark(payload) {
        return pmtApi.patch(`dayRemarks/${payload.id}`, {
            remark: payload.remark,
        }, { v3: true, store: true }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    deleteDayRemark(payload) {
        return pmtApi.delete(`dayRemarks/${payload.id}`, { v3: true, store: true }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    async getStandardRemarks(payload = {}) {
        payload.limit = 1000000
        return pmtApi.get('standardRemarks', { params: payload, v3: true, store: true })
            .then(response => response.data.result)
            .catch(error => { throw error })
    },

    async saveStandardRemark(payload) {
        const response = await pmtApi.patch(`standardRemarks/${payload.standard_remark_id}`, payload.remark, { v3: true, store: true }).catch(error => { throw error })
        return response.data.result
    },

    async createStandardRemark(payload) {
        const response = await pmtApi.post('standardRemarks', payload, { v3: true, store: true }).catch(error => { throw error })
        return response.data.result
    },

    async deleteStandardRemark(id) {
        const response = await pmtApi.delete(`standardRemarks/${id}`, { v3: true, store: true }).catch(error => { throw error })
        return response.data.result
    },

    getStoreGroups({ storeId, yearWeek }) {
        return pmtApi.get(`stores/${storeId}/storeGroups?week=${yearWeek}`).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    getBookableHourTypes(payload) {
        return pmtApi.get('bookableHourTypes', {
            params: {
                ...payload,
            },
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    getPeriods(date) {
        return pmtApi.get(`periods?date=${date.apiFormat()}`, { v3: true, store: true }).then(response => {
            return response.data.result
        })
    },

    getWabCounters(payload) {
        const { year, week } = payload.date.weekYearObject()
        const period = `${payload.period.period_year}_${payload.period.period_number}`
        let apiUrl = `period/${period}/wabCounters?year_week=${year}_${week}`
        if (payload.accountId) {
            apiUrl += `&account_id=${payload.accountId}`
        }
        return pmtApi.get(apiUrl, { v3: true, store: true }).then(response => {
            return response.data.result
        })
    },

    getClaSettings() {
        return pmtApi.get('claSettings', { v3: true }).then(response => {
            return response.data.result
        })
    },

    /**
     * Returns weeks status data for current store, filtered based on payload.
     *
     * @param payload
     * @returns {Promise<T | void>}
     */
    getDepartmentsWeekStatus(payload) {
        return pmtApi.get('departmentStatus', { v3: true, store: true, params: payload }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    getSchedulingNotifications(payload) {
        return pmtApi.post('finalizeDepartments', payload, { v3: true, store: true, planning: true }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    finalizeDepartments(payload) {
        return pmtApi.post('finalizeDepartments', payload, { v3: true, store: true, planning: true }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    closeDepartments(payload) {
        return pmtApi.post('closeDepartments', payload, { v3: true, store: true, planning: true }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    reopenDepartments(payload) {
        return pmtApi.post('reopenDepartments', payload, { v3: true, store: true, planning: true }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    /**
     * Make the api call to approve or reject a substitute request
     * /planning/environment/{envId}/store/{storeId}/manageScheduleSubstituteRequests
     * @param {Object} payload
     * @returns {Promise}
     */
    assessSubstituteRequest(payload) {
        return pmtApi.post('manageScheduleSubstituteRequests', payload, { v3: true, store: true, planning: true }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    getSchedulingWorkloadData(payload) {
        const { year, week } = payload.date.weekYearObject()
        let query = ''
        if (payload.department_ids) {
            query = `?department_id=${payload.department_ids.join(',')}`
        }
        return pmtApi.get(`week/${year}-${week}/timeDistribution${query}`, { v3: true, store: true }).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns indirect hours for given params.
     *
     * @param {Object} payload
     * @return {Promise}
     */
    async getIndirectHours(payload) {
        return pmtApi.get('/indirectHours', {
            params: { ...payload },
        }).then(response => {
            return { hours: response.data.result, aggregation: response.data.aggregation }
        }).catch(error => {
            throw error
        })
    },

    /**
     * Adds Indirect Hours to a Shift Instance
     * @param {Object} payload
     * @return {Promise}
     */
    async addIndirectHours(payload) {
        const apiCall = `/shifts/${payload.shift_id}/instances/${payload.shift_instance_id}/indirectHours`
        return pmtApi.post(apiCall, {
            indirect_task_id: payload.indirect_task_id,
            duration: payload.duration,
            start_time: payload.start_time,
            end_time: payload.end_time,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Modifies an Indirect Hours on a Shift Instance
     * @param {Object} payload
     * @return {Promise}
     */
    async changeIndirectHours(payload) {
        const apiCall = `/shifts/${payload.shift_id}/instances/${payload.shift_instance_id}/indirectHours/${payload.id}`
        return pmtApi.patch(apiCall, {
            indirect_task_id: payload.indirect_task_id,
            duration: payload.duration,
        }).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    },

    /**
     * Delete an Indirect Hour from a Shift Instance
     * @param {Object} payload
     * @return {Promise}
     */
    async deleteIndirectHours(payload) {
        const apiCall = `/shifts/${payload.shift_id}/instances/${payload.shift_instance_id}/indirectHours/${payload.id}`
        return pmtApi.delete(apiCall).catch(error => { throw error })
    },

    /**
     * Returns indirect task types
     *
     * @return {Promise(Array)}
     */
    async getIndirectTaskTypes() {
        return pmtApi.get('/indirectTasks').then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Make the api call to get the week details (characteristics and description)
     * @param {Object} date
     * @returns {Promise}
     */
    getWeekDetails(date) {
        const { year, week } = date.weekYearObject()
        return pmtApi.get(`weekDetails?week=${year}-${week}`, { v3: true, store: true }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Get CLA validations
     * @param {Object} payload
     * @returns {Array}
     */
    getClaValidationOutcomes(params) {
        return pmtApi.get('/claValidationOutcomes', { params, v3: true, store: true })
            .then((response) => {
                return response.data.result
            })
            .catch(error => {
                throw error
            })
    },

    getPlannableEmployees(payload) {
        return pmtApi.get(`plannableEmployees${apiHelper.apiFilters(payload)}`, {
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Gets sent shift instances
     * @param {Object} payload
     */
    getSentShiftInstances(payload) {
        return pmtApi.get('sentShiftInstances', {
            params: payload,
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    /**
     * Gets sent day remarks
     * @param {Object} payload
     */
    getSentDayRemarks(payload) {
        return pmtApi.get('sentDayRemarks', {
            params: payload,
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    getNonProductiveShiftCalculation(payload) {
        const formData = new FormData()
        Object.keys(payload).forEach(e => {
            formData.append(e, payload[e])
        })
        return pmt.post('fetchTwelveWeekAvgData', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    getCloseWeekNotifications(params) {
        return pmt.get('/closeWeekV2Notifications', {
            params,
        }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    closeWeek(payload) {
        const formData = new FormData()
        Object.keys(payload).forEach(e => {
            formData.append(e, payload[e])
        })
        return pmt.post('/closeWeekV2', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(response => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    reopenWeek(payload) {
        const formData = new FormData()
        Object.keys(payload).forEach(e => {
            formData.append(e, payload[e])
        })
        return pmt.post('/reopenWeekV2', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(response => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    getPlanningData({ year, week }) {
        return pmtApi.get(`week/${year}-${week}/planningData`, {
            v3: true,
            store: true,
            planning: true,
        }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    getEmployeeData({ year, week }) {
        return pmtApi.get(`week/${year}-${week}/employeeData`, {
            v3: true,
            store: true,
            account: true,
        }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    getStoreData({ year, week }) {
        return pmtApi.get(`week/${year}-${week}/storeData`, {
            v3: true,
            store: true,
            organisation: true,
        }).then((response) => {
            return response.data
        }).catch(err => {
            throw err
        })
    },

    getShiftSurcharges(payload) {
        return pmtApi.get('shiftSurcharges', {
            v3: true,
            store: true,
            environment: true,
            params: payload,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    },

    downloadExcelPlanning(payload) {
        const formData = new FormData()
        Object.keys(payload).forEach(e => {
            formData.append(e, payload[e])
        })
        return pmt.post('createscheduleexcel', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(response => {
            window.open(`${urlHelper.getHost()}/getscheduleexcel`, '_parent')
            return true
        }).catch(error => {
            throw error
        })
    },

    async deleteShiftSurcharge(shiftSurchargeId) {
        const endpoint = `shiftSurcharges/${shiftSurchargeId}`
        const { data: { result } } = await pmtApi.delete(
            endpoint,
            apiHelper.v3EnvStoreParams,
        ).catch(error => {
            throw error
        })
        return result
    },

    async createShiftSurcharge(payload) {
        const { data: { result } } = await pmtApi.post(
            'shiftSurcharges',
            surchargeApiPayload(payload, true),
            apiHelper.v3EnvStoreParams,
        ).catch(error => {
            throw error
        })
        return result
    },

    async updateShiftSurcharge(payload) {
        const endpoint = `shiftSurcharges/${payload.shift_surcharge_id}`
        const { data: { result } } = await pmtApi.patch(
            endpoint,
            surchargeApiPayload(payload),
            apiHelper.v3EnvStoreParams,
        ).catch(error => {
            throw error
        })
        return result
    },

}

function surchargeApiPayload(payload, isPost) {
    const result = {
        type: payload.type,
        foreign_type: payload.foreign_type,
        length: payload.length,
    }
    if (isPost) {
        result.account_id = payload.account_id
        result.date = payload.date
    }
    return result
}
