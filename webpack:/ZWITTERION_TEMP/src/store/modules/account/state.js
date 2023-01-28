const containsSpecialCharacters = '[^\w]'
const state = {
    PASSWORD_STRENGTHS: {
        NONE: 'none',
        MEDIUM: 'medium',
        HIGH: 'high',
    },
    PASSWORD_MIN_LENGTHS: {
        NONE: 1,
        MEDIUM: 6,
        HIGH: 8,
    },
    assessments: [],
    assessmentHistory: [],
    calendarSettings: {},
    passwordComplexity: {
        minLengthValidation: '(?=.{6,})',
        minLength: 6,
        lowerCaseValidation: '[a-z\s]',
        mustContainLowercase: true,
        uppercaseValidation: '[A-Z]',
        mustContainUppercase: true,
        numbersValidation: '[0-9]',
        mustContainNumbers: true,
        specialCharactersValidation: '(?=.*[!~<>,;:_=?*+#."\'&%()\{\}\|\/\@\^\$\-\\]\[])',
        mustContainSpecialCharacters: true,
    },
    // This will be updated from below api calls:
    // 1. GET /CheckNewUserName
    // 2. GET /me
    // or from "strength" query parameter received in /recovery/:hash url via email
    // none 0 / 4 from passwordComplexity
    // medium 2 / 4 from passwordComplexity
    // high 3 / 4 from passwordComplexity
    validations: {
        password: {
            strength: 'medium',
            minLength: 6,
            lowerCase: '[a-z]',
            upperCase: '[A-Z]',
            numbers: '[0-9]',
            specialChars: '(?=.*[!~<>,;:_=?*+#."\'&%()\{\}\|\/\@\^\$\-])',
        },
        username: {
            minLength: 5,
            containsSpecialCharacters: new RegExp(containsSpecialCharacters),
            allowedCharacters: ['@', '+', '.', '_', '-'],
            matchPattern: /^[@+.a-zA-ZÀ-ÿ0-9_ -]+$/,
        },
        email: {
            matchPattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        },
    },
    passwordStrength: 1,
    minPasswordLength: 6,
    userValidation: {
        minLength: 6,
        containsSpecialCharacters: new RegExp(containsSpecialCharacters),
        allowedCharacters: ['@', '+', '.', '_', '-'],
    },
    employees: [],
    weekEmployees: {},
    storeEmployees: [],
    storeEmployeesForWeek: [], // TODO: deprecate
    weekStoreEmployees: {},
    weekExchangeEmployees: {},
    organisationalAccounts: [],
    employeesLoading: false,
    balances: {},
    pmt_messages: [],
    weeklyWageInfo: {},
    userSettings: [],
    userSettingsFlat: '',
    currentEmployee: null,
    competences: [],
}
export default state
