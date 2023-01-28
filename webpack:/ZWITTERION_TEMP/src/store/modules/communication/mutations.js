import objectHelper from '../../../libraries/objectHelper'
import stringHelper from '../../../libraries/stringHelper'
import moment from 'moment'

const mutations = {
    setMonthBirthdays(state, payload) {
        payload.response = payload.response.map(element => {
            const date = moment(element.date_of_birth)
            const month = date.format('MM').toString()
            element.yearMonth = `${moment(payload.end).format('YYYY')}-${month}`
            return element
        })

        const result = stringHelper.groupBy(payload.response, 'yearMonth')

        state.birthdays[payload.yearMonth] = result[payload.yearMonth]
    },
    setYearBirthdays(state, payload) {
        payload.response = payload.response.map(element => {
            const date = moment(element.date_of_birth)
            const month = date.format('MM').toString()
            element.month = month
            return element
        })

        const result = stringHelper.groupBy(payload.response, 'month')

        const size = objectHelper.objectSize(result)
        for (let index = 1; index < size + 1; index++) {
            let newMonth = index
            if (newMonth < 10) {
                newMonth = `0${newMonth}`
            }
            payload.yearMonth = `${payload.year}-${newMonth}`
            if (typeof state.birthdays[payload.yearMonth] === 'undefined') {
                state.birthdays[payload.yearMonth] = result[newMonth]
            }
            if (typeof state.yearBirthdays[payload.yearMonth] === 'undefined') {
                state.yearBirthdays[payload.yearMonth] = result[newMonth]
            }
        }
    },
    pastBirthdays(state, response) {
        state.pastBirthdays = response
    },
    todayBirthdays(state, response) {
        state.todayBirthdays = response
    },
    futureBirthdays(state, response) {
        state.futureBirthdays = response
    },

    SET_SELECTED_EMPLOYEES(state, payload) {
        state.selectedEmployees = payload
    },

    SET_SMS_MESSAGES(state, payload) {
        state.smsMessages = payload
    },

    UPDATE_SMS_MESSAGES(state, payload) {
        state.smsMessages.push(payload)
    },

    SET_SMS_HISTORY_EMPLOYEES(state, payload) {
        state.smsHistoryEmployees = payload
    },
}
export default mutations
