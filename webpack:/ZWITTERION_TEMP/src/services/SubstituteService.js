import pmtApi from '../libraries/pmtApi'
import dateHelper from '../libraries/dateHelper'

class SubstituteService {
    /**
     * Returns a list of Substitute requests.
     * @param {Array} payload
     * @returns {Promise}
     */
    getSubstituteRequests (payload) {
        return pmtApi.get(`/scheduleSubstituteRequests?${Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}`).then((response) => {
            return response ? response.data.result : []
        })
    }

    /**
     * Updates the reply of a Substitute request.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    putSubstituteRequests (payload) {
        const body = {
            reply: payload.reply,
        }
        return pmtApi.patch('/scheduleSubstituteRequests/' + payload.requestId, body, {
            v3: true,
            store: true,
        }).then((response) => {
            return response.data.result
        })
    }

    /**
     * Send the subtitute request.
     *
     * @param {Object} payload
     */
    sendSubstituteRequests (payload) {
        const apiPayload = {
            shift_instance_id: payload.shiftInstanceId,
            account_ids: payload.colleaguesIds,
            remark: payload.remark,
        }
        return pmtApi.post('/scheduleSubstituteRequests', apiPayload, {
            v3: true,
            store: true,
        }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    }

    /**
     * Returns the open scheduled requests.
     *
     * @returns {Promise}
     */
    getScheduledRequests () {
        return pmtApi.get('/scheduleSubstituteRequests')
            .then((response) => {
                return response.data.result.map(item => {
                    return {
                        id: item.id,
                        scheduleId: item.schedule_id,
                        shiftInstanceId: item.shift_instance_id,
                        from: dateHelper.getDateFromString(item.schedule_time_from),
                        to: dateHelper.getDateFromString(item.schedule_time_to),
                        requester: {
                            id: item.requester_id,
                            name: item.requester_name,
                        },
                        substitute: {
                            id: item.substitute_id,
                            name: item.substitute_name,
                        },
                        status: item.status,
                    }
                })
            })
    }

    /**
     * Returns a list of employees that have a department in common with the curren user
     * for the given date.
     *
     * @param {int} userId
     * @param {Date} date
     * @param {Integer} departmentId
     * @return {Promise}
     */
    getColleaguesOfUser (userId, date, departmentId) {
        return pmtApi.get('/employees', {
            params: {
                date: date.toApiFormat(),
                active: 'true',
            },
        })
            .then((response) => {
                // TODO: can be removed when the filter option is availible on the endpoint (API v3)
                const colleagues = response.data.result.filter(item => {
                    if (parseInt(item.account_id) === parseInt(userId)) {
                        return false
                    }

                    const found = item.departments.filter(department => department.id === departmentId)

                    return found.length === 1
                })

                return colleagues.map(item => {
                    return {
                        id: item.account_id,
                        name: item.employee_first_name + (item.employee_middle_name ? ' ' + item.employee_middle_name + ' ' : ' ') + item.employee_last_name,
                    }
                })
            })
            .catch((error) => {
                throw new Error(error.response.data.result[0].code)
            })
    }

    /**
     * Returns a list of colleagues that are available for the given shift.
     *
     * @param {integer} shiftId
     * @returns {Promise}
     */
    getAvailableColleaguesForShift (shiftId) {
        return pmtApi.get(`/shifts/${shiftId}/scheduleSubstituteRequests/suggestedSubstitutes`, { params: {}, v3: true, store: true })
            .then((response) => {
                return response.data.result
            })
    }

    /**
     * Send the substitute request.
     *
     * @param {Integer} shiftId
     * @param {Array} colleagueIds
     * @param {String} remark
     */
    sendRequest (shiftId, colleagueIds, remark) {
        return pmtApi.post('/scheduleSubstituteRequests', {
            schedule_id: shiftId,
            account_ids: colleagueIds,
            remark: remark,
        })
            .then((response) => {
                return 'Substitute request sent'
            })
            .catch((error) => {
                throw new Error(error.response.data.result[0].code)
            })
    }
}

export default new SubstituteService()
