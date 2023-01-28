import pmtApi from '../libraries/pmtApi'
import stringHelper from '../libraries/stringHelper'

class WorkloadService {
    /**
     * Gets the workload data for the provided week and year.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    getWeekWorkload(payload) {
        return pmtApi.get(`/workload/${stringHelper.getYearWeekString(payload.year, payload.week)}`).then((response) => {
            return { workload: response.data.result, aggregation: response.data.aggregation }
        })
    }

    /**
     * Gets the DISTRIBUTION PATTERNS data for the provided week and year.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    getWeekDistributionPatterns(payload) {
        return pmtApi.get(`/workload/${stringHelper.getYearWeekString(payload.year, payload.week)}/distributionpatterns`).then((response) => {
            return response.data.result
        })
    }

    /**
     * Gets the DISTRIBUTION PATTERNS data for the provided week and year.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    getWeekDistributionProfiles(payload) {
        return pmtApi.get(`/workload/${stringHelper.getYearWeekString(payload.year, payload.week)}/distributionprofiles`).then((response) => {
            return response.data.result
        })
    }

    /**
     * Gets the workload processes.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    getProcesses() {
        return pmtApi.get('/workload/processes').then((response) => {
            return response.data.result
        })
    }

    /**
     * Gets the workload processes.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    getTimeframes(payload) {
        return pmtApi.get(`/workload/${stringHelper.getYearWeekString(payload.year, payload.week)}/timeframes`, {
            params: {
                department_id: payload.department_id,
                work_process_id: payload.work_process_id,
            },
        }).then((response) => {
            return { timeframes: response.data.result, aggregation: response.data.aggregation }
        })
    }

    saveWorkload(payload) {
        return pmtApi.put(`/workload/${stringHelper.getYearWeekString(payload.year, payload.week)}/timeframes`, payload.frames).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    }

    saveDistribution(payload) {
        return pmtApi.post(`/workload/${stringHelper.getYearWeekString(payload.year, payload.week)}/distribution${payload.what}`, payload.body).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    }

    fetchNorms(payload) {
        return pmtApi.post(`/workload/${stringHelper.getYearWeekString(payload.year, payload.week)}/norm`, payload.frames).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    }
}
export default new WorkloadService()
