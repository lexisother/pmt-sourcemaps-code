<template>
    <div class="textarea">
        <label
            v-if="label"
            :for="id || name"
            :class="{ disabled, required }"
        >
            {{ label }}
        </label>

        <div class="textarea-container">
            <textarea
                :id="id || name"
                ref="textarea"
                :name="name"
                :value="value"
                :rows="rows"
                :placeholder="displayedPlaceholder"
                :disabled="disabled"
                :autocorrect="autocorrect"
                :autocapitalize="autocapitalize"
                :readonly="readonly"
                :spellcheck="spellcheck"
                :class="textareaClasses"
                :style="customStyle"
                :minlength="minlength"
                :maxlength="maxlength > 0 ? maxlength : null"
                :tabindex="tabindex"
                @input="$emit('input', $event.target.value)"
                @click="$emit('click', $event)"
                @focus="setFocus($event)"
                @blur="blur($event)"
                @keyup.enter="emitEnterIfCtrlIsPressed"
            />

            <div
                class="right"
                :class="{ dense }"
            >
                <div class="icons">
                    <span
                        v-if="value && value.toString().length && (maxlength > 0 || minlength > 0)"
                        class="character-count"
                        :class="characterCountClasses"
                    >
                        {{ maxlength > 0 ? `${value.toString().length} / ${maxlength}` : value.toString().length }}
                    </span>
                    <PmtButton
                        v-if="showButton"
                        v-ripple
                        v-tooltip="buttonTooltip"
                        default
                        round
                        mini
                        :icon="displayedButtonIcon"
                        icon-size="16"
                        class="textarea-button"
                        tab-index="-1"
                        @click="textareaButtonClick()"
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
            :class="{ success, danger: danger || showMinLengthHint }"
        >
            <slot name="hint">
                {{ displayedHint }}
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PTextArea',
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
        rows: {
            type: Number,
            default: 3,
        },
        resizable: {
            type: Boolean,
            default: true,
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
        fullBorder: {
            type: Boolean,
            default: false,
        },
        customStyle: {
            type: [Object, Array, String],
            default () { return {} },
        },
        maxlength: {
            type: Number,
            default: 0,
        },
        minlength: {
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
        hint: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            focused: false,

        }
    },
    computed: {
        textareaClasses () {
            return {
                danger: this.danger || this.showMinLengthHint,
                success: this.success,
                'has-value': Boolean(this.hasValue && this.value),
                clearable: this.clearable,
                'full-border': this.fullBorder,
                'character-count': this.maxlength > 0 || this.minlength > 0,
                dense: this.dense,
                unresizable: !this.resizable,
            }
        },
        showButton () {
            return Boolean(this.value && this.clearable) || this.buttonIcon
        },
        displayedButtonIcon () {
            if (this.buttonIcon) {
                return this.buttonIcon
            }
            return 'close'
        },
        characterCountClasses () {
            return {
                almost: this.maxlength > 0 && this.maxlength / this.value.toString().length <= 1.75,
                limit: (this.maxlength > 0 && this.maxlength / this.value.toString().length <= 1.1) || this.showMinLengthHint,
            }
        },
        displayedPlaceholder () {
            let placeholder = this.placeholder || ''

            if (this.minlength) {
                if (placeholder.length) placeholder += ' - '
                placeholder += this.minLengthHint
            }

            return placeholder
        },
        displayedHint () {
            let hint = this.hint || ''

            if (this.showMinLengthHint) {
                if (hint.length) hint += ' - '
                hint += this.minLengthHint
            }
            return hint
        },
        showMinLengthHint () {
            if (this.minlength && this.value && this.value.toString().length < this.minlength) {
                return true
            }
            return false
        },
        minLengthHint () {
            return this.$t ? this.$t('components.textInput.textAreaDefaultPlaceholder', [this.minlength]) : `${this.minlength} characters minimum`
        },
    },
    mounted () {
        if (this.autofocus) {
            this.focus()
        }
        if (this.autoselect) {
            this.select()
        }
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
                if (typeof this.$refs.textarea !== 'undefined') {
                    this.focused = true
                    // eslint-disable-next-line no-unused-expressions
                    this.$refs.textarea.focus()
                }
            })
        },
        select () {
            this.$nextTick(() => {
                if (typeof this.$refs.textarea !== 'undefined') {
                    // eslint-disable-next-line no-unused-expressions
                    this.$refs.textarea.select()
                }
            })
        },
        textareaButtonClick () {
            if (this.clearable) {
                this.$emit('input', '')
                this.$emit('clear')
                this.focus()
            } else {
                this.$emit('click:button')
            }
        },
        emitEnterIfCtrlIsPressed (event) {
            if (event.ctrlKey) {
                this.$emit('enter')
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'PTextArea.scss';
</style>
