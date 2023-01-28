<template>
    <component
        :is="tag"
        v-tooltip="showStatusTooltip ? departmentStatusTooltip : ''"
        class="department"
        :class="{clickable}"
        :style="`border-color: ${department.color || department.department_color}`"
        @click="$emit('click', department.id || department.department_id)"
    >
        {{ !showShortName ? department.department_name : department.department_shortname }}
        <span
            v-if="$slots.details"
            class="details"
        >
            <slot name="details" />
        </span>
        <span
            v-if="department.is_default && showDefault"
            v-tooltip="department.is_default && showDefault ? $t('ui.singles.default') : ''"
            class="default-icon"
        >
            <checkbox-marked-circle-outline
                :size="18"
                class="text-success pl-2"
            />
        </span>
    </component>
</template>

<script>
export default {
    name: 'Department',
    props: {
        department: {
            type: Object,
            default: () => ({}),
        },
        showDefault: Boolean,
        showShortName: Boolean,
        showStatusTooltip: Boolean,
        clickable: Boolean,
        tag: {
            type: String,
            default: 'span',
        },
    },
    computed: {
        departmentStatusTooltip () {
            const finalized = this.$t(`pages.availabilityOverview.tooltips.${this.department.status.department_finalized ? 'finalized' : 'notFinalized'}`)
            let finalizedDate = ''
            if (this.department.last_finalized_date && this.department.status.department_finalized) {
                finalizedDate = ` - ${this.$moment(this.department.last_finalized_date).longDayTimeFormat()}`
            }
            return `${finalized}${finalizedDate}`
        },
    },
}
</script>

<style lang="scss" scoped>
    .department {
        border-width: 1px 1px 1px 6px;
        border-style: solid;
        border-image: initial;
        background-color: white;
        box-shadow: none;
        border-radius: 3px;
        padding: 2px 7px;
        font-weight: 600;
        font-size: 13px;
        position: relative;
        .details {
            display: block;
        }
        .default-icon {
            margin-top: -3px;
            position: absolute;
            padding-left: 5px;
        }
        &.clickable {
            margin-left: 2px;
            cursor: pointer;
        }
    }
</style>
