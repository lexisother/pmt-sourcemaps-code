import Vue from 'vue'
const mutations = {

    /**
     * Sets the contexts in state
     * @param {Object} state VUEX
     * @param {Object} data
     */
    SET_ROUTE_CONTEXTS (state, data) {
        state.routeContexts = data
    },

    /**
     * Sets the context CSRF token in state
     * This token is used for saving routes
     * @param {Object} state VUEX
     * @param {Object} data
     */

    SET_ROUTE_CONTEXTS_CSRF (state, data) {
        state.routeContextsCsrf = data
    },

    /**
     * Sets the context Save CSRF token in state
     * This token is used for saving existing
     * or creating new contextx
     * @param {Object} state VUEX
     * @param {Object} data
     */
    SET_SAVE_CONTEXTS_CSRF (state, data) {
        state.saveContextsCsrf = data
    },

    /**
     * Sets the contexts modules in state
     * and also makes an original copy of the same
     * to be used for saving only differences
     * @param {Object} state VUEX
     * @param {Object} data
     */
    SET_CONTEXT_MODULES (state, data) {
        state.contextModules = data
        state.originalContextModules = JSON.parse(JSON.stringify(data))
    },

    /**
     * Saves a context.
     * Used when editing a context.
     * @param {Object} state VUEX
     * @param {Object} payload
     */
    SET_CONTEXT (state, payload) {
        const existingIndex = state.routeContexts.findIndex(c => c.context_id === payload.context_id)
        if (existingIndex > -1) {
            Vue.set(state.routeContexts, existingIndex, payload)
        }
    },

    /**
     * Sets a context modules all routes access to true or false
     * Used by toggle all option for a module
     * @param {Object} state VUEX
     * @param {Object} {contextId, moduleName, access}
     */
    SET_MODULE_ALL_ACCESS (state, { contextId, moduleName, access }) {
        const moduleIndex = state.contextModules.findIndex(module => {
            return module.context_id === contextId && module.name === moduleName
        })
        const module = state.contextModules[moduleIndex]
        for (let i = 0; i < module.routes.length; i++) {
            state.contextModules[moduleIndex].routes[i].access = access
        }
    },

    /**
     * Sets a context all modules routes access to true or false
     * Used by toggle all option for a context
     * @param {Object} state VUEX
     * @param {Object} {contextId, access}
     */
    SET_CONTEXT_ALL_MODULE_ACCESS (state, { contextId, access }) {
        const modules = state.contextModules.filter(module => {
            return module.context_id === contextId
        })
        modules.forEach(module => {
            for (let i = 0; i < module.routes.length; i++) {
                module.routes[i].access = access
            }
        })
    },

    /**
     * Reverts all context modules changes to the original context modules.
     * Used when api call returns an error.
     * @param {Object} state VUEX
     */
    REVERT_CONTEXT_ALL_MODULE_CHANGES (state) {
        state.contextModules = JSON.parse(JSON.stringify(state.originalContextModules))
    },

    /**
     * Updates original context modules with a new set from the database.
     * @param {Object} state VUEX
     */
    UPDATE_ORIGINAL_CONTEXTS (state) {
        state.originalContextModules = JSON.parse(JSON.stringify(state.contextModules))
    },

    /**
     * Sets the selected context into VUEX state.
     * Used by the context selector.
     * @param {Object} state VUEX
     * @param {Object} context
     */
    SET_SELECTED_CONTEXT (state, context) {
        state.selectedContext = context
    },

    /**
     * Finds a route and sets the access to true or false
     * @param {Object} state VUEX
     * @param {Object} payload
     */
    SET_ROUTE_ACCESS (state, payload) {
        for (let i = 0; i < state.contextModules.length; i++) {
            for (let j = 0; j < state.contextModules[i].routes.length; j++) {
                const sameContext = state.contextModules[i].context_id === payload.contextId
                const sameRoute = state.contextModules[i].routes[j].id === payload.routeId
                if (sameContext && sameRoute) {
                    state.contextModules[i].routes[j].access = payload.value
                    break
                }
            }
        }
    },
}
export default mutations
