import service from '../../../../../services/configuration/ContextRoutesService'

const actions = {
    /**
     * Gets and stores all RouteContexts
     * @returns {Promise}
     */
    getContextRoutes(context, v3) {
        context.commit('TOGGLE_LOADING', 'configuration/contextRoutes', { root: true })
        return service.getContextRoutes(v3).then(result => {
            if (v3) {
                context.commit('SET_ROUTE_CONTEXTS', result.data.result)
            } else {
                context.commit('SET_ROUTE_CONTEXTS_CSRF', result._csrf_token)
                context.commit('SET_SAVE_CONTEXTS_CSRF', result._csrf_token_save_context)
                context.commit('SET_ROUTE_CONTEXTS', result.contexts)
                context.commit('SET_CONTEXT_MODULES', result.modules)
            }
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'configuration/contextRoutes', { root: true })
        })
    },

    /**
     * Saves context routes access.
     * Can be used to save one or multiple routes
     * @param {VUEX} context
     * @param {Object} payload
     */
    saveContextRoutes(context, payload) {
        context.commit('TOGGLE_SAVING', 'configuration/contextRoutes', { root: true })
        return service.saveContextRoutes(payload).then(result => {
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_SAVING', 'configuration/contextRoutes', { root: true })
        })
    },

    /**
     * Saves or creates a new context
     * @param {VUEX} context
     * @param {Object} payload
     */
    saveContext(context, payload) {
        context.commit('TOGGLE_SAVING', 'configuration/contextRoutes', { root: true })
        return service.saveContext(payload).then(result => {
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_SAVING', 'configuration/contextRoutes', { root: true })
        })
    },
}
export default actions
