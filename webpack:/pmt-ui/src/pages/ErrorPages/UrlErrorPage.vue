<template>
    <div>
        <card
            :card-style="{maxWidth: '800px', margin: '10vh auto 2vh'}"
            :body-style="{padding: '0px !important'}"
            :class="type + '_card'"
        >
            <div
                slot="body"
                class="body"
            >
                <h1>{{ message }}</h1>
            </div>
        </card>
    </div>
</template>

<script>
export default {
    data: () => ({
        message: '',
        type: '',
    }),
    mounted () {
        if (!this.$route.query.message) {
            this.$router.push('/login')
        } else {
            this.message = this.$route.query.message
            this.type = this.$route.query.type
        }
    },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_colors.scss';

.body {
    padding: 50px;
    text-align: center;
}

.success_card {
    border-top: 10px solid $success-color
}

.warning_card {
    border-top: 10px solid $pending-color
}

.error_card {
    border-top: 10px solid $fail-color
}
</style>
