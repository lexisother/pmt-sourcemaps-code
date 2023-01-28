import pmt from '../../libraries/pmt'
import pmtApi from '../../libraries/pmtApi'
// uncomment for local development
// import mocks from '../../../tests/component/helpers/mocks'

export default {
    /**
     * Returns a list of route contexts.
     * @returns {Array}
     */
    getContextRoutes(v3) {
        // for local development
        // if (process.env.NODE_ENV === 'development') {
        //     return new Promise((resolve, reject) => {
        //         setTimeout(() => {
        //             resolve({
        //                 contexts: mocks.contextRoutes.contexts,
        //                 modules: mocks.contextRoutes.modules,
        //                 _csrf_token: '1234567',
        //                 _csrf_token_save_context: '7654321',
        //             })
        //         }, 1000)
        //     })
        // }
        if (v3) {
            return pmtApi.get('contexts', { v3: true })
                .then((response) => {
                    return response
                })
                .catch((error) => {
                    throw error
                })
        } else {
            return pmt.get('/contextsDetails').then((response) => {
                if (!response.data.result || response.data.result.length === 0) {
                    return {}
                }
                return response.data.result
            }).catch(err => {
                throw err
            })
        }
    },

    /**
     * Saves context module routes
     * @returns {Array}
     */
    saveContextRoutes(payload) {
        return pmt.put('/saveContextsDetails', payload).then((response) => {
            if (!response.data.result || response.data.result.length === 0) {
                return {}
            }
            return response.data.result
        }).catch(err => {
            throw err
        })
    },

    /**
     * Creates or saves a new context to the database
     * @param {Object} payload
     * @returns Object
     */
    saveContext(payload) {
        // for local development
        // if (window.location.hostname === 'localhost') {
        //     return new Promise((resolve, reject) => {
        //         setTimeout(() => {
        //             // return the edited context
        //             resolve(payload.context)
        //         }, 1000)
        //     })
        // }
        const apiMethod = payload.contextId ? 'put' : 'post'
        const apiCall = payload.contextId ? `/saveContext/${payload.contextId}` : 'saveContext'
        return pmt[apiMethod](apiCall, payload.context).then((response) => {
            if (!response.data.result || response.data.result.length === 0) {
                return {}
            }
            return response.data.result
        }).catch(err => {
            throw err
        })
    },
}
