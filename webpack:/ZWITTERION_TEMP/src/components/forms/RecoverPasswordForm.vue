<template>
    <div>
        <Card
            :card-style="{ maxWidth: '400px', margin: '10vh auto 2vh' }"
            :body-style="{ padding: '25px' }"
        >
            <div slot="body">
                <form autocomplete="off">
                    <h2>{{ $t( 'forms.editAccount.resetPasswordLegend' ) }}</h2>
                    <Chip
                        v-if="error"
                        error
                        outline
                        :text="error"
                    />
                    <div class="form-field pb-3">
                        <PInput
                            ref="password"
                            v-model.trim="password"
                            cy_id="password"
                            name="password"
                            is-password
                            :label="$t( 'forms.editAccount.newPasswordField.label' )"
                            autocomplete="new-password"
                            :disabled="isSending()"
                            :danger="passwordIsIncorrect"
                            :hint="passwordHint"
                            @blur="$v.password.$touch()"
                        />
                    </div>
                    <div class="form-field pb-3">
                        <PInput
                            ref="retypePassword"
                            v-model.trim.lazy="retypeNewPassword"
                            cy_id="retypeNewPassword"
                            name="retypeNewPassword"
                            is-password
                            :label="$t( 'forms.editAccount.retypeNewPasswordField.label' )"
                            :disabled="isSending()"
                            autocomplete="new-password"
                            :danger="$v.retypeNewPassword.$invalid && $v.retypeNewPassword.$dirty"
                            :hint="retypeHint"
                            @blur="$v.retypeNewPassword.$touch()"
                        />
                    </div>
                    <PasswordHint
                        v-if="$v.password.$invalid && password !== '' && password.length >= accountValidations.password.minLength"
                        :password="password"
                        tag="div"
                    />
                    <div class="button-group">
                        <PmtButton
                            ref="save"
                            primary
                            type="submit"
                            :disabled="!isFormFilled()"
                            :loading="isSending()"
                            @on-click="onSubmit"
                        >
                            {{ $t( 'forms.editAccount.submitBtn.label' ) }}
                        </PmtButton>
                    </div>
                </form>
            </div>
        </Card>

        <PrivacyFooter />
    </div>
</template>

<script>
import PrivacyFooter from '@/components/PrivacyFooter.vue'
import PasswordHint from '@/components/ui/PasswordHint'
import { sameAs } from 'vuelidate/lib/validators'
import * as vuex from 'vuex'
let errorTimer

export default {
    name: 'RecoverPasswordForm',
    components: {
        PrivacyFooter,
        PasswordHint,
    },
    data () {
        return {
            error: '',
            sendingForm: false,
            retypeNewPassword: '',
            password: '',
            invalidActivationCode: false,
            showPassword: false,
        }
    },
    computed: {
        ...vuex.mapGetters('account', ['conditionalPasswordValidation']),
        ...vuex.mapState('account', {
            accountValidations: state => state.validations,
        }),
        passwordIsIncorrect () {
            if (this.$v.password.$invalid && this.password !== '' && this.password.length >= this.accountValidations.password.minLength) {
                return true
            }
            return false
        },
        passwordHint () {
            if (this.password.length > 0 && this.password.length < this.accountValidations.password.minLength) {
                return `${this.$t('forms.editAccount.errors.passwordTooShort', [this.accountValidations.password.minLength])} (${this.password.length} / ${this.accountValidations.password.minLength})`
            } else if (this.passwordIsIncorrect) {
                return this.$t('forms.editAccount.errors.passwordDoesNotMeetComplexity')
            }
            return null
        },
        retypeHint () {
            if (this.$v.retypeNewPassword.$invalid && this.retypeNewPassword.toString() !== '') {
                return this.$t('forms.editAccount.errors.passwordsDoNotMatch')
            }
            return null
        },
    },
    validations: {
        password: {
            required: true,
            strongPassword (password) {
                return (
                    this.conditionalPasswordValidation(password)
                )
            },
        },
        retypeNewPassword: {
            required: true,
            sameAsNewPassword: sameAs('password'),
        },
    },
    mounted () {
        if (this.$route.query.strength) {
            this.UPDATE_PASSWORD_STRENGTH({ password_strength: this.$route.query.strength })
        }
    },
    methods: {
        ...vuex.mapActions('account', {
            recoverPassword: 'changePasswordFromRecover',
        }),
        ...vuex.mapActions('auth', {
            loginWithRecoveredPassword: 'loginWithRecoveredPassword',
        }),
        ...vuex.mapMutations('account', {
            UPDATE_PASSWORD_STRENGTH: 'UPDATE_PASSWORD_STRENGTH',
        }),
        isSending () {
            return this.sendingForm
        },
        isFormFilled () {
            return !this.$v.$invalid
        },
        onSubmit () {
            this.clearError()
            if (this.isSending() || !this.isFormFilled()) {
                return
            }
            this.sendingForm = true
            const payload = {
                password: this.password,
                recovery_hash: this.$route.params.hash,
            }

            this.recoverPassword(payload).then(response => {
                this.loginWithRecoveredPassword(response)
                    .then(() => {
                        this.$router.push({ name: 'last-visited-page' })
                    })
                    .catch((error) => {
                        this.showError(error.message)

                        this.password = ''
                        this.loggingIn = false

                        this.$refs.password.focus()
                    })
            }).catch((error) => {
                this.handleError(error)
            })
        },
        handleError (error) {
            this.$emit('error', error)
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
    @import '@/assets/scss/_colors.scss';
    fieldset {
        border: 1px solid $border-color;
        margin: 15px 0;
    }
    legend {
        padding: 0 10px;
    }
    .form-field{
        margin-bottom: 9px;
    }
    .hint {
        padding: 10px;
        border: 1px solid $border-color;
        .hint-icon {
            padding: 3px;
            svg, i {
                color: $primary-color;
                font-size: 23px;
            }
            &.error {
                svg, i {
                    color: $fail-color;
                    font-size: 28px;
                }
            }
        }
        .hint-text{
            &.error {
                color: gray
            }
        }
    }
    .error-hint {
        font-size: 11px;
        color: $fail-color;
    }
    .success-hint {
        font-size: 11px;
        color: $success-color;
    }
    .error-hint-extended {
        font-size: 11px;
        color: $fail-color;
    }
</style>
