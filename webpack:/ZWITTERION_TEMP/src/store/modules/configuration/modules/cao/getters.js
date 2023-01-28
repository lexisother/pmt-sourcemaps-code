import stringHelper from '../../../../../libraries/stringHelper'

const getters = {
    /**
     * Returns all cao rules
     * @param {Object} state VUEX
     * @returns {Array}
     */
    ENVIRONMENT_CAO_RULES(state) {
        const environmentCaoRulesClone = JSON.parse(JSON.stringify(state.environmentCaoRules || null))
        const fields = ['type', 'reference', 'description']
        return filter(environmentCaoRulesClone, state.searchString, fields, true, state.statusLabels)
    },
    STORE_CAO_RULES(state) {
        const storeCaoRulesClone = JSON.parse(JSON.stringify(state.storeCaoRules || null))
        const fields = ['type', 'reference', 'description']
        return filter(storeCaoRulesClone, state.searchString, fields, false, state.statusLabels)
    },
    CAO_RULES_API_ERROR(state) {
        return state.caoRulesApiError
    },
    SEARCH_STRING(state) {
        return state.searchString
    },
}
export default getters

function filter(caoRules, searchString, fields, isEnvironmentCao, statusLabels, minLength = 2) {
    let filteredCaoRules = []

    if (searchString && searchString.length >= minLength) {
        const needle = searchString.toLowerCase()

        caoRules.forEach(cao => {
            if ((isEnvironmentCao && cao.available) || !isEnvironmentCao) {
                const rules = []
                cao.rules.forEach(rule => {
                    let match = 0
                    fields.forEach(field => {
                        if (rule[field] !== null && rule[field].toString().toLowerCase().includes(needle)) {
                            match++
                        }
                        if (isEnvironmentCao) {
                            if (statusLabels[rule.status].toLowerCase().includes(needle)) {
                                match++
                            }
                        } else {
                            if ((rule.store_status && statusLabels[rule.store_status].toLowerCase().includes(needle)) ||
                                (rule.default_status && statusLabels[rule.default_status].toLowerCase().includes(needle))) {
                                match++
                            }
                        }
                    })
                    if (match > 0) {
                        rules.push(rule)
                    }
                })
                cao.rules = rules
                filteredCaoRules.push(cao)
            }
        })
    } else {
        filteredCaoRules = caoRules
    }

    return filteredCaoRules
}
