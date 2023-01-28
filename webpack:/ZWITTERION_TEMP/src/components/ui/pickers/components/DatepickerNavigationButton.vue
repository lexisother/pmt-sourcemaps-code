<template>
    <PmtButton
        :ref="navType"
        v-ripple
        :primary="datepicker.activator.primary"
        :inverted="datepicker.activator.inverted"
        :secondary="datepicker.activator.secondary"
        :success="datepicker.activator.success"
        :warning="datepicker.activator.warning"
        :danger="datepicker.activator.danger"
        :default="datepicker.activator.default"
        :outline="datepicker.activator.outline"
        :no-margin="datepicker.activator.noMargin"
        :medium="datepicker.activator.medium"
        round
        :icon="icon"
        icon-size="18"
        disabled-simple
        :disabled="disabled"
        :class="{navType}"
        :cy_id="`${navType}-date`"
        @click="click()"
    />
</template>

<script>
export default {
    props: {
        datepicker: {
            type: Object,
            required: true,
        },
        navType: {
            type: String,
            required: true,
        },
        disabled: Boolean,
    },
    computed: {
        direction () {
            return this.navType === 'previous' ? 'left' : 'right'
        },
        icon () {
            return `chevron-${this.direction}`
        },
    },
    methods: {
        click () {
            this.$emit('click', this.direction === 'left' ? -1 : 1)
        },
    },
}
</script>
