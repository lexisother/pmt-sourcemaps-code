import pmtApi from '../libraries/pmtApi'
import moment from 'moment'

class AssessmentsService {
    /**
     * Returns the current user assessments.
     * @param {Object} payload
     * @returns {Promise}
     */
    getAssessments(payload) {
        return pmtApi.get('/assessments', {
            params: payload,
        }).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns the current user assessments.
     * @param {Object} payload
     * @returns {Promise}
     */
    getEmployeeAssessmentHistory(payload) {
        const historyDate = moment().clone().subtract(13, 'weeks')
        return pmtApi.get('/assessments', {
            params: {
                account_id: payload.account_id,
                'week[gte]': `${historyDate.isoWeekYear()}-${historyDate.isoWeek()}`,
            },
        }).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Saves an employee assessment
     * @param {Object} payload
     */
    saveAssessment(payload) {
        const kind = payload.id ? 'put' : 'post'
        const url = payload.id ? `/assessments/${payload.id}` : '/assessments'
        return pmtApi[kind](url, payload).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    removeAssessment(assessmentId) {
        return pmtApi.delete(`/assessments/${assessmentId}`).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }
}

export default new AssessmentsService()
