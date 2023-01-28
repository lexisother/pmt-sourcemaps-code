import authService from '../../../services/AuthService'
import accountService from '../../../services/AccountService'
import permissionService from '../../../services/PermissionService'
import siteService from '../../../services/SiteService'
import urlHelper from '../../../libraries/urlHelper'
import apiHelper from '../../../libraries/apiHelper'
import accountHelper from '../../../libraries/accountHelper'
import router from '../../../config/router'
import { store } from '../../../store'
import moment from 'moment'

import whatsNewService from '../../../services/WhatsNewService'
import newsService from '../../../services/NewsService'
import language from '../../../config/language'

const actions = {

    /**
     * Attempt to login with the provided user credentials.
     *
     * @param {object} context
     * @param {object} credentials
     */
    login(context, credentials) {
        return authService.login(credentials.username, credentials.password).then(async (response) => {
            // set login cookie to not show news page
            if (window.$cookies.get('loginCookie') === null) {
                await context.dispatch('SET_COOKIE', { name: 'loginCookie', value: 'GH1.1.1689020474.1484362313', expiration: Infinity }, { root: true })
            }
            return context.dispatch('afterLoginActions', {
                token: response.token,
                storeId: response.storeId,
                expiredPassword: response.expiredPassword,
                passwordWillExpire: response.passwordWillExpire,
                daysUntilPasswordExpired: response.daysUntilPasswordExpired,
                hash: location.hash,
                useRedirect: typeof credentials.redirect !== 'undefined' ? credentials.redirect : true,
            })
        })
    },

    /**
     * Reloads page with correct store context.
     */
    async internalRedirect(context, payload) {
        // wee need to always set this cookie to true before reloading the page for a store switch. See PMT-3836
        await context.dispatch('SET_COOKIE', { name: 'internal-pmt-redirect', value: false }, { root: true })
        setTimeout(() => {
            window.location = payload.url
        }, payload.timeout || 0)
    },

    /**
     * Actions performed after a successful login.
     *
     * @returns {Promise<any>}
     */
    async afterLoginActions(context, payload) {
        // wee need to always set this cookie to false on every login action. See PMT-3836
        await context.dispatch('SET_COOKIE', { name: 'internal-pmt-redirect', value: false }, { root: true })
        if (payload.frame_ancestors) {
            await context.dispatch('SET_COOKIE', {
                name: 'frame-ancestors',
                value: payload.frame_ancestors,
                expiration: Infinity,
                path: '/',
                domain: urlHelper.getDomainName(),
            }, { root: true })
        }
        apiHelper.setXApiUserHeader(payload.token)

        return accountService.getCurrentUserInformation(store.getters['locale/getLocale']).then(userInfo => {
            accountHelper.addInfoToUser(userInfo, payload)

            const storesPayload = userInfo.rolename.toLowerCase() === 'super admin' ? { allStores: true } : {}
            const hideRedirectMessage = typeof payload.hideRedirectMessage !== 'undefined' ? payload.hideRedirectMessage : false
            storesPayload.hideRedirectMessage = hideRedirectMessage

            return context.dispatch('stores/initStores', storesPayload, { root: true }).then(async (storesResponse) => {
                if (!storesResponse) {
                    context.dispatch('auth/setUser', {
                        token: payload.token,
                        user: userInfo,
                        permissions: [],
                        hideRedirectMessage: hideRedirectMessage,
                    }, { root: true }).then(() => {
                        // If user has access to login in order to see his paysplips, redirect directly to it.
                        if (siteService.checkUrlExists('/categorynews/8')) {
                            window.location = '/categorynews/8'
                        } else {
                            router.push({ name: 'my-account-information' }).catch(() => { })
                        }
                    })

                    return
                }

                // Needs to redirect to correct store.
                if (!!storesResponse && storesResponse.redirectTo) {
                    context.commit('setUserToken', payload.token)

                    if (!!storesResponse.redirectTo.params && storesResponse.redirectTo.params.noStore) {
                        storesResponse.redirectTo.params.token = payload.token
                        router.push(storesResponse.redirectTo)
                    } else {
                        const redirectTo = storesResponse.redirectTo + (payload.redirectTo ? payload.redirectTo : '')
                        await context.dispatch('SET_COOKIE', {
                            name: 'token',
                            value: payload.token,
                            expiration: 120,
                            path: '/',
                            domain: urlHelper.getDomainName(),
                        }, { root: true })
                        context.dispatch('internalRedirect', { url: redirectTo, timeout: 2000 })
                    }
                    return null
                }

                return permissionService.getCurrentUserPermissions().then(userPermissions => {
                    context.dispatch('auth/setUser', {
                        token: payload.token,
                        user: userInfo,
                        permissions: userPermissions,
                        hideRedirectMessage: hideRedirectMessage,
                    }, { root: true }).then(response => {
                        context.dispatch('handleRedirectAfterLogin', payload)
                    })
                })
            })
        })
    },

    /**
     * Handles redirect after login.
     *
     * @returns {*}
     */
    handleRedirectAfterLogin(context, payload) {
        // Redirect to change password form if password is expired.
        if (payload.expiredPassword) {
            router.push({ name: 'my-account-information' }).catch(() => { })
            return
        }

        // Redirect to pm1.
        if (location.hash !== '') {
            window.location = location.hash.substr(1)

            return
        }
        // Check if we need to redirect the user.
        if (payload.useRedirect) {
            if (payload.redirectTo) {
                router.push({ path: payload.redirectTo.substr(1) })
                return
            }

            if (!siteService.checkUrlExists('/dashboard')) {
                router.push({ name: 'last-visited-page' }).catch(() => { })
                return
            }
            // Check if user tried to access a page as anonymous user. If so, redirect to that page.
            const pageBeforeLogin = localStorage.getItem('lastVisitedPage')

            // Redirect user to dashboard if they have access to it or save the redirect in state for future actions.
            if (!whatsNewService.shouldOpenModal() && !pageBeforeLogin) {
                window.location = '/dashboard'
            }

            // If should open modal but there are no news, redirect to dashboard
            return newsService.getWhatsNew(whatsNewService.version()).then((response) => {
                if (!response.length && !pageBeforeLogin) {
                    window.location = '/dashboard'
                }
                // Save in state and redirect after dismissing modal
                context.commit('menu/setRedirect', '/dashboard', { root: true })
                router.push({ name: 'last-visited-page' }).catch(() => { })
            }).catch((error) => {
                throw error
            })
        }
    },

    loginWithRecoveredPassword(context, response) {
        const redirectTo = location.hash
        if (response.authenticated) {
            apiHelper.setXApiUserHeader(response.user_token)
            return accountService.getCurrentUserInformation(store.getters['locale/getLocale'])
                .then(userInfo => {
                    return permissionService.getCurrentUserPermissions()
                        .then(userPermissions => {
                            context.dispatch('auth/setUser', {
                                token: response.user_token,
                                user: userInfo,
                                permissions: userPermissions,
                            }, { root: true })

                            // Check if we need to redirect the user.
                            if (redirectTo !== '') {
                                window.location = redirectTo.substr(1)
                            } else {
                                return response
                            }
                        })
                })
        }
    },

    /**
     * Set the authenticated user.
     *
     * @param {object} context
     * @param {object} userData
     */
    setUser(context, userData) {
        apiHelper.setXApiUserHeader(userData.token)

        context.commit('authUser', {
            user: userData.user,
            token: userData.token,
            permissions: userData.permissions,
        })
        context.commit('account/SET_PMT_MESSAGES', userData.user.pmt_messages, { root: true })
        context.commit('account/UPDATE_PASSWORD_STRENGTH', { password_strength: userData.user.passwordStrength }, { root: true })
        // Resetting the security error upon successful login.
        context.commit('auth/setSecurityError', '', { root: true })

        urlHelper.setSubdomain()
        if (!store.getters['contracts/myContract']) {
            context.dispatch('contracts/getMyContract', { date: moment().format('YYYY-MM-DD'), account_id: userData.user.accountId }, { root: true })
        }
        return context.dispatch('stores/initStores', { hideRedirectMessage: userData.hideRedirectMessage }, { root: true }).then(() => {
            return context.dispatch('menu/updateHeaderMenu', null, { root: true })
        })
    },

    /**
     * Sso AFAS login.
     */
    loginSso(context, payload) {
        const redirectTo = location.hash

        return authService.loginSso(payload.credentials)
            .then((response) => {
                if (response === false || typeof response === 'undefined') {
                    return false
                }

                return context.dispatch('afterLoginActions', {
                    token: response.token,
                    storeId: response.storeId,
                    expiredPassword: response.expiredPassword,
                    passwordWillExpire: response.passwordWillExpire,
                    daysUntilPasswordExpired: response.daysUntilPasswordExpired,
                    hash: redirectTo,
                    useRedirect: typeof payload.useRedirect !== 'undefined' ? payload.useRedirect : false,
                    hideRedirectMessage: true,
                    redirectTo: payload.redirectTo,
                    frame_ancestors: response.frame_ancestors ? response.frame_ancestors : false,
                })
            })
    },

    /**
     * Attempt to login based on the session in pmt1.
     */
    loginFromUserToken(context, payload) {
        // If cookie is set, the user was redirected from another subdomain. Log in based on the token and remove it since
        // it's not needed anymore.
        if (window.$cookies.get('token') !== null) {
            apiHelper.setXApiUserHeader(window.$cookies.get('token'))
            window.$cookies.remove('token', '/', urlHelper.getDomainName())
        }

        return authService.loginFromPmt(payload)
            .then((response) => {
                // No response means the user has been redirected to login page.
                if (typeof response === 'undefined') {
                    return
                }

                return context.dispatch('afterLoginActions', {
                    token: response.token,
                    storeId: response.storeId,
                    expiredPassword: response.expiredPassword,
                    passwordWillExpire: response.passwordWillExpire,
                    daysUntilPasswordExpired: response.daysUntilPasswordExpired,
                    hash: location.hash,
                    useRedirect: payload && typeof payload.useRedirect !== 'undefined' ? payload.useRedirect : false,
                })
            }).catch(error => {
                context.dispatch('logout')
                throw error
            })
    },

    /**
     * Logs out the current user.
     *
     * Note: No errors will be thrown.
     *
     * @param {object} context
     * @param {object} payload
     */
    logout(context, payload = {}) {
        // Do not logout user during deploy.
        if (context.rootGetters.isMaintenanceMode && !(payload && payload.forceLogout)) {
            return
        }

        if (payload && payload.forceLogout) {
            authService.logout().catch(() => { })
            context.dispatch('afterLogoutActions')

            return
        }

        authService.logout()
            .then(() => {
                context.dispatch('afterLogoutActions')
            })
            .catch((error) => {
                context.commit('SET_SNACKBAR', { message: language.t('generalMessages.errors.generalError'), error: true }, { root: true })
                throw error
            })
    },

    /**
     * Clears all data stored in cookies/local storage for logged in user.
     *
     * @param context
     */
    afterLogoutActions(context) {
        window.$cookies.remove('token', '/', urlHelper.getDomainName())
        window.$cookies.remove('frame-ancestors', '/', urlHelper.getDomainName())
        window.$cookies.remove('internal-pmt-redirect')
        window.$cookies.remove('sitemapExpiration')
        context.dispatch('forgetUser')
        context.commit('stores/forgetStores', { online: context.rootState.online }, { root: true })
        context.commit('availability/reset', null, { root: true })
        context.commit('account/reset', null, { root: true })
        context.commit('schedules/reset', null, { root: true })
        context.commit('news/reset', null, { root: true })
        context.commit('rdoRequests/reset', null, { root: true })
        context.commit('planning/RESET', null, { root: true })
        context.commit('scheduling/RESET', null, { root: true })
        // Functions to hide the Zendesk widget on logout
        if (typeof zE === 'function') {
            window.zE(function () {
                window.zE.hide()
            })
            const snippet = document.getElementById('ze-snippet')
            if (snippet) {
                snippet.outerHTML = ''
            }
        }
        router.replace({ name: 'login' }).catch(() => { })
    },

    /**
     * Forget the current logged in user.
     *
     * @param {object} context
     */
    forgetUser(context) {
        context.commit('forgetUser')
        apiHelper.deleteXApiUserHeader()
        context.dispatch('menu/updateHeaderMenu', null, { root: true })
    },

    /**
     * Log out and make sure to delete all necessary localStorage data.
     */
    forgetLoggedInUserData(context) {
        context.dispatch('forgetUser')
        context.commit('stores/forgetStores', { online: context.rootState.online }, { root: true })
    },

    /**
     * Login the user based on the local stored credentials.
     *
     * @param {object} context
     */
    loginFromLocalStorage(context) {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        const permissions = localStorage.getItem('permissions')

        if (!token || !user) {
            // Logging out if there is no token, to be sure to delete all necessary localStorage data.
            context.dispatch('forgetLoggedInUserData')
            return
        }

        if (!!permissions && !!token && !!user) {
            apiHelper.setXApiUserHeader(token)
            // Remove it for now, it will be added if login is successful.
            localStorage.removeItem('token')

            return authService.loginFromPmt().then((response) => {
                // No response means the user has been redirected to login page.
                if (typeof response === 'undefined') {
                    return
                }
                // Check if the user wants to go to pmt1.
                if (location.hash !== '') {
                    window.location = location.hash.substr(1)

                    return
                }
                // Otherwise set user to state.
                return context.dispatch('setUser', {
                    token: token,
                    user: JSON.parse(user),
                    permissions: JSON.parse(permissions),
                })
            }).catch(error => {
                // Logging out if there is no token, to be sure to delete all necessary localStorage data.
                context.dispatch('forgetLoggedInUserData')
                throw error
            })
        }
    },
}
export default actions
