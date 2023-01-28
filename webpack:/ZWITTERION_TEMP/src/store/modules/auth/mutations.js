const mutations = {
    authUser (state, userData) {
        state.token = userData.token
        state.user = userData.user
        state.permissions = userData.permissions
        localStorage.setItem('token', state.token)
        localStorage.setItem('user', JSON.stringify(state.user))
        if (state.permissions) {
            localStorage.setItem('permissions', JSON.stringify(state.permissions))
        }
    },

    setUserToken (state, token) {
        state.token = token
    },

    forgetUser (state) {
        state.token = null
        state.user = null
        state.permissions = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
        localStorage.removeItem('contract')
        localStorage.removeItem('sitemap')
        localStorage.removeItem('unreadNewsCounter')
        localStorage.removeItem('dismissedForLater')
    },

    /**
     * Updates user data stores in the store and localstorage in "user" property.
     *
     * @param state
     * @param userData
     */
    updateUserData (state, userData) {
        state.user = { ...state.user, ...userData }
        localStorage.setItem('user', JSON.stringify(state.user))
    },

    setSecurityError (state, error) {
        state.securityError = error
    },

    /**
     * Changes the value of loggingIn flag.
     *
     * @param state
     * @param {Boolean} value
     */
    setLoggingIn (state, value) {
        state.loggingIn = value
    },
}
export default mutations
