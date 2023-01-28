import service from '../../../../../services/configuration/CaoService'
import storeService from '../../../../../services/StoreService'

const actions = {
    /**
     * Gets all Cao rules
     * @returns {Promise}
     */
    getCaoRules(context, isEnvironmentCao) {
        if (isEnvironmentCao && context.state.environmentCaoRules.length > 0) {
            // environment cao rules are already in store
            return false
        }
        if (!isEnvironmentCao &&
            context.rootState.stores.currentStore.id !== null &&
            context.rootState.stores.currentStore.id === context.state.caoRulesStoreId &&
            context.state.storeCaoRules.length > 0) {
            // store cao rules of current store are already in vuex store
            return false
        }

        return service.getCaoRules(isEnvironmentCao).then(data => {
            const payload = {
                data: data.result,
                isEnvironmentCao: isEnvironmentCao,
                storeId: context.rootState.stores.currentStore.id,
            }
            context.commit('SET_CAO_RULES', payload)
            context.commit('SET_CAO_RULES_API_ERROR', null)
            return data
        }).catch(error => {
            context.commit('SET_CAO_RULES_API_ERROR', error.message)
            throw error
        })
    },
    /**
     * Update a Cao rule
     * @returns {Promise}
     */
    updateCaoRule(context, payload) {
        return service.putCaoRule(payload).then(data => {
            if (data.cao_rule_id) {
                context.commit('UPDATE_CAO_RULE', { ...data, cao_id: payload.cao_id })
            }
            return data
        }).catch(error => {
            throw error
        })
    },

    /**
     * Create a Cao rule
     * @returns {Promise}
     */
    createCaoRule(context, payload) {
        return service.postCaoRule(payload).then(data => {
            if (data.cao_rule_id) {
                context.commit('CREATE_CAO_RULE', data)
            }
            return data
        }).catch(error => {
            throw error
        })
    },

    recalculateCaoRules(context, forStore) {
        return storeService.recalculate(forStore).then(() => {
            return true
        }).catch(error => {
            throw error
        })
    },
}
export default actions
