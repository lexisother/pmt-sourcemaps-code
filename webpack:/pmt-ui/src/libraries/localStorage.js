import urlHelper from './urlHelper'
const storage = {
    /**
     * Get store id parameter for each api call.
     *
     * @returns {*}
     */
    getDefaultStoreParameter () {
        // If current slug is in the subdomain, we don't need the required store parameter anymore.
        if (urlHelper.isSubdomain() || urlHelper.getStoreSlug()) {
            return {}
        }

        // This is needed for local development
        if (window.location.hostname === 'localhost') {
            let activeStore = localStorage.getItem('active-store')
            if (activeStore) {
                activeStore = JSON.parse(activeStore)
                if (activeStore) {
                    return { store_id: activeStore.id }
                }
            }
        }

        const storeSlug = urlHelper.getStoreSlug()
        if (storeSlug) {
            return { subdomain: storeSlug }
        }

        if (localStorage.getItem('subdomain')) {
            return { subdomain: localStorage.getItem('subdomain') }
        }

        let activeStore = localStorage.getItem('active-store')
        if (activeStore) {
            activeStore = JSON.parse(activeStore)
            if (activeStore) {
                return { store_id: activeStore.id }
            }
        }
    },
}

export default storage
