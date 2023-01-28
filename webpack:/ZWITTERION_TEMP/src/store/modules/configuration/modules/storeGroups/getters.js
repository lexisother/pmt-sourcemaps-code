import objectHelper from '../../../../../libraries/objectHelper'

const getters = {
    STORE_GROUPS(state) {
        const storeGroupsClone = JSON.parse(JSON.stringify(state.storeGroups || null))
        const fields = ['name']
        return objectHelper.filterOnSearchString(storeGroupsClone, state.searchString, fields, 2, true)
    },
    SEARCH_STRING(state) {
        return state.searchString
    },
    STORE_GROUPS_API_ERROR(state) {
        return state.storeGroupsApiError
    },
    STORE_GROUP_STORES(state) {
        return state.storeGroupStores
    },
    STORE_GROUP_USERS(state) {
        return state.storeGroupUsers
    },
}

export default getters
