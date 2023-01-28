<template>
    <form
        ref="loginForm"
        class="login-form"
        autocomplete="off"
    >
        <chip
            v-if="!online"
            error
            outline
            icon="wifi-off"
            :text="online ? error: $t('apiErrors.general.networkError')"
        />
        <chip
            v-else-if="error"
            error
            outline
            :text="error"
        />
        <div class="form-field pb-3">
            <PInput
                id="loginUsername"
                ref="username"
                v-model="username"
                :label="$t('forms.login.usernameField.label')"
                append-icon="account"
                autofocus
                :disabled="loggingIn"
                @focus="$event.target.select()"
            />
        </div>
        <div class="form-field pb-3">
            <PInput
                id="loginPassword"
                ref="password"
                v-model="password"
                type="password"
                :label="$t('forms.login.passwordField.label')"
                :disabled="loggingIn"
                @focus="$event.target.select()"
            />
        </div>
        <div class="button-group">
            <PmtButton
                id="login-button"
                ref="loginButton"
                primary
                :disabled="loggingIn"
                type="submit"
                :loading="loggingIn"
                :loading-text="$t('forms.login.sendBtn.sending')"
                @click="onSubmit"
            >
                <img
                    v-if="isTheJollySeason"
                    class="snowflake"
                    :src="require('@/assets/images/snowflake.png')"
                >
                <span>{{ $t('forms.login.sendBtn.label') }}</span>
            </PmtButton>
        </div>
    </form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import { mapActions, mapState } from 'vuex'

let errorTimer

export default {
    name: 'LoginForm',
    data () {
        return {
            loggingIn: false,
            username: '',
            password: '',
            error: '',
            notValid: false,
            showPassword: false,
            currentYear: this.$moment().isoWeekYear(),
        }
    },
    validations: {
        username: {
            required,
            minLength: minLength(6),
        },
        password: {
            required,
            minLength: minLength(6),
        },
    },
    computed: {
        ...mapState(['online']),
        ...mapState('auth', {
            securityError: 'securityError',
        }),
        isFormFilled () {
            return !this.$v.$invalid
        },
        isTheJollySeason () {
            const christmas = this.$moment().isBetween(`${this.currentYear}-12-15`, `${this.currentYear}-12-26`)
            return christmas
        },
    },
    mounted () {
        if (this.securityError !== '') {
            this.error = this.$t('apiErrors.security.badToken')
        }
    },
    methods: {
        ...mapActions('auth', { login: 'login' }),
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
            if (this.loggingIn || this.username.length < 2 || this.password.length < 2) {
                this.notValid = true
                return
            }
            this.notValid = false
            this.clearError()
            this.loggingIn = true
            this.login({ username: this.username, password: this.password }).catch((error) => {
                console.error(error)
                this.showError(error.message)
                this.password = ''
                this.loggingIn = false
                this.$nextTick(() => this.$refs.password.focus())
            })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';

    :deep() .v-text-field__slot .v-label {
        color: $dark-text-color;
    }
    :deep() .v-input__icon.v-input__icon--append .mdi::before {
        font-size: 18px;
    }

    .snowflake {
        height: 14px;
        width: 14px;
        margin-right: 8px;
        vertical-align: bottom;
    }

</style>
