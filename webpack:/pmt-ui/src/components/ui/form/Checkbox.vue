<template>
    <span
        class="checkbox-container"
        :class="{ disabled }"
        @click="$emit(iconComponent.action)"
    >
        <span :class="{'btn btn--default btn--round': rounded, done: iconComponent.class === 'done'}">
            <component
                :is="iconComponent.tag"
                :class="[iconComponent.class, disabled]"
                :style="iconComponent.style"
                :size="parseInt(size)"
            />
        </span>
        <span
            v-if="text"
            :class="{ disabled }"
            v-html="text"
        />
    </span>
</template>
<script>
export default {
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        indeterminate: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: '',
        },
        rounded: {
            type: Boolean,
            default: false,
        },
        size: {
            type: [String, Number],
            default: 24,
        },
        text: {
            type: String,
            default: '',
        },
    },
    computed: {
        iconComponent () {
            let result = {}
            if (!this.value && !this.indeterminate) {
                result = {
                    tag: 'checkbox-unchecked',
                    class: 'not-done',
                    action: 'add',
                    style: {
                        color: this.checkedColor,
                    },
                }
            } else if (this.value && !this.indeterminate) {
                result = {
                    tag: 'checkbox-checked',
                    class: 'done',
                    action: 'remove',
                    style: {
                        color: this.uncheckedColor,
                    },
                }
            } else if (this.indeterminate) {
                result = {
                    tag: 'checkbox-indeterminate',
                    class: '',
                    action: 'none',
                    style: {
                        color: this.indeterminateColor,
                    },
                }
            }
            return result
        },
    },
}
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .checkbox-container {
        cursor: pointer;
    }
    .checkbox:hover {
        cursor: pointer;
    }
    .btn--round {
        border-radius: 50% !important;
        padding: 8px !important;
        min-width: unset !important;
        box-shadow: unset !important;
        color: #6a6a6a;
    }
    .check-block {
        display: block;
        margin-top: 3px;
        margin-bottom: 3px;
        color: #737373;
        font-size: 13px;
    }
    .not-done {
        color: var(--grey-100)
    }
    .done {
        color: $primary-color;
    }
    .not-done-disabled {
        color: var(--grey-60) !important;
    }
    .disabled {
        color: var(--grey-60);
        pointer-events: none;
        .done, .not-done {
            color: var(--grey-60) !important;
        }
    }
</style>
