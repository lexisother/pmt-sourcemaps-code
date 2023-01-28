import language from '../../../config/language'
import urlHelper from '../../../libraries/urlHelper'

const actions = {

    /**
     * Sets the language based on previous saved settings on initial load..
     *
     * @param context
     * @returns {string|*|string}
     */
    initLocale(context) {
        const locale = getLocaleKey(getSavedLocale())

        // Set language in Vue app.
        context.commit('setLocale', locale)
        // Set locale cookie for pmt1 app.
        context.dispatch('SET_COOKIE', { name: 'language', value: locale, expiration: Infinity }, { root: true })
    },

    setLocale({ commit }, locale) {
        commit('setLocale', locale)
    },
}

/**
 * Returns the supported locale id of the given locale ID.
 *
 * @param {string} localeId
 * @returns {string}
 */
function getLocaleKey(localeId) {
    let locale
    localeId = getAliasLocale(localeId)

    if (localeId) {
        locale = localeId
    }

    if (~locale.indexOf('-')) {
        locale = locale.split('-')[0].toLowerCase()
    }

    return locale
}

/**
 * Get the alias locale ID if any set for the given locale.
 *
 * @param {string} localeId
 * @returns {string}
 */
function getAliasLocale(localeId) {
    const alias = language.aliases[localeId]

    if (!alias) {
        return localeId
    }

    return alias
}

/**
 * Returns the saved locale from browser memory or will
 * the browser locale if no locale saved.
 *
 * @returns {string}
 */
function getSavedLocale() {
    let locale = localStorage.getItem('language')
    const deStore = ['intratuinde', 'intratuinoldenburg'].indexOf(urlHelper.getStoreSlug()) > -1
    // On first load (deLocaleCheck local storage item should not be set), set to de.
    if (deStore && !localStorage.getItem('deLocaleCheck')) {
        localStorage.setItem('deLocaleCheck', 1)

        return 'de'
    }

    if (!locale) {
        locale = deStore ? 'de' : 'nl-NL'
    }

    return locale
}

export default actions
