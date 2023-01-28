import storeService from '../../../services/StoreService'
import urlHelper from '../../../libraries/urlHelper'
import language from '../../../config/language'

const actions = {
    /**
     * Fetches the stores the current user has access to and sets the active store to the state.
     *
     * @returns {*}
     */
    initStores(context, payload) {
        const methodName = payload && payload.allStores ? 'getAllStores' : 'getActiveStores'

        return storeService[methodName]()
            .then(stores => {
                return context.dispatch('getActiveStore', { stores: stores, returnEmpty: false, hideRedirectMessage: payload && payload.hideRedirectMessage })
                    .then(response => {
                        if (!!response && !response.redirectTo) {
                            context.commit('registerStores', stores)
                            context.dispatch('changeActiveStore', response)
                        }

                        return response
                    })
            })
    },

    changeActiveStore({ commit }, store) {
        commit('setActiveStore', store)
        commit('changeFavicon', store)
    },

    /**
     * Returns the roles for a store or for current store if no store provided.
     * Stores response in the state.
     *
     * @param context
     * @param storeId
     * @returns {Promise<void>}
     */
    GET_STORE_ROLES(context, storeId) {
        if (context.state.storeRoles.length > 0) {
            return new Promise((resolve) => { resolve(context.state.storeRoles) })
        }
        if (context.state.storeRoles.length < 1) {
            const payload = {}
            if (storeId) {
                payload.store_id = storeId
            }
            return storeService.getRoles(payload)
                .then((response) => {
                    context.commit('setStoreRoles', response)
                })
        }
    },

    /**
     * Get roles filtered by provided payload.
     *
     * @param context
     * @param payload
     *
     * @returns {Promise<*>}
     */
    GET_ROLES(context, payload) {
        return storeService.getRoles(payload)
            .then((response) => {
                // This response cannot be stored in vuex because any combination of filters is accepted.
                return response
            })
    },

    /**
     * Returns active store for logged in user.
     * If user has a store assigned, returns that store. Otherwise it's calculated based on subdomain.
     *
     * @returns {*}
     */
    getActiveStore(context, payload) {
        let storeSlug = ''
        if (localStorage.getItem('subdomain')) {
            storeSlug = localStorage.getItem('subdomain').toLowerCase()
        }
        const stores = payload.stores

        let activeStore = null
        stores.forEach((element) => {
            if (storeSlug === element.slug.toLowerCase()) {
                activeStore = element
            }
        })

        // If user has access to multiple stores, check if current slug is valid.
        if (stores.length > 1) {
            // Return root store (which actually is the first store).
            if (!storeSlug || !activeStore) {
                context.commit('forgetStore')
                if (storeSlug) {
                    return { redirectTo: { name: 'select-store', params: { wrong_slug: storeSlug, noStore: true } } }
                } else {
                    return { redirectTo: { name: 'select-store', params: { noStore: true } } }
                }
            }
        }

        if (stores.length === 1) {
            // If different storeSlug than user has access to, show warning and redirect to right store.
            if (!!storeSlug && !activeStore) {
                if (!payload.hideRedirectMessage) {
                    context.commit('SET_SNACKBAR', {
                        message: language.t('generalMessages.errors.invalidSubdomain', [storeSlug, stores[0].slug]),
                        error: true,
                    }, { root: true })
                }

                const redirectTo = urlHelper.getCurrentStoreUrl(stores[0].slug)

                return { redirectTo: redirectTo }
            } else if (!storeSlug) {
                // Redirect to user's store with no warning if no store is selected.
                return stores[0]
            }
        }
        return activeStore
    },

    /**
     * Loads stores data from local storage.
     * Returns true if data was found, false otherwise.
     *
     * @param commit
     * @returns {boolean}
     */
    loadStoreDataFromCache({ commit, dispatch }) {
        let stores = localStorage.getItem('stores')
        let activeStore = localStorage.getItem('active-store')

        if (!stores || !activeStore) {
            return false
        }

        // Check if store has been changed.
        stores = JSON.parse(stores)

        return dispatch('getActiveStore', { stores: stores, returnEmpty: true }).then(response => {
            if (!!response && !response.redirectTo) {
                activeStore = response
            } else {
                // If new store is not valid, keep the previous store and show a message.
                activeStore = JSON.parse(activeStore)
            }

            commit('registerStores', stores)
            commit('setActiveStore', activeStore)

            return true
        })
    },

    /**
     * Get current store week business times
     *
     * @param {Vuex} context
     * @param {Object} date
     * @returns {Promise<*>}
     */
    async getCurrentStoreWeekBusinessTimes(context, date) {
        const existingTimes = await context.getters.storeWeekBusinessTimes(date)
        if (existingTimes) {
            // return existing business times
            return new Promise((resolve) => { resolve(existingTimes) })
        }
        if (!context.state.loading.storeTimes) {
            const storeId = context.getters.currentStore.id
            const params = {
                'date[gte]': date.startOf('isoWeek').apiFormat(),
                'date[lte]': date.endOf('isoWeek').apiFormat(),
            }
            context.commit('TOGGLE_LOADING', 'stores/storeTimes', { root: true })
            return storeService.getStoreBusinessTimes(storeId, params).then((result) => {
                const statePayload = {
                    storeId,
                    ...date.weekYearObject(),
                    result,
                }
                context.commit('setStoreWeekBusinessTimes', statePayload)
                return context.getters.storeWeekBusinessTimes(date)
            }).finally(() => {
                context.commit('TOGGLE_LOADING', 'stores/storeTimes', { root: true })
            })
        }
    },

    /**
     * Returns status for a week.
     *
     * @param context
     * @param payload
     *
     * @returns {Promise<unknown>|Promise<void>}
     */
    getWeekStatus(context, payload) {
        // check if it was fetched before
        const weekStatus = context.getters.weekStatus(payload.week)
        if (weekStatus) {
            return new Promise((resolve) => { resolve(weekStatus) })
        }

        context.commit('TOGGLE_LOADING', 'stores/weekStatus', { root: true })
        return storeService.getWeekStatuses(payload).then(result => {
            context.commit('setWeekStatus', { weekYear: payload.week, status: result })
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'stores/weekStatus', { root: true })
        })
    },
}

export default actions
