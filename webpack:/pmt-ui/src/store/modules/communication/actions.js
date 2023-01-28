import communicationService from '../../../services/CommunicationService'

const actions = {
    getBirthdays(context, payload) {
        return communicationService.getBirthdayListOnDate(payload)
            .then((response) => {
                payload.response = response
                context.commit('setMonthBirthdays', payload)
                return payload.response
            })
            .catch((error) => {
                throw error
            })
    },

    getFullYearBirthdays(context, payload) {
        return communicationService.getBirthdayListOnDate(payload)
            .then((response) => {
                payload.response = response
                context.commit('setYearBirthdays', payload)
                return payload.response
            })
            .catch((error) => {
                throw error
            })
    },

    getBirthdaysForInfoCards(context, payload) {
        return communicationService.getBirthdayListOnDate(payload)
            .then((response) => {
                context.commit(`${payload.format}Birthdays`, response)
                return payload.response
            })
            .catch((error) => {
                throw error
            })
    },

    getSmsMessages(context) {
        if (context.state.smsMessages.length > 0) {
            return new Promise((resolve) => { resolve(context.state.smsMessages) })
        }
        return communicationService.getSmsMessages()
            .then((response) => {
                context.commit('SET_SMS_MESSAGES', response.result)
                context.commit('SET_SMS_HISTORY_EMPLOYEES', response.aggregation.accounts)
                return response
            })
            .catch((error) => {
                throw error
            })
    },

}

export default actions
