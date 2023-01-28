import Vue from 'vue'

const mutations = {
    SET_ENV_DEPARTMENTS (state, payload) {
        state.envDepartments = payload
    },
    SET_SEARCH_STRING (state, payload) {
        state.searchString = payload
    },
    SET_ACTIVE_DEPARTMENTS_FILTER (state, value) {
        state.departmentsActiveFilter = value
    },
    SET_DEPARTMENTS_API_ERROR (state, payload) {
        state.departmentsApiError = payload
    },
    ADD_DEPARTMENT (state, value) {
        state.envDepartments.push(value)
    },
    EDIT_DEPARTMENT (state, value) {
        const pos = state.envDepartments.map(function (dep) { return dep.department_id }).indexOf(value.department_id)
        Vue.set(state.envDepartments, pos, value)
    },
    DELETE_DEPARTMENT (state, id) {
        const pos = state.envDepartments.map(function (dep) { return dep.department_id }).indexOf(id)
        state.envDepartments.splice(pos, 1)
    },
    SET_STORE_DEPARTMENTS (state, payload) {
        state.storeDepartments = payload
    },
    UPDATE_STORE_DEPARTMENT (state, payload) {
        const storeDepartments = JSON.parse(JSON.stringify(state.storeDepartments))
        const index = storeDepartments.findIndex(o => o.department_id === payload.departmentId)

        storeDepartments[index].foreign_department_code = payload.body.foreign_department_code
        storeDepartments[index].administration = payload.body.administration
        storeDepartments[index].clock_department_code = payload.body.clock_department_code
        storeDepartments[index].color = payload.body.color

        state.storeDepartments = storeDepartments
    },
    SET_SUBDEPARTMENT_GROUPS (state, value) {
        state.subDepartmentGroups = value
    },
    SET_SUBDEPARTMENT_API_ERROR (state, payload) {
        state.subDepartmentApiError = payload
    },
    SET_SELECTED_SUBDEPARTMENT_GROUP (state, payload) {
        state.selectedSubDepartmentGroup = payload
    },
    SET_SUBDEPARTMENTS (state, value) {
        state.subDepartments = value
    },
    CREATE_SUBDEPARTMENT (state, payload) {
        state.subDepartments.push(payload)
    },
    UPDATE_SUBDEPARTMENT (state, payload) {
        const subDepartmentIndex = state.subDepartments.findIndex(o => o.id === payload.id)
        Vue.set(state.subDepartments, subDepartmentIndex, payload)
    },
    DELETE_SUBDEPARTMENT (state, id) {
        const subDepartmentIndex = state.subDepartments.findIndex(o => o.id === id)
        state.subDepartments.splice(subDepartmentIndex, 1)
    },
    CREATE_SUBDEPARTMENT_GROUP (state, payload) {
        state.subDepartmentGroups.push(payload)
    },
    UPDATE_SUBDEPARTMENT_GROUP (state, payload) {
        const subDepartmentGroupIndex = state.subDepartmentGroups.findIndex(o => o.id === payload.id)
        Vue.set(state.subDepartmentGroups, subDepartmentGroupIndex, payload)
    },
    DELETE_SUBDEPARTMENT_GROUP (state, id) {
        const subDepartmentGroupIndex = state.subDepartmentGroups.findIndex(o => o.id === id)
        state.subDepartmentGroups.splice(subDepartmentGroupIndex, 1)
    },
}
export default mutations
