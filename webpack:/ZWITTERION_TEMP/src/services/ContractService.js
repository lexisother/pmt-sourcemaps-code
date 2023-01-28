import pmtApi from '../libraries/pmtApi'
import timeHelper from '../libraries/timeHelper'
import moment from 'moment'

class MyContractService {
    /**
     * Returns contract information for a given user at provided date.
     *
     * @param {Object} payload
     *
     * @returns {Promise}
     */
    getEmployeeContractInfoOnDate(payload) {
        return pmtApi.get('/contracts', {
            params: { date: payload.date, account_id: payload.account_id },
        }).then((response) => {
            if (!response.data.result || response.data.result.length === 0) {
                return {}
            }
            const personGroupedByAccountId = groupBy(response.data.result, 'account_id')
            const item = personGroupedByAccountId.length > 1 ? personGroupedByAccountId[payload.account_id][personGroupedByAccountId[payload.account_id].length - 1] : response.data.result[response.data.result.length - 1]

            item.use_min_max = item.max_contract_hours
            item.calculated_contract_hours = timeHelper.floatToHoursAndMinutes(moment.duration(item.contract_hours, 'hours'))
            // Return min-max value, or not
            if (item.max_contract_hours) {
                item.visual_contract_hours = item.contract_hours + ' - ' + item.max_contract_hours
                item.calculated_max_contract_hours = timeHelper.floatToHoursAndMinutes(
                    moment.duration(item.max_contract_hours, 'hours'),
                )
            } else {
                item.visual_contract_hours = item.contract_hours
            }

            return item
        })
    }

    /**
     * Returns a list of contracts for all employees current user has access to for a given date.
     *
     * @param date
     * @returns {*}
     */
    getAllContracts(date) {
        return pmtApi.get('/contracts', { params: { date, limit: 1000000 } }).then((response) => {
            if (!response.data.result || response.data.result.length === 0) {
                return {}
            }

            return response.data.result
        })
    }
}
/**
 * Accepts the array and key
 * https://learnwithparam.com/blog/how-to-group-by-array-of-objects-using-a-key/
 *
 * @param {Array} array
 * @param {String} key
 *
 * @returns {Array}
 */
function groupBy(array, key) {
    // Return the end result
    return array.reduce((result, currentValue) => {
        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue,
        )
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result
    }, {}) // empty object is the initial value for result object
};
export default new MyContractService()
