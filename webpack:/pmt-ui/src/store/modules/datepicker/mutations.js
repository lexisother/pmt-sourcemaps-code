import Moment from 'moment'
import Vue from 'vue'
const mutations = {

    /**
     * Initializes date picker based on payload.id
     * @param {Object} payload
     */
    INIT_DATEPICKER (state, payload) {
        payload = checkInstance(payload)
        Vue.set(state.datepickers, payload.id, payload)
    },

    /**
     * Updates given datepicker with respective props
     * payload will be a set of props to set for a datepicker
     * @param {Object} payload
     */
    UPDATE_DATEPICKER (state, payload) {
        if (!payload.id) {
            console.error('ID was not provided for datepicker')
            return
        }
        if (state.datepickers[payload.id]) {
            Object.keys(payload).forEach(key => {
                Vue.set(state.datepickers[payload.id], key, payload[key])
            })
        }
    },
}

function checkInstance (payload) {
    if (payload.id) {
        if (!(payload.selectedDate instanceof Moment)) {
            const tempDate = payload.selectedDate
            payload.selectedDate = Moment(payload.selectedDate)
            if (!payload.selectedDate.isValid()) {
                payload.selectedDate = Moment()
                console.error(`
                    PMT Message:
                    ----------------------------------------------------------------------------
                        Picker ID: ${payload.id}
                        Provided Date: ${tempDate}
                        Actions taken: For this error the date was set to today.
                    ----------------------------------------------------------------------------
                        Date provided is not in a recognized RFC2822 or ISO format 
                        or not recognized as a Moment date. Make sure to initialize 
                        the "${payload.id}" datepicker with a valid Moment date or 
                        a valid ISO format string.
                    ----------------------------------------------------------------------------
                    Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.
                `)
            }
        }
    } else {
        console.error('ID was not provided for datepicker')
    }
    return payload
}
export default mutations
