import service from '../../../../../services/configuration/StoreGroupsService'

const actions = {
    /**
     * Gets all store groups
     * @returns {Promise}
     */
    async getStoreGroups(context) {
        return service.getStoreGroups().then(data => {
            context.commit('SET_STORE_GROUPS', data)
            return data
        }).catch(error => {
            context.commit('SET_STORE_GROUPS_API_ERROR', error.message)
            throw error
        })
    },
    /**
     * Updates a single store group
     * @returns {Promise}
     */
    async updateStoreGroup(context, payload) {
        return service.putStoreGroup(payload.storeGroupId, payload.body).then(data => {
            context.commit('UPDATE_STORE_GROUP', { storeGroupId: payload.storeGroupId, data: data })
            context.commit('SET_STORE_GROUPS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_STORE_GROUPS_API_ERROR', error.message)
            throw error
        })
    },
    /**
     * Inserts a single store group
     * @returns {Promise}
     */
    async insertStoreGroup(context, payload) {
        return service.postStoreGroup(payload).then(data => {
            context.commit('INSERT_STORE_GROUP', data)
            context.commit('SET_STORE_GROUPS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_STORE_GROUPS_API_ERROR', error.message)
            throw error
        })
    },
    /**
     * Deletes a single store group
     * @returns {Promise}
     */
    async deleteStoreGroup(context, storeGroupId) {
        return service.deleteStoreGroup(storeGroupId).then(data => {
            context.commit('DELETE_STORE_GROUP', storeGroupId)
            context.commit('SET_STORE_GROUPS_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_STORE_GROUPS_API_ERROR', error.message)
            throw error
        })
    },
    /**
     * Gets all stores within a store group
     * @returns {Promise}
     */
    async getStoreGroupStores(context, storeGroupId) {
        return service.getStoreGroupStores(storeGroupId).then(data => {
            context.commit('SET_STORE_GROUP_STORES', data)
            return data
        }).catch(error => {
            context.commit('SET_STORE_GROUPS_API_ERROR', error.message)
            throw error
        })
    },
    /**
     * Gets all users within a store group
     * @returns {Promise}
     */
    async getStoreGroupUsers(context, storeGroupId) {
        return service.getStoreGroupUsers(storeGroupId).then(data => {
            context.commit('SET_STORE_GROUP_USERS', data)
            return data
        }).catch(error => {
            context.commit('SET_STORE_GROUPS_API_ERROR', error.message)
            throw error
        })
    },
}

export default actions
