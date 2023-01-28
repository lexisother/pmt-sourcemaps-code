import pmtApi from '../libraries/pmtApi'

class DepartmentsService {
    filteredDepartments = []
    /**
     * Returns a list of departments filtered by provided payload.
     * @returns {Promise}
     */
    getDepartments (payload) {
        this.filteredDepartments = []

        return pmtApi.get('/departments', { params: payload }).then((response) => {
            this.filteredDepartments = this.filteredDepartments.concat(response.data.result)
            if (response.data.metaData && response.data.metaData.pagination.next) {
                // Fetch next page.
                payload.page = response.data.metaData.pagination.next
                return this.getDepartments(payload)
            } else {
                return this.filteredDepartments
            }
        })
    }

    /**
     * Returns all departments of the store at current date
     *
     * @returns {*}
     */
    getAllCurrentDepartments () {
        return pmtApi.get('/departments').then((response) => {
            return response.data.result
        })
    }

    /**
     * Returns a list of Employee Departments.
     * @returns {Promise}
     */
    getDepartmentSets (payload) {
        return pmtApi.get('/employeeDepartments', { params: payload }).then((response) => {
            return !!response.data && response.data.result.length ? response.data.result[0].departments : []
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns a list of departments on store level.
     * @returns {Array}
     */
    getStoreDepartments (storeId) {
        const apiUrl = `/stores/${storeId}/departments`
        return pmtApi.get(apiUrl).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    }

    /**
     * Returns a list of all departments from all store structures.
     * @returns {Array}
     */
    getAllStructuresDepartments () {
        return pmtApi.get('/departments', { params: { all_structures: true } }).then((response) => {
            return response.data.result
        }).catch((error) => {
            throw error
        })
    }
}

export default new DepartmentsService()
