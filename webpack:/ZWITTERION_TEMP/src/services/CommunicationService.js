import pmtApi from '../libraries/pmtApi'

/**
 * This service is for all the loose API calls in the communication bundle that have nothing to do with
 * news (because that has it's seperate service)
 */
class CommunicationService {
    /**
     * Returns the filtered news
     *
     * @param {Object} params
     * @returns {Promise}
     */
    getBirthdayListOnDate(payload) {
        return pmtApi.get('/birthdayList', {
            params: {
                'date[gte]': payload.start,
                'date[lte]': payload.end,
            },
        }).then((response) => {
            return response.data.result
        }, (error) => {
            throw error
        })
    }

    /**
     * GET sms messages
     *
     * @param {Object} params
     * @returns {Promise}
     */
    getSmsMessages(payload) {
        return pmtApi.get('/sms_messages', { v3: true, store: true, params: { limit: 10000 } }).then((response) => {
            return response.data
        }, (error) => {
            throw error
        })
    }

    /**
     * Post sms call
     *
     * @param {Object} params
     * @returns {Promise}
     */
    sendSms(payload) {
        return pmtApi.post('/send_sms_message', payload, { v3: true, store: true, communication: true }).then((response) => {
            return response.data.result
        }, (error) => {
            throw error
        })
    }
}

export default new CommunicationService()
