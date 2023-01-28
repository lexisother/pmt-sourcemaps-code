<template>
    <div
        class="color-palette"
        :class="{ 'in-modal': inModal, disabled }"
    >
        <label
            v-if="label.length > 0"
            :for="id || name"
        >
            {{ label }}
        </label>
        <PmtColorSwatch
            v-for="color in colors"
            :key="color"
            :color="color"
            :selected="color === value"
            :selectable="!disabled"
            @change="change(color)"
        />
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            default: '',
        },
        value: {
            type: String,
            default: null,
        },
        inModal: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            colors: [
                '#a1aaad',
                '#2f4f4f',
                '#2e8b57',
                '#7f0000',
                '#808000',
                '#0000aa',
                '#ffd700',
                '#00fa9a',
                '#4db0fa',
                '#00ffff',
                '#0000ff',
                '#f08080',
                '#adff2f',
                '#cf8804',
                '#ff1493',
                '#ee82ee',
            ],
        }
    },
    methods: {
        change (color) {
            if (!this.disabled) {
                this.$emit('input', color)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .color-palette {
        width: 256px;
        line-height: 16px;
        & > * {
            display: inline-block;
            margin: 0 8px 0 0;
        }

        &.in-modal {
            width: 224px;
        }

        &.disabled {
            opacity: 0.33;
        }

        label {
            width: 100%;
            height: 16px;
            margin-bottom: 4px;
            font-size: 11px;
            color: var(--grey-160)
        }

        @include bp-sm {
            width: 128px;

            &.in-modal {
                width: 256px;
            }
        }

        @include bp-md {
            width: 256px;
        }
    }
</style>
