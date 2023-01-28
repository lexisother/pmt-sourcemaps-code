import Vue from 'vue'
class Helper {
    /**
     * Sets a state data as shown in the example below
     * example = {
     *    year: {
     *       week: {
     *           accountId: {
     *               data,
     *           },
     *       },
     *    },
     * }
     * @param {Vuex} state
     * @param {String} statePropName the vuex prop to be mutated
     * @param {Any} data the data to be set in the vuex state prop
     * @param {Number} year the year index
     * @param {Number} week the week index
     * @param {Number} accountId the accountId index
     */
    setYearWeekAccountIdData (state, statePropName, data, year, week, accountId) {
        if (!state[statePropName][year]) {
            Vue.set(
                state[statePropName],
                year,
                {},
            )
        }
        if (!state[statePropName][year][week]) {
            Vue.set(
                state[statePropName][year],
                week,
                {},
            )
        }
        Vue.set(
            state[statePropName][year][week],
            accountId,
            data,
        )
    }

    /**
     * Sets a state data as shown in the example below
     * example = {
     *    year: {
     *       week: {
     *           data
     *       },
     *    },
     * }
     * @param {Vuex} state
     * @param {String} statePropName the vuex prop to be mutated
     * @param {Any} data the data to be set in the vuex state prop
     * @param {Number} year the year index
     * @param {Number} week the week index
     * @param {Number} accountId the accountId index
     */
    setYearWeekData (state, statePropName, data, year, week) {
        if (!state[statePropName][year]) {
            Vue.set(
                state[statePropName],
                year,
                {},
            )
        }
        Vue.set(
            state[statePropName][year],
            week,
            data,
        )
    }

    /**
     * Sets a state data as shown in the example below
     * example = {
     *    accountId: {
     *       year: {
     *           week: {
     *               data,
     *           },
     *       },
     *    },
     * }
     * @param {Vuex} state
     * @param {String} statePropName the vuex prop to be mutated
     * @param {Any} data the data to be set in the vuex state prop
     * @param {Number} year the year index
     * @param {Number} week the week index
     * @param {Number} accountId the accountId index
     */
    setAccountIdYearWeekData (state, statePropName, data, year, week, accountId) {
        if (!state[statePropName][accountId]) {
            Vue.set(
                state[statePropName],
                accountId,
                {},
            )
        }
        if (!state[statePropName][accountId][year]) {
            Vue.set(
                state[statePropName][accountId],
                year,
                {},
            )
        }
        Vue.set(
            state[statePropName][accountId][year],
            week,
            data,
        )
    }

    /**
     * Sets a state data as shown in the example below
     * example = {
     *    storeId: {
     *       year: {
     *           week: {
     *               data,
     *           },
     *       },
     *    },
     * }
     * @param {Vuex} state
     * @param {String} statePropName the vuex prop to be mutated
     * @param {Any} data the data to be set in the vuex state prop
     * @param {Number} year the year index
     * @param {Number} week the week index
     * @param {Number} storeId the storeId index
     */
    setStoreYearWeekData (state, statePropName, data, year, week, storeId) {
        if (!state[statePropName][storeId]) {
            Vue.set(
                state[statePropName],
                storeId,
                {},
            )
        }
        if (!state[statePropName][storeId][year]) {
            Vue.set(
                state[statePropName][storeId],
                year,
                {},
            )
        }
        Vue.set(
            state[statePropName][storeId][year],
            week,
            data,
        )
    }

    /**
     * Checks provided vuex state object to contain data for the provided year-week-accountId
     * @param {Object} data VUEX state object
     * @param {Object} { year, week, accountId }
     * @returns {Any}
     */
    getYearWeekStateDataForAccount (data, { year, week, accountId }) {
        return data?.[year]?.[week]?.[accountId]
    }

    /**
     * Checks provided vuex state object to contain data for the provided year-week
     * @param {Object} data VUEX state object
     * @param {Object} { year, week }
     * @returns {Any}
     */
    getYearWeekStateData (data, { year, week }) {
        return data?.[year]?.[week]
    }
}

export default new Helper()
