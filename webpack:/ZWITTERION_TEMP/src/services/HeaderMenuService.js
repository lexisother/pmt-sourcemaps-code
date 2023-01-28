import storeService from './StoreService'
import urlHelper from '../libraries/urlHelper'
import { store } from '../store'

class HeaderMenuService {
    /**
     * Returns a list of stores to be shown in store switch menu.
     * @returns {Promise<any>}
     */
    getSwitchStoreMenu() {
        return storeService.getActiveStores().then(items => {
            // Do not add current store to store selector.
            const currentStoreSlug = store.getters['stores/currentStore'] ? store.getters['stores/currentStore'].slug : ''
            const index = items.map(item => item.slug).indexOf(currentStoreSlug)
            if (index > -1) {
                items.splice(index, 1)
            }

            return mapStoresToSwitchStoreMenu(items)
        })
    }

    mapNavigationToHeaderMenu(sitemap) {
        return sitemap.mainNavigation
            .map(item => {
                const newItem = {
                    label: item.label,
                    icon: menuIcons[item.type.toLowerCase()] || 'account',
                    url: item.url || '',
                }

                if (item.items) {
                    newItem.subMenu = item.items.map(subItem => {
                        subItem.counter = null
                        if (typeof subItem.unread !== 'undefined') {
                            subItem.counter = subItem.unread
                        }
                        if (subItem.counter > 9) {
                            subItem.counter = '9+'
                        }

                        return {
                            label: subItem.label,
                            url: subItem.url,
                            category_name: subItem.category_name,
                            category_id: subItem.category_id,
                            counter: subItem.counter,
                            route: subItem.route,
                            match: subItem.match_routes,
                        }
                    })
                }
                return newItem
            })
    }

    /**
     * User menu for logged in user.
     *
     * @param sitemap
     * @returns {{label: *, icon: (*|string), url: (string)}[]}
     */
    mapUserItemsToHeaderMenu(sitemap) {
        return sitemap.userMenu[0].items
            .map(item => {
                const newItem = {
                    label: item.label,
                    type: item.type,
                    url: item.url || '',
                    route: item.route,
                    match: item.match_routes,
                }
                // Map Vue routes.
                switch (item.url) {
                    case '/my-account/information':
                        newItem.icon = 'card-account-details-outline'
                        break

                    case '/logout':
                        newItem.icon = 'logout-variant'
                        break

                    case '/suggestions':
                        newItem.icon = 'thumb-up-outline'
                        break
                }
                return newItem
            })
    }

    /**
     * User menu for guest user.
     *
     * @param sitemap
     * @returns {{label: *, icon: (*|string), url: (string), route: string}[]}
     */
    mapGuestUserItemsToHeaderMenu(sitemap) {
        return sitemap.userMenu
            .map(item => {
                return {
                    label: item.label,
                    type: item.type,
                    icon: menuIcons[item.type.toLowerCase()] || 'account',
                    url: item.url || '',
                    route: item.url === '/login' ? 'login' : '',
                }
            })
    }
}

// use the following icons for sitemap items (based on EN label).
const menuIcons = {
    overview: 'card-account-details-outline',
    communication: 'bullhorn',
    employees: 'account-group',
    planning: 'calendar-month',
    realization: 'clipboard-list',
    reports: 'chart-bar-stacked',
    configuration: 'cogs',
    dashboard: 'monitor-dashboard',
    home: 'home',
    apply: 'clipboard-list',
}

/**
 * Fetches the list of stores the current user has access to and creates a menu out of it.
 */
function mapStoresToSwitchStoreMenu(items) {
    return items.map(
        item => {
            item.url = urlHelper.getCurrentStoreUrl(item.slug)

            return {
                label: item.orgName,
                value: item,
                key: item.id,
            }
        })
}

export default new HeaderMenuService()
