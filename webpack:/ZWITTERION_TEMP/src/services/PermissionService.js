import pmtApi from '../libraries/pmtApi'
import localStorage from '../libraries/localStorage'
class PermissionService {
    /**
     * Returns the current user's permissions
     *
     * @returns {Promise}
     */
    getCurrentUserPermissions () {
        pmtApi.defaults.params = localStorage.getDefaultStoreParameter()
        return pmtApi.get('/userPermissions')
            .then((response) => {
                return response.data.result
            })
    }
}

export default new PermissionService()
