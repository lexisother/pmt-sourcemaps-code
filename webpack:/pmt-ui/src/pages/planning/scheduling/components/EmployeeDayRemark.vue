<template>
    <div
        v-tooltip="remarkTooltip"
        :class="{'content-editable-container': true, focused}"
    >
        <PTextArea
            ref="dayRemark"
            name="content-editable"
            cy_id="dayRemark"
            class="content-editable"
            :value="dayRemark.remark"
            :resizable="false"
            :disabled="isDisabled"
            :rows="2"
            :danger="error"
            v-on="listeners"
        />
        <VProgressLinear
            v-if="saving"
            ref="loadingIndicator"
            :active="saving"
            :indeterminate="saving"
            absolute
            bottom
            height="2"
        />
        <Lock
            v-if="!SHOW_SENT_SCHEDULES && isDisabled && dayRemark.remark"
            ref="readOnlyLockIcon"
            class="read-only-icon"
            :size="14"
            name=""
            title=""
        />
        <CalendarSync
            v-if="!dayRemark.id && !dayRemark.isNew"
            ref="recurringRemarkIcon"
            class="recurring-remark-icon"
            :size="14"
            name=""
            title=""
        />
        <AnimatedSuccess
            v-if="saved"
            class="animated-success"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'EmployeeDayRemark',
    components: {
        AnimatedSuccess: () => import('@/components/ui/form/AnimatedSuccess'),
    },
    mixins: [mixins],
    props: {
        day: {
            type: Object,
            required: true,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        employee: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            focused: false,
            saving: false,
            saved: false,
            error: false,
        }
    },
    computed: {
        dayRemark () {
            return this.employee.dayRemark(this.day, this.DEPARTMENT_STATUS_HISTORY_ID) || {
                account_id: this.employee.account_id,
                remark: '',
                isNew: true,
                date: this.day.apiFormat(),
            }
        },
        listeners () {
            return {
                ...this.$listeners,
                input: this.onInput,
                blur: this.onBlur,
                focus: this.onFocus,
                paste: this.onPaste,
            }
        },
        isDisabled () {
            if (this.weekIsClosed) return true
            if (this.SHOW_SENT_SCHEDULES) return true
            return !this.CAN_MANAGE_REMARKS || this.readOnly
        },
        remarkTooltip () {
            if (this.isDisabled) return ''
            let content = ''
            if (!this.CAN_MANAGE_REMARKS || this.readOnly) {
                content = this.baseTranslate('standardShifts.tooltips.noPermissionToEditRemarks')
            }
            if (!this.dayRemark.id && !this.dayRemark.isNew) {
                content += `${content ? '' : ' '}${this.baseTranslate('editCreateRemarkForm.recurringRemark')}`
            }
            return {
                content,
                delay: {
                    show: 500,
                    hide: 0,
                },
            }
        },
    },
    methods: {
        onInput (e) {
            this.$emit('input', e.value)
        },
        onBlur (e) {
            this.focused = false
            this.$emit('blur', e.value)
            if (e.value !== this.dayRemark.remark) {
                this.saving = true
                this.toggleSpellCheck(true)
                this.saveDayRemark({ ...this.dayRemark, remark: e.value }, this.employee).then(() => {
                    this.update(true)
                }).catch(err => {
                    this.update(true)
                    this.SET_SNACKBAR({ message: err.message, error: true })
                }).finally(() => {
                    this.saving = false
                })
            }
        },
        onFocus (e) {
            this.focused = true
            this.toggleSpellCheck(false)
        },
        onPaste (e) {
            navigator.clipboard.readText().then(clipText => {
                this.$emit('input', this.value + clipText.toString())
            })
        },
        toggleSpellCheck (val) {
            document.body.setAttribute('spellcheck', val)
        },
        update (saved) {
            this.saved = saved
            setTimeout(() => {
                this.saved = false
                this.$emit('saved', this.day.isoWeekday())
                return true
            }, 1700)
        },
    },
}
</script>

<style lang="scss" scoped>
.content-editable-container {
    height: 100%;
    position: relative;
    .content-editable {
        margin: 0;
        height: 100%;
        :deep() textarea {
            background-color: transparent;
            padding: 1px;
            line-height: normal;
            border: none;
            &:focus:enabled, &:hover:enabled {
                background-color: #FFFFFF;
            }
        }
    }
    .read-only-icon, .recurring-remark-icon {
        position: absolute;
        right: .5rem;
        opacity: .5;
        line-height: normal;
        z-index: 9;
        pointer-events: all;
    }
    .read-only-icon {
        top: .2rem;
    }
    .recurring-remark-icon {
        bottom: .2rem;
    }
    .animated-success {
        transform: scale(22%) translate(100%);
        position: absolute;
        right: -6px;
        top: -30px;
    }
}
</style>
