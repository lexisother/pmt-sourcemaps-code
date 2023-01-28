import pmtApi from '../../libraries/pmtApi'

export default {
    /**
     * Returns a list of cao rules.
     * @returns {Array}
     */
    getEnvDepartments() {
        return pmtApi.get('/envDepartments').then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    addDepartment(payload) {
        return pmtApi.post('/envDepartments', payload).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    editDepartment(payload) {
        return pmtApi.put(`/envDepartments/${payload.department_id}`, payload).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    deleteDepartment(id) {
        return pmtApi.delete(`/envDepartments/${id}`).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Returns a list of departments on store level.
     * @returns {Array}
     */
    async getStoreDepartments(storeId) {
        const apiUrl = `/stores/${storeId}/departments`
        return pmtApi.get(apiUrl).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },
    /**
     * Updates a single department on store level
     * @returns {Array}
     */
    async putStoreDepartment(storeId, departmentId, body) {
        const apiUrl = `/stores/${storeId}/departments/${departmentId}`

        return pmtApi.put(apiUrl, body).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Returns a list of subdepartment groups
     * @returns {Promise}
     */
    getSubDepartmentGroups() {
        return pmtApi.get('subdepartmentGroups', { v3: true })
            .then((response) => {
                return response
            })
            .catch((error) => {
                throw error
            })
    },

    createSubDepartmentGroup(payload) {
        return pmtApi.post('subdepartmentGroups', payload, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    updateSubDepartmentGroup(payload) {
        return pmtApi.put(`subdepartmentGroups/${payload.id}`, payload, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    deleteSubDepartmentGroup(id) {
        return pmtApi.delete(`subdepartmentGroups/${id}`, { v3: true })
            .then((response) => {
                return response.data.result
            })
            .catch((error) => {
                throw error
            })
    },

    /**
     * Returns a list of subdepartments
     * @returns {Promise}
     */
    getSubDepartments(subDepartmentGroupId) {
        return pmtApi.get(`subdepartmentGroups/${subDepartmentGroupId}/subdepartments`, { v3: true })
            .then((response) => {
                return response
            })
            .catch((error) => {
                throw error
            })
    },

    createSubDepartment(subDepartmentGroupId, payload) {
        return pmtApi.post(`subdepartmentGroups/${subDepartmentGroupId}/subdepartments`, payload, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    updateSubDepartment(subDepartmentGroupId, payload) {
        return pmtApi.put(`subdepartmentGroups/${subDepartmentGroupId}/subdepartments/${payload.id}`, payload, { v3: true }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    },

    deleteSubDepartment(subDepartmentGroupId, id) {
        return pmtApi.delete(`subdepartmentGroups/${subDepartmentGroupId}/subdepartments/${id}`, { v3: true })
            .then((response) => {
                return response.data.result
            })
            .catch((error) => {
                throw error
            })
    },
}
