import language from '../config/language'
const settings = {
    school: {
        minStartTime: '07:00',
        maxEndTime: '19:00',
        maxSchoolDuration: '12:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        allowOnWeekends: false,
    },
    departments: {
        defaultBackgroundColor: '#B3E7FF',
        defaultColor: '#006699',
    },
    hiddenMenuRoutes: [
        'activate-account',
        'activate-account-finalize',
        'password-recovery',
    ],
    ssoMenuRoutes: [
        'homesso',
        'employeeweekschedulesso',
        'availabilitysso',
        'availabilityMonthSso',
        'availabilityWeekSso',
        'rdosso',
    ],
    specialAvailabilityRoutes: [
        'view-weekset',
        'create-weekset',
        'edit-weekset',
        'manager-view-weekset',
        'manager-create-weekset',
        'manager-edit-weekset',
        'activate-account-finalize',
    ],
    accountIdRoutes: [
        'week-schedule-accountid',
        'week-availability-accountid',
        'month-availability-accountid',
    ],
    defaultCurrency: '€',
    screenSize: {
        xs: 320,
        tiny: 576,
        small: 768,
        medium: 1024,
        large: 1366,
        xLarge: 1920,
        xxLarge: 2560,
    },
}

const helpers = {
    getContrastColorFromHex(hex = '#FFFFFF', black = '#000000', white = '#FFFFFF') {
        const rgb = this.hexToRgb(hex)
        if (rgb) {
            const contrast = (Math.round(rgb.r * 299) + Math.round(rgb.g * 587) + Math.round(rgb.b * 114)) / 1000
            return (contrast >= 170) ? black : white
        }
        return black
    },
    /**
     * Used to convert hex color code to rgb
     *
     * IF CSS Used to convert hex color code to rgb in CSS format 'rgb(xxx, xxx, xxx)'
     *
     * @param {string} hex
     * @returns {string}
     */
    hexToRgb(hex, isCSS, isRGBA) {
        if (hex) {
            hex = hex.replace(/\s+/g, '')
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

            if (isCSS) {
                const rgbCss = `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`

                if (isRGBA) {
                    let rgba = rgbCss.replace(/rgb/i, 'rgba')
                    rgba = rgba.replace(/\)/i, ', 0.15)')
                    return rgba
                }
                return rgbCss
            } else {
                return result
                    ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16),
                    }
                    : null
            }
        } else {
            return 'rgb(0,0,0)'
        }
    },
    compare: (propName) => {
        return (a, b) => a[propName] === b[propName] ? 0 : a[propName] < b[propName] ? -1 : 1
    },
    transparentize: (hex, opacity = 100) => {
        if (!hex) return ''
        const tempHex = hex.replace('#', '')
        const r = parseInt(tempHex.substring(0, 2), 16)
        const g = parseInt(tempHex.substring(2, 4), 16)
        const b = parseInt(tempHex.substring(4, 6), 16)
        return `rgba(${r},${g},${b},${opacity / 100})`
    },
    capitalizeFirst(string) {
        return string ? string.charAt(0).toUpperCase() + string.slice(1) : ''
    },
    isTouchDevice() {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
    },
    formatCurrency(number, currency = 'EUR') {
        if (!number || isNaN(number)) return ''
        return new Intl.NumberFormat(language.locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(number)
    },
    formatNumber(number, options) {
        if (!number || isNaN(number)) return ''
        return new Intl.NumberFormat(language.locale, options).format(number)
    },
}
export default { settings, helpers }
