
import Vue from 'vue'
import VueRouter from 'vue-router'
import { store } from '../store'
import language from '../config/language'
import routerHelper from '../config/router-helper'
import apiHelper from '../libraries/apiHelper'
import urlHelper from '../libraries/urlHelper'
import CompanyService from '../services/CompanyService'
import siteService from '../services/SiteService'
import HomePage from '../pages/HomePage.vue'
import InfoPage from '../pages/ErrorPages/UrlErrorPage.vue'
import SelectStorePage from '../pages/SelectStorePage.vue'
import * as moment from '../config/moment.js'
import PrivacyStatementPage from '../pages/PrivacyStatementPage'

Vue.use(moment)

/**
 * The constant for routes returns an array for the sitemap.
 * Every object should contain:
 *  -name
 *  -path
 *  -component
 *  -beforeEnter
 *
 * When creating a fully new page the name needs to be communicated with Customer Serviced, because then help
 * articles need to be created based on it.
 *
 */

const routes = [
    {
        name: 'homesso',
        path: '/homesso',
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'home',
        path: '/',
        component: HomePage,
        beforeEnter(to, from, next) {
            // Check if we need to redirect to Loket connection page.
            if (urlHelper.getSubdomain().indexOf('retailsolutions') > -1 && urlHelper.urlParam('state') && urlHelper.urlParam('code')) {
                window.location = `/loket/connection?state=${encodeURIComponent(urlHelper.urlParam('state'))}&code=${encodeURIComponent(urlHelper.urlParam('code'))}`

                return
            }

            // This section redirects to an info page if we receive specific URL queries for it
            if (to.query.message) {
                next({ name: 'info-page', query: { message: to.query.message, type: to.query.type } })
                return
            }

            if (store.getters['auth/isAuthenticated']) {
                next({ name: 'my-schedule-init' })

                return
            }

            if (from.name) {
                next()

                return
            }
            urlHelper.setSubdomain()

            // Store switch.
            if (window.$cookies.get('token') !== null) {
                return store.dispatch('auth/loginFromUserToken', null, { root: true }).then((response) => {
                    if (location.hash !== '') {
                        window.location = location.hash.substr(1)
                    } else {
                        next()
                    }
                })
            }

            // Log in from local storage.
            if (localStorage.getItem('token') !== null) {
                return store.dispatch('auth/loginFromLocalStorage', null, { root: true }).then(response => {
                    if (!store.getters['auth/isAuthenticated']) {
                        next({ name: 'login' })
                        return
                    }

                    next()
                })
            }

            store.dispatch('menu/updateHeaderMenu', null, { root: true }).then(respone => {
                if (window.$cookies.get('loginCookie') !== null) {
                    next({ name: 'login' })
                } else {
                    next()
                }
            })
        },
    },
    {
        name: 'select-store',
        path: '/select-store',
        component: SelectStorePage,
    },
    {
        name: 'last-visited-page',
        path: '/last-visited-page',
        redirect: to => {
            const lastVisitedPage = routerHelper.getStoredLastVisitedPage()
            // Remove last-visited-page stored for anonymous users.
            localStorage.removeItem('lastVisitedPage')
            if (lastVisitedPage) {
                return lastVisitedPage
            }

            return {
                name: 'home',
            }
        },
    },
    /* NON GUARDED ROUTES */
    {
        name: 'info-page',
        path: '/info-page',
        component: InfoPage,
        beforeEnter: routerHelper.mixedRoute,
    },
    {
        name: 'privacy-statement',
        path: '/privacy-statement',
        component: PrivacyStatementPage,
        beforeEnter: routerHelper.mixedRoute,
    },
    /* END NON GUARDED ROUTES */
    {
        path: '*',
        beforeEnter(to, from, next) {
            // vue routes have names.
            if (to.name) {
                next({ name: 'my-schedule-init' })
            }
            // if not logged in, go to login.
            urlHelper.setSubdomain()

            if (!store.getters['auth/isAuthenticated']) {
                store.dispatch('auth/loginFromLocalStorage', null, { root: true }).then(response => {
                    if (!store.getters['auth/isAuthenticated']) {
                        next({ name: 'login' })
                    } else {
                        store.dispatch('menu/updateHeaderMenu', null, { root: true }).then(response => {
                            if (!siteService.checkUrlExists(to.path)) {
                                store.commit('SET_SNACKBAR', {
                                    message: language.t('generalMessages.errors.pageNotFound'),
                                    multiLine: true,
                                    error: true,
                                }, { root: true })

                                next({ name: 'my-schedule-init' })
                            }
                        })
                    }
                })
            } else {
                if (!siteService.checkUrlExists(to.path)) {
                    next({ name: 'my-schedule-init' })
                }
            }
            // Otherwise, go to legacy route.
        },
    },
]

// Load all routes from router files.
const resourceRoutes = routerHelper.loadRoutes()

resourceRoutes.forEach((moduleRoutes) => {
    moduleRoutes.forEach((route) => {
        routes.push(route)
    })
})

Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
    fallback: false,
    routes,
    base: CompanyService.getCompanySlug(),
})

/**
 * Actions taken before each route switch
 */
router.beforeEach((to, from, next) => {
    // Before any call, check if app was previously set to maintenance mode.
    if (store.getters.isMaintenanceMode) {
        return apiHelper.isApiWorking()
    }

    to = validateDateParams(to)

    // preserve query params when switching to the same route, without query params (ex: when query params are dynamically added on page component mounted hook)
    if (to.name === from.name && to.name) {
        if (!urlHelper.hasQueryParams(to) && urlHelper.hasQueryParams(from) && !from.query.full_screen) {
            next({ name: to.name, query: from.query })
        } else {
            next()
        }
    } else {
        next()
    }
})

/**
 * Actions taken after each route switch:
 * - set the window title.
 */
router.afterEach((to) => {
    if (to.name) {
        const currentStore = store.getters['stores/currentStore']
        window.document.title = currentStore ? `PMT | ${currentStore.html_page_title || currentStore.orgName} | ${language.t('pageTitles.' + to.name.camelCase())}` : 'PMT | ' + language.t('pageTitles.' + to.name.camelCase())
        // Commented this out for now, this needs to come back after we have more pages in VUE
        // window.document.title = 'PMT | ' + language.t('pageTitles.' + to.name.camelCase())
    } else if (store.getters.name) {
        window.document.title = store.getters.name.camelCase()
    }
    if (to.meta.settingsRoute) {
        store.dispatch('account/getUserSettings', to)
    }
})

/**
 * Validates date parameters and resets date parameters to current date if invalid.
 *
 * @param to
 * @returns {*}
 */
function validateDateParams(to) {
    // Validate year.
    if ((typeof to.params.year !== 'undefined' ? isNaN(to.params.year) : false) || (to.params.year && !Vue.moment().year(to.params.year).isBetween('1900-01-01', '2100-01-01'))) {
        return showErrorAndUpdateDateParams(to)
    }

    // Validate month.
    if (to.params.month > 12 || to.params.month < 1 || (typeof to.params.month !== 'undefined' ? isNaN(to.params.month) : false)) {
        return showErrorAndUpdateDateParams(to)
    }

    // Validate day.
    if (typeof to.params.month !== 'undefined') {
        const daysInMonth = Vue.moment(`${to.params.year}-${to.params.month < 10 ? '0' : ''}${to.params.month}-01`).daysInMonth()
        if (to.params.day > daysInMonth || (typeof to.params.day !== 'undefined' ? isNaN(to.params.day) : false)) {
            return showErrorAndUpdateDateParams(to)
        }
    }

    // Validate week if needed.
    if (to.meta.mode === 'week' && !to.params.id && to.params.year) {
        let weeksInYear = Vue.moment().year(to.params.year).endOf('year').isoWeek()
        // change to week 52 if week === 1. We can always assume 52 weeks as bellow example shows:
        // ex: December 31st 2019
        // week: 1
        // isoWeek: 1
        if (parseInt(weeksInYear) === 1) {
            weeksInYear = 52
        }
        if ((typeof to.params.week !== 'undefined' ? isNaN(to.params.week) : false) || to.params.week > weeksInYear) {
            return showErrorAndUpdateDateParams(to)
        }
    }

    return to
}

/**
 * Sets all date params to current date and shows an error message.
 *
 * @param to
 * @returns {*}
 */
function showErrorAndUpdateDateParams(to) {
    to.params.day = parseInt(Vue.moment().format('D'))
    to.params.week = Vue.moment().isoWeek()
    to.params.month = Vue.moment().month() + 1
    to.params.year = Vue.moment().isoWeekYear()
    store.commit('SET_SNACKBAR', {
        message: language.t('generalMessages.errors.invalidDate', [Vue.moment().euFormat()]),
        autoClose: true,
        error: true,
    }, { root: true })

    return to
}

export default router
