import pmtApi from '../libraries/pmtApi'
import language from '../config/language'
import storeService from './StoreService'
import { store } from '../store'

class SiteService {
    /**
     * Returns the site map of the current user.
     *
     * @param {int} storeId
     * @returns {Promise}
     */
    getSitemap(storeId) {
        const params = { language: language.locale }
        if (storeId) {
            params.store_id = storeId
        }

        return pmtApi.get('/sitemap', { params: params })
            .then((response) => {
                const items = response.data.result
                const layout = items.layout
                layout.store_id = items.store_id

                loadZendeskStyle(layout)

                return {
                    mainNavigation: items.navigation,
                    userMenu: items.user,
                    currentStore: storeService.processCurrentStore(layout),
                }
            }).catch(error => {
                if (error.code === 503) {
                    throw error
                }

                // For any other sitemap related error better not show the navigation than break entire app.
                return {
                    mainNavigation: [],
                    userMenu: [],
                }
            })
    }

    /**
     * Checks if a url is valid - is in the response of sitemap call.
     *
     * @param url
     * @returns {boolean}
     */
    checkUrlExists(url) {
        let found = false
        store.getters['menu/headerMenuItems'].forEach(menuItem => {
            if (!found && !!menuItem.url && menuItem.url === url) {
                found = true
            }
            if (menuItem.subMenu) {
                menuItem.subMenu.forEach(subMenuItem => {
                    if (!found && !!subMenuItem.url && subMenuItem.url === url) {
                        found = true
                    }
                })
            }
        })

        store.getters['menu/headerUserMenuItems'].forEach(userItem => {
            if (!found && !!userItem.url && userItem.url === url) {
                found = true
            }
        })

        return found
    }
}

function loadZendeskStyle(layout) {
    try {
        window.zESettings = {
            webWidget: {
                zIndex: 60,
                color: {
                    launcher: layout.background_color,
                    launcherText: layout.color,
                    header: layout.background_color,
                },
            },
        }
    } catch (error) {

    }
}

export default new SiteService()
