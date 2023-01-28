/* eslint-disable no-labels */
const getters = {
    /**
     * Returns a context based on the id param
     * @param {Object} state VUEX
     * @param {Number} id
     * @returns {Array}
     */
    ROUTE_CONTEXT (state, id) {
        return state.routeContexts.find(context => context.id === id)
    },

    /**
     * Returns all route contexts
     * @param {Object} state VUEX
     * @returns {Array}
     */
    ROUTE_CONTEXTS (state) {
        return state.routeContexts
    },

    /**
     * Return a context modules based on context_id
     * @param {Object} state VUEX
     * @returns {Array} context modules
     */
    CONTEXT_MODULES: (state) => (contextId) => {
        return state.contextModules
            ? state.contextModules.filter(module => {
                return module.context_id === contextId
            })
            : []
    },

    /**
     * Determines if a module has at least one route with access set
     * @param {Object} state VUEX
     * @returns {Boolean}
     */
    ALL_MODULE_ROUTES_ACCESS: (state) => (contextId, moduleName) => {
        const module = state.contextModules.find(module => {
            return module.context_id === contextId && module.name === moduleName
        })
        if (!module) return false
        let checked = true
        for (let i = 0; i < module.routes.length; i++) {
            if (!module.routes[i].access) {
                checked = false
                break
            }
        }
        return checked
    },

    /**
     * Determines if a context has at least one module with a routes access set
     * @param {Object} state VUEX
     * @returns {Boolean}
     */
    ALL_CONTEXT_MODULE_ROUTES_ACCESS: (state) => (contextId) => {
        const modules = state.contextModules.filter(module => {
            return module.context_id === contextId
        })
        if (!modules.length) return false
        let checked = true
        modulesFor:
        for (let i = 0; i < modules.length; i++) {
            for (let j = 0; j < modules[i].routes.length; j++) {
                if (!modules[i].routes[j].access) {
                    checked = false
                    break modulesFor
                }
            }
        }
        return checked
    },
}
export default getters
