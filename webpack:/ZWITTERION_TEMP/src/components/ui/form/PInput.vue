<template>
    <div
        class="text-input"
        :class="{ sticky }"
    >
        <label
            v-if="label"
            :for="id || name"
            :class="{ disabled, required }"
        >
            {{ label }}
        </label>

        <div class="input-container">
            <input
                :id="id || name"
                ref="input"
                :cy_id="id || name"
                :name="name"
                :type="inputType"
                :value="value"
                :placeholder="placeholder"
                :disabled="disabled"
                :autocomplete="autocomplete"
                :autocorrect="autocorrect"
                :autocapitalize="type === 'password' || isPassword ? 'none' : autocapitalize"
                :readonly="readonly"
                :spellcheck="spellcheck"
                :class="inputClasses"
                :style="inputStyle"
                :maxlength="maxlength || null"
                :tabindex="readonly ? -1 : tabindex"
                @input="$emit('input', $event.target.value)"
                @click="$emit('click', $event)"
                @focus="setFocus($event)"
                @blur="blur($event)"
                @keyup="$emit('keyup', $event)"
                @keydown="$emit('keydown', $event)"
                @keyup.enter.prevent.stop="$emit('enter-click', $event)"
                @keyup.esc.prevent.stop="$emit('esc-click', $event)"
            >

            <div
                v-if="showRight"
                class="right"
                :class="{ dense }"
            >
                <div class="icons">
                    <span
                        v-if="value.toString().length && maxlength > 0"
                        class="max-length"
                        :class="maxLengthClasses"
                    >
                        {{ value.toString().length }} / {{ maxlength }}
                    </span>
                    <PmtButton
                        v-if="showInputButton"
                        v-ripple
                        v-tooltip="buttonTooltip"
                        default
                        round
                        mini
                        :icon="displayedButtonIcon"
                        icon-size="16"
                        class="input-button"
                        tab-index="-1"
                        @click="inputButtonClick()"
                    />
                    <component
                        :is="appendIcon"
                        v-if="appendIcon"
                        ref="appendIcon"
                        :size="16"
                        :class="{ disabled: disabled || readonly }"
                    />
                </div>
            </div>

            <VProgressLinear
                v-if="loading"
                indeterminate
                height="1"
                absolute
                bottom
                :color="'var(--blue-100)'"
            />
        </div>

        <div
            v-if="displayedHint.length"
            class="hint"
            :class="{ success, danger }"
        >
            <slot name="hint">
                {{ displayedHint }}
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PInput',
    props: {
        value: {
            type: [String, Number],
            default: '',
        },
        id: {
            type: String,
            default: null,
        },
        name: {
            type: String,
            default: null,
        },
        type: {
            type: String,
            default: 'text',
        },
        /**
         * This prop is for creating a 'fake password input'. Needed when you want your browser prevent from giving
         * password sugggestions, for instance when changing passwords (and current password needs to be entered manually)
         * In this situation 'type' must be set to 'text' by default
         */
        isPassword: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: null,
        },
        required: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        success: {
            type: Boolean,
            default: false,
        },
        hasValue: {
            type: Boolean,
            default: false,
        },
        autocomplete: {
            type: String,
            default: 'off',
        },
        autocorrect: {
            type: String,
            default: 'off',
        },
        autocapitalize: {
            type: String,
            default: 'off',
        },
        spellcheck: {
            type: Boolean,
            default: false,
        },
        autofocus: {
            type: Boolean,
            default: false,
        },
        autoselect: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: null,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        appendIcon: {
            type: String,
            default: null,
        },
        buttonIcon: {
            type: String,
            default: null,
        },
        buttonTooltip: {
            type: String,
            default: null,
        },
        clearable: {
            type: Boolean,
            default: false,
        },
        sticky: {
            type: Boolean,
            default: false,
        },
        fullBorder: {
            type: Boolean,
            default: false,
        },
        inputStyle: {
            type: [Object, Array, String],
            default () { return {} },
        },
        maxlength: {
            type: Number,
            default: 0,
        },
        tabindex: {
            type: Number,
            default: 0,
        },
        dense: {
            type: Boolean,
            default: false,
        },
        center: {
            type: Boolean,
            default: false,
        },
        hint: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            focused: false,
            isCaps: false,
            showPassword: false,
        }
    },
    computed: {
        showRight () {
            const showLength = this.value?.toString().length && this.maxlength > 0
            return showLength || this.showInputButton || this.appendIcon
        },
        inputClasses () {
            return {
                danger: this.danger,
                success: this.success,
                'has-value': Boolean(this.hasValue && this.value),
                clearable: this.clearable,
                'append-icon': this.appendIcon,
                sticky: this.sticky,
                'full-border': this.fullBorder,
                'max-length': this.maxlength,
                dense: this.dense,
                center: this.center,
                password: this.isPassword && !this.showPassword,
            }
        },
        showInputButton () {
            return (this.value && this.clearable) || this.type === 'password' || this.isPassword || this.buttonIcon
        },
        displayedButtonIcon () {
            if (this.type === 'password' || this.isPassword) {
                return this.showPassword ? 'EyeOff' : 'EyeOutline'
            } else if (this.buttonIcon) {
                return this.buttonIcon
            }
            return 'close'
        },
        inputType () {
            if ((this.type === 'password' || this.isPassword) && this.showPassword) {
                return 'text'
            }
            return this.type
        },
        showCapslockHint () {
            return this.isCaps && (this.type === 'password' || this.isPassword) && this.focused
        },
        displayedHint () {
            let displayedHint = ''
            if (this.showCapslockHint) {
                displayedHint += `${this.$t('components.textInput.capsOn')}. `
            }
            if (this.hint) {
                displayedHint += this.hint
            }

            return displayedHint
        },
        maxLengthClasses () {
            return {
                almost: this.maxlength / this.value.toString().length <= 1.75,
                limit: this.maxlength / this.value.toString().length <= 1.1,
            }
        },
    },
    mounted () {
        if (this.autofocus) {
            this.focus()
        }
        if (this.autoselect) {
            this.select()
        }
        window.addEventListener('keyup', this.checkCaps)
    },
    destroyed () {
        window.removeEventListener('keyup', this.checkCaps)
    },
    methods: {
        setFocus (event) {
            this.focused = true
            this.$emit('focus', event)
        },
        blur (event) {
            this.focused = false
            this.$emit('blur', event.target)
        },
        focus () {
            this.$nextTick(() => {
                if (typeof this.$refs.input !== 'undefined') {
                    this.focused = true
                    // eslint-disable-next-line no-unused-expressions
                    this.$refs.input.focus()
                }
            })
        },
        select () {
            this.$nextTick(() => {
                if (typeof this.$refs.input !== 'undefined') {
                    // eslint-disable-next-line no-unused-expressions
                    this.$refs.input.select()
                }
            })
        },
        checkCaps (event) {
            this.isCaps = event.getModifierState && event.getModifierState('CapsLock')
        },
        inputButtonClick (event) {
            if (this.clearable) {
                this.$emit('input', '')
                this.$emit('click:clear')
                this.focus()
            } else if (this.type === 'password' || this.isPassword) {
                this.showPassword = !this.showPassword
            } else {
                this.$emit('click:button')
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'PInput.scss';
</style>
