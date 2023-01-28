import pmtApi from '../../libraries/pmtApi'
import * as moment from '../../config/moment'
import Vue from 'vue'
Vue.use(moment)

class TimerService {
    async getTimers() {
        const today = Vue.moment().format('YYYY-MM-DD')
        return pmtApi
            .get(`/clockTimes?date=${today}`, { v3: true, store: true })
            .then(response => {
                return response.data.result
            })
            .catch(error => {
                throw error
            })
    }

    async setTimer(payload) {
        const {
            account_id,
            store_id,
            badge_id,
            personnel_number,
            department_code,
            department_id,
            retail_store_number,
            home_store_id,
            home_retail_store_number,
            status,
            date,
            time,
        } = payload

        return pmtApi
            .post('/clockTimes', {
                account_id,
                store_id,
                badge_id,
                personnel_number,
                department_code,
                department_id,
                retail_store_number,
                home_store_id,
                home_retail_store_number,
                status,
                date,
                time,
            }, {
                v2: true,
                store: true,
            })
            .then(response => {
                return response.data.result
            })
            .catch(error => {
                throw error
            })
    }
}

export default new TimerService()
