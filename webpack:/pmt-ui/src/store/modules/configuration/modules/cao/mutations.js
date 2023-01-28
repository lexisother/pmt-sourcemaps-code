const mutations = {
    /**
     * Sets the cao rules in state
     * @param {Object} state VUEX
     * @param {Array} data
     */

    SET_CAO_RULES (state, payload) {
        if (payload.isEnvironmentCao) {
            state.environmentCaoRules = payload.data
        } else {
            state.storeCaoRules = payload.data
            state.caoRulesStoreId = payload.storeId
        }
    },
    SET_CAO_RULES_API_ERROR (state, payload) {
        state.caoRulesApiError = payload
    },
    UPDATE_CAO_RULE (state, payload) {
        let caoRulesClone = []

        if (payload.store_id) {
            // status for store is updated
            caoRulesClone = JSON.parse(JSON.stringify(state.storeCaoRules))
        } else {
            // status for environment is updated
            caoRulesClone = JSON.parse(JSON.stringify(state.environmentCaoRules))
        }

        const caoIndex = caoRulesClone.findIndex(o => o.cao_id === payload.cao_id)
        const caoRuleIndex = caoRulesClone[caoIndex].rules.findIndex(o => o.cao_rule_id === payload.cao_rule_id)

        if (caoIndex > -1 && caoRuleIndex > -1) {
            const rule = caoRulesClone[caoIndex].rules[caoRuleIndex]

            if (payload.store_id) {
                if (payload.status === rule.default_status) {
                    // new status is equal to default status, clear store status
                    rule.store_status = null
                } else {
                    // new status is different to default status, assign status to store_status
                    rule.store_status = payload.status
                }
            } else {
                // status for environment is updated: save new status as (default) status
                rule.status = payload.status
            }

            caoRulesClone[caoIndex].rules[caoRuleIndex] = rule

            if (payload.store_id) {
                state.storeCaoRules = caoRulesClone
            } else {
                state.environmentCaoRules = caoRulesClone
            }
        }
    },
    CREATE_CAO_RULE (state, payload) {
        const caoRulesClone = JSON.parse(JSON.stringify(state.environmentCaoRules))
        const caoIndex = caoRulesClone.findIndex(o => o.cao_id === payload.cao_id)
        if (caoIndex > -1) {
            caoRulesClone[caoIndex].rules.push(payload)
            state.environmentCaoRules = caoRulesClone
        }
    },
    SET_SEARCH_STRING (state, payload) {
        state.searchString = payload
    },
    SET_CAO_STATUS_LABELS (state, payload) {
        state.statusLabels = payload
    },
}
export default mutations
