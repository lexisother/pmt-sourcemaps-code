<template>
    <div class="pa-5">
        <h2 class="text-center">
            {{ $t('forms.editAccount.activate.steps.create.title') }}
        </h2>
        <Chip
            v-if="error"
            error
            outline
            :text="error"
        />
        <div class="form-field pb-3">
            <PInput
                ref="username"
                v-model.trim="username"
                cy_id="username"
                name="username"
                :label="$t('forms.editAccount.usernameField.label')"
                :disabled="isSending"
                :danger="usernameInUse || usernameInvalid"
                :success="showUserIsAvailable"
                autocomplete="new-username"
                :loading="fetchingUsername"
                :hint="usernameHint"
                @blur="usernameInUse = false"
                @keyup="userInput"
                @keydown="cancelUserInput"
            />
        </div>
        <br>
        <div class="form-field pb-3">
            <PInput
                ref="password"
                v-model.trim="password"
                cy_id="password"
                name="password"
                is-password
                :label="$t( 'forms.editAccount.newPasswordField.label' )"
                autocomplete="new-password"
                :disabled="isSending"
                :danger="passwordIsTooWeak || passwordsDoNotMatch || (!passwordTooShort && passwordContainsUsername)"
                :hint="passwordHint"
                @blur="$v.password.$touch()"
            />
        </div>
        <br>
        <div class="form-field pb-3">
            <PInput
                ref="retypeNewPassword"
                v-model.trim.lazy="retypeNewPassword"
                cy_id="retypeNewPassword"
                name="retypeNewPassword"
                is-password
                :label="$t( 'forms.editAccount.retypeNewPasswordField.label' )"
                autocomplete="new-password"
                :danger="passwordsDoNotMatch"
                :type="IS_MOBILE ? 'email' : 'text'"
                :hint="passwordsDoNotMatch ? $t('forms.editAccount.errors.passwordsDoNotMatch') : null"
                @blur="$v.retypeNewPassword.$touch()"
            />
        </div>
        <br>
        <PasswordHint
            v-if="passwordIsTooWeak && !passwordContainsUsername"
            :text="$t('forms.editAccount.errors.passwordDoesNotMeetComplexityShort')"
            error
            outline
        />
        <br>
        <div class="button-group text-center my-3">
            <PmtButton
                ref="submit"
                primary
                icon="arrow-right"
                icon-size="16"
                :loading="sendingForm"
                :disabled="!isFormFilled"
                type="submit"
                @click="onSubmit"
            >
                {{ $t('forms.editAccount.create') }}
            </PmtButton>
        </div>
    </div>
</template>

<script>
import { required, sameAs } from 'vuelidate/lib/validators'
import * as vuex from 'vuex'
import ApiError from '@/models/ApiError'
let errorTimer
export default {
    props: {
        theme: Object,
    },
    data () {
        return {
            error: '',
            usernameInUse: false,
            sendingForm: false,
            retypeNewPassword: '',
            username: '',
            password: '',
            userInputTimer: null,
            usernameIsAvailable: null,
            fetchingUsername: false,
            invalidActivationCode: false,
            usernameCharactersValidation: false,
            showPassword: false,
        }
    },
    computed: {
        ...vuex.mapGetters('account', ['conditionalPasswordValidation']),
        ...vuex.mapState('account', {
            accountValidations: state => state.validations,
        }),
        ...vuex.mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        usernameInvalid () {
            return this.usernameIsAvailable && !this.usernameIsAvailable && this.username.length >= this.accountValidations.username.minLength && !this.fetchingUsername
        },
        usernameTooShort () {
            return this.username.length > 0 && this.username.length < this.accountValidations.username.minLength
        },
        usernameHint () {
            let hint = ''
            if (this.usernameInvalid) {
                hint = !this.usernameCharactersValidation ? this.$t('forms.editAccount.errors.usernameIsUnAvailable') : this.$t('forms.editAccount.errors.usernameCharactersValidation')
            }
            if (this.usernameTooShort) {
                hint += hint.length ? '. ' : ''
                hint += `${this.$t('forms.editAccount.errors.usernameTooShort', [this.accountValidations.username.minLength])} (${this.username.length} / ${this.accountValidations.username.minLength})`
            }
            return hint
        },
        passwordTooShort () {
            return this.password.length > 0 && this.password.length < this.accountValidations.password.minLength
        },
        passwordsDoNotMatch () {
            return this.$v.retypeNewPassword.$invalid &&
                this.retypeNewPassword !== '' &&
                this.password.length > 0 &&
                this.password.length >= this.accountValidations.password.minLength
        },
        passwordIsTooWeak () {
            return !this.$v.password.strongPassword &&
                this.password !== '' &&
                this.password.length >= this.accountValidations.password.minLength
        },
        passwordContainsUsername () {
            return this.username.length > 0 && this.password.toLowerCase().includes(this.username.toLowerCase())
        },
        passwordHint () {
            if (this.passwordTooShort) {
                return `${this.$t('forms.editAccount.errors.passwordTooShort', [this.accountValidations.password.minLength])} (${this.password.length} / ${this.accountValidations.password.minLength})`
            } else if (this.passwordContainsUsername) {
                return this.$t('forms.editAccount.errors.passwordNotSameAsUsername')
            } else if (this.passwordIsTooWeak) {
                return this.$t('forms.editAccount.errors.passwordDoesNotMeetComplexityShort')
            }
            return null
        },
        isSending () {
            return this.sendingForm
        },
        isFormFilled () {
            return !this.$v.$invalid && !this.passwordContainsUsername && !this.usernameInvalid
        },
        showUserIsAvailable () {
            return this.usernameIsAvailable && this.usernameIsAvailable && this.username.length >= this.accountValidations.username.minLength && !this.userInputTimer
        },
        isVomar () {
            return this.theme.logo.indexOf('vomar') > -1
        },
    },
    validations: {
        username: {
            required,
        },
        password: {
            required: true,
            strongPassword (password) {
                return (
                    this.conditionalPasswordValidation(password) && password !== this.username
                )
            },
        },
        retypeNewPassword: {
            required: true,
            sameAsNewPassword: sameAs('password'),
        },
    },
    mounted () {
        if (this.$refs.username) this.$refs.username.focus()
    },
    methods: {
        ...vuex.mapActions('auth', {
            login: 'login',
        }),
        ...vuex.mapActions('account', {
            activate: 'activateAccount',
            checkIfUserExists: 'checkIfUserExists',
        }),
        cancelUserInput () {
            clearTimeout(this.userInputTimer)
        },
        checkUsername (username) {
            this.checkIfUserExists({ username, activation_hash: this.$route.params.hash }).then(result => {
                this.fetchingUsername = false
                if (result instanceof ApiError) {
                    this.usernameIsAvailable = null
                    this.invalidActivationCode = true
                    this.$emit('invalid-hash')
                    return
                } else {
                    if (!result.username_available) {
                        this.usernameCharactersValidation = result.reason[0].code === 'accountUpdate.invalidUsername'
                    }
                    this.usernameIsAvailable = result.username_available
                    this.$emit('loaded')
                }
                clearTimeout(this.userInputTimer)
                this.userInputTimer = null
            })
        },
        userInput () {
            if (this.username.length >= this.accountValidations.username.minLength) {
                this.usernameIsAvailable = null
                this.fetchingUsername = true
                this.userInputTimer = setTimeout(() => {
                    this.checkUsername(this.username)
                }, 500)
            } else {
                this.fetchingUsername = false
            }
        },
        async loginLocal (payload, redirect = false) {
            await this.login({
                username: payload.username,
                password: payload.password,
                redirect: redirect,
            }).then(() => {
                return true
            }).catch((error) => {
                this.handleError(error)
            })
        },
        onSubmit () {
            this.clearError()
            if (this.isSending || !this.isFormFilled) {
                return
            }
            this.sendingForm = true
            this.usernameInUse = false
            const payload = {
                username: this.username,
                password: this.password,
                activation_hash: this.$route.params.hash,
            }
            this.activate(payload).then(response => {
                this.loginLocal(payload).then(() => {
                    this.$emit('success')
                })
            }).catch((error) => {
                this.handleError(error)
            })
        },
        handleError (error) {
            this.$emit('error', error)
            if (error.code === 'account.existingUsername') {
                this.usernameInUse = true
                this.$refs.username.focus()
            }
            this.showError(error.message)
            this.password = ''
            this.retypeNewPassword = ''
            this.sendingForm = false
        },
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
    },
}
</script>
<style scoped lang="scss">
.form-field {
    position: relative;
}
</style>
