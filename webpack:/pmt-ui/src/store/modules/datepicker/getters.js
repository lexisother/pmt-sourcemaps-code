const getters = {
    /**
     * Gets a datepicker by id
     * @param {VUEX} state
     * @param {Number} id
     * @returns {Object} datepicker
     */
    DATEPICKER_BY_ID: (state) => (id) => {
        return state.datepickers[`${id}`]
    },
}
export default getters
