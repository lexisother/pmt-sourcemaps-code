const url = {
    /**
     * @returns {string}
     */
    getHost () {
        if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168.')) {
            return window.location.protocol + '//' + window.location.hostname
        }
        /**
         *
         * Use .env.local file to use your own api url,
         * for local development environment server.
         * If you do not have it you can create one in
         * the root of the project with the contents:
         *
         * NODE_ENV=development
         * VUE_APP_URL=<your-api-url>
         *
         * NOTICE:
         * you will have to stop and re-run the srver again
         * when you change .env.local VUE_APP_URL in order
         * for the changes to apply to your running server
         *
        **/
        if (process.env.NODE_ENV === 'test') return 'http://google.com'
        return process.env.VUE_APP_URL
    },

    /**
     * Returns the subdomain of the current url.
     *
     * @returns {string}
     */
    getSubdomain: function () {
        const urlsParts = process.env.NODE_ENV === 'development' ? process.env.VUE_APP_URL.replace(/^https?:\/\//, '').split('.') : location.hostname.split('.')
        const partsLength = urlsParts.length

        const subdomain = urlsParts.shift()
        const isTestEnv = (subdomain.indexOf('staging') > -1 || subdomain.indexOf('shadow') > -1 || subdomain.indexOf('acc') > -1)
        if ((isTestEnv && partsLength < 4) || (!isTestEnv && partsLength !== 3)) {
            return ''
        }

        return subdomain
    },

    /**
     * It will return true for all environments except local env
     */
    isSubdomain: function () {
        return window.location.hostname !== 'localhost'
    },

    /**
     * Returns the store slug from query parameter if provided, if not returns subdomain.
     */
    getStoreSlug: function () {
        // First check if "subdomain" is provided as query parameter.
        const queryVal = url.urlParam('subdomain')
        if (queryVal) {
            return queryVal
        }

        return url.getSubdomain()
    },

    /**
     * Set current subdomain needed for users without store id.
     */
    setSubdomain: function () {
        const subdomain = url.getStoreSlug()
        if (subdomain) {
            localStorage.setItem('subdomain', subdomain)
        }
    },

    /**
     * Returns the company slug name from url.
     *
     * @returns {string}
     */
    getCompanySlug: function () {
        const parts = location.pathname.substr(1).split('/')

        if (parts.length) {
            return parts[0]
        }

        return ''
    },

    /**
     * Returns true if the given URI matches any of the given paths.
     *
     * @param {String} uri
     * @param {Array|String} paths
     * @returns {Boolean}
     */
    uriMatchesPaths: function (uri, paths) {
        if (!paths) {
            paths = []
        } else if (typeof paths === 'string') {
            paths = [paths]
        }

        for (let n = 0; n < paths.length; n++) {
            const path = paths[n]

            if (this.uriMatchesPath(uri, path)) {
                return true
            }
        }

        return false
    },

    /**
     * Returns true if the given URI matches the given path.
     *
     * @param {String} uri
     * @param {String} path
     * @returns {Boolean}
     */
    uriMatchesPath: function (uri, path) {
        if (!path) {
            path = ''
        }

        // strip first and last slash
        path = path.replace(/^\//g, '')
        path = path.replace(/\/$/g, '')

        // regex
        path = path.replace(/:d/g, '\\d+')
        path = path.replace(/:s/g, '\\w+')

        const regex = new RegExp('^/?' + path.replace(/\//g, '\\/') + '/?$')

        return !!regex.exec(uri)
    },

    /**
     * Returns the value of a query parameter based on its name.
     *
     * @param name
     * @returns {any}
     */
    urlParam: function (name) {
        const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search)

        return (results !== null) ? results[1] || 0 : false
    },

    /**
     * Returns the landing page for a store.
     */
    getCurrentStoreUrl (storeSlug) {
        const redirectTo = location.origin
        // Check if store slug is subdomain.
        if (url.isSubdomain()) {
            const currentStoreSlug = url.getStoreSlug()

            return redirectTo.replace(currentStoreSlug, storeSlug)
        }

        return redirectTo + '?subdomain=' + storeSlug
    },

    getDomainName () {
        if (location.host.includes('localhost')) return 'localhost'
        return location.host.split('.').slice(-2).join('.')
    },

    /**
     * Returns true if given route has query parameters.
     *
     * @param route
     * @returns {boolean}
     */
    hasQueryParams (route) {
        return !!Object.keys(route.query).length
    },
}

export default url
