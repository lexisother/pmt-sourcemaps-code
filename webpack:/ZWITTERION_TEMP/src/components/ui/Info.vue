<template>
    <div
        class="pmt-info"
        :class="infoClasses"
        :style="infoStyle || ''"
    >
        <div
            v-if="closable"
            class="close"
        >
            <PmtButton
                v-tooltip="$tc('ui.singles.closeOrCloseAndNeverShowAfter', 2)"
                primary
                inverted
                medium
                icon="close"
                round
                class="close-button"
                @click="close()"
            />
        </div>
        <slot />
    </div>
</template>

<script>
export default {
    name: 'Info',
    props: {
        gray: {
            type: Boolean,
            default: false,
        },
        blue: {
            type: Boolean,
            default: false,
        },
        warning: {
            type: Boolean,
            default: false,
        },
        rounded: {
            type: Boolean,
            default: false,
        },
        textCenter: {
            type: Boolean,
            default: false,
        },
        closable: {
            type: Boolean,
        },
        infoStyle: {
            type: [String, Object, Array],
            default: '',
        },
        inverted: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        infoClasses () {
            return {
                'info-gray': this.gray,
                'info-blue': this.blue,
                'text-center': this.textCenter,
                'info-warning': this.warning,
                rounded: this.rounded,
                inverted: this.inverted,
            }
        },
    },
    methods: {
        close () {
            this.$emit('close-info-text')
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';

    .pmt-info {
        padding: 20px;
        margin-bottom: 15px;
        color: darken($pending-color, 40%);
        font-size: .95rem;
        line-height: 1.8em;
        background-color: $pending-color;
        border: 1px solid darken($pending-color, 30%);
        position: relative;
        ul {
            margin-left: 1em;
            list-style: disc;
            > li {
                margin-bottom: 1em;
            }
        }

        &.rounded {
            border-radius: 4px;
        }

        p:last-child {
            margin-bottom: 0;
        }

        &.info-gray {
            color: darken( $hit-gray, 20% );
            background-color: lighten( $hit-gray, 30% );
            border: none;
            font-weight: 400;
            font-size: 13px;
        }
        &.info-blue {
            color: darken( $primary-color, 20% );
            background-color: lighten( $hit-gray, 30% );
            border: none;
            font-weight: 400;
            font-size: 13px;
            h1, h2, h3, h4, h5, h6 {
                color: darken( $primary-color, 20% );
                margin: 0;
            }
            &.inverted {
                background-color: var(--blue-30) !important;
                color: var(--grey-180) !important;
            }
        }
        &.info-warning {
            color: white;
            background-color: $pending-color;
            border: none;
            font-weight: 400;
            font-size: 13px;
        }
        &:last-child {
            margin-bottom: 0;
        }

        .close {
            float: right;
            position: fixed;
            right: 25px;
            top: 25px;
        }
    }
</style>
