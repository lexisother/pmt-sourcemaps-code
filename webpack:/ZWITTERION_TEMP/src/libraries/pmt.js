import axios from 'axios'
import apiHelper from './apiHelper'
import localStorage from './localStorage'
import urlHelper from './urlHelper'
import { store } from '../store'

const pmt = axios.create({
    baseURL: urlHelper.getHost() + '/',
})

pmt.defaults.params = localStorage.getDefaultStoreParameter()

pmt.interceptors.response.use((response) => {
    // If site was off, set maintenance flag to false at first successful call.
    if (store.getters.isMaintenanceMode) {
        store.commit('SET_MAINTENANCE_MODE', false)
    }

    return response
}, (error) => {
    if (error.response && error.response.status === 503) {
        store.commit('SET_MAINTENANCE_MODE', true)

        // Retry every 60 seconds.
        return apiHelper.postponeRequest(pmt, error.config, 60 * 1000)
    } else {
        store.commit('SET_MAINTENANCE_MODE', false)
    }

    const errorCode = !!error.response && !!error.response.data.result ? error.response.data.result[0] : error
    const payload = {
        code: errorCode.code || (error.response && error.response.status),
        info: errorCode.info,
    }

    return Promise.reject(typeof errorCode.code !== 'undefined' ? apiHelper.getError(payload) : error)
})

export default pmt
