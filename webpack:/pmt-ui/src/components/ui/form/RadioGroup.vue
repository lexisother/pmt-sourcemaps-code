<template>
    <div
        class="radio-group"
        :style="{ 'flex-direction': direction, 'align-items': align, gap }"
    >
        <label
            v-if="label"
            class="radio-group-label"
        >{{ label }}</label>
        <div
            v-for="option in options"
            :key="option.value"
            v-ripple="!disabled"
            :class="{'radio-group-el': true,'d-inline-block': inline, 'pa-1 outline': outline, 'disabled': disabled}"
        >
            <label
                :for="option.name"
                class="radio"
                :class="{'inline': inline}"
                tabindex="0"
                @keyup.enter="radioValue = option.value"
            >
                <input
                    :id="option.name"
                    v-model="radioValue"
                    type="radio"
                    :name="option.name"
                    class="d-none"
                    :value="option.value"
                    :disabled="disabled"
                >
                <span
                    class="label"
                />
                <span
                    class="label-text"
                    :class="{active: radioValue === option.value}"
                >{{ option.label }}</span>
            </label>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            default: '',
        },
        options: {
            type: Array,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        initValue: {
            type: String,
            default: '',
        },
        inline: {
            type: Boolean,
            default: false,
        },
        outline: {
            type: Boolean,
            default: false,
        },
        direction: {
            type: String,
            default: 'row',
        },
        align: {
            type: String,
            default: 'center',
        },
        gap: {
            type: String,
            default: '10px',
        },
    },
    data () {
        return {
            radioValue: '',
        }
    },
    watch: {
        radioValue () {
            this.updateValue()
        },
    },
    created () {
        if (this.initValue) {
            this.radioValue = this.initValue
        }
        this.updateValue()
    },
    methods: {
        updateValue () {
            this.$emit('input', this.radioValue)
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';

    .radio-group {
        display: flex;
    }

    .radio {
        position: relative;
        cursor: pointer;
        line-height: 20px;
        font-size: 14px;
        margin: 15px;
        width: 100%;
        display: block;
        .label {
            position: relative;
            display: block;
            float: left;
            margin-right: 10px;
            width: 15px;
            height: 15px;
            border: 1px solid var(--grey-100);
            border-radius: 100%;
            -webkit-tap-highlight-color: transparent;
            top: 3px;
            &:after {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 7px;
                height: 7px;
                border-radius: 100%;
                background: $primary-color;
                transform: scale(0);
                transition: all 0.2s ease;
                opacity: 0.08;
                pointer-events: none;
            }
        }
        .label-text {
            font-size: 13px;
            &.active {
                font-weight: 600;
            }
        }
        &.inline {
            margin: 3px;
        }
        &:focus-visible {
            outline: 1px solid var(--grey-80);
            outline-offset: 2px;
            border-radius: 2px;
        }
    }
    .radio:hover .label:after {
        transform: scale(3.6);
    }
    input[type="radio"]:checked + .label {
        border-color: $primary-color;
    }
    input[type="radio"]:checked + .label:after {
        transform: scale(1);
        transition: all 0.2s cubic-bezier(0.35, 0.9, 0.4, 0.9);
        opacity: 1;
    }
    .radio-group-el.disabled {
        pointer-events: none;

        .label {
            border-color: var(--grey-50);

            &:after {
                background: var(--grey-50);
            }
        }
        .label-text {
            color: var(--grey-50);
        }

        input[type="radio"]:checked + .label {
            border-color: var(--grey-50);
        }
    }
    .outline {
        border: 1px solid var(--grey-40)
    }
</style>
