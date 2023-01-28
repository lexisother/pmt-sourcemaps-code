import language from '../../../config/language'
import permissionGetters from './permissionGetters'
import moment from 'moment'

const getters = {
    /**
     * @returns {Object}
     */
    user: (state) => {
        return state.user
    },

    /**
     * Returns store groups assigned to current user.
     */
    STORE_GROUPS: (state) => {
        return state.user ? state.user.storeGroups : []
    },

    /**
     * @returns {Object}
     */
    permissions: (state) => {
        return state.permissions
    },

    ...permissionGetters,

    /**
     * @returns {string}
     */
    userToken: (state) => {
        return state.token
    },
    /**
     * @returns {Boolean}
     */
    isAuthenticated: (state) => {
        return state.token !== null
    },

    /**
     * Returns true if we are currently trying to log the user in based on pmt1 session.
     *
     * @returns {Boolean}
     *
     * @param state
     */
    isLoggingIn: (state) => {
        return state.loggingIn
    },
    // This is a list to create a VueX based array for the different parts of data for an employee.
    employeeInfo: (state) => {
        const accountInfo = {
            username: {
                label: language.t('entities.user.username'),
                value: state.user.username,
                id: 'username',
            },
            password: {
                label: language.t('entities.user.password'),
                value: '*************',
                id: 'password',
            },
        }
        const personalInfo = [{
            label: language.t('entities.user.personnelNumber'),
            value: state.user.personnelNumber,
            id: 'personnel-number',
        },
        {
            label: language.t('entities.user.gender'),
            value: (state.user.gender === 'M' ? language.t('entities.user.genders.male') : language.t('entities.user.genders.female')),
            id: 'gender',
        },
        {
            label: language.t('entities.user.name'),
            value: state.user.fullname,
            id: 'fullname',
        },
        {
            label: language.t('entities.user.initials'),
            value: state.user.initials,
            id: 'initials',
        },
        {
            label: language.t('entities.user.dateOfBirth'),
            value: moment(state.user.dateOfBirth).longDayFormat(),
            id: 'date-of-birth',
        },
        ]
        const contactInfo = [{
            label: language.t('entities.user.contact.email'),
            value: state.user.contact.email,
            id: 'email',
        },
        {
            label: language.t('entities.user.contact.phone'),
            value: state.user.contact.phone,
            id: 'phone',
        },
        {
            label: language.t('entities.user.contact.mobile'),
            value: state.user.contact.mobile,
            id: 'mobile-phone',
        },
        {
            label: language.t('entities.user.location.address'),
            value: state.user.location.address,
            id: 'address',
        },
        {
            label: language.t('entities.user.location.zip'),
            value: state.user.location.zip,
            id: 'zipcode',
        },
        {
            label: language.t('entities.user.location.city'),
            value: state.user.location.city,
            id: 'city',
        },
        {
            label: language.t('entities.user.location.country'),
            value: state.user.location.country,
            id: 'country',
        },
        ]
        const employmentInfo = [{
            label: language.t('entities.user.contract.employmentDate'),
            value: moment(state.user.employmentDate).longDayFormat(),
            id: 'employment-date',
        },
        {
            label: language.t('entities.user.contract.historicalEmploymentDate'),
            value: moment(state.user.historicalEmploymentDate).longDayFormat(),
            id: 'historical-employment-date',
        },
        ]
        return { accountInfo, personalInfo, contactInfo, employmentInfo }
    },
}

export default getters
