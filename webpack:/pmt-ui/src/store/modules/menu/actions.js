import Vue from 'vue'
import HeaderMenuService from '../../../services/HeaderMenuService'
import SiteService from '../../../services/SiteService'
import stringHelper from '../../../libraries/stringHelper'
import newsService from '../../../services/NewsService'
import whatsNewService from '../../../services/WhatsNewService'

const actions = {

    /**
     * Fetches sitemap and stores it in state.
     *
     * @param context
     * @param payload
     * @returns {Promise<any>}
     */
    getSitemap(context, payload) {
        context.commit('setSitemapFetched', false)
        const currentStore = context.rootGetters['stores/currentStore']
        const isAuthenticated = context.rootGetters['auth/isAuthenticated']
        const forceReload = payload ? payload.forceReload : false
        if (localStorage.getItem('sitemap') !== null && isAuthenticated && window.$cookies.get('sitemapExpiration') !== null && !forceReload) {
            const sitemap = JSON.parse(localStorage.getItem('sitemap'))
            context.commit('setSitemapResponse', sitemap)
            if (!(!!currentStore && currentStore.id === sitemap.currentStore.id)) {
                context.commit('stores/setActiveStoreInState', sitemap.currentStore, { root: true })
            }
            context.commit('setSitemapFetched')
            context.commit('news/setUnreadNewsCounter', localStorage.getItem('unreadNewsCounter'), { root: true })

            return sitemap
        }

        // If not in local storage, make sitemap call.
        return SiteService.getSitemap().then(async (response) => {
            if (isAuthenticated) {
                await context.dispatch('SET_COOKIE', {
                    name: 'sitemapExpiration',
                    value: Vue.moment().format('hh:mm:ss'),
                    expiration: '1h',
                }, { root: true })

                localStorage.setItem('sitemap', JSON.stringify(response))
            }

            context.commit('setSitemapResponse', response)
            if (isAuthenticated) {
                context.dispatch('news/setUnreadNewsCounter', {}, { root: true })
            }
            if (!(!!currentStore && !!response.currentStore && currentStore.id === response.currentStore.id)) {
                context.commit('stores/setActiveStoreInState', response.currentStore, { root: true })
            }
            return response
        }).catch((error) => {
            throw error
        }).finally(() => {
            context.commit('setSitemapFetched')
        })
    },

    updateHeaderMenu({ dispatch, commit, getters, rootGetters }) {
        const currentStore = rootGetters['stores/currentStore']
        const isAuthenticated = rootGetters['auth/isAuthenticated']
        return dispatch('getSitemap').then((response) => {
            const menuItems = HeaderMenuService.mapNavigationToHeaderMenu(response)
            menuItems.forEach(menuItem => {
                if (menuItem.subMenu && menuItem.subMenu.find(item => item.category_name)) {
                    menuItem.subMenu.categories = stringHelper.groupBy(menuItem.subMenu, 'category_name')
                }
            })

            commit('setMenuAsHeaderMenu', menuItems)

            const methodName = isAuthenticated ? 'mapUserItemsToHeaderMenu' : 'mapGuestUserItemsToHeaderMenu'
            const userMenuItems = HeaderMenuService[methodName](response)
            commit('setMenuAsHeaderUserMenu', userMenuItems)

            if (isAuthenticated && rootGetters['stores/getAllStores'].length > 1) {
                HeaderMenuService.getSwitchStoreMenu(currentStore)
                    .then((menuItems) => {
                        commit('setStoreSwitchMenu', menuItems)
                    })
            }
        })
    },

    setActiveSubMenu({ commit }, subMenu) {
        commit('setActiveSubMenu', subMenu)
    },

    /**
             * Gets the whats new items based on the newsService.getsWhatsNew, bigger docblock there.
             */
    getWhatsNew(context) {
        const version = whatsNewService.version()

        const existingarticles = context.state.whatsNewArticles
        if (existingarticles) {
            return new Promise((resolve) => { resolve(existingarticles) })
        }
        return newsService.getWhatsNew(version).then((response) => {
            context.commit('SET_WHATSNEW_ARTICLES', response)
            return response
        }).catch((error) => {
            throw error
        })
    },
}

export default actions
