import Vue from 'vue'

const mutations = {
    SET_STORE_GROUPS (state, payload) {
        state.storeGroups = payload
    },
    SET_STORE_GROUPS_API_ERROR (state, payload) {
        state.storeGroupsApiError = payload
    },
    SET_SEARCH_STRING (state, payload) {
        state.searchString = payload
    },
    UPDATE_STORE_GROUP (state, payload) {
        const storeGroupIndex = state.storeGroups.findIndex(o => o.id === payload.storeGroupId)
        Vue.set(state.storeGroups, storeGroupIndex, payload.data)
    },
    INSERT_STORE_GROUP (state, data) {
        state.storeGroups.push(data)
    },
    DELETE_STORE_GROUP (state, storeGroupId) {
        const storeGroupIndex = state.storeGroups.findIndex(o => o.id === storeGroupId)
        state.storeGroups.splice(storeGroupIndex, 1)
    },
    SET_STORE_GROUP_STORES (state, payload) {
        state.storeGroupStores = payload
    },
    SET_STORE_GROUP_USERS (state, payload) {
        state.storeGroupUsers = payload
    },
    ADD_STORE_TO_STORE_GROUP (state, payload) {
        state.storeGroupStores.push(payload)
    },
    REMOVE_STORE_FROM_STORE_GROUP (state, payload) {
        const storeGroupIndex = state.storeGroups.findIndex(o => o.id === payload.storeGroupId)
        state.storeGroupStores.splice(storeGroupIndex, 1)
    },
    ADD_USER_TO_STORE_GROUP (state, payload) {
        state.storeGroupUsers.push(payload)
    },
    REMOVE_USER_FROM_STORE_GROUP (state, payload) {
        const storeGroupUserIndex = state.storeGroups.findIndex(o => o.account_id === payload.account_id)
        state.storeGroupUsers.splice(storeGroupUserIndex, 1)
    },
}

export default mutations
