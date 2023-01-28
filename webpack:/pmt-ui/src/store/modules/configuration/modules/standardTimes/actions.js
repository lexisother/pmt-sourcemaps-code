import service from '../../../../../services/configuration/StandardTimesService'

const actions = {
    /**
     * Gets all standard times
     * @returns {Promise}
     */
    getStandardTimes(context) {
        if (context.state.standardTimes.length > 0) {
            return context.state.standardTimes
        }
        return service.getStandardTimes().then(data => {
            context.commit('SET_STANDARD_TIMES', data)
            return data
        }).catch(error => {
            context.commit('SET_STANDARD_TIMES_API_ERROR', error.message)
            throw error
        })
    },

    addStandardTimes(context, payload) {
        return service.addStandardTimes(payload).then(data => {
            context.commit('ADD_STANDARD_TIMES', data)
            context.commit('SET_STANDARD_TIMES_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_STANDARD_TIMES_API_ERROR', error.message)
            throw error
        })
    },

    editStandardTimes(context, payload) {
        return service.editStandardTimes(payload).then(data => {
            context.commit('UPDATE_STANDARD_TIMES', data)
            context.commit('SET_STANDARD_TIMES_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_STANDARD_TIMES_API_ERROR', error.message)
            throw error
        })
    },
}
export default actions
