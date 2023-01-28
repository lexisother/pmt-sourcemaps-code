import vuexHelper from '../../../libraries/vuexHelper'
import urlHelper from '../../../libraries/urlHelper'
import Vue from 'vue'
const mutations = {
    registerStores(state, stores) {
        state.stores = stores

        rememberStores(stores)
    },
    setActiveStore(state, store) {
        if (store) {
            state.currentStore = store
            rememberActiveStore(store)
        }
    },
    setActiveStoreInState(state, store) {
        if (store) {
            state.currentStore = store
        }
    },
    forgetStore(state) {
        state.currentStore = null
        localStorage.removeItem('active-store')
        localStorage.removeItem('subdomain')
    },
    forgetStores(state, payload) {
        state.stores = null
        // only remove when online, sitemap call will re-set it again
        // if offline we need the current store to show store info and
        // customer theming on login screen
        if (payload.online) {
            localStorage.removeItem('stores')
        }
    },
    setStoreRoles(state, roles) {
        state.storeRoles = roles
    },
    changeFavicon(state, currentStore) {
        if (currentStore) {
            const favicon = currentStore.theme.favicon
            let faviconElement = document.querySelector('link[rel="icon"]')

            if (!faviconElement) {
                faviconElement = document.createElement('link')
                faviconElement.setAttribute('rel', 'shortcut icon')
                const head = document.querySelector('head')
                head.appendChild(faviconElement)
            }

            faviconElement.setAttribute('type', 'shortcut icon')
            faviconElement.setAttribute('type', 'image/x-icon')
            faviconElement.setAttribute('href', `${urlHelper.getHost()}/${favicon}?v=${Math.floor(Math.random() * 1111 * 1111)}`)
        }
    },

    /**
     * Sets the provided store business times grouped by year/week
     * @param {VUEX} state
     * @param {Object} payload
     */
    setStoreWeekBusinessTimes(state, payload) {
        const { year, week, storeId } = payload
        vuexHelper.setStoreYearWeekData(state, 'weekBusinessTimes', payload.result, year, week, storeId)
    },

    /**
     * Sets week status for a week.
     *
     * @param state
     * @param payload
     * @constructor
     */
    setWeekStatus(state, payload) {
        Vue.set(state.weekStatuses, `"${payload.weekYear}"`, payload.status[0] || { status: 'draft' })
    },

    setCustomStoreRoles(state, roles) {
        state.customStoreRoles = roles
    },
}

function rememberStores(stores) {
    localStorage.setItem('stores', JSON.stringify(stores))
}

function rememberActiveStore(store) {
    localStorage.setItem('active-store', JSON.stringify(store))
}
export default mutations
