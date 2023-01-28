import pmtApi from '../libraries/pmtApi'
import pmt from '../libraries/pmt'
import dateHelper from '../libraries/dateHelper'
import * as moment from '../config/moment'
import Vue from 'vue'
import stringHelper from '../libraries/stringHelper'
import schedulesHelper from '../libraries/schedulesHelper'
Vue.use(moment)
class MyScheduleService {
    getWeekSchedule(payload) {
        return pmtApi.get('/shifts', {
            params: {
                account_id: payload.accountId,
                'date[gte]': payload.start,
                'date[lte]': payload.end,
                status: payload.status,
                type: payload.type,
            },
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Fetches schedules filtered based on provided payload.
     *
     * @param {object} payload
     * @return {Promise}
     */
    getSchedules(payload) {
        return pmtApi.get('/schedules', { params: payload }).then(response => {
            return response.data.result
        })
    }

    /**
     * Returns schedule for given period of current user.
     *
     * @param {Date} from
     * @param {Date} to
     * @return {Promise}
     */
    getScheduleForPeriod(payload) {
        return pmtApi.get('/schedules', {
            params: {
                account_id: payload.user.accountId,
                from_date: payload.from.toApiFormat(),
                to_date: payload.to.toApiFormat(),
            },
        }).then(response => {
            const result = response.data.result
            result.forEach(element => (element.fullname = payload.user.fullname))
            return schedulesHelper.mapScheduleResponse(result)
        })
    }

    /**
     * Returns shifts of colleagues working on the same day as the current user.
     *
     * @param {Object} payload
     * @return {Promise}
     */
    getMyShifts(payload) {
        return pmtApi.get('/shifts', {
            params: {
                date: payload.date,
                account_id: payload.account_id,
            },
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns shifts of colleagues working on the same day as the current user.
     *
     * @param {Object} payload
     * @return {Promise}
     */
    getColleaguesShifts(payload) {
        return pmtApi.get('/shifts', {
            params: {
                date: payload.date,
                ignore_lent_out: true,
                'account_id[neq]': payload.account_id,
                department_id: (payload.departments || []).map(d => d.department_id).toString(),
            },
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns indirect hours for given params.
     *
     * @param {Object} payload
     * @return {Promise}
     */
    getIndirectHours(payload) {
        return pmtApi.get('/indirectHours', {
            params: { ...payload },
        }).then(response => {
            return { hours: response.data.result, aggregation: response.data.aggregation }
        }).catch(error => {
            throw error
        })
    }

    /**
     * Gets remarks.
     *
     * @param {Object} payload
     */
    getRemarks(payload) {
        return pmtApi.get('/dayRemarks', { params: payload }).then(response => {
            return response.data.result
        })
    }

    /**
     * Returns the productive hours of the requested week.
     *
     * @param {Integer} weekNr
     * @param {Integer} year
     * @param {Promise}
     */
    getWeeksProductiveHours(weekNr, year) {
        const startDate = dateHelper.getDateOfWeek(weekNr, year)
        let endDate = startDate.addDays(6)
        const today = new Date()

        // we can't request data in the future
        if (endDate > today) {
            endDate = today
        }

        // return 0 when we don't have a range in the past
        if (startDate > today) {
            return new Promise(resolve => {
                resolve(0)
            })
        }

        return pmtApi
            .get('/payrollDetails', {
                params: {
                    from_date: startDate.toApiFormat(),
                    to_date: endDate.toApiFormat(),
                    type: 'productive',
                },
            })
            .then(response => {
                const result = response.data.result
                let totalProductiveHours = 0

                // eslint-disable-next-line no-unused-vars
                for (const n in result) {
                    const item = result[n]

                    totalProductiveHours += item.hours
                }

                return totalProductiveHours
            })
    }

    /**
     * TODO: to use getEmployeeWeekStatus for other components as it is more suggestive:
     * EditWeeksetForm
     * NewWeekSet
     * For now the code will remain duplicate
     */
    getActiveWeeks(payload) {
        return pmtApi.get(`employeeWeekStatus/week/${stringHelper.getYearWeekString(payload.year, payload.week)}/account_id/${payload.accountId}`).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Gets the employee week status
     * @param {Object} payload api params
     */
    getEmployeeWeekStatus(payload) {
        return pmtApi.get(`employeeWeekStatus/week/${stringHelper.getYearWeekString(payload.year, payload.week)}/account_id/${payload.accountId}`).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    getWeekBalances(payload) {
        return pmtApi.get('balances/history', {
            params: {
                week: `${payload.year}-${payload.week}`,
                account_id: payload.accountId,
                limit: 1000,
            },
        }).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Get balance history for week range using week smart filter
     * @param {Object} payload
     * @returns {Array}
     */
    getBalanceHistory(payload) {
        return pmtApi.get('balances/history', {
            params: {
                'week[gte]': payload.from,
                'week[lte]': payload.to,
                account_id: payload.accountId,
            },
        }).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Get balance history for week range using week smart filter
     * @param {Object} payload
     * @returns {Array}
     */
    emailWeekSchedule(payload) {
        // Format data as it's expected in legacy.
        const formData = new FormData()
        Object.keys(payload).forEach(e => {
            formData.append(e, payload[e])
        })

        return pmt.post('emailweekschedule', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then((response) => {
                return response
            }).catch(error => {
                throw error
            })
    }

    /*
     * Downloads the department schedule excel file from pmt1.
     *
     * @param payload
     * @returns {*}
     */
    downloadDepartmentScheduleExcel(payload) {
        return pmt.get(`/createdepartmentscheduleexcel?${Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}`)
            .then((response) => {
                if (!response.errors) {
                    document.location = '/getscheduleexcel'
                }
            })
    }

    getAccountBalancesForDay(payload) {
        return pmtApi.get(`accounts/${payload.accountId}/date/${payload.day.apiFormat()}/balances`, {
            v3: true,
            store: true,
            environment: true,
        }).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }
}
export default new MyScheduleService()
