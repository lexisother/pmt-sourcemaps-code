import Vue from 'vue'
const mutations = {
    SET_SNACKBAR (state, payload) {
        if (state.snackbar) {
            state.snackbar.show = payload.show || true
            state.snackbar.message = payload.message || ''
            state.snackbar.error = payload.error || false
            state.snackbar.success = payload.success || false
            state.snackbar.warning = payload.warning || false
            state.snackbar.autoClose = payload.autoClose || true
            state.snackbar.top = payload.top || false
            state.snackbar.bottom = payload.bottom || true
            state.snackbar.left = payload.left || false
            state.snackbar.right = payload.right || false
            state.snackbar.multiLine = payload.multiLine || false
            state.snackbar.vertical = payload.vertical || false
            state.snackbar.permanent = payload.permanent || false
            state.snackbar.color = payload.color || null
        }
    },

    HIDE_SNACKBAR (state) {
        state.snackbar.show = false
        // eslint-disable-next-line no-unused-vars
        for (const prop in state.snackbar) {
            if (prop === 'timeout') {
                state.snackbar[prop] = 5000
                continue
            }
            if (prop === 'message') {
                state.snackbar[prop] = ''
                continue
            }
            state.snackbar[prop] = false
        }
    },

    UPDATE_PAGE_WIDTH (state) {
        state.pageWidth = window.innerWidth
        state.pageHeight = window.innerHeight
    },

    UPDATE_SCROLL_POSITION (state) {
        let interval = null
        interval = setInterval(() => {
            const scrollElement = document.getElementById('main')
            if (scrollElement !== null && scrollElement.addEventListener) {
                scrollElement.addEventListener(
                    'scroll',
                    function () {
                        state.scroll = scrollElement.scrollTop
                        clearInterval(interval)
                    },
                    false,
                )
            }
        }, 1000)
    },

    /**
     * Sets loading to any module prop that is provided.
     * This is a global method that can be used inside
     * modules actions or even inside components.
     * This should be used when fetching data from the api
     * @param {VUEX} state
     * @param {String} mouduleStateProp
     */
    TOGGLE_LOADING (state, mouduleStateProp) {
        const module = mouduleStateProp.split('/')[0]
        const prop = mouduleStateProp.split('/')[1]
        if (warnMissingStoreProps(state, module, prop, 'loading')) return
        Vue.set(state[module].loading, prop, !state[module].loading[prop])
    },

    /**
     * Sets saving to any module prop that is provided.
     * This is a global method that can be used inside
     * modules actions or even inside components
     * This should be used when puting or posting data to the api
     * @param {VUEX} state
     * @param {String} mouduleStateProp
     */
    TOGGLE_SAVING (state, mouduleStateProp) {
        const module = mouduleStateProp.split('/')[0]
        const prop = mouduleStateProp.split('/')[1]
        if (warnMissingStoreProps(state, module, prop, 'saving')) return
        Vue.set(state[module].saving, prop, !state[module].saving[prop])
    },

    /**
     * Updates page filters based on the paylod
     */
    UPDATE_PAGE_FILTER (state, payload) {
        if (payload.filter === 'active') {
            state.pageFilters[payload.filter] = payload.value
            return
        }

        if (typeof state.pageFilters[payload.filter] !== 'boolean') {
            const add = state.pageFilters[payload.filter] && !state.pageFilters[payload.filter].includes(payload.value)
            if (add) {
                state.pageFilters[payload.filter].push(payload.value)
            } else {
                state.pageFilters[payload.filter].splice(state.pageFilters[payload.filter].indexOf(payload.value), 1)
            }
        } else {
            state.pageFilters[payload.filter] = typeof payload.value === 'boolean' ? payload.value : !state.pageFilters[payload.filter]
        }
    },

    /**
     * Sets the amount of displayed rows in a data table on specific pages
     *
     * @param state
     * @param {Object} payload
     */
    SET_TABLE_ROWS_PER_PAGE (state, payload) {
        state.tableRowsPerPage[payload.routeName] = payload.tableRowsPerPage
    },

    /**
     * Sets which filter categories to be displayed in the fly-out filters menu.
     *
     * @param state
     * @param {Object} filters
     */
    UPDATE_ENABLED_FILTERS (state, filters) {
        state.enabledFilters = filters
    },

    /**
     * clears array and object filters
     * @param {VUEX} state
     */
    CLEAR_PAGE_FILTERS (state) {
        Object.keys(state.pageFilters).forEach(filter => {
            if (typeof state.pageFilters[filter] === 'object' || Array.isArray(state.pageFilters[filter])) {
                state.pageFilters[filter] = []
            }
        })
    },

    /**
     * Clears applied filters for one category.
     *
     * @param {string} filterCategory
     */
    CLEAR_FILTER_CATEGORY (state, filterCategory) {
        state.pageFilters[filterCategory] = []
    },

    /**
     * Clears only provided filters
     * @param {VUEX} state
     * @param {Array} payload
     */
    CLEAR_PARTICULAR_PAGE_FILTERS (state, payload) {
        payload.forEach(filter => {
            if (typeof state.pageFilters[filter] === 'object' || Array.isArray(state.pageFilters[filter])) {
                state.pageFilters[filter] = []
            }
            if (typeof state.pageFilters[filter] === 'boolean') {
                state.pageFilters[filter] = false
            }
        })
    },

    // Please make sure that the payload.state you recieve is also present in the states file
    SET_PARTICULAR_PAGE_FILTERS (state, payload) {
        state.pageFilters[payload.state] = payload.event
    },

    SET_APP_ONLINE (state, status) {
        state.online = status
    },

    /**
     * Updates maintenance mode variable.
     *
     * @param state
     * @param { Boolean } value
     */
    SET_MAINTENANCE_MODE (state, value) {
        const wasMaintenanceBefore = state.maintenanceMode
        state.maintenanceMode = value
        if (!value) {
            localStorage.removeItem('maintenanceMode')

            // Also, set flag to show reload button in the menu.
            if (wasMaintenanceBefore) {
                state.showReloadApp = true
            }
        } else {
            localStorage.setItem('maintenanceMode', value)
        }
    },

    SET_PAGE_FILTERS_DATE (state, payload) {
        state.pageFiltersDate = payload
    },

    async SET_APP_PRINTING (state, printing) {
        state.printing = printing
    },

    SET_API_ERRORS (state, call) {
        const found = state.apiErrors.some(error => {
            return error === call
        })
        if (!found) {
            state.apiErrors.push(call)
        }
    },

    SET_CRITICAL_APIS_LIST (state, list) {
        state.criticalApisList = list
    },

    REMOVE_NON_CRITICAL_API_ERRORS (state) {
        state.apiErrors = []
    },

    SET_ZENDESK_LABEL (state, label) {
        state.zendeskLabel = label
    },
}

function warnMissingStoreProps (state, module, prop, loadingOrSaving) {
    // don't check if module is configuration because it doesn't work
    if (module === 'configuration') {
        return true
    }

    // if module is not found
    if (!state[module]) {
        console.warn(`PMT WARNING Message: VUEX module not found: ${module}`)
        return true
    }
    // if loading or saving object is missing from module
    if (!state[module][loadingOrSaving]) {
        console.warn(`PMT WARNING Message: Missing ${module}.${loadingOrSaving} VUEX State property for ${module} module`)
        return true
    }
    // if prop is missing from loading object
    if (typeof state[module][loadingOrSaving][prop] === 'undefined') {
        console.warn(`PMT WARNING Message: Missing prop for ${module}.${loadingOrSaving} VUEX State: ${prop}`)
        return true
    }
}

export default mutations
