import ApiError from '../models/ApiError'
import language from '../config/language'
import { store } from '../store'
import authService from '../services/AuthService'

import pmtApi from '../libraries/pmtApi'
import pmt from '../libraries/pmt'

class ApiHelper {
    /**
     * Creates a debounced function that delays invoking func until after "delay" milliseconds
     * have elapsed since the last time the debounced function was invoked
     *
     * @param func The function to debounce.
     * @param delay The number of milliseconds to delay.
     * @returns {function(): void}
     */
    debounce(func, delay) {
        let debounceTimer
        return function () {
            const context = this
            const args = arguments
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => func.apply(context, args), delay)
        }
    }

    /**
     * @param {Object} payload
     * @returns {ApiError}
     */
    getError(payload) {
        return new ApiError(payload.code, this.getTranslationOfCode(payload), payload.info)
    }

    /**
     * Get the translated message of the given api error code.
     *
     * @param {Object} payload
     * @returns {string}
     */
    getTranslationOfCode(payload) {
        const translationCode = 'apiErrors.' + payload.code
        let translation = language.t(translationCode)

        if (payload.info) {
            if (typeof payload.info === 'object') {
                // for PMT1 ajax calls
                return `${translation}. ${payload.info.message}`
            }
            const infoMessage = payload.info instanceof Array ? payload.info.join(', ') : payload.info

            // Logic to translate info messages
            if (infoMessage.indexOf(',') > -1) {
                const splitInfoMessage = infoMessage.split(',').map(function (item) {
                    return item.trim()
                })

                const splitArray = []
                splitInfoMessage.forEach(element => splitArray.push(language.t('apiErrors.' + element)))

                const translatedArrayMessages = splitArray.join(', ')
                translation = translation.replace('%s', translatedArrayMessages)
            } else {
                translation += ` (${infoMessage})`
            }
        }

        if (translation === translationCode) {
            console.error('No translation found for API error with key "' + translationCode + '".')
            return payload.message ? `${payload.message} (${payload.info})` : language.t('apiErrors.default')
        }

        return translation
    }

    /**
     * Checks if the API returns valid status codes (anything but 503) by making a simple call (GET /pmtLoginSso).
     * If the call fails, maintenance mode is set to true, otherwise it's set to false.
     *
     * @returns {boolean}
     */
    isApiWorking() {
        return authService.loginFromPmt()
            .then(() => {
                store.commit('SET_MAINTENANCE_MODE', false, { root: true })

                location.reload()
            })
    }

    /**
     * Sets a timeout to execute a request.
     *
     * @param {object} axiosInstance
     * @param {object} request
     * @param {int} milliseconds
     * @returns {Promise<unknown>}
     */
    postponeRequest(axiosInstance, request, milliseconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(axiosInstance(request)), milliseconds)
        })
    }

    /**
     * Sets x-api-user header to current user token for both pmtApi and pmt axios instances.
     *
     * @param {String} token
     */
    setXApiUserHeader(token) {
        pmtApi.defaults.headers.common['x-api-user'] = token
        pmt.defaults.headers.common['x-api-user'] = token
    }

    /**
     * Delete x-api-user header from both pmtApi and pmt axios instances.
     */
    deleteXApiUserHeader() {
        delete pmtApi.defaults.headers.common['x-api-user']
        delete pmt.defaults.headers.common['x-api-user']
    }

    /**
     * Constructs an api filter string
     * - returns something like '?account_id=1234&active=true' ... etc
     * @param {Object} payload key/value pair object for all api filters
     * @returns String
     */
    apiFilters(payload) {
        const apiFilters = Object.keys(payload)
            .filter(k => payload[k])
            .map(key => `${key}=${payload[key]}`)
            .join('&')
        if (apiFilters) return `?${apiFilters}`
        return ''
    }

    v3EnvStoreParams = {
        v3: true,
        store: true,
        environment: true,
    }
}

export default new ApiHelper()
