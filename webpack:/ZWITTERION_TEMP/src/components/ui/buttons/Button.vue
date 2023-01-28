<template>
    <button
        :tabindex="tabIndex"
        :class="buttonClasses"
        :style="bStyle"
        :type="type"
        :disabled="disabled || loading"
        @mouseenter="$emit('mouseenter', $event)"
        @mouseleave="$emit('mouseleave', $event)"
        @mouseover="$emit('mouseover', $event)"
        @mouseout="$emit('mouseout', $event)"
        @click.stop.prevent="$emit('on-click', $event);$emit('click', $event);"
    >
        <RoundSpinner
            v-if="loading"
            :no-margin="!!$slots.default || round"
            loading
            :size="defaultLoadingIconSize ? 15 : parseInt(iconSize)"
        />
        <component
            :is="icon"
            v-if="icon && !loading && !rightIcon"
            :size="parseInt(iconSize)"
            title=""
            :class="{'float-left': block}"
            :fill-color="fillColor"
        />
        <span
            v-if="loading && loadingText"
            class="loading-text"
        >{{ loadingText }}</span>
        <span
            v-else-if="$slots.default"
            :class="{'btn-text': true, 'has-left-icon': icon && !loading && !rightIcon, 'has-right-icon': icon && !loading && rightIcon}"
        >
            <slot />
        </span>

        <component
            :is="icon"
            v-if="icon && !loading && rightIcon"
            :size="parseInt(iconSize)"
        />
    </button>
</template>

<script>
export default {
    name: 'PmtButton',
    props: {
        type: {
            type: String,
            default: 'button',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        disabledSimple: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        normal: {
            type: Boolean,
            default: false,
        },
        default: {
            type: Boolean,
            default: false,
        },
        primary: {
            type: Boolean,
            default: false,
        },
        secondary: {
            type: Boolean,
            default: false,
        },
        success: {
            type: Boolean,
            default: false,
        },
        warning: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        defaultGrey: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: false,
        },
        inverted: {
            type: Boolean,
            default: false,
        },
        medium: {
            type: Boolean,
            default: false,
        },
        small: {
            type: Boolean,
            default: false,
        },
        icon: {
            type: String,
            default: '',
        },
        iconSize: {
            type: [String, Number],
            default: 18,
        },
        fillColor: {
            type: String,
            default: undefined,
        },
        rightIcon: {
            type: Boolean,
            default: false,
        },
        mini: {
            type: Boolean,
            default: false,
        },
        round: {
            type: Boolean,
            default: false,
        },
        rounded: {
            type: Boolean,
            default: false,
        },
        sharp: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
        outline: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        defaultLoadingIconSize: {
            type: Boolean,
            default: false,
        },
        loadingText: {
            type: [String, Number],
            default: '',
        },
        big: {
            type: Boolean,
            default: false,
        },
        customClass: {
            type: String,
            default: '',
        },
        noMargin: {
            type: Boolean,
            default: false,
        },
        tabIndex: {
            type: [String, Number],
            default: '0',
        },
        bStyle: {
            type: [String, Array, Object],
            default: '',
        },
    },
    computed: {
        buttonClasses () {
            const classes = {
                btn: true,
                'btn--default': this.default,
                'btn--primary': this.primary,
                'btn--default-grey': this.defaultGrey,
                'btn--secondary': this.secondary,
                'btn--success': this.success,
                'btn--warning': this.warning,
                'btn--danger': this.danger,
                'btn--sm': this.medium,
                'btn--xs': this.small,
                outline: this.outline,
                inverted: this.inverted,
                'btn--icon': this.icon !== '',
                mini: this.mini,
                round: this.round,
                rounded: this.rounded,
                sharp: this.sharp,
                'btn--block': this.block,
                'no-margin': this.noMargin,
                readonly: this.readonly,
                'disabled-simple': this.disabledSimple,
                active: this.active,
            }
            if (this.customClass) {
                classes[this.customClass] = this.customClass
            }
            return classes
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/buttons.scss';
</style>
