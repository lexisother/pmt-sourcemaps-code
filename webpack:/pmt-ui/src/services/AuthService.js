
import pmt from '../libraries/pmt'
import apiHelper from '../libraries/apiHelper'
import ApiError from '../models/ApiError'
import browserHelper from '../libraries/browserHelper'
import { store } from '../store'
import language from '../config/language'

class AuthService {
    /**
     * Attempt to authenticate the user credentials against the PMT API through pmt1.
     *
     * @param {string} username
     * @param {string} password
     * @returns {Promise}
     */
    login(username, password) {
        const browser_info = browserHelper.browser_info()
        return pmt.post('/pmtLoginSso', { username: username, password: password, browser_info }).then((response) => {
            const result = response.data.result
            if (!result) {
                throw new ApiError(200, language.messages[language.locale].generalMessages.errors.generalError)
            }
            if (result.authenticated !== true) {
                throw new ApiError(result[0].code, apiHelper.getTranslationOfCode(result[0]))
            }
            return getLoginReturnData(result)
        })
    }

    /**
     * Sso AFAS login. Returns false if the login was not successful.
     *
     * @param payload
     * @returns {*}
     */
    loginSso(payload) {
        const browser_info = browserHelper.browser_info()
        const apiPayload = {
            dataurl: payload.dataurl,
            tokenurl: payload.tokenurl,
            code: payload.code,
            sessionid: payload.sessionid,
            referrer: payload.referrer,
            publickey: payload.publickey,
            subdomain: payload.subdomain,
            switch_hash: payload.switch_hash,
            skip_session: payload.skip_session,
            browser_info,
        }
        return pmt.post('/pmtLoginSso', apiPayload).then((response) => {
            if (typeof payload.sessionid !== 'undefined') {
                localStorage.setItem('afasSessionId', payload.sessionid)
            }
            const result = response.data.result
            if (!result || (!!result && result.authenticated !== true)) {
                return false
            }
            return getLoginReturnData(result)
        })
    }

    /**
     * Retries a login from pmt1 based on user token.
     *
     * @returns {*}
     */
    loginFromPmt() {
        return pmt.get('/pmtLoginSso')
            .then((response) => {
                if (!response.data || !response.data.result || (!!response.data.result && response.data.result.authenticated !== true)) {
                    store.dispatch('auth/logout')
                    return
                }
                // If the login went well, we get the response from api login
                return getLoginReturnData(response.data.result)
            }).catch(err => {
                // If site is off, don't trigger logout.
                if (!(err.code === 503 || store.getters.isMaintenanceMode)) {
                    store.dispatch('auth/logout')
                }
            })
    }

    /**
     * Logs in to pmt1 and redirects to a pmt1 route if successful.
     */
    loginToLegacyAndRedirect() {
        this.loginFromPmt().then((response) => {
            // If successful redirect the user to the wanted page.
            if (response) {
                window.location = location.hash.substr(1)
            }
        })
    }

    /**
     * Logs out the current user from pmt1 which also logs the user out from api.
     *
     * Note: All errors will be ignored.
     */
    logout() {
        return pmt.get('/logout')
            .then(() => { })
    }
}

/**
 * Returns formatted data expected by login call.
 *
 * @param result
 * @returns {{accountId: *, username: *, token: string}}
 */
function getLoginReturnData(result) {
    if (typeof result.store_groups !== 'undefined' && result.store_groups.length > 0) {
        localStorage.setItem('storeGroups', JSON.stringify(result.store_groups))
    }
    return {
        accountId: result.account_id,
        username: result.username,
        token: result.user_token,
        storeId: result.store_id,
        frame_ancestors: result.frame_ancestors,
        expiredPassword: result.expired_password,
        daysUntilPasswordExpired: result.days_until_password_expires,
        // 5 is the hardcoded number of days ahead when the user gets a notification that the password will expire.
        passwordWillExpire: result.days_until_password_expires && result.days_until_password_expires <= 5,
    }
}

export default new AuthService()
