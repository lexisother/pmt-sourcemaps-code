import moment from 'moment'
class AccountHelper {
    /**
     * @param {Object} employee
     * @returns {Object}
     */
    mapEmployee (employee) {
        if (employee.date_of_birth) {
            employee.age = moment().diff(moment(employee.date_of_birth), 'years')
            employee.age_filter_key = this.mapAgeToFilters(employee.age)
        }
        employee.personnel_number = parseInt(employee.personnel_number)
        if (!employee.name) {
            employee.name = this.namePartsToFullName(employee)
        }
        employee.departments = employee.departments.map(d => {
            if (d.id) {
                return {
                    ...d,
                    color: d.color || d.department_color,
                    department_id: d.id,
                }
            }
            return d
        })
        employee.isEmployed = function (date) {
            if (!date) return false
            const employedFrom = this.date_of_employment ? moment(this.date_of_employment) : false
            const employedUntil = this.date_of_unemployment ? moment(this.date_of_unemployment) : false
            if (employedFrom && date.isBefore(employedFrom, 'day')) {
                // not yet employed on date => employment is in the future
                return false
            }
            if (employedUntil && date.isAfter(employedUntil, 'day')) {
                // no longer employed on date => employment ended on date
                return false
            }
            // if not employment data is found return is employed = true by default
            return true
        }
        return employee
    }

    /**
     * Processes and formats organisational accounts received from the API.
     *
     * @param {object}  account
     */
    mapOrgAccount (account) {
        if (!account.name) {
            account.name = this.namePartsToFullName(account)
        }
        return account
    }

    /**
     * Returns the id of the filter option based on age.
     *
     * @param { number } age
     *
     * @returns {string}
     */
    mapAgeToFilters (age) {
        if (age <= 14) {
            return '13_14_year'
        }
        if (age === 15) {
            return '15_year'
        }

        if (age >= 18) {
            return '18_year_up'
        }

        // Else the employee is 16/17.
        return '16_17_year'
    }

    /**
     * Returns a short version of the employee contract type
     * @param {String} contractType
     * @returns String
     */
    shortContractTypeMap (contractType) {
        switch (contractType) {
            case 'Fulltime':
                return 'FT'
            case 'Parttime':
                return 'PT'
            case 'Hulpkracht':
                return 'HK'
            case 'Vakantiewerker':
                return 'VW'
            case 'Oproepkracht':
                return 'OK'
            case 'Uitzendkracht':
                return 'UZK'
            case 'Ondernemer':
                return 'OND'
            default:
                return contractType.substring(0, 3).toUpperCase()
        }
    }

    /**
     * Trims and puts together first, middle and last name of employee into a full name.
     *
     * @param employee
     */
    namePartsToFullName (employee) {
        const names = []
        employee.employee_first_name = employee.employee_first_name || ''
        employee.employee_last_name = employee.employee_last_name || ''
        names.push(employee.employee_first_name.trim())
        if (employee.employee_middle_name) {
            names.push(employee.employee_middle_name.trim())
        }
        names.push(employee.employee_last_name.trim())
        return names.join(' ')
    }

    /**
     * Adds extra information to user info object received login to be stored in vuex state.
     * @param user
     * @param payload
     */
    addInfoToUser (user, payload) {
        user.storeId = payload.storeId
        user.expiredPassword = payload.expiredPassword
        user.passwordWillExpire = payload.passwordWillExpire
        user.daysUntilPasswordExpired = payload.daysUntilPasswordExpired

        // Also, store store group info into the state, if present.
        const storeGroups = JSON.parse(localStorage.getItem('storeGroups'))
        if (storeGroups && storeGroups.length > 0) {
            user.storeGroups = storeGroups
        }
    }
}

export default new AccountHelper()
