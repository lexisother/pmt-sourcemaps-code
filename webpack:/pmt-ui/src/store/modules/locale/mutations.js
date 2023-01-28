import language from '../../../config/language'
const mutations = {
    setLocale (state, locale) {
        state.locale = locale
        language.locale = locale

        localStorage.setItem('language', state.locale)
    },
}
export default mutations
