<template>
    <form>
        <div class="form-field">
            <PInput
                ref="email"
                v-model="email"
                cy_id="email"
                name="email"
                type="email"
                :label="$t( 'forms.forgotUsername.emailField.label' )"
                :placeholder="$t( 'forms.forgotUsername.emailField.placeholder' )"
                required
                :disabled="isSending()"
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
                {{ $t('forms.forgotUsername.sendBtn.label') }}
            </PmtButton>
        </div>
    </form>
</template>

<script>
import accountService from '@/services/AccountService'
import { required, minLength, email } from 'vuelidate/lib/validators'
import { mapMutations } from 'vuex'

export default {
    name: 'ForgotUsernameForm',
    data () {
        return {
            sendingForm: false,
            email: '',
        }
    },
    validations: {
        email: {
            required,
            email,
            minLength: minLength(2),
        },
    },
    mounted () {
        this.focus()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        isSending () {
            return this.sendingForm
        },
        isFormFilled () {
            return !this.$v.$invalid
        },
        focus () {
            if (this.$refs.email) this.$refs.email.focus()
        },
        onSubmit () {
            if (this.isSending() || !this.isFormFilled()) {
                return
            }
            this.sendingForm = true
            accountService.sendUsernameReminder(this.email).then((response) => {
                this.$emit('after-send')
                this.SET_SNACKBAR({ message: this.$t('modals.forgotUsername.success.info'), success: true })
            }).catch((error) => {
                this.SET_SNACKBAR({ message: error.message, error: true })
                this.$emit('after-send')
            })
        },
    },
}
</script>
