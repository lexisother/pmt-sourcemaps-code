<template>
    <form>
        <div class="form-field">
            <PInput
                ref="username"
                v-model="username"
                cy_id="username"
                name="username"
                :label="$t( 'forms.forgotPassword.usernameField.label' )"
                :placeholder="$t( 'forms.forgotPassword.usernameField.placeholder' )"
                required
                :disabled="isSending()"
                class="mb-3"
            />
            <PInput
                ref="email"
                v-model="email"
                cy_id="email"
                name="email"
                type="email"
                :label="$t( 'forms.forgotPassword.emailField.label' )"
                :placeholder="$t( 'forms.forgotPassword.emailField.placeholder' )"
                required
                :disabled="isSending()"
                class="mb-3"
            />
        </div>

        <div class="button-group">
            <PmtButton
                ref="send"
                primary
                type="submit"
                :disabled="!isFormFilled()"
                :loading="isSending()"
                @click="onSubmit"
            >
                {{ $t('forms.forgotPassword.sendBtn.label') }}
            </PmtButton>
        </div>
    </form>
</template>

<script>
import accountService from '@/services/AccountService'
import { required, minLength, email } from 'vuelidate/lib/validators'
import { mapMutations } from 'vuex'

export default {
    name: 'ForgotPasswordForm',
    data () {
        return {
            sendingForm: false,
            username: '',
            email: '',
        }
    },
    validations: {
        username: {
            required,
            minLength: minLength(2),
        },
        email: {
            required,
            email,
            minLength: minLength(2),
        },
    },
    mounted () {
        this.focus()
        if (this.$route.query.username) {
            this.username = this.$route.query.username
        }
        if (this.$route.query.email) {
            this.email = this.$route.query.email
        }
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        isSending () {
            return this.sendingForm
        },
        isFormFilled () {
            return !this.$v.$invalid
        },
        onSubmit () {
            if (this.isSending() || !this.isFormFilled()) {
                return
            }
            const payload = {
                username: this.username,
                email: this.email,
            }
            this.sendingForm = true
            accountService.sendResetPasswordLink(payload).then((response) => {
                this.SET_SNACKBAR({ message: this.$t('modals.forgotPassword.success.info'), success: true })
                this.$emit('after-send')

                this.sendingForm = false
            }).catch((error) => {
                this.SET_SNACKBAR({ message: error.message, error: true })
                this.$emit('after-send')

                this.sendingForm = false
            })
        },
        focus () {
            if (this.$refs.username) {
                this.$refs.username.focus()
            }
        },
    },
}
</script>
