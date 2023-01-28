import service from '../../../../../services/configuration/DepartmentsService'

const actions = {
    /**
     * Gets all env departments
     * @returns {Promise}
     */
    getEnvDepartments(context) {
        if (context.state.envDepartments.length > 0) {
            // environment departments are already in store
            return false
        }
        return service.getEnvDepartments().then(data => {
            context.commit('SET_ENV_DEPARTMENTS', data)
            return data
        }).catch(error => {
            context.commit('SET_DEPARTMENTS_API_ERROR', error.message)
            throw error
        })
    },

    addDepartment(context, payload) {
        return service.addDepartment(payload).then(data => {
            context.commit('ADD_DEPARTMENT', data)
            context.commit('SET_DEPARTMENTS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_DEPARTMENTS_API_ERROR', error.message)
            throw error
        })
    },

    editDepartment(context, payload) {
        return service.editDepartment(payload).then(data => {
            context.commit('EDIT_DEPARTMENT', data)
            context.commit('SET_DEPARTMENTS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_DEPARTMENTS_API_ERROR', error.message)
            throw error
        })
    },

    deleteDepartment(context, id) {
        return service.deleteDepartment(id).then(data => {
            context.commit('DELETE_DEPARTMENT', id)
            context.commit('SET_DEPARTMENTS_API_ERROR', null)
        }).catch(error => {
            context.commit('SET_DEPARTMENTS_API_ERROR', error.message)
            throw error
        })
    },

    /**
     * Gets all store departments
     * @returns {Promise}
     */
    getStoreDepartments(context) {
        if (context.state.storeDepartments.length > 0) {
            // store departments are already in store
            return false
        }
        const storeId = context.rootState.stores.currentStore.id

        return service.getStoreDepartments(storeId).then(data => {
            context.commit('SET_STORE_DEPARTMENTS', data)
            return data
        }).catch(error => {
            context.commit('SET_DEPARTMENTS_API_ERROR', error.message)
            throw error
        })
    },

    /**
     * Update a store department
     * @returns {Promise}
     */
    updateStoreDepartment(context, payload) {
        const storeId = context.rootState.stores.currentStore.id
        return service.putStoreDepartment(storeId, payload.departmentId, payload.body).then(data => {
            context.commit('UPDATE_STORE_DEPARTMENT', payload)
            return data
        }).catch(error => {
            context.commit('SET_DEPARTMENTS_API_ERROR', error.message)
            throw error
        })
    },

    /**
     * Get subdepartment groups
     * @returns {Promise}
     */
    getSubDepartmentGroups(context) {
        if (context.state.subDepartmentGroups.length > 0) {
            return new Promise((resolve) => { resolve(context.state.subDepartmentGroups) })
        }
        return service.getSubDepartmentGroups()
            .then(response => {
                context.commit('SET_SUBDEPARTMENT_GROUPS', response.data.result)
                return response
            })
            .catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },

    createSubDepartmentGroup(context, payload) {
        context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
        return service.createSubDepartmentGroup(payload)
            .then(response => {
                context.commit('CREATE_SUBDEPARTMENT_GROUP', response)
                context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
                return response
            })
            .catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },

    updateSubDepartmentGroup(context, payload) {
        context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
        return service.updateSubDepartmentGroup(payload)
            .then(data => {
                context.commit('UPDATE_SUBDEPARTMENT_GROUP', data)
                context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
            })
            .catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },

    deleteSubDepartmentGroup(context, id) {
        context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
        return service.deleteSubDepartmentGroup(id)
            .then(() => {
                context.commit('DELETE_SUBDEPARTMENT_GROUP', id)
                context.commit('SET_SELECTED_SUBDEPARTMENT_GROUP', null)
                context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
            }).catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },

    /**
     * Get subdepartments
     * @returns {Promise}
     */
    getSubDepartments(context, payload) {
        context.commit('SET_SUBDEPARTMENT_API_ERROR', null)

        if (!payload.subDepartmentGroupId) {
            context.commit('SET_SUBDEPARTMENTS', [])
            return
        }

        if (context.state.selectedSubDepartmentGroup === payload.subDepartmentGroupId && context.state.subDepartments.length > 0) {
            return new Promise((resolve) => { resolve(context.state.subDepartments) })
        }

        return service.getSubDepartments(payload.subDepartmentGroupId)
            .then(response => {
                context.commit('SET_SUBDEPARTMENTS', response.data.result)
                context.commit('SET_SELECTED_SUBDEPARTMENT_GROUP', payload.subDepartmentGroupId)
                return response
            })
            .catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },

    createSubDepartment(context, payload) {
        context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
        const subDepartmentGroupId = context.state.selectedSubDepartmentGroup
        return service.createSubDepartment(subDepartmentGroupId, payload)
            .then(response => {
                context.commit('CREATE_SUBDEPARTMENT', response)
                context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
            })
            .catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },

    updateSubDepartment(context, payload) {
        context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
        const subDepartmentGroupId = context.state.selectedSubDepartmentGroup
        return service.updateSubDepartment(subDepartmentGroupId, payload)
            .then(data => {
                context.commit('UPDATE_SUBDEPARTMENT', data)
                context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
            })
            .catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },

    deleteSubDepartment(context, id) {
        context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
        const subDepartmentGroupId = context.state.selectedSubDepartmentGroup
        return service.deleteSubDepartment(subDepartmentGroupId, id)
            .then(() => {
                context.commit('DELETE_SUBDEPARTMENT', id)
                context.commit('SET_SUBDEPARTMENT_API_ERROR', null)
            }).catch(error => {
                context.commit('SET_SUBDEPARTMENT_API_ERROR', error.message)
                throw error
            })
    },
}
export default actions
