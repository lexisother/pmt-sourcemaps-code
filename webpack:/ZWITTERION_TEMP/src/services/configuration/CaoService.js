import pmtApi from '../../libraries/pmtApi'

export default {
    /**
     * Returns a list of cao rules.
     * @returns {Array}
     */
    getCaoRules(forEnvironment) {
        const apiUrl = forEnvironment ? '/envcaorules' : '/caorules'

        return pmtApi.get(apiUrl).then((response) => {
            return response.data
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Updates a single cao rule
     * @returns {Object}
     */
    putCaoRule(body) {
        let apiUrl = body.store_id ? '/storecao' : '/cao'
        apiUrl += `/${body.cao_id}/rules/${body.cao_rule_id}`

        return pmtApi.put(apiUrl, body).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Creates a single cao rule
     * @returns {Object}
     */
    postCaoRule(body) {
        const apiUrl = `/cao/${body.cao_id}/rules`

        return pmtApi.post(apiUrl, body, { v3: true, store: false }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
}
