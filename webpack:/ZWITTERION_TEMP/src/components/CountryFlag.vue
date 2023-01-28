<template>
    <div
        class="flag"
        :class="flagIconClass"
        :cy_id="`flag_${country}`"
    />
</template>

<script>
export default {
    name: 'CountryFlag',
    props: {
        country: {
            type: String,
            required: true,
            validator: function (value) {
                return value.length === 2 || value.length === 3
            },
            default: 'nl',
        },
        size: {
            type: String,
            validator: function (value) {
                return value === 'extra-small' || value === 'small' || value === 'normal' || value === 'big'
            },
            default: 'normal',
        },
    },
    computed: {
        /**
             * Method to get the flag class
             */
        flagIconClass () {
            return {
                [`${this.country}`]: true,
                [this.flagMargin]: true,
            }
        },
        /**
             * Method to get the correct flag size based on this.size
             */
        flagMargin () {
            return `${this.size}-flag`
        },
    },
}
</script>
<style scoped lang="scss">
    @import '@/assets/scss/mixins/flags.scss';
    @include flags;
</style>
