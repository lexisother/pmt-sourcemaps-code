<template>
    <fieldset
        class="pmt-fieldset"
        :class="fieldsetClasses"
        v-bind="$attrs"
        :style="{...fieldsetOveridingStyle, ...customStyle}"
    >
        <legend
            :class="{large: biggerLegend}"
            :style="fieldsetLegendOveridingStyle"
        >
            <span
                v-if="legendText && !$slots.legend"
                class="fieldset-legend-text"
            >{{ legendText }}</span>
            <slot name="legend" />
        </legend>
        <slot />
    </fieldset>
</template>

<script>
export default {
    props: {
        legendText: {
            type: String,
            default: '',
        },
        normal: {
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
        biggerLegend: {
            type: Boolean,
            default: false,
        },
        filled: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: '',
        },
        material: {
            type: Boolean,
            default: false,
        },
        customStyle: Object,
    },
    computed: {
        fieldsetClasses () {
            const classes = {
                'fieldset--default': this.normal,
                'fieldset--primary': this.primary,
                'fieldset--secondary': this.secondary,
                'fieldset--success': this.success,
                'fieldset--warning': this.warning,
                'fieldset--danger': this.danger,
                'fieldset--filled': this.filled,
            }
            return classes
        },
        fieldsetOveridingStyle () {
            if (this.material) {
                return {
                    border: 'none',
                    backgroundColor: 'white',
                    boxShadow: 'var(--shadow-2dp)',
                }
            }
            if (this.color) {
                return { border: `1px solid ${this.color} !important` }
            }
            return {}
        },
        fieldsetLegendOveridingStyle () {
            if (this.material) {
                return {
                    border: 'none',
                    backgroundColor: this.color ? this.color : 'white',
                    color: this.color ? `${this.$helpers.getContrastColorFromHex(this.color)} !important` : 'inherit',
                    boxShadow: 'var(--shadow-2dp)',
                }
            }
            if (this.color) {
                const style = {
                    border: `1px solid ${this.color} !important`,
                    backgroundColor: 'white',
                }
                if (this.filled) {
                    style.backgroundColor = `${this.color} !important`
                    style.color = `${this.$helpers.getContrastColorFromHex(this.color)} !important`
                }
                return style
            }
            return {}
        },
    },
}
</script>

<style lang="scss">
    @import '@/assets/scss/_colors.scss';
    $fieldsets: (
        primary: ($primary-color),
        secondary: ($secondary-color),
        success: ($success-color),
        warning: ($pending-color),
        danger: ($fail-color),
        default: ($dark-text-color)
    );
    fieldset {
        -moz-border-radius: 3px;
        -webkit-border-radius: 3px;
        border-radius: 3px;
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid $dark-text-color;
        legend {
            padding: 0 10px;
            color: $dark-text-color;
            border-radius: 3px;
            &.large {
                font-size: 115%;
                font-weight: 600;
            }
        }
        &.filled {
            legend {
                padding: 0 3px;
                border: 1px solid $dark-text-color;
            }
        }
        @each $name, $colors in $fieldsets {
            $borderColor: nth($colors, 1);
            &.fieldset--#{$name} {
                border: 1px solid $borderColor;
                legend {
                    color: $borderColor;
                }
                &.filled {
                    background-color: $white;
                    legend {
                        background-color: transparent;
                        border-radius: 50px;
                        border-bottom: 1px solid $borderColor;
                    }
                }
            }
        }
    }
</style>
