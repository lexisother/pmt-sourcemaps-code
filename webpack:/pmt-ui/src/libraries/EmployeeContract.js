import Vue from 'vue'
import * as moment from '../config/moment'
Vue.use(moment)
class EmployeeContract {
    constructor(payload) {
        Object.keys(payload).forEach(key => {
            this[key] = payload[key]
        })
        const contractHoursDuration = Vue.moment.duration({ hours: this.contract_hours })
        this.duration = contractHoursDuration
        const minMax = {
            min: Vue.moment.duration({ hours: this.contract_hours }).format('HH:mm'),
            max: Vue.moment.duration({ hours: this.max_contract_hours }).format('HH:mm'),
        }
        this.contractHours = this.use_minmax ? `${minMax.min}/${minMax.max}` : contractHoursDuration.format('HH:mm')
    }

    get contractHours() {
        return this._contract_hours
    }

    set contractHours(val) {
        this._contract_hours = val
    }

    get duration() {
        return this._duration
    }

    set duration(val) {
        this._duration = val
    }
}

export default EmployeeContract
