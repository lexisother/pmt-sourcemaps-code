<template>
    <form>
        <PmtInfo gray>
            {{ $t('forms.pmtRepoLink.info') }}
        </PmtInfo>
        <PmtError :show="error !== ''">
            {{ error }}
        </PmtError>

        <div class="form-field">
            <PInput
                ref="urlInput"
                v-model="url"
                name="repo-url"
                :label="$t('forms.pmtRepoLink.repoUrlField.label')"
                :placeholder="$t('forms.pmtRepoLink.repoUrlField.placeholder')"
                :is-invalid="$v.url.$error"
            />
        </div>

        <div class="button-group">
            <PmtButton
                ref="save"
                primary
                @click="onSubmit"
            >
                {{ $t('forms.pmtRepoLink.saveBtn.label' ) }}
            </PmtButton>
        </div>
    </form>
</template>

<script>
import { required, url } from 'vuelidate/lib/validators'

let errorTimer

export default {
    data () {
        return {
            url: '',
            error: '',
        }
    },
    validations: {
        url: {
            required,
            url,
        },
    },
    methods: {
        isFormFilled () {
            return !this.$v.$error
        },
        focus () {
            this.$refs.urlInput.focus()
        },
        // TODO: refactor the form error message stuff out of all forms and into a mixin.
        showError (error) {
            this.error = error

            errorTimer = setTimeout(() => {
                this.error = ''
            }, 5000)
        },
        clearError () {
            clearTimeout(errorTimer)

            this.error = ''
        },
        onSubmit () {
            this.clearError()
            this.$v.$touch()

            if (!this.isFormFilled()) {
                this.showError(this.$t('forms.pmtRepoLink.invalidUrl'))
                return
            }

            if (!/\/$/.test(this.url)) {
                this.url += '/'
            }

            localStorage.setItem('repo-base-url', this.url)

            this.$emit('on-save')
        },
        mounted () {
            this.focus()
        },
    },
}
</script>
