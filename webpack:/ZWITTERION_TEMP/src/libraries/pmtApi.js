import axios from 'axios'
import { store } from '../store'
import apiHelper from './apiHelper'
import localStorage from './localStorage'
import urlHelper from './urlHelper'
import router from '../config/router'
import language from '../config/language'

const apiVersion = 'v2'

const api = axios.create({
    baseURL: urlHelper.getHost() + '/api/' + apiVersion + '/',
    headers: {
        'x-api-context': 'PfqzYJeZX8mp1ewJb9MCFfHOkiXvLEUq',
    },
})
api.defaults.params = localStorage.getDefaultStoreParameter()

// reset base url for api v3
api.interceptors.request.use(request => {
    // below is a wrapper for V3 api calls
    if (request.v3) {
        const currentStore = store.getters['stores/currentStore']
        let environmentId = currentStore ? currentStore.environmentId : undefined
        let currentStoreId = currentStore ? currentStore.id : undefined
        if (!currentStore || !environmentId) {
            if (process.env.NODE_ENV !== 'test') {
                console.error('FATAL-ERROR: Error getting environmentId for V3 api request.')
                console.trace(request)
            }
            environmentId = 1
            if (!currentStore) {
                currentStoreId = 1
            }
        }
        let enviromentPrefix = '/'
        if (request.planning) {
            enviromentPrefix = '/planning/'
        } else if (request.system) {
            enviromentPrefix = '/system/'
        } else if (request.account) {
            enviromentPrefix = '/account/'
        } else if (request.communication) {
            enviromentPrefix = '/communication/'
        } else if (request.organisation) {
            enviromentPrefix = '/organisation/'
        }
        let newBase = urlHelper.getHost() + `/api/v3${enviromentPrefix}environments/${environmentId}/`
        // if the wrapper receives store boolean as true
        // we add another layoer to the baseUrl
        if (request.store) {
            newBase = `${newBase}stores/${currentStoreId}/`
        }
        request.baseURL = newBase
    }
    return request
})

api.interceptors.response.use((response) => {
    // If site was off, set maintenance flag to false at first successful call.
    if (store.getters.isMaintenanceMode) {
        store.commit('SET_MAINTENANCE_MODE', false)
    }
    return response
}, (error) => {
    if (!error.response) {
        const message = language.t('apiErrors.general.networkError')
        return Promise.reject(apiHelper.getError({
            code: 'general.networkError',
            info: 'No Internet Connection',
            message,
        }))
    }

    if (error.response && error.response.status === 500) {
        store.commit('SET_SNACKBAR', { message: error.response.statusText, error: true, top: true }, { root: true })
    }

    if (error.response && error.response.status === 503) {
        store.commit('SET_MAINTENANCE_MODE', true)

        // Retry every 60 seconds.
        return apiHelper.postponeRequest(api, error.config, 60 * 1000)
    } else {
        store.commit('SET_MAINTENANCE_MODE', false)
    }
    // if error.response then something failed in the api, else something failed locally.
    const errorData = error.response.data
    const err = typeof error.response !== 'undefined' ? errorData ? errorData.result[0] : error : error

    let data
    if (error.response && error.response.config.data) {
        data = JSON.parse(error.response.config.data)
    }

    // If token is expired, check pmt1 session. If not valid, redirect to login.
    if (err.code === 'security.badToken' && (store.getters['auth/isAuthenticated'] || !!store.getters['auth/user'] || !!store.getters['auth/userToken'])) {
        // Make sure we log in only once in pmt1, not for every 401 failed request.
        if (!store.getters['auth/isLoggingIn']) {
            store.commit('auth/setLoggingIn', true, { root: false })
            return store.dispatch('auth/loginFromUserToken', null, { root: true }).then((response) => {
                if (store.getters['auth/isAuthenticated']) {
                    router.go()
                }
                store.commit('auth/setLoggingIn', false, { root: false })
            }).catch(() => {
                store.commit('auth/setLoggingIn', false, { root: false })
            })
        }
    }

    // If some api call fails with forbidden set error snackbar
    if (err.code === 'general.forbidden') {
        if (err.info === 'account_id') {
            store.commit('SET_SNACKBAR', { message: language.t('apiErrors.general.invalidAccountId'), error: true }, { root: true })
        } else {
            // if redirect is needed at some point, the router can be imported and router.push('/redirect-path') can be used
            if (!data || data.set403SnackBar !== false) {
                store.commit('SET_SNACKBAR', { message: err.message, error: true }, { root: false })
            }
        }
    }
    if (err.code && err.code.includes('wlp')) {
        console.error(err)
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({ message: err.info ? err.info.message : err.message })
    }
    const payload = {
        code: err.code,
        info: err.info,
        message: err.message,
    }

    return Promise.reject(typeof err.code !== 'undefined' ? apiHelper.getError(payload) : error)
})

export default api
