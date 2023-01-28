import pmtApi from '../../libraries/pmtApi'

export default {
    /**
     * Returns a list of standard times
     * @returns {Array}
     */
    getStandardTimes() {
        return pmtApi.get('/standardTimes', { v3: true, store: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    addStandardTimes(payload) {
        return pmtApi.post('/standardTimes', payload.body, { v3: true, store: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    editStandardTimes(payload) {
        return pmtApi.put(`/standardTimes/${payload.id}`, payload.body, { v3: true, store: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
}
