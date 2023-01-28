import pmtApi from '../libraries/pmtApi'
import Vue from 'vue'
class AccountService {
    /**
     * Sends an email to the email address with the account's username linked
     * to that address.
     *
     * @param {String} email
     * @returns {Promise}
     */
    sendUsernameReminder (email) {
        return pmtApi.post('/forgotUsername', {
            email,
        }).then((response) => {
            return 'Email has been sent'
        }).catch(() => {
            return 'Email has been sent'
        })
    }

    /**
     * Sends an email to the user's email linked to to provided username with
     * a reset password link in it.
     *
     * @param {String} username
     * @returns {Promise}
     */
    sendResetPasswordLink (payload) {
        return pmtApi.post('/forgotPassword', {
            username: payload.username,
            email: payload.email,
        }).then((response) => {
            return 'Email has been sent'
        }).catch(() => {
            return 'Email has been sent'
        })
    }

    changePasswordFromRecover (payload) {
        return pmtApi.post('/recovery/' + payload.recovery_hash, {
            password: payload.password,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    resetPassword (accountId) {
        return pmtApi.post(`/accounts/${accountId}/resetAccount`, null, { v3: true, environment: true, account: true })
            .then(response => {
                return response.data.result
            }).catch(error => {
                throw error
            })
    }

    sendAccountActivation (accountId) {
        return pmtApi.post(`/accounts/${accountId}/sendActivationLink`, null, { v3: true, environment: true, account: true })
            .then(response => {
                return response.data.result
            }).catch(error => {
                throw error
            })
    }

    /**
     * Attempts to update the account information of the current user with the provided ones.
     *
     * @param {Object} payload
     * @returns {Promise}
     */
    updateUserAccountInformation (payload) {
        return pmtApi.put('/me', payload).then((response) => {
            return response ? response.data.result : true
        })
    }

    /**
     * Returns the current user's account information.
     *
     * @returns {Promise}
     */
    getCurrentUserInformation () {
        return pmtApi.get('/me').then((response) => {
            const result = response.data.result

            return {
                accountId: result.account_id,
                personnelNumber: result.personnel_number,
                username: result.username,
                fullname: result.full_name,
                firstname: result.first_name,
                lastname: result.last_name,
                rolename: result.rolename,
                gender: result.gender,
                initials: result.initials,
                dateOfBirth: result.date_of_birth,
                employmentDate: result.date_of_employment,
                historicalEmploymentDate: result.historical_date_of_employment,
                passwordStrength: result.password_strength,
                location: {
                    address: result.street_name + ' ' + result.address_number,
                    street: result.street_name,
                    number: result.address_number,
                    zip: result.zipcode,
                    city: result.city,
                    country: result.country,
                },
                contact: {
                    email: result.email,
                    phone: result.home_phone_number,
                    mobile: result.cell_phone_number,
                },
                pmt_messages: result.pmt_messages,
            }
        })
    }

    getCalendarSettings () {
        return pmtApi.get('/calendar/configure', { data: { set403SnackBar: false } })
            .then((response) => {
                return response.data.result
            })
            .catch(error => {
                throw error
            })
    }

    updateCalendarSettings (acceptTerms, enable) {
        const payload = {
            accept_terms: acceptTerms,
            enable,
        }
        return pmtApi.post('/calendar/configure', payload)
    }

    activateAccount (payload) {
        return pmtApi.put('/activateAccount', payload).then(response => {
            return response.data.result
        }).catch((error) => { throw error })
    }

    checkIfUsernameExists (payload) {
        return pmtApi.post('checkNewUserNames', payload).then(response => {
            return response.data.result
        }).catch(error => {
            return error
        })
    }

    /**
     * Checks if a username is currently in use.
     *
     * @param payload
     * @returns {Promise<T | void>}
     */
    checkCurrentUserNames (payload) {
        return pmtApi.post('checkCurrentUserNames', payload).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns all store employees from current week on.
     *
     * @param payload
     * @returns {Promise<T>}
     */
    getStoreEmployees (payload) {
        const year = payload.year || Vue.moment().isoWeekYear()
        const week = payload.week || Vue.moment().isoWeek()

        return pmtApi.get(`stores/${payload.store_id}/employees`, {
            params: {
                exchange: payload.exchange || false,
                limit: 1000,
                week: `${year}-${week}`,
            },
        }).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    /**
     * Returns store employees for a given week
     *
     * @param storeId
     * @param payload
     *
     * @returns {Promise<T>}
     */
    getStoreEmployeesForWeek (storeId, payload) {
        return pmtApi.get(`stores/${storeId}/employees`, {
            params: {
                week: payload.year + '-' + payload.week,
                exchange: payload.exchange || false,
                limit: 1000,
            },
        }).then((response) => {
            return response.data.result.map(item => {
                item.department_id = item.default_department_id
                return item
            })
        }).catch((error) => {
            throw error
        })
    }

    getEmployees (payload) {
        return pmtApi.get('/employees', { params: { ...payload, limit: 10000 } }).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    async getEmployee (accountId) {
        return pmtApi.get(`/employees?account_id=${accountId}&date=${Vue.moment().apiFormat()}`, { params: { limit: 1 } }).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    getWeekEmployees (payload) {
        return pmtApi.get('/employees', { params: { ...payload, limit: 1000 } }).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    /**
     * Marks a PMT message as read
     * @param {Number} id
     */
    readPmtMessage (id) {
        // for now the implementation is that only one message can be read at one time
        // in the future a dismiss all functionality might be implemented
        // in that case the method parameter should change to an array of dismissed messages
        return pmtApi.put('/me', { pmt_messages: [{ id, status: 'dismissed' }] }).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    /**
     * Creates a new account.
     *
     * @param {Object} userData
     * @returns {Promise<T | void>}
     */
    createAccount (userData) {
        return pmtApi.post('/employees', userData).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    /**
     * Deletes an existing account.
     *
     * @param id
     * @returns {Promise<T | void>}
     */
    deleteAccount (id) {
        return pmtApi.delete(`/employees/${id}`).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    /**
     * Updates an existing account.
     *
     * @param {Integer} accountId
     * @param {Object}  userData
     * @returns {Promise<T | void>}
     */
    updateAccount (accountId, userData) {
        return pmtApi.put(`/employees/${accountId}`, userData).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    getWageInfo (payload) {
        let query = ''
        if (payload.date || payload.accountIds) {
            query += '?'
        }
        if (payload.date) {
            query += `date=${payload.date.apiFormat()}`
        }
        if (payload.accountIds) {
            if (payload.date) {
                query += '&'
            }
            query += `account_id=${payload.accountIds.split(',')}`
        }
        return pmtApi.get(`wagePerHour${query}`, { v3: true, store: true }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    getUserSettings () {
        return pmtApi.get('/userSettings').then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    setUserSettings (payload) {
        return pmtApi.post('/userSettings', payload).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }

    /**
     * Returns store employees for a given week
     *
     * @param storeId
     * @param payload
     *
     * @returns {Promise<T>}
     */
    getExchangeEmployeesForWeek (payload) {
        return pmtApi.get(`stores/${payload.storeId}/employees`, {
            params: {
                week: payload.year + '-' + payload.week,
                exchange: true,
                limit: 1000,
            },
        }).then((response) => {
            return response.data.result.filter(employee => {
                return employee.store_id !== payload.storeId
            }).map(item => {
                item.exchange = true
                item.lentIn = true
                item.departments = []
                item.department_id = item.default_department_id
                return item
            })
        }).catch((error) => {
            throw error
        })
    }

    getCompetences () {
        return pmtApi.get('competences', { v3: true, environment: true, store: true }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    getEmployeeDepartments (payload) {
        const params = {}
        params.account_id = payload.account_id
        if (payload.from) {
            params['date[gte]'] = payload.from.apiFormat()
        }
        if (payload.to) {
            params['date[lte]'] = payload.to.apiFormat()
        }
        return pmtApi.get('/employeeDepartments', {
            params,
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => { throw error })
    }
}

export default new AccountService()
