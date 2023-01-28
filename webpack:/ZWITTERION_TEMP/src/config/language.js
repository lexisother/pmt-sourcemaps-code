import Vue from 'vue'
import VueI18n from 'vue-i18n'

import { store } from '../store'

import nl from '../language/nl/nl'
import en from '../language/en/en'
import de from '../language/de/de'

Vue.use(VueI18n)

const language = new VueI18n({
    locale: store ? store.state.locale.locale : 'nl',
    messages: {
        nl,
        en,
        de,
    },
})

language.allowedLanguages = [
    {
        label: 'nl',
        id: 'nl',
    },
    {
        label: 'en',
        id: 'en-gb',
    },
    {
        label: 'de',
        id: 'de',
    },
]

/**
 * Locale aliases list.
 *
 * Example "fr -> en":
 * { 'fr-FR': 'en-EN', .. }
 */
language.aliases = {
}

export default language
