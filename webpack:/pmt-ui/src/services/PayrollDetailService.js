import pmtApi from '../libraries/pmtApi'
import * as moment from '../config/moment'
import Vue from 'vue'
Vue.use(moment)
class PayrollDetailService {
    /**
     * Fetches the payroll details totals
     * @param {*} payload
     * @returns {Promise}
     */
    getPayrollDetailsTotals(payload) {
        const params = payload
            ? {
                'date[gte]': payload.from || Vue.moment().startOf('isoWeek').apiFormat(),
                'date[lte]': payload.to || Vue.moment().endOf('isoWeek').apiFormat(),
                account_id: payload.accountId,
                hours_type: payload.hoursType,
                category: payload.category,
                week_status: payload.weekStatus,
                department_id: payload.departmentId,
                sorting: payload.sorting,
                page: payload.page,
            }
            : {
                'date[gte]': payload.from || Vue.moment().startOf('isoWeek').apiFormat(),
                'date[lte]': payload.to || Vue.moment().endOf('isoWeek').apiFormat(),
            }
        return pmtApi.get('/payrollDetails/totals', { params }).then((response) => {
            const result = response.data.result
            return result
        })
    }

    /**
     * Fetches the payroll details
     * @param {*} payload
     * @returns {Promise}
     */
    getPayrollDetails(payload) {
        const params = payload
            ? {
                'date[gte]': payload.from || Vue.moment().startOf('isoWeek').apiFormat(),
                'date[lte]': payload.to || Vue.moment().endOf('isoWeek').apiFormat(),
                account_id: payload.accountId,
                hours_type: payload.hoursType,
                category: payload.category,
                week_status: payload.weekStatus,
                department_id: payload.departmentId,
                sorting: payload.sorting,
                page: payload.page,
            }
            : {
                'date[gte]': payload.from || Vue.moment().startOf('isoWeek').apiFormat(),
                'date[lte]': payload.to || Vue.moment().endOf('isoWeek').apiFormat(),
            }
        return pmtApi.get('/payrollDetails', { params }).then((response) => {
            return response.data.result
        })
    }
}
export default new PayrollDetailService()
