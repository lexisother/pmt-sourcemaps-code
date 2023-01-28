import pmtApi from '../../libraries/pmtApi'

export default {
    /**
     * Returns a list of store groups.
     * @returns {Array}
     */
    getStoreGroups() {
        return pmtApi.get('/storeGroups').then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Updates a single store group
     * @returns {Array}
     */
    putStoreGroup(storeGroupId, body) {
        const apiUrl = `/storeGroups/${storeGroupId}`

        return pmtApi.put(apiUrl, body).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Inserts a single store group
     * @returns {Array}
     */
    postStoreGroup(body) {
        return pmtApi.post('/storeGroups', body).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Deletes a single store group
     * @returns {Array}
     */
    deleteStoreGroup(storeGroupId) {
        const apiUrl = `/storeGroups/${storeGroupId}`

        return pmtApi.delete(apiUrl).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Returns a list of stores within a store group
     * @returns {Array}
     */
    getStoreGroupStores(storeGroupId) {
        const apiUrl = `/storeGroups/${storeGroupId}/stores`

        return pmtApi.get(apiUrl).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Returns a list of stores within a store group
     * @returns {Array}
     */
    getStoreGroupUsers(storeGroupId) {
        const apiUrl = `/storeGroups/${storeGroupId}/employees`

        return pmtApi.get(apiUrl).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Adds a store to a store group
     * @returns {Array}
     */
    addToStoreGroup(storeGroupId, body, collection) {
        let apiUrl = `/storeGroups/${storeGroupId}/addStores`
        if (collection === 'users') {
            apiUrl = `/storeGroups/${storeGroupId}/addUsers`
        }

        return pmtApi.post(apiUrl, body).then(() => {
            return body
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Removes a store to a store group
     * @returns {Array}
     */
    removeFromStoreGroup(storeGroupId, body, collection) {
        let apiUrl = `/storeGroups/${storeGroupId}/removeStores`
        if (collection === 'users') {
            apiUrl = `/storeGroups/${storeGroupId}/removeUsers`
        }

        return pmtApi.post(apiUrl, body).then(() => {
            return body
        }).catch((error) => {
            throw error
        })
    },
}
