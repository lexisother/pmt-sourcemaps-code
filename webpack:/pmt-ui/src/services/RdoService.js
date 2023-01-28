import pmtApi from '../libraries/pmtApi'
import pmt from '../libraries/pmt'
import * as moment from '../config/moment'
import Vue from 'vue'
import language from '../config/language'
Vue.use(moment)

class RdoService {
    /**
     * Send a RDO for a single day.
     *
     * @param {Date} date
     * @param {String} timeFrom
     * @param {String} timeTo
     * @param {String} reason
     * @returns {Promise}
     */
    sendSingleDayRdoRequest(date, timeFrom, timeTo, reason) {
        return this.sendRequest(date, null, timeFrom, timeTo, reason)
    }

    /**
     * Send RDO for multiple days.
     *
     * @param {Date} dateFrom
     * @param {Date} dateEnd
     * @param {String} reason
     * @returns {Promise}
     */
    sendMultiDayRdoRequest(dateFrom, dateEnd, reason) {
        return this.sendRequest(dateFrom, dateEnd, null, null, reason)
    }

    /**
     * Send the RDO request.
     *
     * @param {Date} dateFrom
     * @param {Date} dateTo
     * @param {String} timeFrom hh:mm
     * @param {String} timeTo   hh:mm
     * @param {String} reason
     * @returns {Promise}
     */
    sendRequest(dateFrom, dateTo, timeFrom, timeTo, reason) {
        const data = {
            date_from: Vue.moment(dateFrom).apiFormat(),
            reason: reason,
        }
        if (dateTo) {
            data.date_to = Vue.moment(dateTo).apiFormat()
        }
        if (timeFrom && timeTo) {
            data.time_from = timeFrom
            data.time_to = timeTo
        }
        return pmtApi.post('/requestsDayOff', data).then((response) => {
            return 'RDO request sent'
        })
    }

    /**
     * Calls api to send RDO request
     * @param {Object} payload
     * @returns {Object}
     */
    sendRdoRequest(payload) {
        return pmtApi.post('/requestsDayOff', payload).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns all the RDO requests of the current user.
     *
     * @returns {Promise}
     */
    getRequests(accountId) {
        return pmtApi.get('/requestsDayOff?account_id=' + accountId)
            .then((response) => {
                return response.data.result
            }).catch(error => {
                return error
            })
    }

    /**
     * Returns all the RDO requests of all the employee that the current user has access to.
     *
     * @returns {Promise}
     */
    getAllRequests(payload) {
        const endpoint = `/requestsDayOff?${Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}`
        return pmtApi.get(endpoint).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    getRequestsByDate(payload) {
        const params = {}
        if (payload.from) {
            params['date[gte]'] = payload.from
        }
        if (payload.to) {
            params['date[lte]'] = payload.to
        }
        if (payload.status) {
            params.status = payload.status
        }
        return pmtApi.get(`/requestsDayOff?account_id=${payload.accountId}`, { params }).then((response) => {
            return response.data.result
        }, error => {
            throw error
        })
    }

    /**
     * Gets the provided date year RDO Requests
     * @param {Object} payload
     * @returns {Object}
     */
    getEmployeeYearRequests(payload) {
        const from = payload.date.startOf('year').apiFormat()
        const to = payload.date.endOf('year').apiFormat()
        const params = {
            'date[gte]': from,
            'date[lte]': to,
        }
        if (payload.status) {
            params.status = payload.status
        }
        return pmtApi.get(`/requestsDayOff?account_id=${payload.accountId}`, {
            params,
        }).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Revokes the given RDO request.
     *
     * @param {Integer} requestId
     * @param {Integer} storeId
     * @returns {Promise}
     */
    revokeRequest(requestId, storeId) {
        return pmtApi.put('/requestsDayOff/' + requestId, {
            status: 'cancelled',
            store_id: storeId,
        }).then((response) => {
            return 'RDO request revoked'
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns the leave balance of the current user.
     *
     * @param {Integer} payload
     * @returns {Promise}
     */
    getLeaveBalance(payload) {
        return pmtApi.get('/requestsDayOff/balances', {})
            .then((response) => {
                const item = response.data.result

                const checkCurrent = (typeof (item.current) !== 'undefined')
                const checkIndicative = (typeof (item.indicative) !== 'undefined')
                const checkIndicativeContractEnd = (typeof (item.indicative_contract_end) !== 'undefined')

                let current = null
                let indicative = null
                let indicative_contract_end = null

                if (checkCurrent) {
                    current = item.current
                    current.title = language.messages[language.locale].modals.leaveBalance.definitive
                    current.position = 10
                }
                if (checkIndicative && payload.showIndicative) {
                    indicative = item.indicative
                    indicative.title = language.messages[language.locale].modals.leaveBalance.endOfYear
                    indicative.position = 10
                }
                if (checkIndicativeContractEnd && payload.showIndicative) {
                    indicative_contract_end = item.indicative_contract_end
                    indicative_contract_end.title = language.messages[language.locale].modals.leaveBalance.endOfContract
                    indicative_contract_end.position = 10
                }

                return { current, indicative_contract_end, indicative }
            }).catch(error => {
                console.log(error)
                return null
            })
    }

    /**
     * Gets all request types
     *
     * @returns {Promise}
     */
    getRequestTypes(storeId) {
        if (!storeId) return
        return pmtApi.get(`/requestTypes/${storeId}`)
            .then((response) => {
                return response
            }).catch(error => {
                throw error
            })
    }

    /**
     * Fetch all leave balances for an employee on given year-week
     *
     * @returns {Promise}
     */
    getEmployeeLeaveBalance(payload) {
        return pmtApi.get('/balances/history', { params: payload })
            .then((response) => {
                return response
            }).catch(error => {
                throw error
            })
    }

    /**
     * Save manager rdo request (PMT1 ajax call)
     */
    saveRdoRequest(payload) {
        return pmt.post('/saveRDOManagerV2', payload)
            .then((response) => {
                return response
            }).catch(error => {
                throw error
            })
    }

    /**
     * Cancels the given RDO request.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    cancelRdoRequest(payload) {
        return pmtApi.put('/requestsDayOff/' + payload.params.id, payload.body, { params: payload.params })
            .then(() => {
                return true
            })
            .catch(error => {
                throw error
            })
    }

    /**
     * Exports rdo requests as list in .csv
     *
     * @returns {Promise}
     */
    importRdosFromFile(formData) {
        return pmt.post('/importRdosFromFileV2', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then(() => {
                return true
            })
            .catch(error => {
                throw error
            })
    }
}

export default new RdoService()
