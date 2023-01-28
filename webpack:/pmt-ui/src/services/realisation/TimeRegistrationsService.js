import pmtApi from '../../libraries/pmtApi'
import pmt from '../../libraries/pmt'
import apiHelper from '../../libraries/apiHelper'

export default {
    getTimeRegistrations(date) {
        return pmtApi.get(`/timeRegistrations?date=${date}`, { v3: true, store: true })
            .then((response) => {
                return response.data.result
            })
            .catch((error) => {
                throw error
            })
    },

    getProposedRealisationLog(payload) {
        return pmtApi.get(`/employees/${payload.accountId}/date/${payload.date}/proposedRealisationLogs`, { v3: true, store: true })
            .then((response) => {
                return response.data.result
            })
            .catch((error) => {
                throw error
            })
    },

    postProposedRealisation(payload) {
        return pmtApi.post(`/proposedRealisations/${payload.date}`, payload.body, { v3: true, store: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    getTimeRegistrationsByDepartment(payload) {
        return pmt.get(`/timeregistrationV3${apiHelper.apiFilters(payload)}`)
            .then((response) => {
                return response.data.result
            })
            .catch((error) => {
                throw error
            })
    },
}
