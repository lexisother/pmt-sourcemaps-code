import objectHelper from '../../../../../libraries/objectHelper'

const getters = {
    /**
     * Returns all environment departments
     * @param {Object} state VUEX
     * @returns {Array}
     */
    ENV_DEPARTMENTS(state) {
        const departmentsClone = JSON.parse(JSON.stringify(state.envDepartments || null))
        const fields = ['department_id', 'department_shortname', 'department_name', 'wlp2_department_id', 'bi_api_code']
        return filter(departmentsClone, state.searchString, fields, 1, state.departmentsActiveFilter)
    },
    STORE_DEPARTMENTS(state) {
        const departmentsClone = JSON.parse(JSON.stringify(state.storeDepartments || null))
        const fields = ['department_id', 'department_name', 'foreign_department_code', 'administration', 'clock_department_code']
        return filter(departmentsClone, state.searchString, fields, 1)
    },
    SEARCH_STRING(state) {
        return state.searchString
    },
    DEPARTMENTS_ACTIVE_FILTER(state) {
        return state.departmentsActiveFilter
    },
    DEPARTMENTS_API_ERROR(state) {
        return state.departmentsApiError
    },
    SUBDEPARTMENT_GROUPS(state) {
        return state.subDepartmentGroups
    },
    SUBDEPARTMENT_API_ERROR(state) {
        return state.subDepartmentApiError
    },
    SELECTED_SUBDEPARTMENT_GROUP(state) {
        return state.selectedSubDepartmentGroup
    },
    SUBDEPARTMENTS(state) {
        const subDepartmentsClone = JSON.parse(JSON.stringify(state.subDepartments || null))
        const fields = ['code', 'name', 'wlp2_normcluster_id']
        return filter(subDepartmentsClone, state.searchString, fields, 1)
    },
}
export default getters

function filter(departments, searchString, fields, minLength, showInUse) {
    const filteredDepartments = objectHelper.filterOnSearchString(departments, searchString, fields, minLength, showInUse)
    const filteredActiveDepartments = []

    if (filteredDepartments && showInUse) {
        filteredDepartments.forEach(department => {
            if (department.in_use) {
                filteredActiveDepartments.push(department)
            }
        })
    }

    return showInUse ? filteredActiveDepartments : filteredDepartments
}
