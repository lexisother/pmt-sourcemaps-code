<template>
    <div
        class="text-area"
        :class="{ invalid: isInvalid, 'label-according-to-other-input-components': labelAccordingToOtherInputComponents }"
    >
        <label
            v-if="label.length"
            class="text-area-label"
        >
            {{ label }}
            <span v-if="required">*</span>
        </label>
        <textarea
            ref="textArea"
            :name="name"
            :value="value"
            :placeholder="placeholder != '' || noPlaceholder ? placeholder : $t('components.textInput.textAreaDefaultPlaceholder', [minLength])"
            :rows="rows"
            :disabled="disabled"
            :readonly="readOnly"
            :maxlength="maxlength"
            :class="{ 'full-border': fullBorder, 'not-resizable': !resizable, 'disabled-dark': disabledDark }"
            @input="input($event)"
            @focus="$emit('focus')"
            @blur="$emit('blur', $event.target)"
            @keyup.enter="checkCtrlAndEmit"
        />
        <span
            v-if="showActionButtons"
            class="show-save-cancel"
            tabIndex="-1"
        >
            <pmt-button
                v-ripple
                default
                small
                round
                inverted
                tab-index="-1"
                icon="content-save"
                icon-size="16"
                @click="$emit('save');"
            />
            <pmt-button
                v-ripple
                danger
                small
                round
                inverted
                tab-index="-1"
                icon="close"
                icon-size="16"
                @click="$emit('cancel');"
            />
        </span>
    </div>
</template>

<script>
export default {
    name: 'TextArea',
    props: {
        value: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            required: true,
        },
        required: Boolean,
        label: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: '',
        },
        noPlaceholder: {
            type: Boolean,
            default: false,
        },
        isInvalid: {
            type: Boolean,
            default: false,
        },
        showActionButtons: {
            type: Boolean,
            default: false,
        },
        rows: {
            type: Number,
            default: 2,
        },
        maxHeight: {
            type: [String, Number],
            default: 200,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        disabledDark: {
            type: Boolean,
            default: false,
        },
        minLength: {
            type: Number,
            default: 10,
        },
        maxlength: {
            type: Number,
            default: null,
        },
        autofocus: {
            type: Boolean,
            default: false,
        },
        fullBorder: {
            type: Boolean,
            default: false,
        },
        transparentBackground: Boolean,
        resizable: {
            type: Boolean,
            default: true,
        },
        labelAccordingToOtherInputComponents: {
            type: Boolean,
            default: false,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            focused: false,
        }
    },
    mounted () {
        if (this.autofocus) {
            this.focus()
        }
    },
    methods: {
        input (event) {
            this.$emit('input', event.target.value)
        },
        focus () {
            setTimeout(() => {
                if (this.$refs.textArea) this.$refs.textArea.focus()
            }, 150)
        },
        checkCtrlAndEmit (event) {
            if (event.ctrlKey) {
                this.$emit('enter')
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .text-area {
        label {
            font-size: 11px;
            font-weight: 400 !important;
            margin-bottom: -3px;
            color: var(--grey-160)
        }

        &.label-according-to-other-input-components {
            label {
                display: block;
                font-size: 12px;
                font-weight: 600 !important;
                margin-bottom: 4px;
            }
        }
        textarea {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 7px 8px;
            padding-right: 32px;
            font-size: 12px;
            line-height: 24px;
            transition: all .3s ease-out;
            border: 1px solid var(--grey-10);
            border-radius: 2px;
            background-color: var(--grey-10);

            &.full-border {
                border: 1px solid $border-color-darker;
                border-radius: 3px;
            }
            &:hover {
                border-color: $dark-gray;
            }
            &:focus {
                border-color: $primary-color;
            }
            &.not-resizable {
                resize: none;
            }
            &.disabled-dark:disabled {
                background-color: $disabled-background-color !important;
            }
        }

        &.invalid {
            textarea {
                border-color: $fail-color;
            }
        }

        .show-save-cancel{
            position: relative;
            height: 100%;
            .btn {
                position: absolute;
                bottom: 0;
                left: 0;

                &:first-child {
                    transform: translate(-225%, -25%);
                }

                &:last-child {
                    transform: translate(-125%, -25%);
                }
            }
        }
    }
</style>
