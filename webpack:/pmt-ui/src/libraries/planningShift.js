import Vue from 'vue'
import * as moment from '../config/moment'
import stringHelper from './stringHelper'
Vue.use(moment)

class PlanningShift {
    _style = {}
    constructor(payload) {
        Object.keys(payload).forEach(key => {
            this[key] = payload[key]
        })
        this.guid = payload.guid || stringHelper.newIdShort()
        this.original = payload
        this.updateDuration(payload)
    }

    get pendingSubstituteRequest() {
        if (!Object.keys(this.pending_substitute_request || {}).length) return null
        return this.pending_substitute_request
    }

    get original() {
        return this._original
    }

    set original(newVal) {
        this._original = newVal
    }

    get style() {
        return this._style
    }

    set style(newVal) {
        this._style = newVal
    }

    get department() {
        return this._department
    }

    set department(newVal) {
        this._department = newVal || {}
    }

    update = (shift) => {
        Object.keys(shift).forEach(key => {
            this[key] = shift[key]
        })
    }

    updateBreak = (suggestedBreaks) => {
        this.breaks = [{ duration: suggestedBreaks || '00:00' }]
        this.updateDuration()
        return this
    }

    updateDuration = (shift) => {
        if (shift.nonProductive) {
            this.duration = shift.duration
            return this
        }
        const from = Vue.moment(this.start_datetime)
        const to = Vue.moment(this.end_datetime)
        let breaksDuration = 0
        this.breaks.forEach(br => {
            breaksDuration += Vue.moment.duration(br.duration).asMinutes()
        })
        this.duration = Vue.moment.duration(to.diff(from)).subtract(breaksDuration, 'minutes').format('HH:mm')
        return this
    }
}

export default PlanningShift
