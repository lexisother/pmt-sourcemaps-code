<template>
    <pmt-content narrow>
        <card
            :card-style="{ maxWidth: '400px', margin: '10vh auto 2vh' }"
            :body-style="{ padding: '25px' }"
            :front-style="{ minHeight: '200px' }"
        >
            <div slot="body">
                <forgot-password-form />
            </div>
        </card>
    </pmt-content>
</template>

<script>
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm.vue'
export default {
    components: {
        ForgotPasswordForm,
    },
}

</script>
