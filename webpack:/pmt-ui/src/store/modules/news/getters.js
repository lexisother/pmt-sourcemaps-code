const getters = {

    /**
     * Returns a department by id.
     *
     * @param state
     * @returns {function(...[*]=)}
     */
    getDepartmentById: state => (id) => {
        const department = state.departments.filter(item => {
            return item.department_id === id
        })
        if (department.length) {
            return department[0]
        }
        return {}
    },

    allDepartments (state) {
        return state.departments
    },

    PAGE_NUMBER (state) {
        return state.pageNumber
    },
}
export default getters
