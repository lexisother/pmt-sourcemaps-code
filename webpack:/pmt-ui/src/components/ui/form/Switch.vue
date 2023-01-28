<template>
    <div
        class="switch noprint"
        :class="{ 'no-margin' : noMargin, disabled }"
        @click="change"
    >
        <input
            :id="id"
            :checked="checked"
            type="checkbox"
            class="switch__input"
            :tabindex="tabIndex"
            :disabled="disabled"
        >
        <label
            :for="id"
            class="switch__label"
            :class="{ bold }"
            v-html="label"
        />
    </div>
</template>
<script>
export default {
    name: 'PmtSwitch',
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: '',
        },
        id: {
            type: [String, Number],
            default: '',
        },
        noMargin: {
            type: Boolean,
            default: true,
        },
        bold: {
            type: Boolean,
            default: true,
        },
        tabIndex: {
            type: [String, Number],
            default: '-1',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            checked: this.value,
            hasFocus: false,
        }
    },
    watch: {
        value (newValue) {
            this.checked = newValue
        },
    },
    methods: {
        change () {
            if (!this.disabled) {
                this.checked = !this.checked
                this.$emit('input', this.checked)
            }
        },
    },
}
</script>
<style lang="scss">
    @import '@/assets/scss/_colors.scss';
    .switch {
        display: inline-block;
        position: relative;
        height: 28px;
        margin: 10px 0 10px;
        line-height: 24px;
        cursor: pointer;

        &.disabled {
            cursor: not-allowed !important;
        }
    }

    .no-margin {
        margin: 0 !important;
    }

    .switch__input {
        position: absolute;
        left: 0;
        width: 36px;
        height: 20px;
        opacity: 0;
        z-index: 3;
        cursor: pointer;
    }

    .switch__label {
        display: block;
        height: 28px;
        padding: 2px 4px 4px 44px;
        cursor: pointer;
        font-size: 12px;
        font-weight: normal !important;
        line-height: 20px;
        .bold {
            font-weight: 600 !important;
        }
    }

    input:focus + .switch__label {
        border: 1px dotted $primary-color;
    }

    .switch__label:before {
        content: '';
        position: absolute;
        top: 8px;
        left: 1px;
        width: 36px;
        height: 10px;
        background-color: rgb(154, 154, 154);
        border-radius: 14px;
        z-index: 1;
        transition: background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .switch__label:after {
        content: '';
        position: absolute;
        top: 4px;
        left: 0;
        width: 18px;
        height: 18px;
        background-color: #e0e0e0;
        border-radius: 14px;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
        z-index: 2;
        transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        transition-property: left, background-color;
    }

    .switch__input:checked + .switch__label:before {
        opacity: 0.6;
    }

    .switch__input:checked + .switch__label:after {
        left: 20px;
        background-color: $primary-color;
    }

    .switch.disabled .switch__label:before {
        border: $disabled-color dotted 1px;
        background-color: transparent;
    }

    .switch.disabled .switch__label:after {
        border: $disabled-color dotted 1px;
        background-color: $grey-10;
    }

    @media print {
        .switch {
            display: none;
        }
    }
    label {
        color: inherit;
        font-size: inherit;
    }
</style>
