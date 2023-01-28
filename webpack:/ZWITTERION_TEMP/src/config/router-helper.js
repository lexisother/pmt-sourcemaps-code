import { store } from '../store'
import stringHelper from '../libraries/stringHelper'
import urlHelper from '../libraries/urlHelper'
import apiHelper from '../libraries/apiHelper'
import language from './language'
import globalSettings from './global-settings'
import authService from '../services/AuthService'
import * as moment from '../config/moment'
import Vue from 'vue'
Vue.use(moment)

const routerHelper = {

    /**
     * Route is only accessible when the current user is authenticated.
     * Will redirect the browser to the login page if not.
     *
     * Will also check access to Zendesk widget.
     *
     * @param {object} to
     * @param {object} from
     * @param {function} next
     */
    authRoute(to, from, next) {
        if (store.getters.isMaintenanceMode) {
            return
        }

        const isSSORoute = globalSettings.settings.ssoMenuRoutes.includes(to.name)
        urlHelper.setSubdomain()

        // Perform store switch login.
        if (window.$cookies.get('token') !== null) {
            return store.dispatch('auth/loginFromUserToken', { useRedirect: (isSSORoute && to.name === 'homesso') }, { root: true }).then(() => {
                next()
            })
        }

        // Check if date is not in future for clocktimes page; if so redirect to today
        if (to.name === 'time-registrations-page') {
            const now = Vue.moment().format('YYYY-MM-DD')
            if (to.params.date > now) {
                to.params.date = now
                next()
            }
        }

        const currentUser = store.getters['auth/user']

        // Always redirect to change password if user has an expired password or it will expire soon.
        if (currentUser && to.name && to.name !== 'my-account-information' && (currentUser.expiredPassword || currentUser.passwordWillExpire)) {
            // If we already displayed the message reset expiration password notice and go to the next page.
            if (from && from.name === 'my-account-information') {
                store.commit('auth/updateUserData', { passwordWillExpire: false, daysUntilPasswordExpired: 0 }, { root: true })
            } else {
                next({ name: 'my-account-information' })

                return
            }
        }

        if (store.getters['auth/isAuthenticated']) {
            routerHelper.storeLastVisitedPage(to)
            // User was successfully authenticated but not store was selected.
            if (!currentUser.storeId && !store.getters['stores/currentStore'] && !localStorage.getItem('subdomain')) {
                next({ name: 'select-store' })

                return
            }
            // Go to pmt1.
            if (location.hash !== '') {
                authService.loginToLegacyAndRedirect(next)
                return
            }
            routerHelper.loadZendeskWidget(to.name)
            next()
        } else {
            routerHelper.storeLastVisitedPage(to)
            if (!isSSORoute) {
                // Try to login based on pmt1 login.
                store.dispatch('auth/loginFromLocalStorage', null, { root: true }).then(response => {
                    routerHelper.afterLoginFromLocalStorage(to, from, next)
                })
            } else {
                // Perform SSO LOGIN.
                store.commit('setSitemapFetched', false)
                to.query.subdomain = localStorage.getItem('subdomain')
                if (to.query.sessionid === localStorage.getItem('afasSessionId') && localStorage.getItem('token') !== null) {
                    return store.dispatch('auth/loginFromLocalStorage', null, { root: true }).then(response => {
                        routerHelper.afterLoginFromLocalStorage(to, from, next)
                    })
                }

                store.dispatch('auth/loginSso', {
                    credentials: to.query,
                    useRedirect: to.name === 'homesso',
                    redirectTo: to.path,
                }).then(response => {
                    if (response !== false) {
                        next()
                        store.commit('setSitemapFetched', true)
                    } else {
                        store.commit('SET_SNACKBAR', {
                            message: language.t('apiErrors.account.errorSsoLogin'),
                            autoClose: true,
                            error: true,
                        }, { root: true })
                        next({ name: 'login' })
                        store.commit('setSitemapFetched', true)
                    }
                })
            }
        }
    },

    /**
     * Route is only accessible when the current user is NOT authenticated.
     * Will redirect the browser to the home page if not.
     *
     * Will also check access to Zendesk widget.
     *
     * @param {object} to
     * @param {object} from
     * @param {function} next
     */
    guestRoute(to, from, next) {
        urlHelper.setSubdomain()

        // Perform store switch login. This doesn't need a next() action because it performs an internal redirect after login
        if (window.$cookies.get('token') !== null) {
            return store.dispatch('auth/loginFromUserToken', { useRedirect: true }, { root: true })
        }

        // Redirect logged in users.
        if (store.getters['auth/isAuthenticated']) {
            if (location.hash === '') {
                next({ name: 'last-visited-page' })
            } else {
                // Check if we got here form pmt1. If so, attempt a pmt1 login.
                authService.loginToLegacyAndRedirect(next)
            }

            return
        }

        if (localStorage.getItem('token')) {
            return store.dispatch('auth/loginFromLocalStorage', null, { root: true }).then(response => {
                routerHelper.afterLoginFromLocalStorage(to, from, next)
            })
        } else {
            apiHelper.deleteXApiUserHeader()
            return store.dispatch('menu/updateHeaderMenu', null, { root: true }).then(response => {
                next()
            })
        }
    },

    /**
     * Before handler for routes which can be accessed by both anonymous and authenticated users.
     * Makes sure sitemap is fetched in order to nicely display the menu and load the page.
     *
     * @param to
     * @param from
     * @param next
     */
    async mixedRoute(to, from, next) {
        if (!store.getters['auth/isAuthenticated']) {
            await store.dispatch('auth/loginFromLocalStorage', null, { root: true })
        }
        await store.dispatch('menu/updateHeaderMenu', null, { root: true })
        next()
    },

    /**
     * Actions performed after successfully login in based on local storage.
     *
     * @param to
     * @param from
     * @param next
     */
    afterLoginFromLocalStorage(to, from, next) {
        if (store.getters['auth/isAuthenticated']) {
            routerHelper.storeLastVisitedPage(to)
            const currentUser = store.getters['auth/user']
            // Always redirect to change password if user has an expired password.
            if (currentUser && currentUser.expiredPassword && to.name && to.name !== 'my-account-information') {
                next({ name: 'my-account-information' })
            } else {
                if (to.name === 'homesso') {
                    next({ name: 'my-schedule-init' })
                } else {
                    next({ name: 'last-visited-page' })
                }
            }
        } else {
            store.dispatch('auth/logout', null, { root: true }).then(() => {
                next({ name: 'login' })
            })
        }
    },

    /**
     * Stores the given route as the last visited page for the current loggedin user.
     *
     * @param {object} route
     */
    storeLastVisitedPage(route) {
        if (route.name !== 'login') {
            const lastVisitedPage = {
                name: route.name,
                params: route.params,
                query: route.query,
            }
            const user = store.getters['auth/user']
            localStorage.setItem(`${user ? `${user.accountId}:` : ''}lastVisitedPage`, JSON.stringify(lastVisitedPage))
        }
    },

    /**
     * Returns the stored last visited page of the current logged in user.
     *
     * @returns {object}
     */
    getStoredLastVisitedPage() {
        const user = store.getters['auth/user']
        let page = localStorage.getItem('lastVisitedPage')
        if (!page) {
            // all other times set user last visited page
            page = localStorage.getItem(`${user ? `${user.accountId}:` : ''}lastVisitedPage`)
        }
        if (!page) {
            return null
        }
        return JSON.parse(page)
    },

    /**
     * Function to display the zendesk widget suggestions based on page.
     * @param {String} route
     *
     */
    async loadZendeskWidget(route) {
        // Load Zendesk widget if rights comply
        if (store.getters['auth/canViewZendeskWidget']) {
            const checkHtmlForZendeskWidget = document.getElementById('ze-snippet')
            if (checkHtmlForZendeskWidget === null) {
                await routerHelper.loadZendeskWidgetHtml()
            }
            // If login page is not login then show/hide widget and get page based results in the widget body.
            // AHA 15-10-2020: In the else we do exactly the same, this is so that mobile view doesn't break :)
            if (route !== 'login' && typeof zE === 'undefined') {
                routerHelper.loadZendeskLabels(route)
            } else {
                routerHelper.loadZendeskLabels(route)
            }
        }
    },

    /**
     * Loads the zendesk widget when the rights comply for the user
     */
    loadZendeskWidgetHtml() {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.id = 'ze-snippet'
        script.async = true
        script.src = 'https://static.zdassets.com/ekr/snippet.js?key=e4e41235-f639-4231-acbd-4bec13c8832c'
        document.getElementsByTagName('head')[0].appendChild(script)
    },

    loadZendeskLabels(route) {
        setTimeout(() => {
            if (typeof zE !== 'undefined') {
                // This is an array because Zendesk needs it like that
                const label = ['widget_' + stringHelper.camelCaseHyphenString(route)]
                window.zE('webWidget', 'helpCenter:setSuggestions', { labels: label })

                // We always hide by default because the widget icon/button itself should not be visible, only when we want it to
                window.zE(() => window.zE.hide())

                store.commit('SET_ZENDESK_LABEL', label[0], { root: true })
            }
        }, 1000)
    },

    /**
     * Import all of the resource routes files.
     *
     * @returns {*}
     */
    loadRoutes() {
        const context = require.context('../pages', true, /resources\/router.js$/i)
        return context.keys()
            .map(context) // import module
            .map(m => m.default) // get `default` export from each resolved module
    },

}

export default routerHelper
