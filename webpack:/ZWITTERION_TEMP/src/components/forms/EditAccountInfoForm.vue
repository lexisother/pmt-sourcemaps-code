<template>
    <div class="pa-5">
        <Chip
            v-if="user.expiredPassword && !infoChanged"
            :text="$t('forms.editAccount.info.passwordExpired')"
            warning
            large
            icon="alert-outline"
            inverted
        />
        <br v-if="user.expiredPassword && !infoChanged">
        <Chip
            v-if="error"
            :text="error"
            error
            outline
        />
        <div v-if="changeUsername && !infoChanged">
            <div class="form-field pb-3">
                <PInput
                    ref="username"
                    v-model.trim="username"
                    cy_id="username"
                    name="username"
                    :label="$t('forms.editAccount.usernameField.label')"
                    :disabled="isSending"
                    :danger="usernameInUse"
                    autocomplete="new-username"
                    required
                    :hint="usernameHint"
                    @input="usernameInUse = false"
                    @enter-click="username !== '' ? $refs.currentPassword.focus() : false"
                    @blur="usernameInUse = false"
                />
            </div>
            <div class="form-field pb-3">
                <PInput
                    ref="currentPassword"
                    v-model.trim.lazy="currentPassword"
                    cy_id="currentPassword"
                    is-password
                    name="currentPassword"
                    :label="$t('forms.editAccount.currentPasswordField.label')"
                    :disabled="isSending"
                    autocomplete="off"
                    :danger="incorrectCurrentPassword"
                    required
                    :hint="incorrectCurrentPassword ? $t('apiErrors.accountUpdate.incorrectPassword') : null"
                    @enter-click="onSubmit"
                    @blur="incorrectCurrentPassword = false"
                    @focus="$event.target.removeAttribute('readonly')"
                />
            </div>
        </div>

        <div v-if="changePassword && !infoChanged">
            <div class="form-field pb-3">
                <PInput
                    ref="currentPassword"
                    v-model.trim.lazy="currentPassword"
                    cy_id="currentPassword"
                    is-password
                    name="currentPassword"
                    :label="$t('forms.editAccount.currentPasswordField.label')"
                    :disabled="isSending"
                    autocomplete="off"
                    :danger="incorrectCurrentPassword"
                    required
                    @enter-click="currentPassword !== '' ? $refs.newPassword.focus() : false"
                    @blur="incorrectCurrentPassword = false"
                    @focus="$event.target.removeAttribute('readonly')"
                />
            </div>
            <div class="form-field pb-3">
                <PInput
                    ref="newPassword"
                    v-model.trim="newPassword"
                    cy_id="newPassword"
                    is-password
                    name="newPassword"
                    :label="$t('forms.editAccount.newPasswordField.label')"
                    autofill="off"
                    autocomplete="new-password"
                    :disabled="isSending"
                    required
                    :hint="newPasswordHint"
                    @input="passwordMatchError = false"
                    @enter-click="newPassword !== '' ? $refs.retypeNewPassword.focus() : false"
                />
            </div>

            <div class="form-field pb-3">
                <PInput
                    ref="retypeNewPassword"
                    v-model.trim.lazy="retypeNewPassword"
                    cy_id="retypeNewPassword"
                    is-password
                    name="retypeNewPassword"
                    :label="$t('forms.editAccount.retypeNewPasswordField.label')"
                    :disabled="isSending"
                    autocomplete="new-password"
                    :danger="$v.retypeNewPassword.$invalid && $v.retypeNewPassword.$dirty"
                    required
                    :hint="retypeNewPasswordHint"
                    @blur="$v.retypeNewPassword.$touch()"
                    @enter-click="onSubmit"
                />
            </div>
            <PasswordHint
                v-show="passwordIsTooWeak && !passwordContainsUsername"
                :password="newPassword"
            />
        </div>

        <template v-if="infoChanged">
            <AnimatedSuccess />
            <PmtInfo
                gray
                text-center
            >
                {{ $t('pages.myAccountInformation.editAccountSuccessModal.message') }}
            </PmtInfo>
        </template>

        <div
            v-if="!infoChanged"
            class="pt-5 text-center"
        >
            <PmtButton
                v-if="!user.expiredPassword"
                ref="cancel"
                default
                outline
                icon="close"
                icon-size="18"
                :disabled="isSending"
                @click="hide"
            >
                {{ $t('forms.editAccount.cancelBtn.label') }}
            </PmtButton>
            <PmtButton
                ref="save"
                primary
                icon="content-save"
                icon-size="18"
                type="submit"
                :disabled="!isFormFilled"
                :loading="isSending"
                @click="onSubmit"
            >
                {{ $t('pages.myAccountInformation.editBtn.label') }}
            </PmtButton>
        </div>
    </div>
</template>

<script>
import { required, minLength, requiredIf, sameAs } from 'vuelidate/lib/validators'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
let errorTimer
export default {
    name: 'EditAccountInfoForm',
    components: {
        AnimatedSuccess: () => import('@/components/ui/form/AnimatedSuccess'),
    },
    props: {
        updateType: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            error: '',
            usernameInUse: false,
            incorrectCurrentPassword: false,
            passwordMatchError: false,
            sendingForm: false,
            username: '',
            newPassword: '',
            retypeNewPassword: '',
            currentPassword: '',
            currentUsername: '',
            changePassword: false,
            changeUsername: false,
            infoChanged: false,
        }
    },
    computed: {
        ...mapGetters('auth', ['user']),
        ...mapGetters('account', ['conditionalPasswordValidation']),
        ...mapState('account', {
            accountValidations: state => state.validations,
        }),
        isSending () {
            return this.sendingForm
        },
        isFormFilled () {
            return !this.$v.$invalid && !!this.additionalValidations
        },
        canSubmit () {
            return this.isSending || !this.isFormFilled
        },
        additionalValidations () {
            if (this.changeUsername) {
                return this.username.length >= this.accountValidations.username.minLength
            }
            if (this.changePassword) {
                return this.newPassword.length >= this.accountValidations.password.minLength
            }
            return false
        },
        usernameHint () {
            if (!this.$v.username.notSameAsCurrent) {
                return this.$t('forms.editAccount.errors.notSameAsCurrent')
            } else if (this.usernameInUse) {
                return this.$t('forms.editAccount.errors.usernameIsUnAvailable')
            } else if (this.username.length > 0 && this.username.length < this.accountValidations.username.minLength) {
                return `${this.$t('forms.editAccount.errors.usernameTooShort', [this.accountValidations.username.minLength])} (${this.username.length} / ${this.accountValidations.username.minLength})`
            }
            return null
        },
        passwordIsTooWeak () {
            return !this.$v.newPassword.strongPassword &&
                this.newPassword !== '' &&
                this.newPassword.length >= this.accountValidations.password.minLength
        },
        passwordsDoNotMatch () {
            return this.$v.retypeNewPassword.$invalid && this.newPassword !== '' && this.retypeNewPassword !== '' && this.$v.newPassword.strongPassword
        },
        passwordIsTooShort () {
            return this.newPassword.length > 0 && this.newPassword.length < this.accountValidations.password.minLength
        },
        passwordContainsUsername () {
            return this.user.username.length > 0 && this.newPassword.toLowerCase().includes(this.user.username.toLowerCase())
        },
        newPasswordHint () {
            if (this.passwordIsTooShort) {
                return `${this.$t('forms.editAccount.errors.passwordTooShort', [this.accountValidations.password.minLength])} (${this.newPassword.length} / ${this.accountValidations.password.minLength})`
            } else if (this.passwordContainsUsername) {
                return this.$t('forms.editAccount.errors.passwordNotSameAsUsername')
            } else if (this.passwordIsTooWeak) {
                return this.$t('forms.editAccount.errors.passwordDoesNotMeetComplexity')
            } else if (this.passwordMatchError) {
                return this.$t('apiErrors.accountUpdate.passwordMatchError')
            }
            return null
        },
        retypeNewPasswordHint () {
            if (this.passwordsDoNotMatch) {
                return this.$t('forms.editAccount.errors.passwordsDoNotMatch')
            }
            return null
        },
    },

    validations: {
        username: {
            required: requiredIf(function () {
                return this.changeUsername
            }),
            notSameAsCurrent (username) {
                return (
                    username.toLowerCase() !== this.currentUsername.toLowerCase()
                )
            },
        },
        currentPassword: {
            minLength: minLength(2),
            required,
        },
        newPassword: {
            required: requiredIf(function () {
                return this.changePassword
            }),
            strongPassword (newPassword) {
                return (
                    this.changePassword ? this.conditionalPasswordValidation(newPassword) && newPassword !== this.currentUsername : true
                )
            },
        },
        retypeNewPassword: {
            sameAsNewPassword: sameAs('newPassword'),
        },
    },
    mounted () {
        this.reset()
        this.currentUsername = this.user.username.toString()

        this.changePassword = this.updateType === 'password'
        this.changeUsername = !this.changePassword
    },
    methods: {
        ...mapActions('account', {
            updateInfo: 'updateUserAccountInformation',
        }),
        ...mapActions('menu', {
            updateHeaderMenu: 'updateHeaderMenu',
        }),
        ...mapMutations('auth', { updateUserData: 'updateUserData' }),
        show (what) {
            if (what === 'password') {
                this.changePassword = true
                this.changeUsername = false
                setTimeout(() => {
                    if (this.$refs.currentPassword) this.$refs.currentPassword.focus()
                }, 500)
            } else {
                this.changePassword = false
                this.changeUsername = true
                setTimeout(() => {
                    if (this.$refs.username) this.$refs.username.focus()
                }, 500)
            }
            this.$emit('show-modal')
        },
        reset () {
            this.changePassword = false
            this.changeUsername = false
            this.currentPassword = ''
            this.newPassword = ''
            this.retypeNewPassword = ''
            this.username = ''
            this.sendingForm = false
            this.infoChanged = false
            this.passwordMatchError = false
            this.currentUsername = this.user.username
        },
        hide () {
            this.reset()
            this.$emit('hide-modal')
        },
        onSubmit () {
            this.clearError()
            if (this.canSubmit) {
                return
            }
            this.sendingForm = true
            this.usernameInUse = false
            this.incorrectCurrentPassword = false
            this.passwordMatchError = false
            const payload = {
                username: this.changeUsername ? this.username : this.user.username,
                current_password: this.currentPassword,
                email: this.user.contact.email,
                home_phone_number: this.user.contact.phone,
                cell_phone_number: this.user.contact.mobile,
            }
            if (this.changePassword) {
                payload.new_password = this.newPassword
                payload.new_password_repeat = this.retypeNewPassword
            }
            this.updateInfo(payload).then(() => {
                this.$emit('success')
                this.infoChanged = true
                setTimeout(() => {
                    this.hide()

                    // If user had an expired password, made some extra calls now that they have more rights.
                    if (this.user.expiredPassword) {
                        localStorage.removeItem('sitemap')
                        this.updateUserData({ expiredPassword: false })
                        this.updateHeaderMenu()
                    }
                }, 2500)
            }).catch((error) => {
                if (error.code === 'account.existingUsername') {
                    this.usernameInUse = true
                    this.$refs.username.focus()
                    this.$refs.username.select()
                } else if (error.code === 'accountUpdate.incorrectPassword') {
                    this.incorrectCurrentPassword = true
                    this.$refs.currentPassword.focus()
                    this.currentPassword = ''
                } else if (error.code === 'accountUpdate.passwordMatchError') {
                    this.passwordMatchError = true
                    this.$refs.newPassword.focus()
                    this.newPassword = ''
                    this.retypeNewPassword = ''
                } else {
                    this.showError(error.message)
                }
                this.sendingForm = false
            })
        },
        showError (error) {
            this.error = error
            errorTimer = setTimeout(() => { this.error = '' }, 5000)
        },
        clearError () {
            clearTimeout(errorTimer)
            this.error = ''
        },
    },
}
</script>
<style scoped lang="scss">
    .form-field{
        margin-bottom: 9px;
    }
</style>
