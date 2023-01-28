<template>
    <div class="language-selector">
        <VMenu
            ref="languageMenu"
            offset-y
            :value="menu"
            @click="menu = !menu"
        >
            <template #activator="{ on }">
                <PmtButton
                    class="flag-button"
                    v-on="on"
                >
                    <country-flag
                        :country="getLocale"
                        :size="'small'"
                    />
                </PmtButton>
            </template>
            <VList ref="languageList">
                <VListItem
                    v-for="(item, index) in getViewSelectOptions()"
                    :key="index"
                    :ref="`${item.label.toLowerCase()}Button`"
                    :class="`${item.label.toLowerCase()}_button`"
                    @click="changeLanguage(item)"
                >
                    <country-flag
                        :country="item.label.toLowerCase()"
                        :size="'extra-small'"
                    />
                    <span class="label">{{ item.label.toUpperCase() }}</span>
                </VListItem>
            </VList>
        </VMenu>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import languages from '@/config/language'

export default {
    components: {
        CountryFlag: () => import('@/components/CountryFlag.vue'),
    },
    data () {
        return {
            langs: languages.allowedLanguages,
            selectedLanguage: null,
            menu: false,
        }
    },
    computed: {
        ...mapGetters('locale', { getLocale: 'getLocale' }),
    },
    mounted () {
        this.selectedLanguage = this.getLocale
    },
    methods: {
        ...mapActions('menu', { updateHeaderMenu: 'updateHeaderMenu' }),
        ...mapActions('locale', { setLocale: 'setLocale' }),
        ...mapActions(['SET_COOKIE']),
        /**
            * This method is used to change the language
            *
            * @param {Object} lang
            */
        async changeLanguage (lang) {
            // Logic to update language in PMT3/Vue
            const language = lang.label
            this.setLocale(language)
            await localStorage.removeItem('sitemap')
            this.updateHeaderMenu()
            this.$moment().changeLanguage()
            this.selectedLanguage = language

            // Logic to update language in PMT1
            this.SET_COOKIE({ name: 'language', value: language, expiration: Infinity })

            // This reloads the tabs in the MyAccountInformationPage.vue page to recalculate the active tab blue-bar
            this.$emit('select-language')
        },
        /**
            * This method is used to reorder the list after selecting a language. The already selected language will always be displayed on top
            */
        getViewSelectOptions () {
            const array = []
            if (typeof this.langs !== 'undefined') {
                const firstLanguage = this.langs.find(elem => elem.label.toLowerCase() === this.getLocale)
                const otherLanguages = this.langs.filter(elem => elem.label.toLowerCase() !== this.getLocale)
                if (firstLanguage) {
                    array.push(firstLanguage)
                }
                otherLanguages.forEach(element => {
                    array.push(element)
                })
                return array
            }
        },
    },
}
</script>
<style lang="scss" scoped>
    .flag-button {
        margin: 0px !important;
        padding: 0px !important;
    }
    .label {
        margin-left: 5px;
    }
</style>
