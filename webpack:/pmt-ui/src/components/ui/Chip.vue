<template>
    <div
        class="chip"
        :class="{
            raised,
            clickable,
            simple,
            'success-chip': success,
            successLight,
            'error-chip': error,
            small,
            large,
            'warning-chip': warning,
            'primary-chip': primary,
            round,
            rounded,
            outline,
            inverted,
            absolute,
            bold,
            'text-center': !icon && !textLeft,
            'text-left': textLeft,
        }"
        :style="chipStyle"
        @click="clickable ? $emit('click') : false"
    >
        <div
            v-if="avatarText || icon"
            v-tooltip="iconTooltip"
            class="chip-icon"
            :style="{'line-height': iconLineHeight + 'px'}"
        >
            <component
                :is="icon"
                :size="parseInt(iconSize)"
                :fill-color="iconColor"
                title=""
            />
            {{ avatarText ? avatarText : '' }}
        </div>
        <span class="chip-text">
            <slot>
                {{ text }}
            </slot>
        </span>
        <div
            v-if="removeable"
            v-tooltip="$t( 'pages.newsOverview.newsInfo.trash' )"
            class="chip-close"
            @click="$emit('remove')"
        >
            <slot name="close">
                <close :size="14" />
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PmtChip',
    props: {
        avatarText: [String, Number],
        text: [String, Number],
        removeable: Boolean,
        raised: Boolean,
        clickable: Boolean,
        simple: Boolean,
        success: Boolean,
        successLight: Boolean,
        warning: Boolean,
        primary: Boolean,
        error: Boolean,
        small: Boolean,
        large: Boolean,
        icon: String,
        iconSize: {
            type: [String, Number],
            default: 18,
        },
        iconColor: {
            type: String,
        },
        iconTooltip: String,
        backgroundColor: String,
        color: String,
        rounded: Boolean,
        round: Boolean,
        outline: Boolean,
        inverted: Boolean,
        absolute: Boolean,
        bold: {
            type: Boolean,
            default: true,
        },
        minWidth: {
            type: [String, Number],
            default: 30,
        },
        iconLineHeight: {
            type: [String, Number],
        },
        textLeft: Boolean,
    },

    computed: {
        chipStyle () {
            const style = {
                backgroundColor: this.backgroundColor,
                color: this.color,
            }
            if (this.minWidth) {
                style.minWidth = this.minWidth + 'px'
            }
            return style
        },
    },
}
</script>

<style lang="scss" scoped>
    @import url(https://fonts.googleapis.com/css?family=Roboto);
    @import '@/assets/scss/shaddows.scss';
    @import '@/assets/scss/_colors.scss';

    $chip-height: 20px;
    $chip-small-height: 15px;
    $chip-large-height: 30px;
    $chip-min-width: 30px;
    $chip-color: #e0e0e0;

    $chips: (
        primary-chip: ($primary-color, $button-text-color),
        secondary-chip: ($secondary-color, $button-text-color),
        success-chip: ($success-color, $button-text-color),
        successLight: (#95c995, $button-text-color),
        warning-chip: ($pending-color, $button-text-color),
        error-chip: ($fail-color, $button-text-color)
    );

    .chip {
        display: inline-block;
        background: $chip-color;
        padding: 0 5px;
        border-radius: 3px;
        font-size: 12px;
        margin: 3px 3px;
        min-height: $chip-height;
        min-width: $chip-min-width;
        line-height: $chip-height;
        vertical-align: middle;
        cursor: inherit;
        &.simple.outline {
            background: transparent;
            color: $dark-text-color;
            border: 1px solid $dark-text-color;
            padding: 0 5px;
        }
        &.inverted {
            background: transparent;
            color: $dark-text-color;
            border: none;
            padding: 0;
            margin: 0;
        }
        @each $name, $colors in $chips {
            $bgcolor: nth($colors, 1);
            $fontcolor: nth($colors, 2);
            &.#{$name} {
                background-color: $bgcolor;
                border: 1px solid $bgcolor;
                @if $name == 'default' {
                    background-color: transparent;
                    border: 1px solid transparent;
                }
                color: $fontcolor;
                &.outline {
                    @if $name == 'default' {
                        border: 1px solid $bgcolor;
                    }
                    border: 1px solid $bgcolor;
                    background-color: transparent;
                    box-shadow: none;
                    color: $bgcolor;
                    padding: 0 5px;
                }
                &.inverted {
                    background: transparent;
                    color: $bgcolor;
                    border: none;
                }
            }
            &.rounded {
                border-radius: 24px !important;
            }
            &.round {
                border-radius: 50% !important;
            }
            &.bold span {
                font-weight: 600;
            }
            .chip-close {
                display: inline-block;
                margin-left: 3px;
                cursor: pointer;
                padding: 2px;
            }
            .chip-icon {
                float: left;
                margin-top: -2px;
                margin-right: 2px;
            }
            &.small {
                min-height: $chip-small-height;
                line-height: 11px;
                font-size: 11px;
            }
            &.large {
                min-height: $chip-large-height;
                line-height: 15px;
                font-size: 15px;

                .chip-icon {
                    font-size: 12px;
                    line-height: 19px;
                }
            }
            &.clickable {
                cursor: pointer;
                &:hover {
                    filter: brightness(105%);
                }
            }
            &.raised {
                box-shadow: $shaddow-2p;
            }
            &.simple {
                border-radius: 4px;
                height: auto;
                padding: 0 5px;
            }
            &.absolute {
                position: absolute;
                padding-top: 3px;
            }
        }
    }
</style>
